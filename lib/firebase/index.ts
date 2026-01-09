/**
 * Firebase Module Exports
 *
 * Centralized exports for Firebase functionality.
 */

// Client-side Firebase
export { app, auth, db } from './config';

// Authentication
export {
  signInWithGoogle,
  signOut,
  getCurrentUser,
  onAuthChange,
  isAllowedDomain,
  getUserToken,
} from './auth';

// Firestore
export {
  COLLECTIONS,
  saveSubmission,
  getSubmission,
  updateSubmission,
  deleteSubmission,
  getUserDraft,
  saveUserDraft,
  getUserSubmissions,
  getAllSubmissions,
  getSubmissionsByStatus,
  createSubmissionRef,
  timestampToISO,
  isoToTimestamp,
} from './firestore';

export type { SubmissionDocument } from './firestore';

// Admin SDK (server-side only)
export {
  adminAuth,
  adminDb,
  verifyIdToken,
  getUserByUid,
  getUserByEmail,
  getAuthTokenFromHeaders,
} from './admin';
