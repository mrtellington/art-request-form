/**
 * Error Boundary Provider
 *
 * Client component wrapper for ErrorBoundary to be used in server components.
 */

'use client';

import { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ErrorBoundaryProviderProps {
  children: ReactNode;
}

export function ErrorBoundaryProvider({ children }: ErrorBoundaryProviderProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // TODO: Send to error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  };

  return <ErrorBoundary onError={handleError}>{children}</ErrorBoundary>;
}
