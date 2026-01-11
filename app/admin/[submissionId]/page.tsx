/**
 * Submission Detail Page
 *
 * View and edit individual submission details.
 * Allows retrying failed submissions and viewing complete form data.
 */

'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
  products?: Array<{ name: string; quantity?: number; sku?: string }>;
  websiteLinks?: Array<{ url: string; description?: string }>;
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
  const submissionId = params.submissionId as string;

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

      const response = await fetch(`/api/submissions/${submissionId}/retry`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Retry failed');
      }

      // Refresh submission data
      await fetchSubmission();

      // Show success message
      alert('Submission retried successfully!');
    } catch (err) {
      console.error('Error retrying submission:', err);
      setError(err instanceof Error ? err.message : 'Failed to retry submission');
    } finally {
      setRetrying(false);
    }
  };

  // Load submission on mount
  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              Error Loading Submission
            </h2>
            <p className="text-zinc-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={fetchSubmission}>Try Again</Button>
              <Link href="/admin">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-zinc-600">Submission not found</p>
            <Link href="/admin">
              <Button variant="outline" className="mt-4">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Submissions
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">
              {submission.requestTitle || 'Untitled Request'}
            </h1>
            <p className="text-zinc-600">
              Submitted {new Date(submission.createdAt).toLocaleString()} by{' '}
              {submission.requestorEmail}
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
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="text-sm font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">
              Basic Information
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

            {/* Collaborators */}
            {submission.collaborators && submission.collaborators.length > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-200">
                <dt className="text-sm font-medium text-zinc-600 mb-2">Collaborators</dt>
                <ul className="text-sm text-zinc-900 space-y-1">
                  {submission.collaborators.map((email, index) => (
                    <li key={index}>{email}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Pertinent Information */}
          {submission.pertinentInformation && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-zinc-900 mb-4">
                Pertinent Information
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
                  <div key={product.id} className="border border-zinc-200 rounded-lg p-4">
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
                      {product.size && (
                        <div>
                          <dt className="text-zinc-600">Size</dt>
                          <dd className="text-zinc-900">{product.size}</dd>
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
                      {product.notes && (
                        <div className="col-span-2">
                          <dt className="text-zinc-600">Notes</dt>
                          <dd className="text-zinc-900">{product.notes}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Website Links */}
          {submission.websiteLinks && submission.websiteLinks.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-zinc-900 mb-4">
                Website & Social Links
              </h2>
              <ul className="space-y-2">
                {submission.websiteLinks.map((link, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-600">{link.type}</span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {link.url}
                    </a>
                  </li>
                ))}
              </ul>
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
                    <p className="text-xs text-red-700">{submission.errorDetails.step}</p>

                    <p className="text-xs font-medium text-red-800 mt-2">Retry Count</p>
                    <p className="text-xs text-red-700">
                      {submission.errorDetails.retryCount}
                    </p>
                  </>
                )}
              </div>
            )}
          </Card>

          {/* Integration Links */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              Integration Links
            </h2>
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
                <p className="text-sm text-zinc-500">No Asana task created</p>
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
                <p className="text-sm text-zinc-500">No Google Drive folder created</p>
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

          {/* Submission Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Submission Info</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-zinc-600">Submission ID</dt>
                <dd className="text-zinc-900 font-mono text-xs mt-1 break-all">
                  {submissionId}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-600">Created At</dt>
                <dd className="text-zinc-900 mt-1">
                  {new Date(submission.createdAt).toLocaleString()}
                </dd>
              </div>
              {submission.completedAt && (
                <div>
                  <dt className="text-zinc-600">Completed At</dt>
                  <dd className="text-zinc-900 mt-1">
                    {new Date(submission.completedAt).toLocaleString()}
                  </dd>
                </div>
              )}
              {submission.asanaTaskId && (
                <div>
                  <dt className="text-zinc-600">Asana Task ID</dt>
                  <dd className="text-zinc-900 font-mono text-xs mt-1 break-all">
                    {submission.asanaTaskId}
                  </dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
