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

    const paths = await PatternPath.find({ userId: user.id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: paths.map(toClient) });
  } catch (error) {
    console.error('GET /api/patterns error:', error);
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
    const { name, topic, description, problems } = body;

    if (!name?.trim() || !topic?.trim()) {
      return NextResponse.json({ success: false, error: 'Name and topic are required' }, { status: 400 });
    }

    const path = new PatternPath({
      userId: user.id,
      name: name.trim(),
      topic: topic.trim(),
      description: description?.trim() ?? '',
      problems: (problems ?? []).map((p: any) => ({
        id: p.id,
        title: p.title ?? '',
        url: p.url ?? '',
        difficulty: p.difficulty ?? '',
        notes: p.notes ?? '',
        completed: p.completed ?? false,
      })),
    });

    await path.save();
    return NextResponse.json({ success: true, data: toClient(path) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/patterns error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
