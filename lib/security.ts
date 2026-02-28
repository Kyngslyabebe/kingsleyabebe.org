import { NextRequest } from 'next/server';

/**
 * Validates that a POST request originated from the same site
 * by checking the Origin header against allowed origins.
 * This prevents cross-site request forgery (CSRF) attacks.
 */
export function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');

  // Allow requests with no origin (e.g., server-to-server, same-origin navigation)
  if (!origin) return true;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const allowedOrigins = [
    siteUrl,
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean);

  return allowedOrigins.some((allowed) => origin === allowed);
}
