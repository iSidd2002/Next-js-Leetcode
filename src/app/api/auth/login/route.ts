import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      username: user.username
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          username: user.username
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
