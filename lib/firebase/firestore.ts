/**
 * Firestore Database Helpers
 *
 * Helper functions for interacting with Firestore database.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint,
  serverTimestamp,
  DocumentReference
} from 'firebase/firestore';
import { db } from './config';
import { FormData } from '@/types/form';

/**
 * Collection names
 */
export const COLLECTIONS = {
  SUBMISSIONS: 'submissions',
} as const;

/**
 * Submission document interface
 * Matches the schema from the implementation plan
 */
export interface SubmissionDocument {
  submittedAt: Timestamp;
  submittedBy: {
    uid: string;
    email: string;
    displayName: string | null;
  };
  formData: FormData;
  asanaTaskId?: string;
  asanaTaskUrl?: string;
  googleDriveFolderId?: string;
  googleDriveFolderUrl?: string;
  status: 'draft' | 'submitted' | 'processing' | 'complete' | 'error';
  errorMessage?: string;
  errorDetails?: {
    step: string;
    timestamp: Timestamp;
    retryCount: number;
  };
  version: string;
  lastModified: Timestamp;
}

/**
 * Save or update a submission document
 */
export async function saveSubmission(
  submissionId: string,
  data: Partial<SubmissionDocument>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.SUBMISSIONS, submissionId);
  await setDoc(docRef, {
    ...data,
    lastModified: serverTimestamp(),
  }, { merge: true });
}

/**
 * Get a submission by ID
 */
export async function getSubmission(
  submissionId: string
): Promise<SubmissionDocument | null> {
  const docRef = doc(db, COLLECTIONS.SUBMISSIONS, submissionId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as SubmissionDocument;
  }
  return null;
}

/**
 * Update a submission document
 */
export async function updateSubmission(
  submissionId: string,
  data: Partial<SubmissionDocument>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.SUBMISSIONS, submissionId);
  await updateDoc(docRef, {
    ...data,
    lastModified: serverTimestamp(),
  });
}

/**
 * Delete a submission document
 */
export async function deleteSubmission(submissionId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.SUBMISSIONS, submissionId);
  await deleteDoc(docRef);
}

/**
 * Get user's draft submission
 * Each user can have one draft at a time (id: draft-{userId})
 */
export async function getUserDraft(userId: string): Promise<SubmissionDocument | null> {
  return getSubmission(`draft-${userId}`);
}

/**
 * Save user's draft
 */
export async function saveUserDraft(
  userId: string,
  formData: FormData,
  userEmail: string,
  displayName: string | null
): Promise<void> {
  await saveSubmission(`draft-${userId}`, {
    status: 'draft',
    formData,
    submittedBy: {
      uid: userId,
      email: userEmail,
      displayName,
    },
    version: '1.0',
  });
}

/**
 * Get all submissions for a user
 */
export async function getUserSubmissions(
  userId: string,
  constraints: QueryConstraint[] = []
): Promise<SubmissionDocument[]> {
  const q = query(
    collection(db, COLLECTIONS.SUBMISSIONS),
    where('submittedBy.uid', '==', userId),
    where('status', '!=', 'draft'),
    orderBy('status'),
    orderBy('submittedAt', 'desc'),
    ...constraints
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as SubmissionDocument);
}

/**
 * Get all submissions (admin only)
 */
export async function getAllSubmissions(
  constraints: QueryConstraint[] = []
): Promise<Array<SubmissionDocument & { id: string }>> {
  const q = query(
    collection(db, COLLECTIONS.SUBMISSIONS),
    where('status', '!=', 'draft'),
    orderBy('status'),
    orderBy('submittedAt', 'desc'),
    limit(100),
    ...constraints
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as SubmissionDocument
  }));
}

/**
 * Get submissions by status
 */
export async function getSubmissionsByStatus(
  status: SubmissionDocument['status']
): Promise<Array<SubmissionDocument & { id: string }>> {
  const q = query(
    collection(db, COLLECTIONS.SUBMISSIONS),
    where('status', '==', status),
    orderBy('submittedAt', 'desc'),
    limit(50)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as SubmissionDocument
  }));
}

/**
 * Create a new submission document reference
 */
export function createSubmissionRef(): DocumentReference {
  return doc(collection(db, COLLECTIONS.SUBMISSIONS));
}

/**
 * Convert Firestore Timestamp to ISO string
 */
export function timestampToISO(timestamp: Timestamp): string {
  return timestamp.toDate().toISOString();
}

/**
 * Convert ISO string to Firestore Timestamp
 */
export function isoToTimestamp(isoString: string): Timestamp {
  return Timestamp.fromDate(new Date(isoString));
}
