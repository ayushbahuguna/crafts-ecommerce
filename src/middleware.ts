import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserFromRequest } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and Next.js internals
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Admin route protection
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/admin')) {
    const user = await getUserFromRequest(request);
    
    // Debug logging (remove in production)
    console.log('Middleware - Admin route accessed:', pathname);
    console.log('Middleware - User from request:', user ? { id: user.userId, role: user.role } : 'No user');
    console.log('Middleware - Cookies:', request.cookies.get('auth-token')?.value ? 'Token present' : 'No token');

    if (!user) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      // For admin pages (not API), redirect to login
      console.log('Middleware - Redirecting to login, no user found');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (user.role !== 'ADMIN') {
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        );
      }
      // For admin pages (not API), redirect to home
      console.log('Middleware - Redirecting to home, user is not admin:', user.role);
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    console.log('Middleware - Admin access granted');
  }

  // Customer route protection
  if (pathname.startsWith('/api/customer') || pathname.startsWith('/customer') || pathname.startsWith('/checkout')) {
    const user = await getUserFromRequest(request);

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
    '/customer/:path*',
    '/checkout/:path*',
  ],
};
