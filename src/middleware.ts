import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserFromRequest } from './lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the request is for admin routes
  if (pathname.startsWith('/api/admin/')) {
    const user = getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }
  }

  // Check if the request is for customer routes
  if (pathname.startsWith('/api/customer/')) {
    const user = getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/admin/:path*', '/api/customer/:path*']
}
