import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { configErrorMessage, missingSupabaseEnv } from '@/lib/env';

export async function middleware(request: NextRequest) {
  // Runs before any admin page. Without credentials the Supabase client
  // throws here and the visitor gets an opaque error digest, so report the
  // missing variables by name instead.
  const missing = missingSupabaseEnv();
  if (missing.length > 0) {
    return new NextResponse(configErrorMessage(missing), {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isLoginRoute = pathname === '/admin/login';

  if (!user && !isLoginRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin/login';
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isLoginRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin';
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
