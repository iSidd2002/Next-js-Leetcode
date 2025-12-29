/**
 * Global Rate Limiter
 * Prevents abuse and DDoS attacks by limiting request rates
 */

import { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// TODO: For production with multiple instances/serverless, migrate to:
// - @upstash/ratelimit for serverless environments
// - Redis for traditional deployments
// See: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  const ip = cfConnectingIp || (forwarded ? forwarded.split(',')[0].trim() : realIp) || 'unknown';
  
  // Optionally include user agent for more granular limiting
  const userAgent = request.headers.get('user-agent') || '';
  const userAgentHash = simpleHash(userAgent);
  
  return `${ip}:${userAgentHash}`;
}

/**
 * Simple hash function for user agent
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Rate limit configuration options
 */
export interface RateLimitOptions {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number;
  
  /**
   * Time window in milliseconds
   */
  windowMs: number;
  
  /**
   * Optional custom key generator
   */
  keyGenerator?: (request: NextRequest) => string;
  
  /**
   * Skip rate limiting function
   */
  skip?: (request: NextRequest) => boolean;
}

/**
 * Check if request should be rate limited
 * Returns true if request should be blocked
 */
export function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): { limited: boolean; remaining: number; resetTime: number } {
  // Skip if configured
  if (options.skip && options.skip(request)) {
    return { limited: false, remaining: options.maxRequests, resetTime: Date.now() + options.windowMs };
  }
  
  const key = options.keyGenerator ? options.keyGenerator(request) : getClientIdentifier(request);
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  // Reset if window has passed
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + options.windowMs
    };
    rateLimitStore.set(key, entry);
  }
  
  entry.count++;
  
  const limited = entry.count > options.maxRequests;
  const remaining = Math.max(0, options.maxRequests - entry.count);
  
  return {
    limited,
    remaining,
    resetTime: entry.resetTime
  };
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  /**
   * Strict limits for authentication endpoints
   * 5 requests per 15 minutes
   */
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000
  } as RateLimitOptions,
  
  /**
   * Moderate limits for API endpoints
   * 100 requests per minute
   */
  API: {
    maxRequests: 100,
    windowMs: 60 * 1000
  } as RateLimitOptions,
  
  /**
   * Strict limits for expensive AI operations
   * 10 requests per hour
   */
  AI: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000
  } as RateLimitOptions,
  
  /**
   * Relaxed limits for read-only operations
   * 200 requests per minute
   */
  READ_ONLY: {
    maxRequests: 200,
    windowMs: 60 * 1000
  } as RateLimitOptions,
  
  /**
   * Limits for public endpoints
   * 50 requests per minute
   */
  PUBLIC: {
    maxRequests: 50,
    windowMs: 60 * 1000
  } as RateLimitOptions
};

/**
 * Format rate limit headers for response
 */
export function getRateLimitHeaders(result: ReturnType<typeof checkRateLimit>, options: RateLimitOptions) {
  const resetTimeSeconds = Math.ceil(result.resetTime / 1000);
  
  return {
    'X-RateLimit-Limit': options.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': resetTimeSeconds.toString(),
    'Retry-After': result.limited ? Math.ceil((result.resetTime - Date.now()) / 1000).toString() : '0'
  };
}

