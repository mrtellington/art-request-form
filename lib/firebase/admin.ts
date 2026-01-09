/**
 * Firebase Admin SDK Configuration
 *
 * Server-side Firebase Admin SDK for API routes.
 * Used for verifying authentication tokens and server-side database operations.
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Initialize Firebase Admin SDK
 * Only initialize once (singleton pattern)
 */
function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Parse service account credentials from environment
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error(
      'Firebase Admin credentials not configured. Please set FIREBASE_ADMIN_PRIVATE_KEY, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PROJECT_ID environment variables.'
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      // Handle escaped newlines in private key
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
}

// Initialize the admin app
const adminApp = initializeFirebaseAdmin();

// Export admin services
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

/**
 * Verify Firebase ID token from client
 * Use this in API routes to authenticate requests
 */
export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Verify email domain
    const email = decodedToken.email;
    if (!email?.endsWith('@whitestonebranding.com')) {
      throw new Error('Unauthorized: Invalid email domain');
    }

    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Unauthorized: Invalid authentication token');
  }
}

/**
 * Get user by UID
 */
export async function getUserByUid(uid: string) {
  try {
    return await adminAuth.getUser(uid);
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  try {
    return await adminAuth.getUserByEmail(email);
  } catch (error) {
    console.error('Failed to get user by email:', error);
    return null;
  }
}

/**
 * Helper to extract auth token from request headers
 */
export function getAuthTokenFromHeaders(headers: Headers): string | null {
  const authHeader = headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
