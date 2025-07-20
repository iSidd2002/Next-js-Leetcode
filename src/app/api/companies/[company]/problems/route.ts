import { NextRequest, NextResponse } from 'next/server';

interface CompanyProblem {
  id: number;
  title: string;
  titleSlug: string;
  difficulty: string;
  difficultyLevel: number;
  frontendQuestionId: number;
  acRate: number;
  frequency: number;
  isPaidOnly: boolean;
  status: string | null;
  tags: string[];
  companies: string[];
  url: string;
}

const DIFFICULTY_MAP = {
  'Easy': 1,
  'Medium': 2,
  'Hard': 3
};

// GitHub repository base URL for company problems
const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/liquidslr/leetcode-company-wise-problems/main';

// Parse CSV data from GitHub (space-separated format)
function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // The first line contains headers separated by commas
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim());
  console.log('CSV Headers:', headers);

  const problems = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse the space-separated format: DIFFICULTY,Title,Frequency,AcceptanceRate,Link,"Topics"
    // The format appears to be: DIFFICULTY,Title,Frequency,Rate,URL,"Topics in quotes"
    const parts = line.split(',');

    if (parts.length >= 5) {
      const difficulty = parts[0]?.trim();
      const title = parts[1]?.trim();
      const frequency = parts[2]?.trim();
      const acceptanceRate = parts[3]?.trim();
      const link = parts[4]?.trim();
      const topics = parts.slice(5).join(',').trim().replace(/"/g, '');

      if (title && link && difficulty) {
        problems.push({
          difficulty,
          title,
          frequency: parseFloat(frequency) || 0,
          acceptanceRate: parseFloat(acceptanceRate) || 0,
          link,
          topics: topics || ''
        });
      }
    }
  }

  console.log(`Parsed ${problems.length} problems from CSV`);
  return problems;
}

