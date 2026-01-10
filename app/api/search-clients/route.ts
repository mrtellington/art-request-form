/**
 * Search Clients API Route
 *
 * Searches cached clients in Firebase with fuzzy matching.
 * Returns matching clients for autocomplete dropdown.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

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

interface CachedClient {
  id: string;
  name: string;
  nameLower: string;
}

/**
 * GET - Search clients by name
 * Returns up to 10 matching clients for autocomplete
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({
        clients: [],
        message: 'Query must be at least 2 characters',
      });
    }

    const queryLower = query.toLowerCase();
    const db = getFirestoreDb();

    // Firestore doesn't support true fuzzy search, so we use a prefix match
    // and also search for contains by fetching more results
    // For better fuzzy search, consider Algolia or Elasticsearch

    // Strategy: Get clients that start with the query (prefix match)
    // This is efficient in Firestore
    const prefixResults = await db
      .collection('clients')
      .where('nameLower', '>=', queryLower)
      .where('nameLower', '<=', queryLower + '\uf8ff')
      .orderBy('nameLower')
      .limit(20)
      .get();

    const prefixClients: CachedClient[] = [];
    prefixResults.forEach((doc) => {
      const data = doc.data();
      prefixClients.push({
        id: data.id,
        name: data.name,
        nameLower: data.nameLower,
      });
    });

    // Also do a "contains" search by getting more clients and filtering
    // This is less efficient but provides better UX for partial matches
    // Only do this if we don't have many prefix matches
    let containsClients: CachedClient[] = [];

    if (prefixClients.length < 5) {
      // Get a broader set and filter client-side for "contains"
      // This is a workaround for Firestore's limited query capabilities
      const allClientsSnapshot = await db
        .collection('clients')
        .orderBy('nameLower')
        .limit(1000) // Limit to prevent memory issues
        .get();

      allClientsSnapshot.forEach((doc) => {
        const data = doc.data();
        // Check if name contains the query (not just starts with)
        if (
          data.nameLower?.includes(queryLower) &&
          !prefixClients.some((c) => c.id === data.id)
        ) {
          containsClients.push({
            id: data.id,
            name: data.name,
            nameLower: data.nameLower,
          });
        }
      });

      // Sort contains results by relevance (earlier match = higher relevance)
      containsClients.sort((a, b) => {
        const indexA = a.nameLower.indexOf(queryLower);
        const indexB = b.nameLower.indexOf(queryLower);
        return indexA - indexB;
      });

      // Limit contains results
      containsClients = containsClients.slice(0, 10);
    }

    // Combine results: prefix matches first, then contains matches
    const allClients = [...prefixClients, ...containsClients];

    // Remove duplicates and limit to 10
    const uniqueClients = allClients
      .filter(
        (client, index, self) => index === self.findIndex((c) => c.id === client.id)
      )
      .slice(0, 10);

    return NextResponse.json({
      clients: uniqueClients.map((c) => ({
        id: c.id,
        name: c.name,
      })),
      count: uniqueClients.length,
    });
  } catch (error) {
    console.error('Client search error:', error);

    return NextResponse.json(
      {
        clients: [],
        error: 'Failed to search clients',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
