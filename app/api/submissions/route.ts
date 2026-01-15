/**
 * Submissions API Route
 *
 * Fetch and manage art request submissions from Firestore.
 * Supports filtering, searching, and pagination.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
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

/**
 * GET /api/submissions - List all submissions with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const email = searchParams.get('email');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = getFirestoreDb();

    interface SubmissionData {
      id: string;
      requestType: string;
      clientName: string;
      requestTitle: string;
      status: string;
      requestorEmail: string;
      createdAt: string;
      completedAt: string | null;
      errorMessage: string | null;
      asanaTaskUrl: string | null;
      googleDriveFolderUrl: string | null;
    }

    let submissions: SubmissionData[] = [];

    // Fetch drafts if filtering by email or status is 'draft'
    if (
      (email || status === 'draft') &&
      status !== 'complete' &&
      status !== 'processing' &&
      status !== 'error'
    ) {
      try {
        const draftsSnapshot = await db.collection('drafts').get();

        const drafts = draftsSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            const formData = data.formData || {};
            const draftEmail = (
              data.userEmail ||
              formData.requestorEmail ||
              ''
            ).toLowerCase();

            // Only include drafts with required fields and matching email (if filtering by email)
            if (
              formData.requestType &&
              formData.clientName &&
              formData.requestTitle &&
              (!email || draftEmail === email.toLowerCase())
            ) {
              return {
                id: doc.id,
                requestType: formData.requestType,
                clientName: formData.clientName,
                requestTitle: formData.requestTitle,
                status: 'draft',
                requestorEmail: data.userEmail || formData.requestorEmail,
                createdAt:
                  data.lastModified?.toDate().toISOString() || new Date().toISOString(),
                completedAt: null,
                errorMessage: null,
                asanaTaskUrl: null,
                googleDriveFolderUrl: null,
              };
            }
            return null;
          })
          .filter((draft): draft is NonNullable<typeof draft> => draft !== null);

        submissions.push(...drafts);
        console.log(`Found ${drafts.length} drafts for email: ${email}`);
      } catch (draftError) {
        console.error('Error fetching drafts:', draftError);
        // Continue even if drafts fail - just log the error
      }
    }

    // Fetch submissions if not filtering by draft status only
    if (status !== 'draft') {
      let query = db.collection('submissions').orderBy('createdAt', 'desc');

      // Filter by status if provided (server-side)
      if (status && status !== 'all') {
        query = query.where('status', '==', status) as ReturnType<typeof query.where>;
      }

      // Apply limit and offset for pagination
      const snapshot = await query.limit(limit).offset(offset).get();

      const submissionDocs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          requestType: data.requestType,
          clientName: data.clientName,
          requestTitle: data.requestTitle,
          status: data.status,
          requestorEmail: data.requestorEmail,
          createdAt: data.createdAt?.toDate().toISOString(),
          completedAt: data.completedAt?.toDate().toISOString(),
          errorMessage: data.errorMessage,
          asanaTaskUrl: data.asanaTaskUrl,
          googleDriveFolderUrl: data.googleDriveFolderUrl,
        };
      });

      submissions.push(...submissionDocs);
    }

    // Sort by createdAt descending
    submissions.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Filter by email (client-side to avoid composite index requirement)
    if (email) {
      submissions = submissions.filter(
        (sub) => sub.requestorEmail?.toLowerCase() === email.toLowerCase()
      );
    }

    // Apply search filter on client side (simpler than complex Firestore queries)
    if (search) {
      const searchLower = search.toLowerCase();
      submissions = submissions.filter(
        (sub) =>
          sub.clientName?.toLowerCase().includes(searchLower) ||
          sub.requestTitle?.toLowerCase().includes(searchLower) ||
          sub.requestType?.toLowerCase().includes(searchLower) ||
          sub.requestorEmail?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      submissions,
      total: submissions.length,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
