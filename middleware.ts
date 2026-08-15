import { NextRequest, NextResponse } from 'next/server';

/**
 * The canonical /dashboard URL had a long-lived Vercel CDN object from an
 * earlier production deployment. Keep the public URL stable while routing
 * the dashboard shell through a versioned request key so the live navigation
 * is always resolved by the current deployment.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.searchParams.set('__horus_ui', 'primary');

  const response = NextResponse.rewrite(url);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

export const config = {
  matcher: ['/dashboard'],
};
