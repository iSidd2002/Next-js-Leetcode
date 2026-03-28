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

    const topicPatternContext = `
Topic → Common Pattern mappings for reference:
Array + Two Pointers → Two Pointers, Fast-Slow Pointers
Array + Sliding Window → Sliding Window (Fixed), Sliding Window (Variable)
Array + Hash Map → Hash Map Lookup, Frequency Count
Array + Sorting → Sort + Greedy, Sort + Two Pointers
Array + Binary Search → Binary Search on Answer, Binary Search on Sorted Array
Array + Prefix Sum → Prefix Sum, Kadane's Algorithm, Difference Array
Array + Stack → Monotonic Stack, Next Greater Element
Array + DP → 1D DP, Kadane's Algorithm, Buy-Sell Stock DP
Tree + DFS → DFS on Tree, Post-order DFS, Path Sum DFS
Tree + BFS → BFS Level Order, Zigzag BFS
Tree + DP → Tree DP, Diameter via DFS
Graph + DFS → DFS on Graph, Cycle Detection DFS, Connected Components
Graph + BFS → BFS Shortest Path, Multi-source BFS, 0-1 BFS
Graph + Topological Sort → Kahn's Algorithm, DFS Topological Sort
Graph + Union Find → Union Find, Disjoint Set Union
String + Sliding Window → Sliding Window + Char Frequency
String + DP → String DP, Edit Distance, LCS, Palindrome DP
String + Two Pointers → Two Pointers on String
String + Hashing → Rolling Hash, Rabin-Karp
Linked List → Fast-Slow Pointers, In-place Reversal, Two Pointers
Heap → Top-K with Heap, K-way Merge, Heap Simulation
Backtracking → Backtracking, Permutations, Subsets, N-Queens
DP (Interval) → Interval DP, Burst Balloons, Matrix Chain
DP (Bitmask) → Bitmask DP, TSP variant
DP (Grid) → Grid DP, Unique Paths, Dungeon DP
Greedy → Greedy, Activity Selection, Greedy with Sorting
Math → Math (Bit Tricks), Euclidean GCD, Fast Power, Modular Arithmetic
Bit Manipulation → XOR Tricks, Bit Manipulation, Bitmask
Trie → Trie Insert/Search, Trie + Backtracking
Segment Tree → Range Query, Lazy Propagation, Segment Tree
Divide and Conquer → Merge Sort, Divide and Conquer`;

    const prompt = `You are an expert competitive programmer. Identify the top 3 most relevant algorithmic patterns for this problem, ranked best-match first.

Problem title: ${title}
Difficulty: ${difficulty || 'not specified'}
Topics: ${topicsStr}
${notes ? `Notes: ${notes.slice(0, 400)}` : ''}

Reference mappings:${topicPatternContext}

Rules:
- Return EXACTLY 3 pattern names separated by " | " (pipe with spaces), nothing else
- Be specific: "Monotonic Stack" not "Stack", "Binary Search on Answer" not "Binary Search"
- Each pattern max 5 words
- No explanation, no numbering, no quotes

Example valid responses:
Sliding Window | Hash Map Lookup | Two Pointers
Monotonic Stack | Next Greater Element | Stack Simulation
Binary Search on Answer | Greedy | Sorting
Tree DP | Post-order DFS | Memoization
Union Find | BFS Shortest Path | Graph DFS
Backtracking | Permutations | Recursion

Return ONLY the 3 pipe-separated pattern names:`;

    const geminiClient = getGeminiClient();
    const response = await geminiClient.generateResponse(prompt, {
      userId: user.id,
      temperature: 0.3,
      maxTokens: 80,
    });

    const patterns = response.content
      .trim()
      .split('\n')[0]
      .split('|')
      .map(p => p.trim().replace(/^["'\d.\s-]+|["']+$/g, '').trim())
      .filter(p => p.length > 1 && p.length <= 100)
      .slice(0, 3);

    const pattern = patterns[0] || '';

    return NextResponse.json({ success: true, pattern, patterns });
  } catch (error) {
    console.error('AI pattern suggestion error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'AI unavailable' },
      { status: 500 }
    );
  }
}
