/**
 * Health Check API Route
 *
 * Provides application health status for monitoring and load balancers.
 * Returns 200 OK if application is healthy, 503 if unhealthy.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin (only when API is called)
function getFirestoreDb() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const checks: Record<string, { status: 'healthy' | 'unhealthy'; message?: string; responseTime?: number }> = {};

  // 1. Basic health check
  checks.app = { status: 'healthy', message: 'Application running' };

  // 2. Check Firestore connectivity (optional - can be slow)
  const checkFirestore = request.nextUrl.searchParams.get('checkDb') === 'true';
  if (checkFirestore) {
    try {
      const dbStartTime = Date.now();
      const db = getFirestoreDb();

      // Simple read to verify connection
      await db.collection('submissions').limit(1).get();

      checks.firestore = {
        status: 'healthy',
        message: 'Connected to Firestore',
        responseTime: Date.now() - dbStartTime,
      };
    } catch (error) {
      checks.firestore = {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Firestore connection failed',
      };
    }
  }

  // 3. Check environment variables
  const requiredEnvVars = [
    'FIREBASE_ADMIN_PROJECT_ID',
    'FIREBASE_ADMIN_CLIENT_EMAIL',
    'FIREBASE_ADMIN_PRIVATE_KEY',
    'ASANA_ACCESS_TOKEN',
    'ASANA_PROJECT_ID',
  ];

  const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
  checks.environment = {
    status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
    message:
      missingEnvVars.length === 0
        ? 'All required environment variables present'
        : `Missing: ${missingEnvVars.join(', ')}`,
  };

  // Determine overall health
  const isHealthy = Object.values(checks).every((check) => check.status === 'healthy');
  const totalResponseTime = Date.now() - startTime;

  const response = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    responseTime: totalResponseTime,
    version: process.env.npm_package_version || 'unknown',
    environment: process.env.NODE_ENV || 'unknown',
    checks,
  };

  return NextResponse.json(response, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
