/**
 * Submissions API Route
 *
 * Fetch and manage art request submissions from Firestore.
 * Supports filtering, searching, and pagination.
 */

import { NextRequest, NextResponse } from 'next/server';
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

/**
 * GET /api/submissions - List all submissions with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = getFirestoreDb();
    let query = db.collection('submissions').orderBy('createdAt', 'desc');

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.where('status', '==', status) as any;
    }

    // Apply limit and offset for pagination
    const snapshot = await query.limit(limit).offset(offset).get();

    let submissions = snapshot.docs.map((doc) => {
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
