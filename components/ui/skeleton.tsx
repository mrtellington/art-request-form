/**
 * Skeleton Loader Component
 *
 * Provides loading placeholders while content is being fetched.
 * Used throughout the application for better perceived performance.
 */

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-zinc-200", className)}
      {...props}
    />
  );
}

/**
 * Skeleton variants for common use cases
 */

export function SkeletonText({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn("h-4 w-full", className)} {...props} />;
}

export function SkeletonButton({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn("h-10 w-24", className)} {...props} />;
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("rounded-lg border border-zinc-200 p-6", className)} {...props}>
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, ...props }: SkeletonProps & { rows?: number }) {
  return (
    <div className="space-y-3" {...props}>
      {/* Header */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-10 w-1/4" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-12 w-1/4" />
          <Skeleton className="h-12 w-1/4" />
          <Skeleton className="h-12 w-1/4" />
          <Skeleton className="h-12 w-1/4" />
        </div>
      ))}
    </div>
  );
}
