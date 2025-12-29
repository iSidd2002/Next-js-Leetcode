import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear all auth cookies (must match login cookie settings)
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Match login cookie setting
      maxAge: 0, // Expire immediately
      path: '/'
    });

    // Clear the authentication indicator cookie
    response.cookies.set('auth-status', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Match login cookie setting
      maxAge: 0, // Expire immediately
      path: '/'
    });
    
    // Clear legacy user-id cookie if it exists (for backwards compatibility)
    response.cookies.set('user-id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
