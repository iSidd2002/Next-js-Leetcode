import { NextRequest, NextResponse } from 'next/server';

interface LeetCodeProblem {
  stat: {
    question_id: number;
    question__title: string;
    question__title_slug: string;
    question__hide: boolean;
    total_acs: number;
    total_submitted: number;
    frontend_question_id: number;
    is_new_question: boolean;
  };
  status: string | null;
  difficulty: {
    level: number;
  };
  paid_only: boolean;
  is_favor: boolean;
  frequency: number;
  progress: number;
}

interface LeetCodeApiResponse {
  stat_status_pairs: LeetCodeProblem[];
  has_more: boolean;
  num_solved: number;
  num_total: number;
  ac_easy: number;
  ac_medium: number;
  ac_hard: number;
  stat_status_pairs_difficulty_distribution: number[];
}

const DIFFICULTY_MAP = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard'
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ company: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const useCache = searchParams.get('useCache') === 'true';
    const resolvedParams = await params;
    const company = decodeURIComponent(resolvedParams.company);

    // For now, we'll return mock data since LeetCode's company-specific API requires authentication
    // In a real implementation, you would need to:
    // 1. Use LeetCode's premium API with proper authentication
    // 2. Or scrape the data (which may violate ToS)
    // 3. Or maintain your own database of company-tagged problems

    const mockProblems = generateMockCompanyProblems(company, limit);

    return NextResponse.json({
      success: true,
      data: {
        problems: mockProblems,
        company: company,
        total: mockProblems.length,
        hasMore: false
      }
    });

  } catch (error) {
    console.error(`Error fetching problems for company ${params.company}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company problems' },
      { status: 500 }
    );
  }
}

function generateMockCompanyProblems(company: string, limit: number) {
  // This is mock data - in a real implementation, you'd fetch from LeetCode or your database
  const baseProblemTitles = [
    'Two Sum', 'Add Two Numbers', 'Longest Substring Without Repeating Characters',
    'Median of Two Sorted Arrays', 'Longest Palindromic Substring', 'ZigZag Conversion',
    'Reverse Integer', 'String to Integer (atoi)', 'Palindrome Number', 'Regular Expression Matching',
    'Container With Most Water', 'Integer to Roman', 'Roman to Integer', 'Longest Common Prefix',
    'Three Sum', 'Three Sum Closest', 'Letter Combinations of a Phone Number', 'Four Sum',
    'Remove Nth Node From End of List', 'Valid Parentheses', 'Merge Two Sorted Lists',
    'Generate Parentheses', 'Merge k Sorted Lists', 'Swap Nodes in Pairs', 'Reverse Nodes in k-Group',
    'Remove Duplicates from Sorted Array', 'Remove Element', 'Implement strStr()', 'Divide Two Integers',
    'Substring with Concatenation of All Words', 'Next Permutation', 'Longest Valid Parentheses',
    'Search in Rotated Sorted Array', 'Find First and Last Position of Element in Sorted Array',
    'Search Insert Position', 'Valid Sudoku', 'Sudoku Solver', 'Count and Say', 'Combination Sum',
    'Combination Sum II', 'First Missing Positive', 'Trapping Rain Water', 'Multiply Strings',
    'Wildcard Matching', 'Jump Game II', 'Permutations', 'Permutations II', 'Rotate Image',
    'Group Anagrams', 'Pow(x, n)', 'N-Queens', 'N-Queens II', 'Maximum Subarray', 'Spiral Matrix'
  ];

  const problems = [];
  const numProblems = Math.min(limit, baseProblemTitles.length);

  for (let i = 0; i < numProblems; i++) {
    const title = baseProblemTitles[i];
    const titleSlug = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const difficulty = [1, 2, 3][Math.floor(Math.random() * 3)];
    const questionId = i + 1;

    problems.push({
      id: questionId,
      title: title,
      titleSlug: titleSlug,
      difficulty: DIFFICULTY_MAP[difficulty as keyof typeof DIFFICULTY_MAP],
      difficultyLevel: difficulty,
      frontendQuestionId: questionId,
      acRate: Math.floor(Math.random() * 80) + 20, // 20-100%
      frequency: Math.floor(Math.random() * 100) + 1, // 1-100
      isPaidOnly: Math.random() < 0.1, // 10% paid only
      status: Math.random() < 0.3 ? 'ac' : null, // 30% solved
      tags: getRandomTags(),
      companies: [company],
      url: `https://leetcode.com/problems/${titleSlug}/`
    });
  }

  return problems;
}

function getRandomTags() {
  const allTags = [
    'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math', 'Sorting',
    'Greedy', 'Depth-First Search', 'Binary Search', 'Database', 'Breadth-First Search',
    'Tree', 'Matrix', 'Two Pointers', 'Binary Tree', 'Bit Manipulation', 'Stack',
    'Design', 'Heap (Priority Queue)', 'Graph', 'Simulation', 'Backtracking',
    'Counting', 'Sliding Window', 'Union Find', 'Linked List', 'Ordered Set',
    'Monotonic Stack', 'Trie', 'Divide and Conquer', 'Recursion', 'Binary Search Tree',
    'Bitmask', 'Queue', 'Memoization', 'Segment Tree', 'Geometry', 'Topological Sort',
    'Binary Indexed Tree', 'Hash Function', 'Rolling Hash', 'Shortest Path'
  ];

  const numTags = Math.floor(Math.random() * 4) + 1; // 1-4 tags
  const shuffled = allTags.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numTags);
}
