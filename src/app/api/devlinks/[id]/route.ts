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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { url, title, description, category, tags, isRead } = body;

    const link = await DevLink.findOne({ _id: params.id, userId: user.id });
    if (!link) return NextResponse.json({ success: false, error: 'Link not found' }, { status: 404 });

    if (url !== undefined) {
      try { new URL(url.trim()); } catch {
        return NextResponse.json({ success: false, error: 'Invalid URL format' }, { status: 400 });
      }
      link.url = url.trim();
    }
    if (title !== undefined) link.title = title.trim();
    if (description !== undefined) link.description = description?.trim() || undefined;
    if (category !== undefined) link.category = category;
    if (tags !== undefined) link.tags = Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter(Boolean) : [];
    if (typeof isRead === 'boolean') link.isRead = isRead;

    await link.save();
    return NextResponse.json({ success: true, data: toClient(link) });
  } catch (error) {
    console.error('PUT /api/devlinks/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const link = await DevLink.findOneAndDelete({ _id: params.id, userId: user.id });
    if (!link) return NextResponse.json({ success: false, error: 'Link not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/devlinks/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
