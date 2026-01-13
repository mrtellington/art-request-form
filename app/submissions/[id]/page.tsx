/**
 * User Submission Detail Page
 *
 * View individual submission details and retry failed submissions.
 * Only accessible to the user who created the submission.
 */

'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/AuthContext';
import { signOut } from '@/lib/firebase/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  FileText,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface Submission {
  id: string;
  requestType: string;
  clientName: string;
  requestTitle: string;
  region: string;
  dueDate?: string;
  projectValue?: string;
  billable?: string;
  requestorEmail: string;
  requestorName?: string;
  pertinentInformation?: string;
  products?: Array<{
    id: string;
    name: string;
    color?: string;
    imprintMethod?: string;
    imprintColor?: string;
    location?: string;
    size?: string;
    link?: string;
    notes?: string;
  }>;
  websiteLinks?: Array<{ type: string; url: string }>;
  labels?: string[];
  collaborators?: string[];
  status: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  errorDetails?: {
    step: string;
    timestamp: string;
    retryCount: number;
    lastError?: string;
  };
  asanaTaskId?: string;
  asanaTaskUrl?: string;
  googleDriveFolderId?: string;
  googleDriveFolderUrl?: string;
  uploadedFiles?: Array<{ id: string; name: string; url: string }>;
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    complete: {
      icon: CheckCircle,
      className: 'bg-green-100 text-green-800',
      label: 'Complete',
    },
    processing: {
      icon: Clock,
      className: 'bg-primary/10 text-midnight',
      label: 'Processing',
    },
    error: {
      icon: AlertCircle,
      className: 'bg-red-100 text-red-800',
      label: 'Error',
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.processing;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium w-full ${config.className}`}
    >
      <Icon className="w-4 h-4" />
      {config.label}
    </div>
  );
}

export default function SubmissionDetailPage() {
  const params = useParams();
  const submissionId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch submission data
  const fetchSubmission = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/submissions/${submissionId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch submission');
      }

      setSubmission(data.submission);
    } catch (err) {
      console.error('Error fetching submission:', err);
      setError(err instanceof Error ? err.message : 'Failed to load submission');
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  // Retry failed submission
  const handleRetry = async () => {
    if (!submission) return;

    try {
      setRetrying(true);
      setError(null);

      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Retry failed');
      }

      // Refresh submission data
      await fetchSubmission();
    } catch (err) {
      console.error('Error retrying submission:', err);
      setError(err instanceof Error ? err.message : 'Failed to retry submission');
    } finally {
      setRetrying(false);
    }
  };

  // Load submission on mount
  useEffect(() => {
    if (user) {
      fetchSubmission();
    }
  }, [fetchSubmission, user]);

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-midnight mb-4">Sign In Required</h1>
          <p className="text-zinc-600 mb-6">Please sign in to view this submission.</p>
          <Link href="/request">
            <Button>Go to Sign In</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Check if user owns the submission
  if (
    submission &&
    submission.requestorEmail.toLowerCase() !== user.email?.toLowerCase()
  ) {
    return (
      <div className="min-h-screen bg-zinc-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="p-8 text-center max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-midnight mb-4">Access Denied</h1>
            <p className="text-zinc-600 mb-6">
              You don&apos;t have permission to view this submission.
            </p>
            <Link href="/submissions">
              <Button>Back to My Submissions</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-zinc-600">Loading submission...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="min-h-screen bg-zinc-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="p-6 max-w-2xl mx-auto">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-zinc-900 mb-2">
                Error Loading Submission
              </h2>
              <p className="text-zinc-600 mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={fetchSubmission}>Try Again</Button>
                <Link href="/submissions">
                  <Button variant="outline">Back to My Submissions</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-zinc-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="p-6 max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-zinc-600">Submission not found</p>
              <Link href="/submissions">
                <Button variant="outline" className="mt-4">
                  Back to My Submissions
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/submissions">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to My Submissions
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Log Out
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-midnight mb-2">
                {submission.requestTitle || 'Untitled Request'}
              </h1>
              <p className="text-zinc-600">
                Submitted {new Date(submission.createdAt).toLocaleString()}
              </p>
            </div>

            {submission.status === 'error' && (
              <Button onClick={handleRetry} disabled={retrying} className="gap-2">
                <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                {retrying ? 'Retrying...' : 'Retry Submission'}
              </Button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-5xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            <p className="text-sm font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-zinc-900 mb-4">
                Request Details
              </h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-zinc-600">Request Type</dt>
                  <dd className="text-sm text-zinc-900 mt-1">{submission.requestType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-600">Client</dt>
                  <dd className="text-sm text-zinc-900 mt-1">{submission.clientName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-600">Region</dt>
                  <dd className="text-sm text-zinc-900 mt-1">
                    {submission.region || 'N/A'}
                  </dd>
                </div>
                {submission.dueDate && (
                  <div>
                    <dt className="text-sm font-medium text-zinc-600">Due Date</dt>
                    <dd className="text-sm text-zinc-900 mt-1">
                      {new Date(submission.dueDate).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {submission.projectValue && (
                  <div>
                    <dt className="text-sm font-medium text-zinc-600">Project Value</dt>
                    <dd className="text-sm text-zinc-900 mt-1">
                      {submission.projectValue}
                    </dd>
                  </div>
                )}
                {submission.billable && (
                  <div>
                    <dt className="text-sm font-medium text-zinc-600">Billable</dt>
                    <dd className="text-sm text-zinc-900 mt-1">{submission.billable}</dd>
                  </div>
                )}
              </dl>

              {/* Labels */}
              {submission.labels && submission.labels.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-200">
                  <dt className="text-sm font-medium text-zinc-600 mb-2">Labels</dt>
                  <div className="flex flex-wrap gap-2">
                    {submission.labels.map((label) => (
                      <span
                        key={label}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-midnight"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Pertinent Information */}
            {submission.pertinentInformation && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-zinc-900 mb-4">
                  Project Details
                </h2>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: submission.pertinentInformation }}
                />
              </Card>
            )}

            {/* Products */}
            {submission.products && submission.products.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-zinc-900 mb-4">Products</h2>
                <div className="space-y-4">
                  {submission.products.map((product, index) => (
                    <div
                      key={product.id}
                      className="border border-zinc-200 rounded-lg p-4"
                    >
                      <h3 className="font-medium text-zinc-900 mb-3">
                        Product {index + 1}: {product.name}
                      </h3>
                      <dl className="grid grid-cols-2 gap-3 text-sm">
                        {product.color && (
                          <div>
                            <dt className="text-zinc-600">Color</dt>
                            <dd className="text-zinc-900">{product.color}</dd>
                          </div>
                        )}
                        {product.imprintMethod && (
                          <div>
                            <dt className="text-zinc-600">Imprint Method</dt>
                            <dd className="text-zinc-900">{product.imprintMethod}</dd>
                          </div>
                        )}
                        {product.imprintColor && (
                          <div>
                            <dt className="text-zinc-600">Imprint Color</dt>
                            <dd className="text-zinc-900">{product.imprintColor}</dd>
                          </div>
                        )}
                        {product.location && (
                          <div>
                            <dt className="text-zinc-600">Location</dt>
                            <dd className="text-zinc-900">{product.location}</dd>
                          </div>
                        )}
                        {product.link && (
                          <div className="col-span-2">
                            <dt className="text-zinc-600">Product Link</dt>
                            <dd className="text-zinc-900">
                              <a
                                href={product.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {product.link}
                              </a>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Status</h2>
              <StatusBadge status={submission.status} />

              {/* Error Details */}
              {submission.status === 'error' && submission.errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-xs font-medium text-red-800 mb-1">Error Message</p>
                  <p className="text-xs text-red-700">{submission.errorMessage}</p>

                  {submission.errorDetails && (
                    <>
                      <p className="text-xs font-medium text-red-800 mt-2">Failed Step</p>
                      <p className="text-xs text-red-700">
                        {submission.errorDetails.step}
                      </p>
                    </>
                  )}
                </div>
              )}
            </Card>

            {/* Links */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Links</h2>
              <div className="space-y-3">
                {submission.asanaTaskUrl ? (
                  <a
                    href={submission.asanaTaskUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:text-midnight"
                  >
                    <FileText className="w-4 h-4" />
                    View in Asana
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <p className="text-sm text-zinc-500">Asana task pending</p>
                )}

                {submission.googleDriveFolderUrl ? (
                  <a
                    href={submission.googleDriveFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800"
                  >
                    <FolderOpen className="w-4 h-4" />
                    View in Google Drive
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <p className="text-sm text-zinc-500">Drive folder pending</p>
                )}
              </div>

              {/* Uploaded Files */}
              {submission.uploadedFiles && submission.uploadedFiles.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-200">
                  <h3 className="text-sm font-medium text-zinc-700 mb-2">
                    Uploaded Files ({submission.uploadedFiles.length})
                  </h3>
                  <ul className="space-y-2">
                    {submission.uploadedFiles.map((file) => (
                      <li key={file.id}>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline truncate block"
                        >
                          {file.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            {/* Timestamps */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Timeline</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-zinc-600">Submitted</dt>
                  <dd className="text-zinc-900 mt-1">
                    {new Date(submission.createdAt).toLocaleString()}
                  </dd>
                </div>
                {submission.completedAt && (
                  <div>
                    <dt className="text-zinc-600">Completed</dt>
                    <dd className="text-zinc-900 mt-1">
                      {new Date(submission.completedAt).toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
