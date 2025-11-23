import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { validateCSRFProtection, requiresCSRFProtection } from '@/lib/csrf';

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
  '/api/contests/all',        // Allow public contest listing
  '/api/daily-challenge',     // Allow public daily challenge
];

// Test routes - only available in development
const devOnlyRoutes = [
  '/api/ai/test',
  '/api/ai/models',
  '/api/ai/verify',
  '/api/ai/platform-test',
  '/api/ai/cache-test',
  '/api/ai/database-test',
  '/api/ai/integration-test'
];

// AI routes that require authentication
const aiProtectedRoutes = [
  '/api/ai/similar',
  '/api/ai/review'
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

  // Handle page routes - add security headers
  const response = NextResponse.next();
  addSecurityHeaders(response);
  return response;
}

function addSecurityHeaders(response: NextResponse): void {
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Enable XSS filter in older browsers
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy (CSP)
  // Note: This is a strict policy. May need adjustment based on your needs
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for Next.js dev
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.openai.com https://api.anthropic.com", // Allow AI API calls
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  response.headers.set('Content-Security-Policy', cspDirectives);
  
  // Permissions Policy (formerly Feature Policy)
  const permissionsPolicy = [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
    'magnetometer=()'
  ].join(', ');
  response.headers.set('Permissions-Policy', permissionsPolicy);
  
  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
}

function handleAPIRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // CSRF Protection: Validate origin/referer for state-changing requests
  if (requiresCSRFProtection(method)) {
    const csrfValidation = validateCSRFProtection(request, false); // Token not required yet, just origin check
    
    if (!csrfValidation.valid) {
      const response = NextResponse.json(
        { 
          success: false, 
          error: 'CSRF validation failed',
          details: process.env.NODE_ENV === 'development' ? csrfValidation.reason : undefined
        },
        { status: 403 }
      );
      addSecurityHeaders(response);
      return response;
    }
  }

  // Block debug/test routes in production
  if (process.env.NODE_ENV === 'production') {
    if (devOnlyRoutes.some(route => pathname.startsWith(route))) {
      const response = NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
      addSecurityHeaders(response);
      return response;
    }
  }

  // Allow public routes without authentication
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  // Dev-only routes are allowed in development
  if (process.env.NODE_ENV !== 'production' && devOnlyRoutes.some(route => pathname.startsWith(route))) {
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  // Check if this is a protected route (including AI routes)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) ||
                          aiProtectedRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedRoute) {
    // For unspecified API routes, allow them through
    // This provides flexibility for new routes
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  // For protected routes, just check if token exists (don't verify in Edge Runtime)
  // JWT verification will be done in the API routes themselves using Node.js runtime
  const token = getTokenFromRequest(request);

  if (!token) {
    const response = NextResponse.json(
      { success: false, error: 'Access token required' },
      { status: 401 }
    );
    addSecurityHeaders(response);
    return response;
  }

  // Token exists, let the API route handle verification
  const response = NextResponse.next();
  addSecurityHeaders(response);
  return response;
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
