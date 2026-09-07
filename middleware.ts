import { NextRequest, NextResponse } from 'next/server';
import { parseSessionToken } from '@/lib/session';

const PROTECTED_PREFIXES = ['/chat', '/settings', '/admin'];
const AUTH_PAGES = ['/login', '/register'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('wind_session')?.value;
  const session = token ? parseSessionToken(token) : null;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/admin') && session?.role !== 'admin') {
    return NextResponse.redirect(new URL('/chat', req.url));
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/chat', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/chat/:path*', '/settings/:path*', '/admin/:path*', '/login', '/register']
};