// Fetch company problems from GitHub repository
async function fetchCompanyProblemsFromGitHub(company: string): Promise<CompanyProblem[]> {
  try {
    // Try the actual file naming conventions from the repository
    const possibleFiles = [
      '5. All.csv',           // All-time problems (most comprehensive)
      '4. More Than Six Months.csv',
      '3. Six Months.csv',
      '2. Three Months.csv',
      '1. Thirty Days.csv'
    ];

    let csvData = null;
    let usedFile = '';

    for (const fileName of possibleFiles) {
      try {
        const url = `${GITHUB_BASE_URL}/${encodeURIComponent(company)}/${fileName}`;
        console.log(`Trying to fetch: ${url}`);

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'LeetCode-Tracker-App/1.0'
          }
        });

        if (response.ok) {
          csvData = await response.text();
          usedFile = fileName;
          console.log(`Successfully fetched ${fileName} for ${company}`);
          break;
        }
      } catch (error) {
        console.log(`Failed to fetch ${fileName}:`, error);
        continue;
      }
    }

    if (!csvData) {
      console.log(`No CSV file found for company: ${company}`);
      return [];
    }

    const rawProblems = parseCSV(csvData);
    console.log(`Parsed ${rawProblems.length} problems from ${usedFile}`);

    // Convert to our format
    const problems: CompanyProblem[] = rawProblems.map((problem, index) => {
      const title = problem.Title || problem.title || problem.Problem || '';
      const difficulty = problem.Difficulty || problem.difficulty || 'Medium';
      const link = problem.Link || problem.link || problem.URL || problem.url || '';

      // Extract problem ID from link or use index
      let problemId = index + 1;
      if (link) {
        const match = link.match(/\/problems\/([^\/]+)\//);
        if (match) {
          const slug = match[1];
          // Try to extract number from slug or use a hash
          const numMatch = slug.match(/\d+/);
          if (numMatch) {
            problemId = parseInt(numMatch[0]);
          }
        }
      }

      const titleSlug = title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '');

      return {
        id: problemId,
        title: title,
        titleSlug: titleSlug,
        difficulty: difficulty,
        difficultyLevel: DIFFICULTY_MAP[difficulty as keyof typeof DIFFICULTY_MAP] || 2,
        frontendQuestionId: problemId,
        acRate: Math.floor(Math.random() * 60) + 30, // 30-90%
        frequency: Math.floor(Math.random() * 100) + 1, // 1-100
        isPaidOnly: Math.random() < 0.15, // 15% paid only
        status: null, // Not solved by default
        tags: [], // Would need additional data source for tags
        companies: [company],
        url: link || `https://leetcode.com/problems/${titleSlug}/`
      };
    });

    return problems;

  } catch (error) {
    console.error(`Error fetching problems for ${company}:`, error);
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ company: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '1000'); // Increased default limit
    const page = parseInt(searchParams.get('page') || '1');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const resolvedParams = await params;
    const company = decodeURIComponent(resolvedParams.company);

    console.log(`Fetching problems for company: ${company}, limit: ${limit}`);

    // First try to fetch real data from GitHub
    let allProblems = await fetchCompanyProblemsFromGitHub(company);
    let dataSource = 'mock';

    // If no real data found, fall back to enhanced mock data
    if (allProblems.length === 0) {
      console.log(`No real data found for ${company}, using enhanced mock data`);
      allProblems = generateEnhancedMockCompanyProblems(company, Math.max(limit, 200));
      dataSource = 'mock';
    } else {
      console.log(`Using real GitHub data for ${company}`);
      dataSource = 'github';
    }

    console.log(`Total problems available for ${company}: ${allProblems.length}`);

    // Apply filters
    let filteredProblems = allProblems;

    if (difficulty) {
      filteredProblems = filteredProblems.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProblems = filteredProblems.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply pagination with much higher limits
    const maxLimit = 2000; // Reasonable maximum to prevent abuse
    const actualLimit = Math.min(limit, maxLimit);
    const startIndex = (page - 1) * actualLimit;
    const endIndex = startIndex + actualLimit;
    const paginatedProblems = filteredProblems.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        problems: paginatedProblems,
        company: company,
        total: filteredProblems.length,
        hasMore: endIndex < filteredProblems.length,
        actualLimit: actualLimit,
        requestedLimit: limit,
        source: dataSource,
        page: page
      }
    });

  } catch (error) {
    console.error(`Error fetching problems for company ${company}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company problems' },
      { status: 500 }
    );
  }
}

// Enhanced mock data generator with more variety
function generateEnhancedMockCompanyProblems(company: string, limit: number): CompanyProblem[] {
  const problemTemplates = [
    // Array problems
    'Two Sum', 'Three Sum', 'Four Sum', 'Container With Most Water', 'Trapping Rain Water',
    'Maximum Subarray', 'Product of Array Except Self', 'Find Minimum in Rotated Sorted Array',
    'Search in Rotated Sorted Array', 'Merge Intervals', 'Insert Interval', 'Non-overlapping Intervals',
    'Meeting Rooms', 'Meeting Rooms II', 'Best Time to Buy and Sell Stock', 'Best Time to Buy and Sell Stock II',

    // String problems
    'Longest Substring Without Repeating Characters', 'Longest Palindromic Substring', 'Valid Parentheses',
    'Generate Parentheses', 'Letter Combinations of a Phone Number', 'Group Anagrams', 'Valid Anagram',
    'Palindrome Permutation', 'One Edit Distance', 'Read N Characters Given Read4', 'String to Integer (atoi)',
    'Implement strStr()', 'Longest Common Prefix', 'Reverse Words in a String', 'Word Break',

    // Linked List problems
    'Add Two Numbers', 'Merge Two Sorted Lists', 'Remove Nth Node From End of List', 'Swap Nodes in Pairs',
    'Reverse Nodes in k-Group', 'Rotate List', 'Remove Duplicates from Sorted List', 'Partition List',
    'Reverse Linked List', 'Palindrome Linked List', 'Intersection of Two Linked Lists', 'Linked List Cycle',

    // Tree problems
    'Binary Tree Inorder Traversal', 'Binary Tree Preorder Traversal', 'Binary Tree Postorder Traversal',
    'Binary Tree Level Order Traversal', 'Binary Tree Zigzag Level Order Traversal', 'Maximum Depth of Binary Tree',
    'Minimum Depth of Binary Tree', 'Balanced Binary Tree', 'Path Sum', 'Path Sum II', 'Flatten Binary Tree to Linked List',
    'Populating Next Right Pointers in Each Node', 'Binary Tree Maximum Path Sum', 'Construct Binary Tree from Preorder and Inorder Traversal',

    // Dynamic Programming
    'Climbing Stairs', 'House Robber', 'House Robber II', 'Paint House', 'Paint Fence', 'Coin Change',
    'Perfect Squares', 'Longest Increasing Subsequence', 'Maximum Product Subarray', 'Word Break',
    'Unique Paths', 'Unique Paths II', 'Minimum Path Sum', 'Edit Distance', 'Distinct Subsequences',

    // Graph problems
    'Number of Islands', 'Word Ladder', 'Word Ladder II', 'Surrounded Regions', 'Clone Graph',
    'Course Schedule', 'Course Schedule II', 'Alien Dictionary', 'Graph Valid Tree', 'Number of Connected Components in an Undirected Graph',

    // Design problems
    'LRU Cache', 'LFU Cache', 'Design Twitter', 'Design Search Autocomplete System', 'Design Tic-Tac-Toe',
    'Design Snake Game', 'Design Hit Counter', 'Design Log Storage System', 'Design In-Memory File System',

    // Math problems
    'Reverse Integer', 'Palindrome Number', 'Roman to Integer', 'Integer to Roman', 'Pow(x, n)',
    'Sqrt(x)', 'Divide Two Integers', 'Multiply Strings', 'Plus One', 'Add Binary', 'Valid Number',

    // Backtracking
    'Permutations', 'Permutations II', 'Combinations', 'Combination Sum', 'Combination Sum II',
    'Subsets', 'Subsets II', 'Word Search', 'N-Queens', 'N-Queens II', 'Sudoku Solver', 'Restore IP Addresses',

    // Two Pointers
    'Remove Duplicates from Sorted Array', 'Remove Element', 'Move Zeroes', 'Sort Colors',
    'Minimum Window Substring', 'Substring with Concatenation of All Words', 'Longest Substring with At Most Two Distinct Characters',

    // Binary Search
    'Search Insert Position', 'Find First and Last Position of Element in Sorted Array', 'Search for a Range',
    'Find Peak Element', 'Find Minimum in Rotated Sorted Array II', 'Median of Two Sorted Arrays'
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const tags = [
    'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math', 'Tree', 'Depth-first Search',
    'Binary Search', 'Greedy', 'Two Pointers', 'Breadth-first Search', 'Stack', 'Backtracking',
    'Design', 'Linked List', 'Sort', 'Bit Manipulation', 'Graph', 'Heap', 'Trie', 'Union Find'
  ];

  const problems: CompanyProblem[] = [];

  for (let i = 0; i < limit; i++) {
    const baseTitle = problemTemplates[i % problemTemplates.length];
    const title = i < problemTemplates.length ? baseTitle : `${baseTitle} ${Math.floor(i / problemTemplates.length) + 1}`;
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

    problems.push({
      id: i + 1,
      title: title,
      titleSlug: title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-'),
      difficulty: difficulty,
      difficultyLevel: DIFFICULTY_MAP[difficulty as keyof typeof DIFFICULTY_MAP] || 2,
      frontendQuestionId: i + 1,
      acRate: Math.floor(Math.random() * 60) + 30, // 30-90%
      frequency: Math.floor(Math.random() * 100) + 1, // 1-100
      isPaidOnly: Math.random() < 0.15, // 15% paid only
      status: null,
      tags: tags.slice(0, Math.floor(Math.random() * 4) + 1), // 1-4 random tags
      companies: [company],
      url: `https://leetcode.com/problems/${title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}/`
    });
  }

  return problems;
}

function generateMockCompanyProblems(company: string, limit: number) {
  // Legacy function - redirect to enhanced version
  return generateEnhancedMockCompanyProblems(company, limit);
}
