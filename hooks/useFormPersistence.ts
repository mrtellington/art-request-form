/**
 * Form Persistence Hook
 *
 * Auto-saves form data to Firestore drafts every 30 seconds.
 * Allows users to resume incomplete forms.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { doc, setDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { FormData } from '@/types/form';
import { CURRENT_SCHEMA_VERSION } from '@/lib/schemas/firestore-schema';

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export interface UseFormPersistenceOptions {
  userId: string;
  userEmail: string;
  formData: Partial<FormData>;
  enabled?: boolean;
  draftId?: string; // Optional draft ID for editing existing drafts
}

export interface UseFormPersistenceReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  saveDraft: () => Promise<void>;
  draftId: string | null; // Return the draft ID after creation
}

/**
 * Hook to auto-save form drafts to Firestore
 */
export function useFormPersistence({
  userId,
  userEmail,
  formData,
  enabled = true,
  draftId: initialDraftId,
}: UseFormPersistenceOptions): UseFormPersistenceReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(initialDraftId || null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>('');

  /**
   * Sanitize form data for Firestore (remove non-serializable File objects)
   */
  const sanitizeFormData = (data: unknown): unknown => {
    const cleanObject = (obj: unknown): unknown => {
      if (obj === null || obj === undefined) return null;

      // Handle arrays
      if (Array.isArray(obj)) {
        return obj.map(cleanObject).filter((item) => item !== null && item !== undefined);
      }

      // Handle objects
      if (typeof obj === 'object') {
        // Skip File and Blob objects
        if (obj instanceof File || obj instanceof Blob) return null;

        const cleaned: Record<string, unknown> = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = obj[key];

            // Skip 'file' property (File objects from FileAttachment)
            if (key === 'file') continue;

            // Skip base64Data (too large for Firestore, files are uploaded to Drive)
            if (key === 'base64Data') continue;

            // Skip undefined values
            if (value === undefined) continue;

            // Skip File/Blob objects
            if (value instanceof File || value instanceof Blob) continue;

            // Skip blob URLs (localUrl)
            if (
              key === 'localUrl' &&
              typeof value === 'string' &&
              value.startsWith('blob:')
            ) {
              continue;
            }

            // Recursively clean
            const cleanedValue = cleanObject(value);
            if (cleanedValue !== null && cleanedValue !== undefined) {
              cleaned[key] = cleanedValue;
            }
          }
        }
        return cleaned;
      }

      return obj;
    };

    return cleanObject(data);
  };

  /**
   * Save draft to Firestore
   */
  const saveDraft = useCallback(async () => {
    if (!userId || !enabled) return;

    // Only save draft if required fields are present
    const hasRequiredFields =
      formData.requestType &&
      formData.clientName?.trim() &&
      formData.requestTitle?.trim();

    if (!hasRequiredFields) {
      return;
    }

    // Sanitize form data to remove File objects
    const sanitizedData = sanitizeFormData(formData);

    // Convert sanitized data to JSON string for comparison
    const currentDataString = JSON.stringify(sanitizedData);

    // Skip if data hasn't changed
    if (currentDataString === previousDataRef.current) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const draftData = {
        lastModified: serverTimestamp(),
        userId,
        userEmail,
        formData: sanitizedData,
        version: CURRENT_SCHEMA_VERSION,
      };

      if (draftId) {
        // Update existing draft
        console.log('Updating existing draft:', draftId);
        const draftRef = doc(db, 'drafts', draftId);
        await setDoc(draftRef, draftData);
        console.log('Draft updated successfully:', draftId);
      } else {
        // Create new draft with auto-generated ID
        console.log('Creating new draft for user:', userId);
        const draftsCollection = collection(db, 'drafts');
        const newDraftRef = await addDoc(draftsCollection, draftData);
        console.log('New draft created with ID:', newDraftRef.id);
        setDraftId(newDraftRef.id);
      }

      setLastSaved(new Date());
      previousDataRef.current = currentDataString;
    } catch (err) {
      console.error('Failed to save draft:', err);
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  }, [userId, enabled, formData, userEmail, draftId]);

  /**
   * Auto-save effect
   */
  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Schedule next auto-save
    saveTimeoutRef.current = setTimeout(() => {
      saveDraft();
    }, AUTO_SAVE_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, userId, userEmail, enabled, saveDraft]);

  /**
   * Save on page unload
   */
  useEffect(() => {
    if (!enabled || !draftId) return;

    const handleBeforeUnload = () => {
      // Use synchronous localStorage as fallback
      // since beforeunload doesn't support async operations
      try {
        localStorage.setItem(
          `draft-${draftId}`,
          JSON.stringify({
            formData,
            timestamp: new Date().toISOString(),
          })
        );
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData, draftId, enabled]);

  return {
    isSaving,
    lastSaved,
    error,
    saveDraft,
    draftId,
  };
}
