import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import DevLink from '@/models/DevLink';
import { authenticateRequest } from '@/lib/auth';
import { checkRateLimit, getRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limiter';

function toClient(doc: any) {
  return {
    id: doc._id.toString(),
    url: doc.url,
    title: doc.title,
    description: doc.description,
    category: doc.category,
    tags: doc.tags ?? [],
    isRead: doc.isRead,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

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

    const links = await DevLink.find({ userId: user.id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: links.map(toClient) });
  } catch (error) {
    console.error('GET /api/devlinks error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const { url, title, description, category, tags } = body;

    if (!url?.trim() || !title?.trim()) {
      return NextResponse.json({ success: false, error: 'URL and title are required' }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(url.trim());
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid URL format' }, { status: 400 });
    }

    const link = new DevLink({
      userId: user.id,
      url: url.trim(),
      title: title.trim(),
      description: description?.trim() || undefined,
      category: category || 'other',
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter(Boolean) : [],
      isRead: false,
    });

    await link.save();
    return NextResponse.json({ success: true, data: toClient(link) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/devlinks error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
