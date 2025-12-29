import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword, generateToken } from '@/lib/auth';
import { sanitizeEmail } from '@/lib/input-validation';

// Simple in-memory rate limiting
// TODO: For production with multiple instances, migrate to Redis/Upstash for persistent rate limiting
// See: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Export for debugging purposes
export { loginAttempts };

function getRateLimitKey(request: NextRequest): string {
  // Use IP address for rate limiting
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || 'localhost';
  return ip;
}

function isRateLimited(key: string): boolean {
  const attempts = loginAttempts.get(key);
  if (!attempts) return false;

  const now = Date.now();
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    // Reset attempts after lockout period
    loginAttempts.delete(key);
    return false;
  }

  return attempts.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const attempts = loginAttempts.get(key);

  if (!attempts || now - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.set(key, { count: 1, lastAttempt: now });
  } else {
    attempts.count++;
    attempts.lastAttempt = now;
  }
}

function clearFailedAttempts(key: string): void {
  loginAttempts.delete(key);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Rate limiting check
    const       rateLimitKey = getRateLimitKey(request);
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json({
        success: false,
        error: 'Too many login attempts. Please try again in 15 minutes.'
      }, { status: 429 });
    }

    const body = await request.json();

    // Validation
    if (!body.email || !body.password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    // Additional validation
    if (typeof body.email !== 'string' || typeof body.password !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid input format'
      }, { status: 400 });
    }

    if (body.email.length > 255 || body.password.length > 128) {
      return NextResponse.json({
        success: false,
        error: 'Input too long'
      }, { status: 400 });
    }

    // Sanitize email
    let email: string;
    try {
      email = sanitizeEmail(body.email);
    } catch (validationError) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Check password
    const isValidPassword = await comparePassword(body.password, user.password);
    if (!isValidPassword) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(rateLimitKey);

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      username: user.username
    });

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          username: user.username
        }
      }
    });

    // Set HTTP-only cookie with the token (secure, server-side only)
    // SECURITY: Using SameSite=strict for CSRF protection
    // Note: User ID is extracted from JWT token - no separate cookie needed
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Upgraded from 'lax' for better CSRF protection
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    });

    // Set authentication indicator cookie (readable by JavaScript for client-side checks)
    // Note: Keeping as 'lax' since this is used for client-side navigation
    response.cookies.set('auth-status', 'authenticated', {
      httpOnly: false, // JavaScript can read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Keep as 'lax' for better UX with external navigation
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
