/**
 * Single Submission API Route
 *
 * Get, update, or retry a specific submission.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { handleGoogleDriveIntegration } from '@/lib/integrations/google-drive';
import { handleAsanaIntegration } from '@/lib/integrations/asana';
import { sendSlackErrorNotification } from '@/lib/integrations/slack';

// Initialize Firebase Admin (only when API is called)
function getFirestoreDb() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

/**
 * GET /api/submissions/[id] - Get submission details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getFirestoreDb();
    const submissionDoc = await db.collection('submissions').doc(id).get();

    if (!submissionDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    const data = submissionDoc.data();

    // Convert Timestamps to ISO strings
    const submission = {
      id: submissionDoc.id,
      ...data,
      createdAt: data?.createdAt?.toDate().toISOString(),
      lastModified: data?.lastModified?.toDate().toISOString(),
      completedAt: data?.completedAt?.toDate().toISOString(),
      errorDetails: data?.errorDetails
        ? {
            ...data.errorDetails,
            timestamp: data.errorDetails.timestamp?.toDate().toISOString(),
          }
        : undefined,
    };

    return NextResponse.json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/submissions/[id] - Update submission
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = getFirestoreDb();
    const submissionRef = db.collection('submissions').doc(id);

    // Check if submission exists
    const doc = await submissionRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Update submission
    await submissionRef.update({
      ...body,
      lastModified: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: 'Submission updated successfully',
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/submissions/[id]/retry - Retry failed submission
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getFirestoreDb();
    const submissionRef = db.collection('submissions').doc(id);
    const doc = await submissionRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    const data = doc.data();

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Submission data not found' },
        { status: 404 }
      );
    }

    // Check if submission is in error state
    if (data.status !== 'error') {
      return NextResponse.json(
        {
          success: false,
          error: 'Only failed submissions can be retried',
        },
        { status: 400 }
      );
    }

    // Update status to processing
    await submissionRef.update({
      status: 'processing',
      lastModified: Timestamp.now(),
    });

    const errorStep = data.errorDetails?.step;
    let currentStep = errorStep || 'unknown';

    try {
      // Retry from the failed step
      if (errorStep === 'drive_folder' || errorStep === 'drive_upload') {
        // Retry Google Drive integration
        currentStep = 'drive_folder';
        const driveResult = await handleGoogleDriveIntegration(data as any);

        await submissionRef.update({
          googleDriveFolderId: driveResult.folderId,
          googleDriveFolderUrl: driveResult.folderUrl,
          uploadedFiles: driveResult.uploadedFiles,
          lastModified: Timestamp.now(),
        });

        // Continue to Asana
        currentStep = 'asana_create';
        const asanaResult = await handleAsanaIntegration(
          data as any,
          driveResult.folderUrl,
          driveResult.uploadedFiles
        );

        await submissionRef.update({
          asanaTaskId: asanaResult.taskId,
          asanaTaskUrl: asanaResult.taskUrl,
          status: 'complete',
          completedAt: Timestamp.now(),
          errorMessage: null,
          errorDetails: null,
          lastModified: Timestamp.now(),
        });
      } else if (errorStep === 'asana_create') {
        // Retry Asana integration only
        currentStep = 'asana_create';
        const asanaResult = await handleAsanaIntegration(
          data as any,
          data.googleDriveFolderUrl,
          data.uploadedFiles
        );

        await submissionRef.update({
          asanaTaskId: asanaResult.taskId,
          asanaTaskUrl: asanaResult.taskUrl,
          status: 'complete',
          completedAt: Timestamp.now(),
          errorMessage: null,
          errorDetails: null,
          lastModified: Timestamp.now(),
        });
      } else {
        // Unknown error step - retry from beginning
        currentStep = 'drive_folder';
        const driveResult = await handleGoogleDriveIntegration(data as any);

        await submissionRef.update({
          googleDriveFolderId: driveResult.folderId,
          googleDriveFolderUrl: driveResult.folderUrl,
          uploadedFiles: driveResult.uploadedFiles,
          lastModified: Timestamp.now(),
        });

        currentStep = 'asana_create';
        const asanaResult = await handleAsanaIntegration(
          data as any,
          driveResult.folderUrl,
          driveResult.uploadedFiles
        );

        await submissionRef.update({
          asanaTaskId: asanaResult.taskId,
          asanaTaskUrl: asanaResult.taskUrl,
          status: 'complete',
          completedAt: Timestamp.now(),
          errorMessage: null,
          errorDetails: null,
          lastModified: Timestamp.now(),
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Submission retry successful',
      });
    } catch (error) {
      console.error('Retry failed:', error);

      // Update retry count
      const retryCount = (data.errorDetails?.retryCount || 0) + 1;

      await submissionRef.update({
        status: 'error',
        errorMessage: `Retry failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorDetails: {
          step: currentStep,
          timestamp: Timestamp.now(),
          retryCount: retryCount,
          lastError: error instanceof Error ? error.message : 'Unknown error',
        },
        lastModified: Timestamp.now(),
      });

      // Send Slack notification about retry failure
      await sendSlackErrorNotification(
        error instanceof Error ? error : new Error('Unknown error'),
        data as any,
        `retry_${currentStep}`,
        id
      );

      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error retrying submission:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
