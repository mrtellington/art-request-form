/**
 * Firebase Authentication Helpers
 *
 * Handles Google Sign-In with @whitestonebranding.com domain restriction.
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './config';

// Allowed email domain
const ALLOWED_DOMAIN = 'whitestonebranding.com';

/**
 * Google Auth Provider with domain restriction
 */
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: ALLOWED_DOMAIN, // Hosted domain - restricts to @whitestonebranding.com
  prompt: 'select_account', // Always show account selector
});

/**
 * Sign in with Google
 * Only allows @whitestonebranding.com email addresses
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Verify domain on client side (double-check)
    const email = user.email;
    if (!email?.endsWith(`@${ALLOWED_DOMAIN}`)) {
      // Sign out immediately if domain doesn't match
      await firebaseSignOut(auth);
      throw new Error(`Access restricted to @${ALLOWED_DOMAIN} emails only.`);
    }

    return user;
  } catch (error: any) {
    // Handle specific error cases
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up blocked. Please allow pop-ups for this site.');
    } else if (error.message?.includes('Access restricted')) {
      // Re-throw our custom domain restriction error
      throw error;
    } else {
      console.error('Sign-in error:', error);
      throw new Error('Failed to sign in. Please try again.');
    }
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw new Error('Failed to sign out. Please try again.');
  }
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Subscribe to authentication state changes
 * Returns unsubscribe function
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Check if user email is from allowed domain
 */
export function isAllowedDomain(email: string | null): boolean {
  if (!email) return false;
  return email.endsWith(`@${ALLOWED_DOMAIN}`);
}

/**
 * Get user's ID token for API calls
 */
export async function getUserToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Failed to get user token:', error);
    return null;
  }
}
