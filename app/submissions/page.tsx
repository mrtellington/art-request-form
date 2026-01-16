/**
 * My Submissions Page
 *
 * Shows the current user's art request submissions.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { signOut } from '@/lib/firebase/auth';
import { getApiPath } from '@/lib/api-base-path';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonTable } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileEdit,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

interface Submission {
  id: string;
  createdAt: string;
  requestType: string;
  clientName: string;
  requestTitle: string;
  status: string;
  asanaTaskUrl?: string;
  googleDriveFolderUrl?: string;
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    complete: {
      icon: CheckCircle,
      className: 'bg-green-100 text-green-800 border-green-200',
      label: 'Complete',
    },
    processing: {
      icon: Clock,
      className: 'bg-primary/10 text-midnight border-primary/20',
      label: 'Processing',
    },
    error: {
      icon: AlertCircle,
      className: 'bg-red-100 text-red-800 border-red-200',
      label: 'Error',
    },
    draft: {
      icon: FileEdit,
      className: 'bg-zinc-100 text-zinc-800 border-zinc-200',
      label: 'Draft',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

export default function MySubmissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('email', user.email);

      const response = await fetch(getApiPath(`/api/submissions?${params.toString()}`));
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch submissions');
      }

      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  const handleDeleteDraft = useCallback(async (draftId: string) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    try {
      setDeletingId(draftId);
      setError(null);

      const response = await fetch(getApiPath(`/api/drafts/${draftId}`), {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete draft');
      }

      // Remove the draft from the list
      setSubmissions((prev) => prev.filter((sub) => sub.id !== draftId));
    } catch (err) {
      console.error('Error deleting draft:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete draft');
    } finally {
      setDeletingId(null);
    }
  }, []);

  useEffect(() => {
    if (user?.email) {
      fetchSubmissions();
    }
  }, [user?.email, fetchSubmissions]);

  // Loading auth state
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
        <div className="max-w-md w-full mx-4">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-midnight mb-4">Sign In Required</h1>
            <p className="text-zinc-600 mb-6">Please sign in to view your submissions.</p>
            <Link href="/request">
              <Button>Go to Sign In</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-midnight">My Submissions</h1>
            <div className="flex items-center gap-3">
              <Link href="/request">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Request
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Log Out
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto">
          <Card className="p-6">
            {/* Refresh Button */}
            <div className="mb-6 flex justify-end">
              <Button
                onClick={fetchSubmissions}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                <p className="text-sm font-figtree">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <SkeletonTable rows={5} />
            ) : (
              <>
                {/* Submissions Table */}
                <div className="rounded-lg border border-zinc-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-zinc-50">
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Links</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <div className="text-zinc-500">
                              <p className="mb-4">No submissions yet</p>
                              <Link href="/request">
                                <Button variant="outline" className="gap-2">
                                  <Plus className="w-4 h-4" />
                                  Create your first request
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        submissions.map((submission) => (
                          <TableRow
                            key={submission.id}
                            className="cursor-pointer hover:bg-zinc-50"
                          >
                            <TableCell className="font-medium">
                              {new Date(submission.createdAt).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )}
                            </TableCell>
                            <TableCell>{submission.requestType}</TableCell>
                            <TableCell>{submission.clientName}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {submission.requestTitle}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={submission.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              {submission.status === 'draft' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Link href={`/request?draftId=${submission.id}`}>
                                    <Button variant="outline" size="sm">
                                      Continue
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteDraft(submission.id)}
                                    disabled={deletingId === submission.id}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    {deletingId === submission.id ? (
                                      <span className="animate-spin">⏳</span>
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              ) : (
                                <Link href={`/submissions/${submission.id}`}>
                                  <Button variant="outline" size="sm">
                                    View
                                  </Button>
                                </Link>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Results Count */}
                {submissions.length > 0 && (
                  <div className="mt-4 text-sm text-zinc-600">
                    {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
