/**
 * Firebase Client Configuration
 *
 * Initializes Firebase app for client-side usage (browser).
 * Used for authentication and real-time updates.
 *
 * NOTE: This only initializes in browser environment to prevent
 * build-time errors when Firebase credentials are not available.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth as getFirebaseAuth, Auth } from 'firebase/auth';
import { getFirestore as getFirebaseFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Lazy initialization - only initialize when accessed in browser
let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;

function getFirebaseApp(): FirebaseApp {
  // Only initialize in browser environment
  if (!isBrowser) {
    throw new Error('Firebase client can only be initialized in browser environment');
  }

  if (!firebaseApp) {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return firebaseApp;
}

// Export lazy-initialized services as getters
export function getAuth(): Auth {
  if (!firebaseAuth) {
    firebaseAuth = getFirebaseAuth(getFirebaseApp());
  }
  return firebaseAuth;
}

export function getDb(): Firestore {
  if (!firebaseDb) {
    firebaseDb = getFirebaseFirestore(getFirebaseApp());
  }
  return firebaseDb;
}

// Named exports that are safe for SSR - will only initialize in browser
// These provide backwards compatibility with existing imports
export const db = isBrowser ? getDb() : ({} as Firestore);
export const auth = isBrowser ? getAuth() : ({} as Auth);

// Export the app getter
export const app = isBrowser ? getFirebaseApp() : ({} as FirebaseApp);
