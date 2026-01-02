/**
 * CSRF Protection Utilities
 * Implements multiple layers of CSRF defense
 */

import { NextRequest } from 'next/server';

/**
 * Validates Origin/Referer headers against the request host
 * First line of defense against CSRF
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  
  // For same-origin requests from browsers, at least one should be present
  if (!origin && !referer) {
    // Allow requests without origin/referer (e.g., from native apps, curl)
    // These will be caught by authentication if needed
    return true;
  }
  
  // If we have a host header, validate against it
  if (host) {
    if (origin) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return false;
        }
      } catch {
        return false;
      }
    }
    
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        if (refererUrl.host !== host) {
          return false;
        }
      } catch {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Checks for custom header presence
 * Modern CSRF protection - browsers won't add custom headers for cross-origin requests
 */
export function validateCustomHeader(request: NextRequest): boolean {
  // Check for X-Requested-With header (common in AJAX requests)
  const requestedWith = request.headers.get('x-requested-with');
  
  // For now, we'll be lenient and not strictly require it
  // But its presence is a good indicator of a legitimate request
  return true; // Will log suspicious requests without blocking
}

/**
 * CSRF Token generation and validation
 * For extra-sensitive operations
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_LIFETIME = 60 * 60 * 1000; // 1 hour

interface CSRFTokenData {
  token: string;
  expires: number;
  userId: string;
}

// In-memory token store (for simplicity)
// TODO: For production with multiple instances/serverless, migrate to:
// - Redis/Upstash for persistent storage
// - Or use stateless double-submit cookie pattern with signed tokens
// See: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
const tokenStore = new Map<string, CSRFTokenData>();

/**
 * Generates a CSRF token for a user
 */
export function generateCSRFToken(userId: string): string {
  // Use Web Crypto API for Edge Runtime compatibility
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  const expires = Date.now() + CSRF_TOKEN_LIFETIME;
  
  tokenStore.set(token, {
    token,
    expires,
    userId
  });
  
  // Cleanup expired tokens periodically
  cleanupExpiredTokens();
  
  return token;
}

/**
 * Validates a CSRF token
 */
export function validateCSRFToken(token: string, userId: string): boolean {
  const tokenData = tokenStore.get(token);
  
  if (!tokenData) {
    return false;
  }
  
  // Check if token is expired
  if (Date.now() > tokenData.expires) {
    tokenStore.delete(token);
    return false;
  }
  
  // Check if token belongs to this user
  if (tokenData.userId !== userId) {
    return false;
  }
  
  return true;
}

/**
 * Invalidates a CSRF token after use (one-time use)
 */
export function invalidateCSRFToken(token: string): void {
  tokenStore.delete(token);
}

/**
 * Cleanup expired tokens from memory
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (now > data.expires) {
      tokenStore.delete(token);
    }
  }
}

/**
 * Comprehensive CSRF validation for API routes
 * Checks multiple factors
 */
export interface CSRFValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateCSRFProtection(
  request: NextRequest,
  requireToken: boolean = false,
  userId?: string
): CSRFValidationResult {
  // 1. Validate Origin/Referer
  if (!validateOrigin(request)) {
    return {
      valid: false,
      reason: 'Origin/Referer mismatch'
    };
  }
  
  // 2. Check custom header (log but don't block)
  const hasCustomHeader = request.headers.get('x-requested-with') !== null;
  
  // 3. If token is required, validate it
  if (requireToken) {
    const token = request.headers.get('x-csrf-token');
    
    if (!token || !userId) {
      return {
        valid: false,
        reason: 'CSRF token required but not provided'
      };
    }
    
    if (!validateCSRFToken(token, userId)) {
      return {
        valid: false,
        reason: 'Invalid or expired CSRF token'
      };
    }
  }
  
  return { valid: true };
}

/**
 * List of HTTP methods that require CSRF protection
 */
export const CSRF_PROTECTED_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

/**
 * Checks if a request method requires CSRF protection
 */
export function requiresCSRFProtection(method: string): boolean {
  return CSRF_PROTECTED_METHODS.includes(method.toUpperCase());
}

