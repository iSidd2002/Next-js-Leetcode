import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/ai/gemini-client';
import { authenticateRequest } from '@/lib/auth';
import { checkRateLimit, getRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limiter';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Well-known problem → patterns lookup (fast path, no AI needed)
const KNOWN_PATTERNS: Record<string, string[]> = {
  'two sum': ['Hash Map Lookup', 'Two Pointers', 'Brute Force'],
  '3sum': ['Two Pointers', 'Sort + Two Pointers', 'Hash Set'],
  '4sum': ['Two Pointers', 'Sort + Two Pointers', 'Hash Set'],
  'two sum ii': ['Two Pointers', 'Binary Search', 'Hash Map Lookup'],
  'maximum subarray': ["Kadane's Algorithm", '1D DP', 'Divide and Conquer'],
  'best time to buy and sell stock': ['Greedy', "Kadane's Algorithm", 'Sliding Window'],
  'container with most water': ['Two Pointers', 'Greedy', 'Binary Search'],
  'trapping rain water': ['Monotonic Stack', 'Two Pointers', 'Prefix Max Array'],
  'valid parentheses': ['Stack', 'Monotonic Stack', 'Greedy'],
  'longest valid parentheses': ['Stack', '1D DP', 'Two Pointers'],
  'minimum window substring': ['Sliding Window + Char Frequency', 'Two Pointers', 'Hash Map'],
  'longest substring without repeating characters': ['Sliding Window (Variable)', 'Hash Map Lookup', 'Two Pointers'],
  'find all anagrams in a string': ['Sliding Window (Fixed)', 'Char Frequency', 'Hash Map'],
  'permutation in string': ['Sliding Window (Fixed)', 'Char Frequency', 'Hash Map'],
  'climbing stairs': ['1D DP', 'Fibonacci / Memoization', 'Bottom-up DP'],
  'coin change': ['1D DP', 'BFS Shortest Path', 'Memoization'],
  'coin change ii': ['2D DP (Unbounded Knapsack)', 'Bottom-up DP', 'Memoization'],
  'house robber': ['1D DP', 'Greedy', 'Bottom-up DP'],
  'house robber ii': ['1D DP (Circular)', 'Bottom-up DP', 'Greedy'],
  'longest increasing subsequence': ['1D DP', 'Binary Search + Patience Sort', 'Memoization'],
  'longest common subsequence': ['2D DP', 'String DP', 'Memoization'],
  'edit distance': ['2D DP', 'String DP', 'Memoization'],
  'word break': ['1D DP', 'BFS', 'Memoization + Trie'],
  'word break ii': ['Backtracking + Memoization', '1D DP', 'DFS'],
  'unique paths': ['Grid DP', '2D DP', 'Math (Combinations)'],
  'unique paths ii': ['Grid DP', '2D DP', 'Bottom-up DP'],
  'minimum path sum': ['Grid DP', '2D DP', 'Bottom-up DP'],
  'jump game': ['Greedy', '1D DP', 'BFS'],
  'jump game ii': ['Greedy', 'BFS Level Order', '1D DP'],
  'merge intervals': ['Sort + Merge', 'Greedy', 'Interval Processing'],
  'insert interval': ['Interval Processing', 'Binary Search', 'Greedy'],
  'meeting rooms': ['Sorting', 'Greedy', 'Sweep Line'],
  'meeting rooms ii': ['Min Heap', 'Sweep Line', 'Sort + Greedy'],
  'number of islands': ['DFS on Grid', 'BFS on Grid', 'Union Find'],
  'max area of island': ['DFS on Grid', 'BFS on Grid', 'Union Find'],
  'surrounded regions': ['DFS on Grid', 'BFS from Border', 'Union Find'],
  'pacific atlantic water flow': ['Multi-source BFS', 'DFS from Border', 'BFS on Grid'],
  'word search': ['DFS Backtracking', 'Backtracking', 'DFS on Grid'],
  'word search ii': ['Trie + Backtracking', 'DFS Backtracking', 'Trie'],
  'course schedule': ['Topological Sort (Kahn\'s)', 'DFS Cycle Detection', 'Kahn\'s Algorithm'],
  'course schedule ii': ['Topological Sort (Kahn\'s)', 'DFS Topological Sort', 'Kahn\'s Algorithm'],
  'alien dictionary': ['Topological Sort', 'BFS Topological Sort', 'Graph DFS'],
  'number of connected components': ['Union Find', 'DFS on Graph', 'BFS on Graph'],
  'graph valid tree': ['Union Find', 'DFS Cycle Detection', 'BFS'],
  'clone graph': ['DFS on Graph', 'BFS on Graph', 'Hash Map + DFS'],
  'network delay time': ['Dijkstra', 'Bellman-Ford', 'BFS Shortest Path'],
  'cheapest flights within k stops': ['Bellman-Ford (K steps)', 'BFS Shortest Path', 'Dijkstra'],
  'find median from data stream': ['Two Heaps (Min + Max)', 'Heap Simulation', 'Sorted Insert'],
  'sliding window maximum': ['Monotonic Deque', 'Monotonic Stack', 'Sliding Window'],
  'top k frequent elements': ['Top-K with Heap', 'Bucket Sort', 'Quick Select'],
  'kth largest element': ['Quick Select', 'Top-K with Heap', 'Sorting'],
  'merge k sorted lists': ['K-way Merge (Heap)', 'Divide and Conquer', 'Min Heap'],
  'reverse linked list': ['In-place Reversal', 'Iterative Pointer Swap', 'Recursion'],
  'reverse linked list ii': ['In-place Reversal', 'Two Pointers', 'Iterative'],
  'linked list cycle': ['Fast-Slow Pointers', "Floyd's Cycle Detection", 'Hash Set'],
  'linked list cycle ii': ['Fast-Slow Pointers', "Floyd's Cycle Detection", 'Math'],
  'remove nth node from end': ['Two Pointers (Gap)', 'Fast-Slow Pointers', 'Length Calculation'],
  'reorder list': ['Fast-Slow Pointers', 'In-place Reversal', 'Linked List Split'],
  'lru cache': ['Hash Map + Doubly Linked List', 'Ordered Dict', 'Hash Map + DLL'],
  'valid sudoku': ['Hash Set', 'Bitmask', 'Constraint Checking'],
  'sudoku solver': ['Backtracking', 'DFS Backtracking', 'Constraint Propagation'],
  'n-queens': ['Backtracking', 'DFS Backtracking', 'Bitmask'],
  'combination sum': ['Backtracking', 'DFS Backtracking', 'Recursion'],
  'combination sum ii': ['Backtracking + Dedup', 'DFS Backtracking', 'Sorting + Backtrack'],
  'permutations': ['Backtracking', 'Permutations', 'Swap Recursion'],
  'permutations ii': ['Backtracking + Dedup', 'Permutations', 'Sorting + Backtrack'],
  'subsets': ['Backtracking', 'Bit Manipulation', 'Power Set'],
  'subsets ii': ['Backtracking + Dedup', 'Sorting + Backtrack', 'Bit Manipulation'],
  'palindrome partitioning': ['Backtracking + DP', 'DFS Backtracking', 'Palindrome DP'],
  'binary tree inorder traversal': ['DFS on Tree', 'Morris Traversal', 'Iterative Stack'],
  'validate binary search tree': ['DFS on Tree (Range)', 'In-order DFS', 'Morris Traversal'],
  'lowest common ancestor': ['DFS on Tree', 'Post-order DFS', 'Binary Lifting'],
  'diameter of binary tree': ['Post-order DFS', 'Tree DP', 'DFS on Tree'],
  'maximum depth of binary tree': ['DFS on Tree', 'BFS Level Order', 'Recursion'],
  'balanced binary tree': ['Post-order DFS', 'DFS on Tree', 'Bottom-up DP'],
  'symmetric tree': ['DFS on Tree', 'BFS Level Order', 'Mirror Check'],
  'path sum': ['DFS on Tree', 'Post-order DFS', 'BFS'],
  'binary tree maximum path sum': ['Post-order DFS', 'Tree DP', 'DFS on Tree'],
  'serialize and deserialize binary tree': ['BFS Level Order', 'DFS Preorder', 'String Encoding'],
  'construct binary tree from preorder and inorder': ['Divide and Conquer', 'DFS Preorder', 'Hash Map Index'],
  'binary search': ['Binary Search on Sorted Array', 'Two Pointers', 'Iterative Binary Search'],
  'search in rotated sorted array': ['Binary Search (Modified)', 'Binary Search on Answer', 'Two Pointers'],
  'find minimum in rotated sorted array': ['Binary Search (Modified)', 'Binary Search on Answer', 'Two Pointers'],
  'search a 2d matrix': ['Binary Search on 2D', 'Binary Search on Sorted Array', 'Row + Col Search'],
  'search a 2d matrix ii': ['Staircase Search', 'Binary Search per Row', 'Divide and Conquer'],
  'first bad version': ['Binary Search on Answer', 'Binary Search', 'Predicate Binary Search'],
  'sqrt(x)': ['Binary Search on Answer', 'Newton\'s Method', 'Math'],
  'longest palindromic substring': ['Expand Around Center', 'Palindrome DP', 'Manacher\'s Algorithm'],
  'palindromic substrings': ['Expand Around Center', 'Palindrome DP', 'Manacher\'s Algorithm'],
  'regular expression matching': ['2D DP', 'Memoization', 'Recursive DP'],
  'wildcard matching': ['2D DP', 'Greedy', 'Memoization'],
  'burst balloons': ['Interval DP', 'Divide and Conquer DP', 'Memoization'],
  'minimum cost to merge stones': ['Interval DP', 'Prefix Sum + DP', 'Memoization'],
  'decode ways': ['1D DP', 'Memoization', 'Bottom-up DP'],
  'integer to roman': ['Greedy', 'Hash Map', 'Math'],
  'roman to integer': ['Greedy', 'Hash Map', 'Math'],
  'single number': ['XOR Tricks', 'Bit Manipulation', 'Hash Set'],
  'missing number': ['XOR Tricks', 'Math (Sum)', 'Bit Manipulation'],
  'reverse bits': ['Bit Manipulation', 'Bit Reversal', 'Math'],
  'number of 1 bits': ['Bit Manipulation', 'Brian Kernighan', 'Math'],
  'counting bits': ['1D DP', 'Bit Manipulation', 'Bottom-up DP'],
  'implement trie': ['Trie Insert/Search', 'Trie', 'Hash Map Trie'],
  'design add and search words': ['Trie + DFS', 'Trie + Backtracking', 'Trie'],
  'range sum query': ['Prefix Sum', 'Segment Tree', 'Binary Indexed Tree'],
  'range sum query 2d': ['2D Prefix Sum', 'Segment Tree 2D', 'Prefix Sum'],
};

function lookupKnownPatterns(title: string): string[] | null {
  const key = title.toLowerCase().trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
  if (KNOWN_PATTERNS[key]) return KNOWN_PATTERNS[key];
  // fuzzy: check if any known key is contained in the title or vice versa
  for (const [k, v] of Object.entries(KNOWN_PATTERNS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

function parsePatterns(raw: string): string[] {
  const line = raw.trim().split('\n')[0].trim();
  let parts: string[];
  if (line.includes('|')) {
    parts = line.split('|');
  } else if ((line.match(/,/g) || []).length >= 2) {
    // 3+ comma-separated items
    parts = line.split(',');
  } else {
    // fallback: try all lines (newline-separated list)
    parts = raw.trim().split('\n');
  }
  return parts
    .map(p => p.trim().replace(/^[\d.\-*•\s"']+|["']+$/g, '').trim())
    .filter(p => p.length > 1 && p.length <= 80)
    .slice(0, 3);
}

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

    // Fast path: well-known problem lookup
    const known = lookupKnownPatterns(title);
    if (known) {
      return NextResponse.json({ success: true, pattern: known[0], patterns: known });
    }

    const geminiClient = getGeminiClient();
    const response = await geminiClient.generateResponse(prompt, {
      userId: user.id,
      temperature: 0.3,
      maxTokens: 80,
    });

    const patterns = parsePatterns(response.content);
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
