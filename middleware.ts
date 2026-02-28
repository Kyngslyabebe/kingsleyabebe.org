import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseMiddlewareClient } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and login page
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/login' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Server-side auth check for admin routes
  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    const { supabase } = createSupabaseMiddlewareClient(request, response);

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  // Check maintenance mode for public routes
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('personal_info')
      .select('maintenance_mode, maintenance_message, maintenance_eta')
      .single();

    if (!error && data?.maintenance_mode) {
      return NextResponse.rewrite(new URL('/maintenance', request.url));
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
