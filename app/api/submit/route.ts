/**
 * Submit API Route
 *
 * Orchestrates complete submission flow:
 * 1. Validate form data
 * 2. Create Google Drive folder
 * 3. Upload files to Drive
 * 4. Create Asana task
 * 5. Save to Firestore
 * 6. Send notifications
 *
 * Includes error handling, retry logic, and Slack notifications.
 */

import { NextRequest, NextResponse } from 'next/server';
import { formDataSchema } from '@/lib/schemas/form-schema';
import { handleGoogleDriveIntegration } from '@/lib/integrations/google-drive';
import { handleAsanaIntegration } from '@/lib/integrations/asana';
import {
  sendSlackErrorNotification,
  sendSlackSuccessNotification,
} from '@/lib/integrations/slack';
import { rateLimit, RateLimits } from '@/lib/middleware/rate-limit';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

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

export async function POST(request: NextRequest) {
  // Apply rate limiting (5 submissions per minute per IP)
  const rateLimitResult = await rateLimit(request, RateLimits.submit);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  let submissionId: string | undefined;
  let currentStep = 'validation';

  try {
    // Parse and validate form data
    const body = await request.json();
    const validationResult = formDataSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const formData = validationResult.data;

    // Sanitize form data for Firestore (remove non-serializable objects and clean structure)
    const sanitizeForFirestore = (data: unknown): Record<string, unknown> => {
      // Helper to recursively clean objects
      const cleanObject = (obj: unknown): unknown => {
        if (obj === null || obj === undefined) return null;

        // Handle arrays
        if (Array.isArray(obj)) {
          return obj
            .map(cleanObject)
            .filter((item) => item !== null && item !== undefined);
        }

        // Handle objects
        if (typeof obj === 'object') {
          // Skip File and Blob objects entirely
          if (obj instanceof File || obj instanceof Blob) return null;

          const cleaned: Record<string, unknown> = {};
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              const value = obj[key];

              // Skip undefined and 'file' properties (File objects from FileAttachment)
              if (value === undefined || key === 'file') {
                continue;
              }

              // Skip base64Data (too large for Firestore, files are uploaded to Drive)
              if (key === 'base64Data') {
                continue;
              }

              // Skip File/Blob objects
              if (value instanceof File || value instanceof Blob) {
                continue;
              }

              // Handle localUrl (blob URLs) - skip them as they're not serializable
              if (
                key === 'localUrl' &&
                typeof value === 'string' &&
                value.startsWith('blob:')
              ) {
                continue;
              }

              // Recursively clean nested objects and arrays
              const cleanedValue = cleanObject(value);

              // Only include non-null, non-undefined values
              if (cleanedValue !== null && cleanedValue !== undefined) {
                // For arrays, skip empty arrays unless it's a critical field
                if (Array.isArray(cleanedValue) && cleanedValue.length === 0) {
                  // Keep empty arrays for critical fields
                  if (
                    [
                      'attachments',
                      'slides',
                      'products',
                      'websiteLinks',
                      'collaborators',
                      'labels',
                    ].includes(key)
                  ) {
                    cleaned[key] = cleanedValue;
                  }
                } else {
                  cleaned[key] = cleanedValue;
                }
              }
            }
          }
          return cleaned;
        }

        return obj;
      };

      // Clean the entire data structure
      const cleaned = cleanObject(data);

      // Ensure critical arrays are present (even if empty) and properly structured
      return {
        ...cleaned,
        attachments: Array.isArray(cleaned.attachments) ? cleaned.attachments : [],
        slides: Array.isArray(cleaned.slides) ? cleaned.slides : [],
        products: Array.isArray(cleaned.products) ? cleaned.products : [],
        websiteLinks: Array.isArray(cleaned.websiteLinks) ? cleaned.websiteLinks : [],
        collaborators: Array.isArray(cleaned.collaborators) ? cleaned.collaborators : [],
        labels: Array.isArray(cleaned.labels) ? cleaned.labels : [],
      };
    };

    const sanitizedFormData = sanitizeForFirestore(formData);

    // Debug: Log the sanitized data structure
    console.log('Sanitized form data:', JSON.stringify(sanitizedFormData, null, 2));

    // Create initial submission document in Firestore
    currentStep = 'firestore_create';
    const db = getFirestoreDb();

    let submissionRef;
    try {
      submissionRef = await db.collection('submissions').add({
        ...sanitizedFormData,
        status: 'processing',
        createdAt: Timestamp.now(),
        lastModified: Timestamp.now(),
        version: '1.0',
      });
      submissionId = submissionRef.id;
    } catch (firestoreError) {
      // If full data save fails, try to save with minimal structure but keep all data
      console.error(
        'Full Firestore save failed, attempting to save with error status:',
        firestoreError
      );

      try {
        // Try to save the full sanitized data but with error status
        submissionRef = await db.collection('submissions').add({
          ...sanitizedFormData,
          status: 'error',
          errorMessage: `Failed to save submission initially: ${firestoreError instanceof Error ? firestoreError.message : 'Unknown error'}`,
          errorDetails: {
            step: currentStep,
            timestamp: Timestamp.now(),
            error:
              firestoreError instanceof Error ? firestoreError.message : 'Unknown error',
            stackTrace:
              firestoreError instanceof Error ? firestoreError.stack : undefined,
          },
          createdAt: Timestamp.now(),
          lastModified: Timestamp.now(),
          version: '1.0',
        });
        submissionId = submissionRef.id;
        console.log('Saved submission with error status:', submissionId);
      } catch (secondError) {
        // Last resort: save only critical fields
        console.error('Second attempt failed, saving minimal data:', secondError);
        submissionRef = await db.collection('submissions').add({
          requestorName: sanitizedFormData.requestorName,
          requestorEmail: sanitizedFormData.requestorEmail,
          requestTitle: sanitizedFormData.requestTitle,
          requestType: sanitizedFormData.requestType,
          clientName: sanitizedFormData.clientName,
          status: 'error',
          errorMessage: `Critical save failure: ${secondError instanceof Error ? secondError.message : 'Unknown error'}`,
          errorDetails: {
            step: currentStep,
            timestamp: Timestamp.now(),
            primaryError:
              firestoreError instanceof Error ? firestoreError.message : 'Unknown error',
            secondaryError:
              secondError instanceof Error ? secondError.message : 'Unknown error',
          },
          createdAt: Timestamp.now(),
          lastModified: Timestamp.now(),
          version: '1.0',
        });
        submissionId = submissionRef.id;
      }

      // Re-throw to trigger main error handler
      throw firestoreError;
    }

    // Step 1: Google Drive Integration
    currentStep = 'drive_folder';
    let driveFolderId: string | undefined;
    let driveFolderUrl: string | undefined;
    let uploadedFiles: Array<{ id: string; name: string; url: string }> = [];

    try {
      const driveResult = await handleGoogleDriveIntegration(formData);
      driveFolderId = driveResult.folderId;
      driveFolderUrl = driveResult.folderUrl;
      uploadedFiles = driveResult.uploadedFiles;

      // Update submission with Drive info
      await submissionRef.update({
        googleDriveFolderId: driveFolderId,
        googleDriveFolderUrl: driveFolderUrl,
        uploadedFiles: uploadedFiles,
        lastModified: Timestamp.now(),
      });
    } catch (error) {
      console.error('Google Drive integration failed:', error);

      // Log error but continue - we can retry Drive upload later
      await submissionRef.update({
        status: 'error',
        errorMessage: `Google Drive integration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorDetails: {
          step: currentStep,
          timestamp: Timestamp.now(),
          retryCount: 0,
          lastError: error instanceof Error ? error.message : 'Unknown error',
        },
        lastModified: Timestamp.now(),
      });

      // Send Slack notification
      await sendSlackErrorNotification(
        error instanceof Error ? error : new Error('Unknown error'),
        formData,
        currentStep,
        submissionId
      );

      throw error;
    }

    // Step 2: Asana Integration
    currentStep = 'asana_create';
    let asanaTaskId: string | undefined;
    let asanaTaskUrl: string | undefined;

    try {
      const asanaResult = await handleAsanaIntegration(
        formData,
        driveFolderUrl,
        uploadedFiles
      );
      asanaTaskId = asanaResult.taskId;
      asanaTaskUrl = asanaResult.taskUrl;

      // Update submission with Asana info
      await submissionRef.update({
        asanaTaskId: asanaTaskId,
        asanaTaskUrl: asanaTaskUrl,
        lastModified: Timestamp.now(),
      });
    } catch (error) {
      console.error('Asana integration failed:', error);

      // Log error but mark as recoverable
      await submissionRef.update({
        status: 'error',
        errorMessage: `Asana integration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorDetails: {
          step: currentStep,
          timestamp: Timestamp.now(),
          retryCount: 0,
          lastError: error instanceof Error ? error.message : 'Unknown error',
        },
        lastModified: Timestamp.now(),
      });

      // Send Slack notification
      await sendSlackErrorNotification(
        error instanceof Error ? error : new Error('Unknown error'),
        formData,
        currentStep,
        submissionId
      );

      throw error;
    }

    // Step 3: Mark as complete
    currentStep = 'finalize';
    await submissionRef.update({
      status: 'complete',
      completedAt: Timestamp.now(),
      lastModified: Timestamp.now(),
    });

    // Delete the draft after successful submission
    if (formData.userId) {
      try {
        await db.collection('drafts').doc(formData.userId).delete();
        console.log('Draft deleted for user:', formData.userId);
      } catch (draftError) {
        // Log error but don't fail the submission
        console.error('Failed to delete draft:', draftError);
      }
    }

    // Send success notification (optional)
    if (driveFolderUrl && asanaTaskUrl) {
      await sendSlackSuccessNotification(formData, asanaTaskUrl, driveFolderUrl);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      submissionId: submissionId,
      asanaTaskId: asanaTaskId,
      asanaTaskUrl: asanaTaskUrl,
      googleDriveFolderId: driveFolderId,
      googleDriveFolderUrl: driveFolderUrl,
      uploadedFiles: uploadedFiles,
    });
  } catch (error) {
    console.error('Submission failed:', error);

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        step: currentStep,
        submissionId: submissionId,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check submission status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('id');

    if (!submissionId) {
      return NextResponse.json(
        { success: false, error: 'Submission ID required' },
        { status: 400 }
      );
    }

    const db = getFirestoreDb();
    const submissionDoc = await db.collection('submissions').doc(submissionId).get();

    if (!submissionDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    const data = submissionDoc.data();

    return NextResponse.json({
      success: true,
      submission: {
        id: submissionDoc.id,
        status: data?.status,
        asanaTaskUrl: data?.asanaTaskUrl,
        googleDriveFolderUrl: data?.googleDriveFolderUrl,
        createdAt: data?.createdAt,
        completedAt: data?.completedAt,
        errorMessage: data?.errorMessage,
      },
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
