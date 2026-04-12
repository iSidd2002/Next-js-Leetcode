import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PatternPath from '@/models/PatternPath';
import { authenticateRequest } from '@/lib/auth';
import { checkRateLimit, getRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limiter';

function toClient(doc: any) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    topic: doc.topic,
    description: doc.description,
    problems: doc.problems ?? [],
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  };
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const body = await request.json();
    const { name, topic, description, problems } = body;

    const path = await PatternPath.findOne({ _id: id, userId: user.id });
    if (!path) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    if (name !== undefined) path.name = name.trim();
    if (topic !== undefined) path.topic = topic.trim();
    if (description !== undefined) path.description = description.trim();
    if (problems !== undefined) {
      path.problems = problems.map((p: any) => ({
        id: p.id,
        title: p.title ?? '',
        url: p.url ?? '',
        difficulty: p.difficulty ?? '',
        notes: p.notes ?? '',
        completed: p.completed ?? false,
      }));
    }

    await path.save();
    return NextResponse.json({ success: true, data: toClient(path) });
  } catch (error) {
    console.error('PUT /api/patterns/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const result = await PatternPath.deleteOne({ _id: id, userId: user.id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/patterns/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
