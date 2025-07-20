import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Define protected API routes that require authentication
const PROTECTED_API_ROUTES = [
  '/api/problems',
  '/api/contests',
  '/api/auth/profile'
];

// Define public API routes that don't require authentication
const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/potd',
  '/api/companies'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only process API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if this is a public route
  const isPublicRoute = PUBLIC_API_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtectedRoute = PROTECTED_API_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (!isProtectedRoute) {
    // For routes not explicitly defined, allow them to pass through
    // Individual route handlers can implement their own auth checks
    return NextResponse.next();
  }

  // Extract JWT token from cookies
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Access token required' },
      { status: 401 }
    );
  }
  
  try {
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Add user info to request headers for use in API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.id);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-username', payload.username);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('JWT verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all API routes except:
     * - Static files
     * - Image optimization files
     * - Favicon
     */
    '/api/:path*'
  ]
};
