import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/firebase/AuthContext";
import { ErrorBoundaryProvider } from "@/components/providers/ErrorBoundaryProvider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Art Request Form | Whitestone Branding",
  description: "Submit art requests for design services, mockups, presentations, proofs, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundaryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </ErrorBoundaryProvider>
      </body>
    </html>
  );
}
