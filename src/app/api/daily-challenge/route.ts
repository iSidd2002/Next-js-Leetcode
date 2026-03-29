import { NextRequest, NextResponse } from 'next/server';

// Supported platforms
type Platform = 'leetcode' | 'codeforces' | 'geeksforgeeks' | 'codingninjas' | 'atcoder';

interface LeetCodeProblem {
  acRate: number;
  difficulty: string;
  freqBar: number | null;
  frontendQuestionId: string;
  isFavor: boolean;
  paidOnly: boolean;
  status: string | null;
  title: string;
  titleSlug: string;
  hasVideoSolution: boolean;
  hasSolution: boolean;
  topicTags: Array<{
    name: string;
    id: string;
    slug: string;
  }>;
}

interface CodeForcesProblem {
  contestId: number;
  index: string;
  name: string;
  type: string;
  rating?: number;
  tags: string[];
}

interface UnifiedProblem {
  id: string;
  platform: Platform;
  title: string;
  difficulty: string;
  url: string;
  topics: string[];
  acRate?: number;
  date: string;
  platformMetadata?: {
    contestId?: number;
    problemIndex?: string;
    rating?: number;
    originalDifficulty?: string;
  };
}

interface DailyChallengeResponse {
  success: boolean;
  problem?: UnifiedProblem;
  error?: string;
  isCached?: boolean;
}

// Enhanced fallback problems from multiple platforms
const FALLBACK_PROBLEMS: UnifiedProblem[] = [
  // LeetCode Problems
  {
    id: 'fallback-leetcode-1',
    platform: 'leetcode',
    title: 'Two Sum',
    difficulty: 'Easy',
    url: 'https://leetcode.com/problems/two-sum/',
    topics: ['Array', 'Hash Table'],
    acRate: 54.5,
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'fallback-leetcode-2',
    platform: 'leetcode',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    topics: ['Hash Table', 'String', 'Sliding Window'],
    acRate: 35.2,
    date: new Date().toISOString().split('T')[0]
  },
  // CodeForces Problems
  {
    id: 'fallback-codeforces-1',
    platform: 'codeforces',
    title: 'Watermelon',
    difficulty: 'Easy',
    url: 'https://codeforces.com/problemset/problem/4/A',
    topics: ['Math', 'Brute Force'],
    date: new Date().toISOString().split('T')[0],
    platformMetadata: {
      contestId: 4,
      problemIndex: 'A',
      rating: 800
    }
  },
  {
    id: 'fallback-codeforces-2',
    platform: 'codeforces',
    title: 'Next Round',
    difficulty: 'Easy',
    url: 'https://codeforces.com/problemset/problem/158/A',
    topics: ['Implementation'],
    date: new Date().toISOString().split('T')[0],
    platformMetadata: {
      contestId: 158,
      problemIndex: 'A',
      rating: 800
    }
  },
  // GeeksforGeeks Problems
  {
    id: 'fallback-gfg-1',
    platform: 'geeksforgeeks',
    title: 'Array Rotation',
    difficulty: 'Medium',
    url: 'https://www.geeksforgeeks.org/problems/rotate-array-by-n-elements-1587115621/1',
    topics: ['Array', 'Rotation'],
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'fallback-gfg-2',
    platform: 'geeksforgeeks',
    title: 'Missing Number',
    difficulty: 'Easy',
    url: 'https://www.geeksforgeeks.org/problems/missing-number-in-array1416/1',
    topics: ['Array', 'Math'],
    date: new Date().toISOString().split('T')[0]
  },
  // Coding Ninjas Problems
  {
    id: 'fallback-codingninjas-1',
    platform: 'codingninjas',
    title: 'Reverse The Array',
    difficulty: 'Easy',
    url: 'https://www.codingninjas.com/studio/problems/reverse-the-array_1262298',
    topics: ['Array', 'Two Pointers'],
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'fallback-codingninjas-2',
    platform: 'codingninjas',
    title: 'Maximum Subarray Sum',
    difficulty: 'Medium',
    url: 'https://www.codingninjas.com/studio/problems/maximum-subarray-sum_630526',
    topics: ['Array', 'Dynamic Programming', 'Kadane Algorithm'],
    date: new Date().toISOString().split('T')[0]
  },
  // AtCoder Problems
  {
    id: 'fallback-atcoder-1',
    platform: 'atcoder',
    title: 'Welcome to AtCoder',
    difficulty: 'Easy',
    url: 'https://atcoder.jp/contests/practice/tasks/practice_1',
    topics: ['Implementation'],
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'fallback-atcoder-2',
    platform: 'atcoder',
    title: 'Product',
    difficulty: 'Easy',
    url: 'https://atcoder.jp/contests/abc086/tasks/abc086_a',
    topics: ['Math'],
    date: new Date().toISOString().split('T')[0]
  }
];



// Simple in-memory cache for daily problems
let dailyCache: { date: string; problem: UnifiedProblem } | null = null;

