/**
 * API Base Path Helper
 *
 * Returns the correct base path for API calls based on environment.
 * - Production: /art/api
 * - Development: /api
 */

export function getApiPath(endpoint: string): string {
  const basePath = process.env.NODE_ENV === 'production' ? '/art' : '';
  return `${basePath}${endpoint}`;
}
