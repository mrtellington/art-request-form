import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import { AuthProvider } from '@/lib/firebase/AuthContext';
import { ErrorBoundaryProvider } from '@/components/providers/ErrorBoundaryProvider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-figtree',
  display: 'swap',
});

// Get base path for production
const basePath = process.env.NODE_ENV === 'production' ? '/art' : '';

export const metadata: Metadata = {
  title: 'Art Request Form | Whitestone Branding',
  description:
    'Submit art requests for design services, mockups, presentations, proofs, and more.',
  icons: {
    icon: [
      { url: `${basePath}/favicon.ico`, sizes: '32x32' },
      { url: `${basePath}/favicon.svg`, type: 'image/svg+xml' },
    ],
    apple: `${basePath}/logo.png`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} font-sans antialiased`}>
        <ErrorBoundaryProvider>
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </ErrorBoundaryProvider>
      </body>
    </html>
  );
}
