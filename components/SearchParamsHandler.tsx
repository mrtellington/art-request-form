/**
 * Search Params Handler
 *
 * Wrapper component for useSearchParams() to satisfy Next.js 15 Suspense requirements
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';

interface SearchParamsHandlerProps {
  children: (draftId: string | undefined) => ReactNode;
}

export function SearchParamsHandler({ children }: SearchParamsHandlerProps) {
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId') || undefined;

  return <>{children(draftId)}</>;
}
