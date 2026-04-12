import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';
import { checkRateLimit, getRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request, RateLimitPresets.API);
    if (rateLimit.limited) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded.' }, {
        status: 429, headers: getRateLimitHeaders(rateLimit, RateLimitPresets.API),
      });
    }

    await connectDB();
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Access token required' }, { status: 401 });

    const dbUser = await User.findById(user.id).select('settings');
    if (!dbUser) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const settings = dbUser.settings ?? {};
    return NextResponse.json({
      success: true,
      data: {
        reviewIntervals: settings.reviewIntervals ?? [2, 5, 7],
        notifications: settings.notifications ?? true,
        theme: settings.theme ?? 'light',
        emailUpdates: settings.emailUpdates ?? false,
      },
    });
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request, RateLimitPresets.API);
    if (rateLimit.limited) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded.' }, {
        status: 429, headers: getRateLimitHeaders(rateLimit, RateLimitPresets.API),
      });
    }

    await connectDB();
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Access token required' }, { status: 401 });

    const body = await request.json();
    const { reviewIntervals, notifications, theme, emailUpdates } = body;

    const patch: Record<string, unknown> = {};
    if (Array.isArray(reviewIntervals) && reviewIntervals.every((n: unknown) => typeof n === 'number' && n > 0)) {
      patch['settings.reviewIntervals'] = reviewIntervals;
    }
    if (typeof notifications === 'boolean') patch['settings.notifications'] = notifications;
    if (theme === 'light' || theme === 'dark') patch['settings.theme'] = theme;
    if (typeof emailUpdates === 'boolean') patch['settings.emailUpdates'] = emailUpdates;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid settings provided' }, { status: 400 });
    }

    const updated = await User.findByIdAndUpdate(
      user.id,
      { $set: patch },
      { new: true, select: 'settings' }
    );

    if (!updated) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const settings = updated.settings ?? {};
    return NextResponse.json({
      success: true,
      data: {
        reviewIntervals: settings.reviewIntervals ?? [2, 5, 7],
        notifications: settings.notifications ?? true,
        theme: settings.theme ?? 'light',
        emailUpdates: settings.emailUpdates ?? false,
      },
    });
  } catch (error) {
    console.error('PUT /api/settings error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
