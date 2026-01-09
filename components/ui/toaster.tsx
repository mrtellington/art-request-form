/**
 * Toaster Component
 *
 * Global toast notification system using sonner.
 * Provides success, error, info, and loading notifications.
 */

'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: 'white',
          color: '#18181B',
          border: '1px solid #E4E4E7',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
        classNames: {
          error: 'border-red-200 bg-red-50',
          success: 'border-green-200 bg-green-50',
          warning: 'border-amber-200 bg-amber-50',
          info: 'border-blue-200 bg-blue-50',
        },
      }}
    />
  );
}
