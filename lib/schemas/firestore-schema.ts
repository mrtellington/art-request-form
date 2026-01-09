/**
 * Firestore Schema
 *
 * TypeScript interfaces and Zod schemas for Firestore documents.
 * Defines the structure of data stored in Firebase Firestore.
 */

import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';
import { formDataSchema } from './form-schema';

/**
 * Submission Status
 */
export const submissionStatusSchema = z.enum([
  'draft',
  'submitted',
  'processing',
  'complete',
  'error',
]);

export type SubmissionStatus = z.infer<typeof submissionStatusSchema>;

/**
 * Submitted By User Info
 */
export const submittedBySchema = z.object({
  uid: z.string(),
  email: z.string(),
  displayName: z.string().nullable(),
});

export type SubmittedBy = z.infer<typeof submittedBySchema>;

/**
 * Error Details for Failed Submissions
 */
export const errorDetailsSchema = z.object({
  step: z.enum([
    'validation',
    'drive_folder',
    'drive_upload',
    'asana_create',
    'slack_notification',
  ]),
  timestamp: z.date(),
  retryCount: z.number().int().nonnegative(),
  lastError: z.string().optional(),
});

export type ErrorDetails = z.infer<typeof errorDetailsSchema>;

/**
 * Submission Document Schema
 * Stored in Firestore: submissions/{submissionId}
 */
export const submissionDocumentSchema = z.object({
  // Timestamps
  submittedAt: z.date(),
  lastModified: z.date(),

  // User who submitted
  submittedBy: submittedBySchema,

  // Form data
  formData: formDataSchema,

  // Integration results
  asanaTaskId: z.string().optional(),
  asanaTaskUrl: z.string().optional(),
  googleDriveFolderId: z.string().optional(),
  googleDriveFolderUrl: z.string().optional(),

  // Status tracking
  status: submissionStatusSchema,
  errorMessage: z.string().optional(),
  errorDetails: errorDetailsSchema.optional(),

  // Schema version for migrations
  version: z.string(),
});

export type SubmissionDocument = z.infer<typeof submissionDocumentSchema>;

/**
 * Interface for Submission Document (with Firestore Timestamps)
 * Used when reading from Firestore
 */
export interface SubmissionDocumentFirestore {
  submittedAt: Timestamp;
  lastModified: Timestamp;
  submittedBy: SubmittedBy;
  formData: z.infer<typeof formDataSchema>;
  asanaTaskId?: string;
  asanaTaskUrl?: string;
  googleDriveFolderId?: string;
  googleDriveFolderUrl?: string;
  status: SubmissionStatus;
  errorMessage?: string;
  errorDetails?: {
    step: 'validation' | 'drive_folder' | 'drive_upload' | 'asana_create' | 'slack_notification';
    timestamp: Timestamp;
    retryCount: number;
    lastError?: string;
  };
  version: string;
}

/**
 * Draft Document Schema
 * Stored in Firestore: drafts/{userId}
 *
 * NOTE: We use z.any() for formData in drafts because formDataSchema
 * contains refinements, which cannot be used with .partial().
 * The actual type will be Partial<FormData> at runtime.
 */
export const draftDocumentSchema = z.object({
  lastModified: z.date(),
  userId: z.string(),
  userEmail: z.string(),
  formData: z.any(), // Partial form data - typed as any to avoid .partial() on refined schema
  currentStep: z.number().int().nonnegative().optional(),
  version: z.string(),
});

export type DraftDocument = z.infer<typeof draftDocumentSchema>;

/**
 * Interface for Draft Document (with Firestore Timestamps)
 */
export interface DraftDocumentFirestore {
  lastModified: Timestamp;
  userId: string;
  userEmail: string;
  formData: Partial<z.infer<typeof formDataSchema>>;
  currentStep?: number;
  version: string;
}

/**
 * Current schema version
 * Increment this when making breaking changes to the schema
 */
export const CURRENT_SCHEMA_VERSION = '1.0.0';

/**
 * Helper functions for converting between Firestore and application types
 */

export function firestoreTimestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

export function dateToFirestoreTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

/**
 * Convert Firestore submission document to application type
 */
export function submissionFromFirestore(
  doc: SubmissionDocumentFirestore
): SubmissionDocument {
  return {
    ...doc,
    submittedAt: doc.submittedAt.toDate(),
    lastModified: doc.lastModified.toDate(),
    errorDetails: doc.errorDetails
      ? {
          ...doc.errorDetails,
          timestamp: doc.errorDetails.timestamp.toDate(),
        }
      : undefined,
  };
}

/**
 * Convert application submission to Firestore format
 */
export function submissionToFirestore(
  doc: SubmissionDocument
): SubmissionDocumentFirestore {
  return {
    ...doc,
    submittedAt: Timestamp.fromDate(doc.submittedAt),
    lastModified: Timestamp.fromDate(doc.lastModified),
    errorDetails: doc.errorDetails
      ? {
          ...doc.errorDetails,
          timestamp: Timestamp.fromDate(doc.errorDetails.timestamp),
        }
      : undefined,
  };
}

/**
 * Convert Firestore draft document to application type
 */
export function draftFromFirestore(doc: DraftDocumentFirestore): DraftDocument {
  return {
    ...doc,
    lastModified: doc.lastModified.toDate(),
  };
}

/**
 * Convert application draft to Firestore format
 */
export function draftToFirestore(doc: DraftDocument): DraftDocumentFirestore {
  return {
    ...doc,
    lastModified: Timestamp.fromDate(doc.lastModified),
  };
}
