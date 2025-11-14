import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/server-init';
import { cookies } from 'next/headers';

async function getAuthenticatedUser(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  if (!sessionCookie) {
    return null;
  }
  try {
    const admin = await getFirebaseAdmin();
    const decodedIdToken = await admin.auth().verifySessionCookie(sessionCookie, true);
    return decodedIdToken;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login');

  if (isAuthPage) {
    if (user) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/assets', '/debts', '/coaching', '/news', '/settings', '/login'],
};
