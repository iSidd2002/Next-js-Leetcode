import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/ai/gemini-client';
import { authenticateRequest } from '@/lib/auth';
import { checkRateLimit, getRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limiter';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request, RateLimitPresets.AI);
    if (rateLimit.limited) {
      const headers = getRateLimitHeaders(rateLimit, RateLimitPresets.AI);
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Try again later.' },
        { status: 429, headers }
      );
    }

    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, difficulty, topics, notes } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Problem title is required.' },
        { status: 400 }
      );
    }

    const topicsStr = Array.isArray(topics) && topics.length > 0 ? topics.join(', ') : 'not specified';
    const prompt = `You are a competitive programming expert. Given a problem's details, identify the single most relevant well-known algorithmic pattern name.

Problem title: ${title}
Difficulty: ${difficulty || 'not specified'}
Topics: ${topicsStr}
${notes ? `Notes: ${notes.slice(0, 300)}` : ''}

Rules:
- Return ONLY the pattern name, nothing else — no explanation, no punctuation, no quotes
- Use standard well-known pattern names from competitive programming
- Be specific: prefer "Monotonic Stack" over "Stack", "Binary Search on Answer" over "Binary Search"
- Max 5 words

Examples of correct responses:
Two Pointers
Prefix Sum
Sliding Window
Monotonic Stack
Binary Search on Answer
Interval DP
Greedy with Sorting
BFS Shortest Path
Union Find
Segment Tree Range Query
Meet in the Middle
Bitmask DP
Kadane's Algorithm
Dutch National Flag

Return ONLY the pattern name:`;

    const geminiClient = getGeminiClient();
    const response = await geminiClient.generateResponse(prompt, {
      userId: user.id,
      temperature: 0.4,
      maxTokens: 50,
    });

    const pattern = response.content
      .trim()
      .replace(/^["']|["']$/g, '') // strip surrounding quotes if any
      .split('\n')[0]              // take only first line
      .slice(0, 150);

    return NextResponse.json({ success: true, pattern });
  } catch (error) {
    console.error('AI pattern suggestion error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'AI unavailable' },
      { status: 500 }
    );
  }
}
