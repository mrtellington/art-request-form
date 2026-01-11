/**
 * Success Page
 *
 * Displayed after successful form submission.
 * Shows confirmation and links to Asana task and Google Drive folder.
 */

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, ExternalLink, FileText, FolderOpen } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();

  // Get data from URL parameters
  const submissionId = searchParams.get('id');
  const asanaTaskUrl = searchParams.get('asanaUrl');
  const driveFolderUrl = searchParams.get('driveUrl');
  const requestTitle = searchParams.get('title');

  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-zinc-900 mb-2">
                Request Submitted Successfully!
              </h1>
              <p className="text-zinc-600">
                Your art request has been submitted and processed.
              </p>
            </div>

            {requestTitle && (
              <div className="bg-zinc-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-zinc-600 mb-1">Request Title</p>
                <p className="font-semibold text-zinc-900">{requestTitle}</p>
              </div>
            )}

            <div className="space-y-4 mb-8">
              {asanaTaskUrl && (
                <a
                  href={asanaTaskUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-zinc-900">View in Asana</p>
                      <p className="text-sm text-zinc-600">
                        Track progress and collaborate on your request
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-400" />
                </a>
              )}

              {driveFolderUrl && (
                <a
                  href={driveFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-zinc-900">View in Google Drive</p>
                      <p className="text-sm text-zinc-600">
                        Access attachments and project files
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-400" />
                </a>
              )}
            </div>

            {submissionId && (
              <div className="text-center text-sm text-zinc-500 mb-6">
                Submission ID: {submissionId}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Link href="/request">
                <Button variant="default">Submit Another Request</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 py-12 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
