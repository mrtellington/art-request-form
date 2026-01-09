/**
 * Form Persistence Hook
 *
 * Auto-saves form data to Firestore drafts every 30 seconds.
 * Allows users to resume incomplete forms.
 */

import { useEffect, useState, useRef } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { FormData } from '@/types/form';
import { CURRENT_SCHEMA_VERSION } from '@/lib/schemas/firestore-schema';

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export interface UseFormPersistenceOptions {
  userId: string;
  userEmail: string;
  formData: Partial<FormData>;
  enabled?: boolean;
}

export interface UseFormPersistenceReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  saveDraft: () => Promise<void>;
}

/**
 * Hook to auto-save form drafts to Firestore
 */
export function useFormPersistence({
  userId,
  userEmail,
  formData,
  enabled = true,
}: UseFormPersistenceOptions): UseFormPersistenceReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>('');

  /**
   * Save draft to Firestore
   */
  const saveDraft = async () => {
    if (!userId || !enabled) return;

    // Convert formData to JSON string for comparison
    const currentDataString = JSON.stringify(formData);

    // Skip if data hasn't changed
    if (currentDataString === previousDataRef.current) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const draftRef = doc(db, 'drafts', userId);

      await setDoc(draftRef, {
        lastModified: serverTimestamp(),
        userId,
        userEmail,
        formData,
        version: CURRENT_SCHEMA_VERSION,
      });

      setLastSaved(new Date());
      previousDataRef.current = currentDataString;
    } catch (err: any) {
      console.error('Failed to save draft:', err);
      setError(err.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

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
  }, [formData, userId, userEmail, enabled]);

  /**
   * Save on page unload
   */
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      // Use synchronous localStorage as fallback
      // since beforeunload doesn't support async operations
      try {
        localStorage.setItem(
          `draft-${userId}`,
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
  }, [formData, userId, enabled]);

  return {
    isSaving,
    lastSaved,
    error,
    saveDraft,
  };
}
