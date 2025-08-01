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

    // Validate user ID format
    if (!authUser.id || typeof authUser.id !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid user ID'
      }, { status: 400 });
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
