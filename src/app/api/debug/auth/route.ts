import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get all users (without passwords)
    const users = await User.find({}, { password: 0 }).lean();
    
    return NextResponse.json({
      success: true,
      data: {
        totalUsers: users.length,
        users: users.map(user => ({
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          createdAt: user.createdAt
        })),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set',
          jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
        }
      }
    });

  } catch (error) {
    console.error('Auth debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Test password comparison
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password, action } = await request.json();
    
    if (action === 'test-password') {
      if (!email || !password) {
        return NextResponse.json({
          success: false,
          error: 'Email and password required for password test'
        }, { status: 400 });
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      
      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found',
          debug: {
            searchedEmail: email.toLowerCase().trim(),
            totalUsers: await User.countDocuments()
          }
        }, { status: 404 });
      }

      const isValidPassword = await comparePassword(password, user.password);
      
      return NextResponse.json({
        success: true,
        data: {
          userFound: true,
          passwordValid: isValidPassword,
          user: {
            id: user._id.toString(),
            email: user.email,
            username: user.username
          },
          debug: {
            hashedPasswordLength: user.password.length,
            hashedPasswordPrefix: user.password.substring(0, 10) + '...'
          }
        }
      });
    }

    if (action === 'create-test-user') {
      const { hashPassword } = await import('@/lib/auth');
      
      const testEmail = 'test@example.com';
      const testPassword = 'password123';
      const testUsername = 'testuser';

      // Check if user already exists
      const existingUser = await User.findOne({ email: testEmail });
      if (existingUser) {
        return NextResponse.json({
          success: false,
          error: 'Test user already exists',
          data: {
            user: {
              id: existingUser._id.toString(),
              email: existingUser.email,
              username: existingUser.username
            }
          }
        });
      }

      // Create test user
      const hashedPassword = await hashPassword(testPassword);
      const newUser = new User({
        email: testEmail,
        username: testUsername,
        password: hashedPassword
      });

      await newUser.save();

      return NextResponse.json({
        success: true,
        data: {
          message: 'Test user created successfully',
          user: {
            id: newUser._id.toString(),
            email: newUser.email,
            username: newUser.username
          },
          credentials: {
            email: testEmail,
            password: testPassword
          }
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use "test-password" or "create-test-user"'
    }, { status: 400 });

  } catch (error) {
    console.error('Auth debug POST error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
