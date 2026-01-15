/**
 * Art Request Form Page
 *
 * Main form page where users submit art requests.
 * Requires authentication with @whitestonebranding.com domain.
 */

'use client';

import { useAuth } from '@/lib/firebase/AuthContext';
import { signInWithGoogle, signOut } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import { FormContainer } from '@/components/form/FormContainer';
import { FormData, FileAttachment } from '@/types/form';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * Convert a File object to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Result is "data:mime/type;base64,<base64data>"
      // We only want the base64 part after the comma
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Process attachments to convert File objects to base64 for server transfer
 */
async function processAttachments(
  attachments: FileAttachment[]
): Promise<FileAttachment[]> {
  const processedAttachments: FileAttachment[] = [];

  for (const attachment of attachments) {
    if (attachment.file) {
      const base64Data = await fileToBase64(attachment.file);
      processedAttachments.push({
        id: attachment.id,
        name: attachment.name,
        size: attachment.size,
        mimeType: attachment.mimeType,
        base64Data, // Include base64 data instead of File object
        // Don't include file, localUrl as they're not serializable or needed server-side
      });
    }
  }

  return processedAttachments;
}

export default function RequestPage() {
  const { user, loading } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId') || undefined;

  const handleSignIn = async () => {
    setSigningIn(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      setSigningIn(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show sign in
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-midnight mb-2">Art Request Form</h1>
            <p className="text-zinc-600 mb-6">
              Sign in with your @whitestonebranding.com account to submit art requests.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4 font-figtree">
                {error}
              </div>
            )}

            <Button
              onClick={handleSignIn}
              disabled={signingIn}
              className="w-full"
              size="lg"
            >
              {signingIn ? 'Signing in...' : 'Sign in with Google'}
            </Button>

            <p className="text-sm text-zinc-500 mt-4">
              Access restricted to @whitestonebranding.com emails only
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    try {
      // Process attachments to convert File objects to base64
      const processedAttachments = formData.attachments
        ? await processAttachments(formData.attachments)
        : [];

      // Create submission data with processed attachments, user ID, and draft ID
      const submissionData = {
        ...formData,
        attachments: processedAttachments,
        userId: user.uid, // Include user ID for tracking
        draftId: draftId, // Include draft ID for draft deletion
      };

      // Call submission API
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Submission failed');
      }

      // Redirect to success page with submission details
      const params = new URLSearchParams({
        id: result.submissionId,
        asanaUrl: result.asanaTaskUrl || '',
        driveUrl: result.googleDriveFolderUrl || '',
        title: formData.requestTitle || 'Untitled Request',
      });

      router.push(`/success?${params.toString()}`);
    } catch (error) {
      console.error('Form submission error:', error);
      throw error; // Let FormContainer handle the error display
    }
  };

  // Authenticated - show form
  return (
    <div className="min-h-screen bg-zinc-50 py-4 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-midnight">
                Art Request Form
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/submissions">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  My Submissions
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="text-xs sm:text-sm"
              >
                Log Out
              </Button>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <FormContainer
          onSubmit={handleSubmit}
          userId={user.uid}
          userEmail={user.email || ''}
          userName={user.displayName || ''}
          draftId={draftId}
        />
      </div>
    </div>
  );
}
