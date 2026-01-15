/**
 * Admin Layout
 *
 * Layout for admin pages with authentication guard.
 * Requires user to be authenticated with @whitestonebranding.com domain.
 */

'use client';

import { useAuth } from '@/lib/firebase/AuthContext';
import { signInWithGoogle, signOut } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import { Shield, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out');
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
            <Shield className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">
              Admin Access Required
            </h1>
            <p className="text-zinc-600 mb-6">
              Sign in with your @whitestonebranding.com account to access the admin
              dashboard.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4 text-sm font-figtree">
                {error}
              </div>
            )}

            <Button
              onClick={handleSignIn}
              disabled={signingIn}
              className="w-full mb-4"
              size="lg"
            >
              {signingIn ? 'Signing in...' : 'Sign in with Google'}
            </Button>

            <Link href="/">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - show admin layout
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin">
                <h1 className="text-xl font-bold text-zinc-900">Art Request Admin</h1>
              </Link>
              <nav className="flex gap-4">
                <Link href="/admin" className="text-sm text-zinc-600 hover:text-zinc-900">
                  Submissions
                </Link>
                <Link
                  href="/request"
                  className="text-sm text-zinc-600 hover:text-zinc-900"
                >
                  New Request
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600">{user.email}</span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main>{children}</main>
    </div>
  );
}
