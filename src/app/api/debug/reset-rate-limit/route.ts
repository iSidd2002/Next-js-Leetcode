import { NextRequest, NextResponse } from 'next/server';

// Import the loginAttempts map from the login route
// Note: This is a temporary solution for development. In production, use Redis or database.
let loginAttempts: Map<string, { count: number; lastAttempt: number }>;

try {
  // Dynamic import to access the loginAttempts map
  const loginModule = require('../../auth/login/route');
  loginAttempts = loginModule.loginAttempts;
} catch (error) {
  console.error('Could not import loginAttempts:', error);
}

export async function POST(request: NextRequest) {
  try {
    if (!loginAttempts) {
      return NextResponse.json({
        success: false,
        error: 'Could not access rate limiting data'
      }, { status: 500 });
    }

    const beforeCount = loginAttempts.size;
    
    // Clear all rate limiting data
    loginAttempts.clear();
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Rate limiting data cleared successfully',
        clearedEntries: beforeCount,
        currentEntries: loginAttempts.size
      }
    });

  } catch (error) {
    console.error('Rate limit reset error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!loginAttempts) {
      return NextResponse.json({
        success: false,
        error: 'Could not access rate limiting data'
      }, { status: 500 });
    }

    const entries = Array.from(loginAttempts.entries()).map(([key, value]) => ({
      ip: key,
      attempts: value.count,
      lastAttempt: new Date(value.lastAttempt).toISOString(),
      isLocked: value.count >= 5
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalEntries: loginAttempts.size,
        entries
      }
    });

  } catch (error) {
    console.error('Rate limit check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
