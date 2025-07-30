import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserFromRequest } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin route protection
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/admin')) {
    const user = getUserFromRequest(request);

    if (!user) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (user.role !== 'ADMIN') {
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Customer route protection
  if (pathname.startsWith('/api/customer') || pathname.startsWith('/profile') || pathname.startsWith('/orders') || pathname.startsWith('/checkout')) {
    const user = getUserFromRequest(request);

    if (!user) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/admin/:path*',
    '/api/customer/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/checkout/:path*',
  ],
};
