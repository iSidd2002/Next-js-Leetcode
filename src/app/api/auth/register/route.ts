import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, generateToken } from '@/lib/auth';
import { sanitizeEmail, sanitizeUsername, validatePassword } from '@/lib/input-validation';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validation
    if (!body.email || !body.username || !body.password) {
      return NextResponse.json({
        success: false,
        error: 'Email, username, and password are required'
      }, { status: 400 });
    }

    // Sanitize and validate inputs
    let email: string;
    let username: string;
    
    try {
      email = sanitizeEmail(body.email);
      username = sanitizeUsername(body.username);
      validatePassword(body.password);
    } catch (validationError) {
      return NextResponse.json({
        success: false,
        error: validationError instanceof Error ? validationError.message : 'Invalid input'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        { username }
      ]
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this email or username already exists'
      }, { status: 409 });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(body.password);

    const user = new User({
      email: email.toLowerCase(),
      username,
      password: hashedPassword
    });

    await user.save();

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
    }, { status: 201 });

    // Set HTTP-only cookie with the token
    // SECURITY: Using SameSite=strict for CSRF protection
    // Note: User ID is extracted from JWT token - no separate cookie needed
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Upgraded for CSRF protection
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    });

    // Set authentication indicator cookie (for client-side checks)
    response.cookies.set('auth-status', 'authenticated', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Keep as 'lax' for better UX
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