// Per-topic cache: topic slug → { date, problem }
const topicCaches = new Map<string, { date: string; problem: UnifiedProblem }>();

// Curated fallback problems per topic slug
type TopicProblem = Omit<UnifiedProblem, 'date'>;
const TOPIC_FALLBACK_PROBLEMS: Record<string, TopicProblem[]> = {
  'two-pointers': [
    { id: 'tp-1', platform: 'leetcode', title: '3Sum', difficulty: 'Medium', url: 'https://leetcode.com/problems/3sum/', topics: ['Array', 'Two Pointers', 'Sorting'] },
    { id: 'tp-2', platform: 'leetcode', title: 'Container With Most Water', difficulty: 'Medium', url: 'https://leetcode.com/problems/container-with-most-water/', topics: ['Array', 'Two Pointers', 'Greedy'] },
    { id: 'tp-3', platform: 'leetcode', title: 'Trapping Rain Water', difficulty: 'Hard', url: 'https://leetcode.com/problems/trapping-rain-water/', topics: ['Array', 'Two Pointers', 'Stack', 'Dynamic Programming'] },
    { id: 'tp-4', platform: 'leetcode', title: 'Two Sum II', difficulty: 'Medium', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', topics: ['Array', 'Two Pointers', 'Binary Search'] },
    { id: 'tp-5', platform: 'leetcode', title: 'Valid Palindrome', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-palindrome/', topics: ['String', 'Two Pointers'] },
    { id: 'tp-6', platform: 'leetcode', title: 'Move Zeroes', difficulty: 'Easy', url: 'https://leetcode.com/problems/move-zeroes/', topics: ['Array', 'Two Pointers'] },
    { id: 'tp-7', platform: 'leetcode', title: '4Sum', difficulty: 'Medium', url: 'https://leetcode.com/problems/4sum/', topics: ['Array', 'Two Pointers', 'Sorting'] },
  ],
  'sliding-window': [
    { id: 'sw-1', platform: 'leetcode', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', topics: ['String', 'Sliding Window', 'Hash Table'] },
    { id: 'sw-2', platform: 'leetcode', title: 'Minimum Window Substring', difficulty: 'Hard', url: 'https://leetcode.com/problems/minimum-window-substring/', topics: ['String', 'Sliding Window', 'Hash Table'] },
    { id: 'sw-3', platform: 'leetcode', title: 'Find All Anagrams in a String', difficulty: 'Medium', url: 'https://leetcode.com/problems/find-all-anagrams-in-a-string/', topics: ['String', 'Sliding Window', 'Hash Table'] },
    { id: 'sw-4', platform: 'leetcode', title: 'Sliding Window Maximum', difficulty: 'Hard', url: 'https://leetcode.com/problems/sliding-window-maximum/', topics: ['Array', 'Sliding Window', 'Queue'] },
    { id: 'sw-5', platform: 'leetcode', title: 'Permutation in String', difficulty: 'Medium', url: 'https://leetcode.com/problems/permutation-in-string/', topics: ['String', 'Sliding Window', 'Hash Table'] },
    { id: 'sw-6', platform: 'leetcode', title: 'Longest Repeating Character Replacement', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-repeating-character-replacement/', topics: ['String', 'Sliding Window'] },
  ],
  'binary-search': [
    { id: 'bs-1', platform: 'leetcode', title: 'Binary Search', difficulty: 'Easy', url: 'https://leetcode.com/problems/binary-search/', topics: ['Array', 'Binary Search'] },
    { id: 'bs-2', platform: 'leetcode', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', topics: ['Array', 'Binary Search'] },
    { id: 'bs-3', platform: 'leetcode', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', topics: ['Array', 'Binary Search'] },
    { id: 'bs-4', platform: 'leetcode', title: 'Koko Eating Bananas', difficulty: 'Medium', url: 'https://leetcode.com/problems/koko-eating-bananas/', topics: ['Array', 'Binary Search'] },
    { id: 'bs-5', platform: 'leetcode', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', topics: ['Array', 'Binary Search', 'Divide and Conquer'] },
    { id: 'bs-6', platform: 'leetcode', title: 'Time Based Key-Value Store', difficulty: 'Medium', url: 'https://leetcode.com/problems/time-based-key-value-store/', topics: ['Hash Table', 'Binary Search', 'String', 'Design'] },
  ],
  'dynamic-programming': [
    { id: 'dp-1', platform: 'leetcode', title: 'Climbing Stairs', difficulty: 'Easy', url: 'https://leetcode.com/problems/climbing-stairs/', topics: ['Math', 'Dynamic Programming', 'Memoization'] },
    { id: 'dp-2', platform: 'leetcode', title: 'Coin Change', difficulty: 'Medium', url: 'https://leetcode.com/problems/coin-change/', topics: ['Array', 'Dynamic Programming', 'Breadth-First Search'] },
    { id: 'dp-3', platform: 'leetcode', title: 'Longest Increasing Subsequence', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-increasing-subsequence/', topics: ['Array', 'Binary Search', 'Dynamic Programming'] },
    { id: 'dp-4', platform: 'leetcode', title: 'House Robber', difficulty: 'Medium', url: 'https://leetcode.com/problems/house-robber/', topics: ['Array', 'Dynamic Programming'] },
    { id: 'dp-5', platform: 'leetcode', title: 'Maximum Subarray', difficulty: 'Medium', url: 'https://leetcode.com/problems/maximum-subarray/', topics: ['Array', 'Divide and Conquer', 'Dynamic Programming'] },
    { id: 'dp-6', platform: 'leetcode', title: 'Word Break', difficulty: 'Medium', url: 'https://leetcode.com/problems/word-break/', topics: ['Array', 'Hash Table', 'String', 'Dynamic Programming', 'Trie'] },
    { id: 'dp-7', platform: 'leetcode', title: 'Unique Paths', difficulty: 'Medium', url: 'https://leetcode.com/problems/unique-paths/', topics: ['Math', 'Dynamic Programming', 'Combinatorics'] },
  ],
  'tree': [
    { id: 'tr-1', platform: 'leetcode', title: 'Binary Tree Inorder Traversal', difficulty: 'Easy', url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/', topics: ['Stack', 'Tree', 'Depth-First Search'] },
    { id: 'tr-2', platform: 'leetcode', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', topics: ['Tree', 'Depth-First Search', 'Breadth-First Search'] },
    { id: 'tr-3', platform: 'leetcode', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', topics: ['Tree', 'Breadth-First Search'] },
    { id: 'tr-4', platform: 'leetcode', title: 'Validate Binary Search Tree', difficulty: 'Medium', url: 'https://leetcode.com/problems/validate-binary-search-tree/', topics: ['Tree', 'Depth-First Search', 'Binary Search Tree'] },
    { id: 'tr-5', platform: 'leetcode', title: 'Lowest Common Ancestor of a Binary Tree', difficulty: 'Medium', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', topics: ['Tree', 'Depth-First Search'] },
    { id: 'tr-6', platform: 'leetcode', title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', topics: ['Dynamic Programming', 'Tree', 'Depth-First Search'] },
  ],
  'graph': [
    { id: 'gr-1', platform: 'leetcode', title: 'Number of Islands', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/', topics: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find'] },
    { id: 'gr-2', platform: 'leetcode', title: 'Clone Graph', difficulty: 'Medium', url: 'https://leetcode.com/problems/clone-graph/', topics: ['Hash Table', 'Depth-First Search', 'Breadth-First Search', 'Graph'] },
    { id: 'gr-3', platform: 'leetcode', title: 'Course Schedule', difficulty: 'Medium', url: 'https://leetcode.com/problems/course-schedule/', topics: ['Depth-First Search', 'Graph', 'Topological Sort'] },
    { id: 'gr-4', platform: 'leetcode', title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', url: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', topics: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Matrix'] },
    { id: 'gr-5', platform: 'leetcode', title: 'Network Delay Time', difficulty: 'Medium', url: 'https://leetcode.com/problems/network-delay-time/', topics: ['Depth-First Search', 'Graph', 'Heap (Priority Queue)', 'Shortest Path'] },
    { id: 'gr-6', platform: 'leetcode', title: 'Word Ladder', difficulty: 'Hard', url: 'https://leetcode.com/problems/word-ladder/', topics: ['Hash Table', 'String', 'Breadth-First Search'] },
  ],
  'backtracking': [
    { id: 'bt-1', platform: 'leetcode', title: 'Subsets', difficulty: 'Medium', url: 'https://leetcode.com/problems/subsets/', topics: ['Array', 'Backtracking', 'Bit Manipulation'] },
    { id: 'bt-2', platform: 'leetcode', title: 'Permutations', difficulty: 'Medium', url: 'https://leetcode.com/problems/permutations/', topics: ['Array', 'Backtracking'] },
    { id: 'bt-3', platform: 'leetcode', title: 'Combination Sum', difficulty: 'Medium', url: 'https://leetcode.com/problems/combination-sum/', topics: ['Array', 'Backtracking'] },
    { id: 'bt-4', platform: 'leetcode', title: 'Word Search', difficulty: 'Medium', url: 'https://leetcode.com/problems/word-search/', topics: ['Array', 'Backtracking', 'Matrix'] },
    { id: 'bt-5', platform: 'leetcode', title: 'N-Queens', difficulty: 'Hard', url: 'https://leetcode.com/problems/n-queens/', topics: ['Array', 'Backtracking'] },
    { id: 'bt-6', platform: 'leetcode', title: 'Palindrome Partitioning', difficulty: 'Medium', url: 'https://leetcode.com/problems/palindrome-partitioning/', topics: ['String', 'Dynamic Programming', 'Backtracking'] },
  ],
  'stack': [
    { id: 'st-1', platform: 'leetcode', title: 'Valid Parentheses', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-parentheses/', topics: ['String', 'Stack'] },
    { id: 'st-2', platform: 'leetcode', title: 'Min Stack', difficulty: 'Medium', url: 'https://leetcode.com/problems/min-stack/', topics: ['Stack', 'Design'] },
    { id: 'st-3', platform: 'leetcode', title: 'Daily Temperatures', difficulty: 'Medium', url: 'https://leetcode.com/problems/daily-temperatures/', topics: ['Array', 'Stack', 'Monotonic Stack'] },
    { id: 'st-4', platform: 'leetcode', title: 'Largest Rectangle in Histogram', difficulty: 'Hard', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', topics: ['Array', 'Stack', 'Monotonic Stack'] },
    { id: 'st-5', platform: 'leetcode', title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium', url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', topics: ['Array', 'Math', 'Stack'] },
    { id: 'st-6', platform: 'leetcode', title: 'Car Fleet', difficulty: 'Medium', url: 'https://leetcode.com/problems/car-fleet/', topics: ['Array', 'Stack', 'Sorting', 'Monotonic Stack'] },
  ],
  'heap-priority-queue': [
    { id: 'hp-1', platform: 'leetcode', title: 'Kth Largest Element in an Array', difficulty: 'Medium', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', topics: ['Array', 'Sorting', 'Heap (Priority Queue)'] },
    { id: 'hp-2', platform: 'leetcode', title: 'Top K Frequent Elements', difficulty: 'Medium', url: 'https://leetcode.com/problems/top-k-frequent-elements/', topics: ['Array', 'Hash Table', 'Sorting', 'Heap (Priority Queue)'] },
    { id: 'hp-3', platform: 'leetcode', title: 'Find Median from Data Stream', difficulty: 'Hard', url: 'https://leetcode.com/problems/find-median-from-data-stream/', topics: ['Two Pointers', 'Design', 'Sorting', 'Heap (Priority Queue)'] },
    { id: 'hp-4', platform: 'leetcode', title: 'Merge K Sorted Lists', difficulty: 'Hard', url: 'https://leetcode.com/problems/merge-k-sorted-lists/', topics: ['Linked List', 'Divide and Conquer', 'Heap (Priority Queue)'] },
    { id: 'hp-5', platform: 'leetcode', title: 'Task Scheduler', difficulty: 'Medium', url: 'https://leetcode.com/problems/task-scheduler/', topics: ['Array', 'Hash Table', 'Greedy', 'Heap (Priority Queue)'] },
  ],
  'greedy': [
    { id: 'gd-1', platform: 'leetcode', title: 'Jump Game', difficulty: 'Medium', url: 'https://leetcode.com/problems/jump-game/', topics: ['Array', 'Dynamic Programming', 'Greedy'] },
    { id: 'gd-2', platform: 'leetcode', title: 'Jump Game II', difficulty: 'Medium', url: 'https://leetcode.com/problems/jump-game-ii/', topics: ['Array', 'Dynamic Programming', 'Greedy'] },
    { id: 'gd-3', platform: 'leetcode', title: 'Gas Station', difficulty: 'Medium', url: 'https://leetcode.com/problems/gas-station/', topics: ['Array', 'Greedy'] },
    { id: 'gd-4', platform: 'leetcode', title: 'Merge Intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/merge-intervals/', topics: ['Array', 'Sorting'] },
    { id: 'gd-5', platform: 'leetcode', title: 'Partition Labels', difficulty: 'Medium', url: 'https://leetcode.com/problems/partition-labels/', topics: ['Hash Table', 'Two Pointers', 'String', 'Greedy'] },
    { id: 'gd-6', platform: 'leetcode', title: 'Hand of Straights', difficulty: 'Medium', url: 'https://leetcode.com/problems/hand-of-straights/', topics: ['Array', 'Hash Table', 'Greedy', 'Sorting'] },
  ],
  'union-find': [
    { id: 'uf-1', platform: 'leetcode', title: 'Redundant Connection', difficulty: 'Medium', url: 'https://leetcode.com/problems/redundant-connection/', topics: ['Depth-First Search', 'Breadth-First Search', 'Union Find', 'Graph'] },
    { id: 'uf-2', platform: 'leetcode', title: 'Number of Islands', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/', topics: ['Array', 'Depth-First Search', 'Union Find', 'Matrix'] },
    { id: 'uf-3', platform: 'leetcode', title: 'Accounts Merge', difficulty: 'Medium', url: 'https://leetcode.com/problems/accounts-merge/', topics: ['Array', 'Hash Table', 'String', 'Depth-First Search', 'Union Find', 'Sorting'] },
    { id: 'uf-4', platform: 'leetcode', title: 'Min Cost to Connect All Points', difficulty: 'Medium', url: 'https://leetcode.com/problems/min-cost-to-connect-all-points/', topics: ['Array', 'Union Find', 'Minimum Spanning Tree'] },
    { id: 'uf-5', platform: 'leetcode', title: 'Longest Consecutive Sequence', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-consecutive-sequence/', topics: ['Array', 'Hash Table', 'Union Find'] },
  ],
  'trie': [
    { id: 'ti-1', platform: 'leetcode', title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium', url: 'https://leetcode.com/problems/implement-trie-prefix-tree/', topics: ['Hash Table', 'String', 'Design', 'Trie'] },
    { id: 'ti-2', platform: 'leetcode', title: 'Design Add and Search Words Data Structure', difficulty: 'Medium', url: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/', topics: ['String', 'Depth-First Search', 'Design', 'Trie'] },
    { id: 'ti-3', platform: 'leetcode', title: 'Word Search II', difficulty: 'Hard', url: 'https://leetcode.com/problems/word-search-ii/', topics: ['Array', 'String', 'Backtracking', 'Trie', 'Matrix'] },
    { id: 'ti-4', platform: 'leetcode', title: 'Search Suggestions System', difficulty: 'Medium', url: 'https://leetcode.com/problems/search-suggestions-system/', topics: ['Array', 'String', 'Binary Search', 'Trie', 'Sorting'] },
  ],
  'bit-manipulation': [
    { id: 'bm-1', platform: 'leetcode', title: 'Single Number', difficulty: 'Easy', url: 'https://leetcode.com/problems/single-number/', topics: ['Array', 'Bit Manipulation'] },
    { id: 'bm-2', platform: 'leetcode', title: 'Number of 1 Bits', difficulty: 'Easy', url: 'https://leetcode.com/problems/number-of-1-bits/', topics: ['Divide and Conquer', 'Bit Manipulation'] },
    { id: 'bm-3', platform: 'leetcode', title: 'Counting Bits', difficulty: 'Easy', url: 'https://leetcode.com/problems/counting-bits/', topics: ['Dynamic Programming', 'Bit Manipulation'] },
    { id: 'bm-4', platform: 'leetcode', title: 'Reverse Bits', difficulty: 'Easy', url: 'https://leetcode.com/problems/reverse-bits/', topics: ['Divide and Conquer', 'Bit Manipulation'] },
    { id: 'bm-5', platform: 'leetcode', title: 'Missing Number', difficulty: 'Easy', url: 'https://leetcode.com/problems/missing-number/', topics: ['Array', 'Hash Table', 'Math', 'Bit Manipulation'] },
    { id: 'bm-6', platform: 'leetcode', title: 'Sum of Two Integers', difficulty: 'Medium', url: 'https://leetcode.com/problems/sum-of-two-integers/', topics: ['Math', 'Bit Manipulation'] },
  ],
  'depth-first-search': [
    { id: 'dfs-1', platform: 'leetcode', title: 'Number of Islands', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/', topics: ['Array', 'Depth-First Search', 'Union Find', 'Matrix'] },
    { id: 'dfs-2', platform: 'leetcode', title: 'Max Area of Island', difficulty: 'Medium', url: 'https://leetcode.com/problems/max-area-of-island/', topics: ['Array', 'Depth-First Search', 'Union Find', 'Matrix'] },
    { id: 'dfs-3', platform: 'leetcode', title: 'Surrounded Regions', difficulty: 'Medium', url: 'https://leetcode.com/problems/surrounded-regions/', topics: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Matrix'] },
    { id: 'dfs-4', platform: 'leetcode', title: 'Path Sum', difficulty: 'Easy', url: 'https://leetcode.com/problems/path-sum/', topics: ['Tree', 'Depth-First Search'] },
    { id: 'dfs-5', platform: 'leetcode', title: 'All Paths From Source to Target', difficulty: 'Medium', url: 'https://leetcode.com/problems/all-paths-from-source-to-target/', topics: ['Backtracking', 'Depth-First Search', 'Breadth-First Search', 'Graph'] },
  ],
  'breadth-first-search': [
    { id: 'bfs-1', platform: 'leetcode', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', topics: ['Tree', 'Breadth-First Search'] },
    { id: 'bfs-2', platform: 'leetcode', title: 'Rotting Oranges', difficulty: 'Medium', url: 'https://leetcode.com/problems/rotting-oranges/', topics: ['Array', 'Breadth-First Search', 'Matrix'] },
    { id: 'bfs-3', platform: 'leetcode', title: 'Shortest Path in Binary Matrix', difficulty: 'Medium', url: 'https://leetcode.com/problems/shortest-path-in-binary-matrix/', topics: ['Array', 'Breadth-First Search', 'Matrix'] },
    { id: 'bfs-4', platform: 'leetcode', title: 'Jump Game III', difficulty: 'Medium', url: 'https://leetcode.com/problems/jump-game-iii/', topics: ['Array', 'Depth-First Search', 'Breadth-First Search'] },
    { id: 'bfs-5', platform: 'leetcode', title: 'Word Ladder', difficulty: 'Hard', url: 'https://leetcode.com/problems/word-ladder/', topics: ['Hash Table', 'String', 'Breadth-First Search'] },
  ],
};

// Map topic slugs to CodeForces tag names
const SLUG_TO_CF_TAG: Record<string, string> = {
  'two-pointers': 'two pointers',
  'binary-search': 'binary search',
  'dynamic-programming': 'dp',
  'tree': 'trees',
  'graph': 'graphs',
  'backtracking': 'backtracking',
  'greedy': 'greedy',
  'bit-manipulation': 'bitmasks',
  'depth-first-search': 'dfs and similar',
  'breadth-first-search': 'graphs',
  'stack': 'data structures',
  'heap-priority-queue': 'data structures',
  'union-find': 'dsu',
};

// Hash a seed string to a positive integer
const hashSeed = (seed: string): number => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h) + seed.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h);
};

// Fetch problems from LeetCode filtered by topic tag
const fetchLeetCodeByTopic = async (topicSlug: string, date: string): Promise<UnifiedProblem | null> => {
  try {
    const query = `
      query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(
          categorySlug: $categorySlug
          limit: $limit
          skip: $skip
          filters: $filters
        ) {
          questions: data {
            acRate
            difficulty
            title
            titleSlug
            topicTags { name slug }
          }
        }
      }
    `;
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://leetcode.com/',
        'Origin': 'https://leetcode.com',
      },
      body: JSON.stringify({
        query,
        variables: { categorySlug: '', limit: 100, skip: 0, filters: { tags: [topicSlug] } },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`LeetCode API ${response.status}`);
    const data = await response.json();
    const questions = data.data?.problemsetQuestionList?.questions as Array<any> | undefined;
    if (!questions?.length) return null;

    const idx = hashSeed(date + topicSlug) % questions.length;
    const q = questions[idx];
    return {
      id: `leetcode-topic-${topicSlug}-${q.titleSlug}`,
      platform: 'leetcode',
      title: q.title,
      difficulty: q.difficulty,
      url: `https://leetcode.com/problems/${q.titleSlug}/`,
      topics: q.topicTags.map((t: any) => t.name),
      acRate: q.acRate,
      date,
    };
  } catch {
    return null;
  }
};

// Pick a deterministic problem from the curated fallback list for a topic
const getTopicFallback = (topicSlug: string, date: string): UnifiedProblem | null => {
  const list = TOPIC_FALLBACK_PROBLEMS[topicSlug];
  if (!list?.length) return null;
  const idx = hashSeed(date + topicSlug) % list.length;
  return { ...list[idx], date };
};

// Fetch a CodeForces problem filtered by topic tag
const fetchCodeForcesByTopic = async (topicSlug: string, date: string): Promise<UnifiedProblem | null> => {
  const cfTag = SLUG_TO_CF_TAG[topicSlug];
  if (!cfTag) return null;
  try {
    const response = await fetch(
      `https://codeforces.com/api/problemset.problems?tags=${encodeURIComponent(cfTag)}`,
      {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DailyChallengeBot/1.0)' },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!response.ok) throw new Error(`CF API ${response.status}`);
    const data = await response.json();
    if (data.status !== 'OK' || !data.result?.problems?.length) return null;

    const suitable = (data.result.problems as CodeForcesProblem[]).filter(
      p => p.rating && p.rating >= 800 && p.rating <= 1800
    );
    if (!suitable.length) return null;

    const idx = hashSeed(date + topicSlug + 'cf') % suitable.length;
    const p = suitable[idx];
    return {
      id: `cf-topic-${topicSlug}-${p.contestId}-${p.index}`,
      platform: 'codeforces',
      title: p.name,
      difficulty: normalizeDifficulty(p.rating || 1000, 'codeforces'),
      url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
      topics: p.tags || [],
      date,
      platformMetadata: {
        contestId: p.contestId,
        problemIndex: p.index,
        rating: p.rating,
        originalDifficulty: p.rating?.toString(),
      },
    };
  } catch {
    return null;
  }
};

// Get today's date as a string
const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Helper for conditional logging
const logDev = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

// Platform rotation logic - determines which platform to use for a given date
const getPlatformForDate = (date: string): Platform => {
  const platforms: Platform[] = ['leetcode', 'codeforces', 'geeksforgeeks', 'codingninjas', 'atcoder'];

  // Create a simple hash from the date
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    const char = date.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value and modulo to get platform index
  const index = Math.abs(hash) % platforms.length;
  return platforms[index];
};

// Get a deterministic random problem based on date
const getDeterministicRandomProblem = (date: string): UnifiedProblem => {
  // Create a simple hash from the date
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    const char = date.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value and modulo to get index
  const index = Math.abs(hash) % FALLBACK_PROBLEMS.length;
  const problem = FALLBACK_PROBLEMS[index];
  return {
    ...problem,
    date
  };
};

// Normalize difficulty levels across platforms
const normalizeDifficulty = (difficulty: string | number, platform: Platform): string => {
  if (platform === 'codeforces') {
    const rating = typeof difficulty === 'number' ? difficulty : parseInt(difficulty.toString());
    if (rating <= 1200) return 'Easy';
    if (rating <= 1600) return 'Medium';
    return 'Hard';
  }

  if (typeof difficulty === 'string') {
    const lower = difficulty.toLowerCase();
    if (lower.includes('easy') || lower.includes('beginner')) return 'Easy';
    if (lower.includes('medium') || lower.includes('intermediate')) return 'Medium';
    if (lower.includes('hard') || lower.includes('advanced') || lower.includes('expert')) return 'Hard';
  }

  return 'Medium'; // Default fallback
};

// Fetch random problem from CodeForces
const fetchCodeForcesProblem = async (): Promise<UnifiedProblem | null> => {
  try {
    logDev('Daily Challenge: 🔄 Fetching from CodeForces API');

    // Fetch recent problems from CodeForces API
    const response = await fetch('https://codeforces.com/api/problemset.problems?tags=implementation', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DailyChallengeBot/1.0)',
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`CodeForces API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'OK' && data.result && data.result.problems && data.result.problems.length > 0) {
      // Filter problems with reasonable difficulty (800-1600 rating)
      const suitableProblems = data.result.problems.filter((p: CodeForcesProblem) =>
        p.rating && p.rating >= 800 && p.rating <= 1600
      );

      if (suitableProblems.length > 0) {
        // Select a random problem from suitable ones
        const randomIndex = Math.floor(Math.random() * Math.min(suitableProblems.length, 50));
        const problem = suitableProblems[randomIndex];

        return {
          id: `codeforces-${problem.contestId}-${problem.index}`,
          platform: 'codeforces',
          title: problem.name,
          difficulty: normalizeDifficulty(problem.rating || 1000, 'codeforces'),
          url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
          topics: problem.tags || [],
          date: getTodayString(),
          platformMetadata: {
            contestId: problem.contestId,
            problemIndex: problem.index,
            rating: problem.rating,
            originalDifficulty: problem.rating?.toString()
          }
        };
      }
    }

    return null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('CodeForces API error:', error);
    }
    return null;
  }
};

// Fetch actual daily challenge from LeetCode
const fetchLeetCodeProblem = async (): Promise<UnifiedProblem | null> => {
  try {
    logDev('Daily Challenge: 🔄 Fetching LeetCode Daily Challenge');

    // First, try to fetch the actual daily challenge
    // Updated query for LeetCode's current GraphQL schema (2025)
    const dailyQuery = `
      query questionOfToday {
        activeDailyCodingChallengeQuestion {
          date
          link
          question {
            acRate
            difficulty
            questionId
            title
            titleSlug
            topicTags {
              name
              slug
            }
          }
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://leetcode.com/',
        'Origin': 'https://leetcode.com'
      },
      body: JSON.stringify({ query: dailyQuery }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      logDev(`LeetCode API returned status: ${response.status}`);
      throw new Error(`LeetCode API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.data && data.data.activeDailyCodingChallengeQuestion) {
      const dailyChallenge = data.data.activeDailyCodingChallengeQuestion;
      const problem = dailyChallenge.question;
      
      logDev(`✅ Fetched LeetCode Daily Challenge: ${problem.title}`);
      
      return {
        id: `leetcode-daily-${problem.titleSlug}`,
        platform: 'leetcode',
        title: problem.title,
        difficulty: problem.difficulty,
        url: `https://leetcode.com${dailyChallenge.link}`,
        topics: problem.topicTags.map((tag: any) => tag.name),
        acRate: problem.acRate,
        date: getTodayString()
      };
    }

    logDev('LeetCode daily challenge not found in response');
    return null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('LeetCode API error:', error);
    }
    return null;
  }
};

// Fetch problem from GeeksforGeeks (using fallback approach due to limited API)
const fetchGeeksforGeeksProblem = async (): Promise<UnifiedProblem | null> => {
  try {
    logDev('Daily Challenge: 🔄 Using GeeksforGeeks fallback problems');

    // GeeksforGeeks doesn't have a public API, so we use curated problems
    const gfgProblems = FALLBACK_PROBLEMS.filter(p => p.platform === 'geeksforgeeks');
    if (gfgProblems.length > 0) {
      const randomIndex = Math.floor(Math.random() * gfgProblems.length);
      return {
        ...gfgProblems[randomIndex],
        date: getTodayString()
      };
    }

    return null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('GeeksforGeeks error:', error);
    }
    return null;
  }
};

// Fetch problem from Coding Ninjas (using fallback approach)
const fetchCodingNinjasProblem = async (): Promise<UnifiedProblem | null> => {
  try {
    logDev('Daily Challenge: 🔄 Using Coding Ninjas fallback problems');

    // Coding Ninjas API requires authentication, so we use curated problems
    const codingNinjasProblems = FALLBACK_PROBLEMS.filter(p => p.platform === 'codingninjas');
    if (codingNinjasProblems.length > 0) {
      const randomIndex = Math.floor(Math.random() * codingNinjasProblems.length);
      return {
        ...codingNinjasProblems[randomIndex],
        date: getTodayString()
      };
    }

    return null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Coding Ninjas error:', error);
    }
    return null;
  }
};

// Fetch problem from AtCoder (using fallback approach)
const fetchAtCoderProblem = async (): Promise<UnifiedProblem | null> => {
  try {
    logDev('Daily Challenge: 🔄 Using AtCoder fallback problems');

    // AtCoder API is complex, so we use curated problems
    const atCoderProblems = FALLBACK_PROBLEMS.filter(p => p.platform === 'atcoder');
    if (atCoderProblems.length > 0) {
      const randomIndex = Math.floor(Math.random() * atCoderProblems.length);
      return {
        ...atCoderProblems[randomIndex],
        date: getTodayString()
      };
    }

    return null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('AtCoder error:', error);
    }
    return null;
  }
};

// Main function to fetch problem from the designated platform
const fetchProblemFromPlatform = async (platform: Platform): Promise<UnifiedProblem | null> => {
  logDev(`Daily Challenge: 🎯 Attempting to fetch from ${platform}`);

  try {
    switch (platform) {
      case 'leetcode':
        return await fetchLeetCodeProblem();
      case 'codeforces':
        return await fetchCodeForcesProblem();
      case 'geeksforgeeks':
        return await fetchGeeksforGeeksProblem();
      case 'codingninjas':
        return await fetchCodingNinjasProblem();
      case 'atcoder':
        return await fetchAtCoderProblem();
      default:
        logDev(`Daily Challenge: ⚠️ Unknown platform: ${platform}`);
        return null;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Daily Challenge: ❌ Error fetching from ${platform}:`, error);
    }
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    const today = getTodayString();
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    const topic = searchParams.get('topic') || '';

    // Handle topic-specific daily challenge
    if (topic) {
      const cached = topicCaches.get(topic);
      if (!forceRefresh && cached && cached.date === today) {
        return NextResponse.json({ success: true, problem: cached.problem, isCached: true } as DailyChallengeResponse);
      }
      const problem =
        (await fetchLeetCodeByTopic(topic, today)) ||
        (await fetchCodeForcesByTopic(topic, today)) ||
        getTopicFallback(topic, today);
      if (!problem) {
        return NextResponse.json({ success: false, error: 'No problem found for this topic' }, { status: 404 });
      }
      topicCaches.set(topic, { date: today, problem });
      return NextResponse.json({ success: true, problem, isCached: false } as DailyChallengeResponse);
    }

    // Check if we have a cached problem for today (unless force refresh)
    if (dailyCache && dailyCache.date === today && !forceRefresh) {
      logDev('Daily Challenge: 📋 Returning cached problem for', today);
      return NextResponse.json({
        success: true,
        problem: dailyCache.problem,
        isCached: true
      } as DailyChallengeResponse);
    }

    logDev('Daily Challenge: 🔄 Fetching new problem for', today, forceRefresh ? '(forced refresh)' : '');

    // Determine which platform to use for today
    const targetPlatform = getPlatformForDate(today);
    logDev(`Daily Challenge: 🎯 Target platform for ${today}: ${targetPlatform}`);

    let problem: UnifiedProblem | null = null;

    // Try to fetch from the target platform first
    try {
      problem = await fetchProblemFromPlatform(targetPlatform);

      if (problem) {
        logDev(`Daily Challenge: ✅ Fetched from ${targetPlatform}:`, problem.title);
      }
    } catch (error) {
      logDev(`Daily Challenge: ⚠️ ${targetPlatform} failed, trying fallback platforms`);
    }

    // If target platform failed, try other platforms as fallback
    if (!problem) {
      const allPlatforms: Platform[] = ['leetcode', 'codeforces', 'geeksforgeeks', 'codingninjas', 'atcoder'];
      const fallbackPlatforms = allPlatforms.filter(p => p !== targetPlatform);

      for (const fallbackPlatform of fallbackPlatforms) {
        try {
          logDev(`Daily Challenge: 🔄 Trying fallback platform: ${fallbackPlatform}`);
          problem = await fetchProblemFromPlatform(fallbackPlatform);

          if (problem) {
            logDev(`Daily Challenge: ✅ Fetched from fallback ${fallbackPlatform}:`, problem.title);
            break;
          }
        } catch (error) {
          logDev(`Daily Challenge: ⚠️ Fallback ${fallbackPlatform} also failed`);
          continue;
        }
      }
    }

    // If all APIs failed, use deterministic fallback
    if (!problem) {
      problem = getDeterministicRandomProblem(today);
      logDev('Daily Challenge: 🔄 Using deterministic fallback:', problem.title);
    }
    
    // Cache the problem for today
    dailyCache = { date: today, problem };
    
    return NextResponse.json({
      success: true,
      problem,
      isCached: false
    } as DailyChallengeResponse);
    
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Daily Challenge API error:', error);
    }
    
    // Return a fallback problem even on complete failure
    const today = getTodayString();
    const fallbackProblem = getDeterministicRandomProblem(today);
    
    return NextResponse.json({
      success: true,
      problem: fallbackProblem,
      error: process.env.NODE_ENV === 'development' ? 'API error, using fallback problem' : undefined
    } as DailyChallengeResponse);
  }
}
