import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword, generateToken } from '@/lib/auth';

// Simple in-memory rate limiting (for production, use Redis or database)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function getRateLimitKey(request: NextRequest): string {
  // Use IP address for rate limiting
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
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
    const rateLimitKey = getRateLimitKey(request);
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json({
        success: false,
        error: 'Too many login attempts. Please try again in 15 minutes.'
      }, { status: 429 });
    }

    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    // Additional validation
    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid input format'
      }, { status: 400 });
    }

    if (email.length > 255 || password.length > 128) {
      return NextResponse.json({
        success: false,
        error: 'Input too long'
      }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
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

    // Set HTTP-only cookie with the token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Enhanced security
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    });

    // Also set userId cookie for easy access
    response.cookies.set('user-id', user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Enhanced security
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
