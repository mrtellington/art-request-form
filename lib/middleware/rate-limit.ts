/**
 * Rate Limiting Middleware
 *
 * Simple in-memory rate limiter for API routes.
 * Prevents abuse and protects backend integrations.
 *
 * For production, consider using:
 * - Redis-backed rate limiting for distributed systems
 * - Upstash Rate Limit for serverless
 * - Cloudflare Rate Limiting at edge
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store (resets on server restart)
const store = new Map<string, RateLimitStore>();

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  max: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Optional message to return when rate limit is exceeded
   */
  message?: string;
}

/**
 * Get client identifier (IP address or fallback)
 */
function getClientId(request: NextRequest): string {
  // Try to get real IP from headers (consider proxy/CDN)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';

  return ip;
}

/**
 * Clean up expired entries from the store
 */
function cleanup() {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}

/**
 * Rate limit middleware
 *
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = await rateLimit(request, {
 *     max: 5,
 *     windowMs: 60000, // 1 minute
 *   });
 *
 *   if (!rateLimitResult.success) {
 *     return rateLimitResult.response;
 *   }
 *
 *   // Continue with request...
 * }
 * ```
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<{ success: boolean; response?: NextResponse }> {
  const clientId = getClientId(request);
  const key = `${clientId}:${request.nextUrl.pathname}`;
  const now = Date.now();

  // Clean up old entries periodically (1% chance)
  if (Math.random() < 0.01) {
    cleanup();
  }

  // Get or create rate limit entry
  let entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    store.set(key, entry);
    return { success: true };
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > config.max) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: config.message || 'Rate limit exceeded',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
          },
        }
      ),
    };
  }

  return { success: true };
}

/**
 * Common rate limit configurations
 */
export const RateLimits = {
  /** Strict rate limit for submission endpoints (5 requests per minute) */
  submit: { max: 5, windowMs: 60000 },

  /** Moderate rate limit for validation endpoints (30 requests per minute) */
  validate: { max: 30, windowMs: 60000 },

  /** Lenient rate limit for read endpoints (100 requests per minute) */
  read: { max: 100, windowMs: 60000 },

  /** Very strict rate limit for auth endpoints (3 requests per minute) */
  auth: { max: 3, windowMs: 60000 },
};
