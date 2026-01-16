/**
 * Sync Clients API Route
 *
 * Fetches all clients from CommonSKU and caches them in Firebase.
 * Should be called periodically (daily) via cron job.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const COMMONSKU_API_KEY = process.env.COMMONSKU_API_KEY;
const COMMONSKU_BASE_URL =
  process.env.COMMONSKU_BASE_URL ||
  'https://fws09sh894.execute-api.us-east-1.amazonaws.com/beta';

// Simple auth token for cron job security (set in env)
const SYNC_AUTH_TOKEN = process.env.SYNC_AUTH_TOKEN;

// Initialize Firebase Admin
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

interface CommonSKUClient {
  client_id: string;
  client_name: string;
  [key: string]: unknown;
}

/**
 * Fetch all clients from CommonSKU API
 * Uses cursor-based pagination
 */
async function fetchAllClientsFromCommonSKU(): Promise<CommonSKUClient[]> {
  if (!COMMONSKU_API_KEY) {
    throw new Error('COMMONSKU_API_KEY not configured');
  }

  const allClients: CommonSKUClient[] = [];
  let cursor: string | null = null;
  let pageNum = 1;
  const maxPages = 500; // Safety limit

  while (pageNum <= maxPages) {
    const url: string = cursor
      ? `${COMMONSKU_BASE_URL}/clients?cursor=${encodeURIComponent(cursor)}`
      : `${COMMONSKU_BASE_URL}/clients?per_page=100`;

    const response = await fetch(url, {
      headers: {
        'x-api-key': COMMONSKU_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CommonSKU API error: ${response.status}`);
    }

    const responseData = await response.json();
    const clients = responseData.data || [];
    const meta = responseData.meta || {};

    allClients.push(...clients);
    console.log(
      `Page ${pageNum}: fetched ${clients.length} clients (total: ${allClients.length})`
    );

    // Check if there's a next page via cursor
    if (meta.cursor && clients.length > 0) {
      cursor = meta.cursor;
      pageNum++;
    } else {
      // No more pages
      break;
    }
  }

  if (pageNum > maxPages) {
    console.warn(`Reached maximum page limit (${maxPages})`);
  }

  return allClients;
}

/**
 * POST - Sync clients from CommonSKU to Firebase
 * Protected by auth token
 */
export async function POST(request: NextRequest) {
  try {
    // Verify auth token OR Vercel Cron header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';

    // Allow either valid auth token or Vercel Cron requests
    if (!isVercelCron && SYNC_AUTH_TOKEN && token !== SYNC_AUTH_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting client sync from CommonSKU...');

    // Fetch all clients from CommonSKU
    const commonskuClients = await fetchAllClientsFromCommonSKU();
    console.log(`Fetched ${commonskuClients.length} clients from CommonSKU`);

    // Get Firestore reference
    const db = getFirestoreDb();
    const clientsCollection = db.collection('clients');

    // Batch write to Firebase (Firestore has 500 write limit per batch)
    const batchSize = 400;
    let processedCount = 0;

    for (let i = 0; i < commonskuClients.length; i += batchSize) {
      const batch = db.batch();
      const batchClients = commonskuClients.slice(i, i + batchSize);

      for (const client of batchClients) {
        const docRef = clientsCollection.doc(client.client_id);
        batch.set(docRef, {
          id: client.client_id,
          name: client.client_name,
          nameLower: client.client_name?.toLowerCase() || '',
          updatedAt: Timestamp.now(),
        });
      }

      await batch.commit();
      processedCount += batchClients.length;
      console.log(`Processed ${processedCount}/${commonskuClients.length} clients`);
    }

    // Update sync metadata
    await db.collection('metadata').doc('clientSync').set({
      lastSyncAt: Timestamp.now(),
      clientCount: commonskuClients.length,
      status: 'success',
    });

    console.log('Client sync completed successfully');

    return NextResponse.json({
      success: true,
      clientCount: commonskuClients.length,
      message: 'Clients synced successfully',
    });
  } catch (error) {
    console.error('Client sync failed:', error);

    // Log error to metadata
    try {
      const db = getFirestoreDb();
      await db
        .collection('metadata')
        .doc('clientSync')
        .set({
          lastSyncAt: Timestamp.now(),
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
    } catch (e) {
      console.error('Failed to log sync error:', e);
    }

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
 * GET - Check sync status
 */
export async function GET() {
  try {
    const db = getFirestoreDb();
    const metadataDoc = await db.collection('metadata').doc('clientSync').get();

    if (!metadataDoc.exists) {
      return NextResponse.json({
        synced: false,
        message: 'No sync has been performed yet',
      });
    }

    const data = metadataDoc.data();

    return NextResponse.json({
      synced: true,
      lastSyncAt: data?.lastSyncAt?.toDate?.() || null,
      clientCount: data?.clientCount || 0,
      status: data?.status || 'unknown',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to get sync status' }, { status: 500 });
  }
}
