/**
 * Admin Dashboard
 *
 * Lists all art request submissions with search and filter capabilities.
 * Allows viewing, editing, and retrying submissions.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SkeletonTable } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  FileEdit,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface Submission {
  id: string;
  createdAt: string;
  requestType: string;
  clientName: string;
  requestTitle: string;
  status: string;
  requestorEmail: string;
  errorMessage?: string;
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

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch submissions from API
  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/art/api/submissions?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch submissions');
      }

      setSubmissions(data.submissions || []);
      setFilteredSubmissions(data.submissions || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load submissions';
      setError(errorMessage);
      toast.error('Failed to load submissions', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Load submissions on mount and when filter changes
  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Apply search filter
  useEffect(() => {
    if (!searchQuery) {
      setFilteredSubmissions(submissions);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = submissions.filter(
      (submission) =>
        submission.clientName?.toLowerCase().includes(query) ||
        submission.requestTitle?.toLowerCase().includes(query) ||
        submission.requestType?.toLowerCase().includes(query) ||
        submission.requestorEmail?.toLowerCase().includes(query)
    );
    setFilteredSubmissions(filtered);
  }, [searchQuery, submissions]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">
              Art Request Submissions
            </h1>
            <p className="text-zinc-600">View and manage all art request submissions</p>
          </div>
          <Button
            onClick={fetchSubmissions}
            variant="outline"
            className="gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="p-6">
        {/* Filters */}
        <div className="mb-6 flex gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search by client, title, type, or submitter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded font-figtree">
            <p className="text-sm font-medium">Error loading submissions</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <SkeletonTable rows={10} />
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
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                        {searchQuery || statusFilter !== 'all'
                          ? 'No submissions match your filters'
                          : 'No submissions found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          {new Date(submission.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>{submission.requestType}</TableCell>
                        <TableCell>{submission.clientName}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {submission.requestTitle}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-600">
                          {submission.requestorEmail}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={submission.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/${submission.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-zinc-600">
              Showing {filteredSubmissions.length} of {submissions.length} submissions
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
