import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

// Define protected routes that require authentication
const protectedRoutes = [
  '/api/problems',
  '/api/todos',
  '/api/contests',
  '/api/auth/profile',
  '/api/auth/logout'
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/potd',
  '/api/health',
  '/api/debug'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files, Next.js internals, and public assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    return handleAPIRoute(request);
  }

  // Handle page routes - for now, let client-side handle authentication
  // This allows the app to work without forcing server-side redirects
  return NextResponse.next();
}

function handleAPIRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes without authentication
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!isProtectedRoute) {
    // For unspecified API routes, allow them through
    // This provides flexibility for new routes
    return NextResponse.next();
  }

  // For protected routes, verify authentication
  try {
    console.log(`🔍 Middleware: Processing protected route ${pathname}`);
    const token = getTokenFromRequest(request);
    console.log(`🔍 Middleware: Token found: ${token ? 'YES' : 'NO'}`);

    if (!token) {
      console.log(`🔒 Middleware: No token found for protected route: ${pathname}`);
      return NextResponse.json(
        { success: false, error: 'Access token required' },
        { status: 401 }
      );
    }

    // Verify the token
    console.log(`🔍 Middleware: Verifying token...`);
    const payload = verifyToken(token);
    console.log(`🔍 Middleware: Token payload:`, payload);

    if (!payload || !payload.id || !payload.email) {
      console.log(`🔒 Middleware: Invalid token payload for route: ${pathname}`);
      return NextResponse.json(
        { success: false, error: 'Invalid access token' },
        { status: 401 }
      );
    }

    // Add user information to request headers for API routes to use
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.id);
    response.headers.set('x-user-email', payload.email);
    response.headers.set('x-user-username', payload.username);

    console.log(`✅ Middleware: Authenticated request for ${pathname} by user ${payload.email}`);
    return response;

  } catch (error) {
    console.error(`🔒 Authentication error for ${pathname}:`, error);
    
    // Determine the appropriate error message
    let errorMessage = 'Authentication failed';
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        errorMessage = 'Access token expired';
      } else if (error.message.includes('invalid')) {
        errorMessage = 'Invalid access token';
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 401 }
    );
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
