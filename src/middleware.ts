import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NOTE: Middleware is not currently used for auth protection as all auth
// is handled on the client-side. This file is a placeholder for if/when
// server-side auth protection is added.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
