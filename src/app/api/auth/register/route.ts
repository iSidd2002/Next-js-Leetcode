import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, username, password } = await request.json();

    // Validation
    if (!email || !username || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email, username, and password are required'
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 6 characters long'
      }, { status: 400 });
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json({
        success: false,
        error: 'Username must be between 3 and 30 characters'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
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
    const hashedPassword = await hashPassword(password);

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
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
