import { NextRequest, NextResponse } from 'next/server';

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

interface DailyChallengeResponse {
  success: boolean;
  problem?: {
    id: string;
    platform: 'leetcode';
    title: string;
    difficulty: string;
    url: string;
    topics: string[];
    acRate: number;
    date: string;
  };
  error?: string;
  isCached?: boolean;
}

// Fallback problems for when API fails
const FALLBACK_PROBLEMS = [
  {
    id: 'fallback-1',
    platform: 'leetcode' as const,
    title: 'Two Sum',
    difficulty: 'Easy',
    url: 'https://leetcode.com/problems/two-sum/',
    topics: ['Array', 'Hash Table'],
    acRate: 54.5,
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'fallback-2',
    platform: 'leetcode' as const,
    title: 'Add Two Numbers',
    difficulty: 'Medium',
    url: 'https://leetcode.com/problems/add-two-numbers/',
    topics: ['Linked List', 'Math', 'Recursion'],
    acRate: 42.1,
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'fallback-3',
    platform: 'leetcode' as const,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    topics: ['Hash Table', 'String', 'Sliding Window'],
    acRate: 35.2,
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'fallback-4',
    platform: 'leetcode' as const,
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
    topics: ['Array', 'Binary Search', 'Divide and Conquer'],
    acRate: 38.9,
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'fallback-5',
    platform: 'leetcode' as const,
    title: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    url: 'https://leetcode.com/problems/longest-palindromic-substring/',
    topics: ['String', 'Dynamic Programming'],
    acRate: 33.8,
    date: new Date().toISOString().split('T')[0]
  }
];

// Simple in-memory cache for daily problems
let dailyCache: { date: string; problem: any } | null = null;

// Get today's date as a string
const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Get a deterministic random problem based on date
const getDeterministicRandomProblem = (date: string) => {
  // Create a simple hash from the date
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    const char = date.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get index
  const index = Math.abs(hash) % FALLBACK_PROBLEMS.length;
  return FALLBACK_PROBLEMS[index];
};

// Fetch random problem from LeetCode (simplified approach)
const fetchRandomLeetCodeProblem = async (): Promise<LeetCodeProblem | null> => {
  try {
    // This is a simplified approach - in a real implementation, you might want to:
    // 1. Fetch a list of problems first
    // 2. Select a random one
    // 3. Get its details
    
    // For now, we'll use the POTD endpoint and modify it
    const query = `
      query randomQuestion {
        randomQuestion {
          acRate
          difficulty
          freqBar
          frontendQuestionId: questionFrontendId
          isFavor
          paidOnly: isPaidOnly
          status
          title
          titleSlug
          hasVideoSolution
          hasSolution
          topicTags {
            name
            id
            slug
          }
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://leetcode.com/',
        'Origin': 'https://leetcode.com',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.data && data.data.randomQuestion) {
      return data.data.randomQuestion;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch random LeetCode problem:', error);
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    const today = getTodayString();
    
    // Check if we have a cached problem for today
    if (dailyCache && dailyCache.date === today) {
      console.log('Daily Challenge: 📋 Returning cached problem for', today);
      return NextResponse.json({
        success: true,
        problem: dailyCache.problem,
        isCached: true
      } as DailyChallengeResponse);
    }

    console.log('Daily Challenge: 🔄 Fetching new problem for', today);
    
    // Try to fetch a random problem from LeetCode
    let problem: any = null;
    
    try {
      const leetcodeProblem = await fetchRandomLeetCodeProblem();
      
      if (leetcodeProblem) {
        problem = {
          id: `daily-${today}-${leetcodeProblem.titleSlug}`,
          platform: 'leetcode' as const,
          title: leetcodeProblem.title,
          difficulty: leetcodeProblem.difficulty,
          url: `https://leetcode.com/problems/${leetcodeProblem.titleSlug}/`,
          topics: leetcodeProblem.topicTags.map(tag => tag.name),
          acRate: leetcodeProblem.acRate,
          date: today
        };
        
        console.log('Daily Challenge: ✅ Fetched from LeetCode:', problem.title);
      }
    } catch (error) {
      console.warn('Daily Challenge: ⚠️ LeetCode API failed, using fallback');
    }
    
    // If LeetCode API failed, use deterministic fallback
    if (!problem) {
      problem = getDeterministicRandomProblem(today);
      console.log('Daily Challenge: 🔄 Using deterministic fallback:', problem.title);
    }
    
    // Cache the problem for today
    dailyCache = { date: today, problem };
    
    return NextResponse.json({
      success: true,
      problem,
      isCached: false
    } as DailyChallengeResponse);
    
  } catch (error) {
    console.error('Daily Challenge API error:', error);
    
    // Return a fallback problem even on complete failure
    const today = getTodayString();
    const fallbackProblem = getDeterministicRandomProblem(today);
    
    return NextResponse.json({
      success: true,
      problem: fallbackProblem,
      error: 'API error, using fallback problem'
    } as DailyChallengeResponse);
  }
}
