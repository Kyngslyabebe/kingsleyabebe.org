import { NextRequest } from 'next/server';

/**
 * Validates that a POST request originated from the same site
 * by checking the Origin or Referer header against allowed origins.
 * This prevents cross-site request forgery (CSRF) attacks.
 */
export function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Require at least one of origin or referer
  if (!origin && !referer) return false;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const isDev = process.env.NODE_ENV === 'development';

  const allowedOrigins = [siteUrl].filter(Boolean);
  if (isDev) {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:3001');
  }

  // Check origin header first
  if (origin) {
    return allowedOrigins.some((allowed) => origin === allowed);
  }

  // Fall back to referer header
  if (referer) {
    return allowedOrigins.some((allowed) => referer.startsWith(allowed));
  }

  return false;
}
