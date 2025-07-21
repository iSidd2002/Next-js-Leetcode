import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authUser = await authenticateRequest(request);

    if (!authUser) {
      return NextResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    // Handle development mode with mock user
    if (process.env.NODE_ENV === 'development' && authUser.id === '507f1f77bcf86cd799439011') {
      return NextResponse.json({
        success: true,
        data: {
          id: authUser.id,
          email: authUser.email,
          username: authUser.username,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          settings: {
            theme: 'light',
            notifications: true,
            emailUpdates: false
          }
        }
      });
    }

    // Get user profile from database
    const userProfile = await User.findById(authUser.id);

    if (!userProfile) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: userProfile._id.toString(),
        email: userProfile.email,
        username: userProfile.username,
        createdAt: userProfile.createdAt.toISOString(),
        updatedAt: userProfile.updatedAt.toISOString(),
        settings: userProfile.settings || {
          theme: 'light',
          notifications: true,
          emailUpdates: false
        }
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
