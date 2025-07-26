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

// Get today's date as a string
const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
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
    console.log('Daily Challenge: 🔄 Fetching from CodeForces API');

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
    console.error('CodeForces API error:', error);
    return null;
  }
};

// Fetch random problem from LeetCode
const fetchLeetCodeProblem = async (): Promise<UnifiedProblem | null> => {
  try {
    console.log('Daily Challenge: 🔄 Fetching from LeetCode API');

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
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`LeetCode API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.data && data.data.randomQuestion) {
      const leetcodeProblem = data.data.randomQuestion;
      return {
        id: `leetcode-${leetcodeProblem.titleSlug}`,
        platform: 'leetcode',
        title: leetcodeProblem.title,
        difficulty: leetcodeProblem.difficulty,
        url: `https://leetcode.com/problems/${leetcodeProblem.titleSlug}/`,
        topics: leetcodeProblem.topicTags.map((tag: any) => tag.name),
        acRate: leetcodeProblem.acRate,
        date: getTodayString()
      };
    }

    return null;
  } catch (error) {
    console.error('LeetCode API error:', error);
    return null;
  }
};

// Fetch problem from GeeksforGeeks (using fallback approach due to limited API)
const fetchGeeksforGeeksProblem = async (): Promise<UnifiedProblem | null> => {
  try {
    console.log('Daily Challenge: 🔄 Using GeeksforGeeks fallback problems');

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
    console.error('GeeksforGeeks error:', error);
    return null;
  }
};

// Fetch problem from Coding Ninjas (using fallback approach)
const fetchCodingNinjasProblem = async (): Promise<UnifiedProblem | null> => {
  try {
    console.log('Daily Challenge: 🔄 Using Coding Ninjas fallback problems');

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
    console.error('Coding Ninjas error:', error);
    return null;
  }
};

// Fetch problem from AtCoder (using fallback approach)
const fetchAtCoderProblem = async (): Promise<UnifiedProblem | null> => {
  try {
    console.log('Daily Challenge: 🔄 Using AtCoder fallback problems');

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
    console.error('AtCoder error:', error);
    return null;
  }
};

// Main function to fetch problem from the designated platform
const fetchProblemFromPlatform = async (platform: Platform): Promise<UnifiedProblem | null> => {
  console.log(`Daily Challenge: 🎯 Attempting to fetch from ${platform}`);

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
        console.warn(`Daily Challenge: ⚠️ Unknown platform: ${platform}`);
        return null;
    }
  } catch (error) {
    console.error(`Daily Challenge: ❌ Error fetching from ${platform}:`, error);
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

    // Determine which platform to use for today
    const targetPlatform = getPlatformForDate(today);
    console.log(`Daily Challenge: 🎯 Target platform for ${today}: ${targetPlatform}`);

    let problem: UnifiedProblem | null = null;

    // Try to fetch from the target platform first
    try {
      problem = await fetchProblemFromPlatform(targetPlatform);

      if (problem) {
        console.log(`Daily Challenge: ✅ Fetched from ${targetPlatform}:`, problem.title);
      }
    } catch (error) {
      console.warn(`Daily Challenge: ⚠️ ${targetPlatform} failed, trying fallback platforms`);
    }

    // If target platform failed, try other platforms as fallback
    if (!problem) {
      const fallbackPlatforms: Platform[] = ['leetcode', 'codeforces', 'geeksforgeeks', 'codingninjas', 'atcoder']
        .filter(p => p !== targetPlatform);

      for (const fallbackPlatform of fallbackPlatforms) {
        try {
          console.log(`Daily Challenge: 🔄 Trying fallback platform: ${fallbackPlatform}`);
          problem = await fetchProblemFromPlatform(fallbackPlatform);

          if (problem) {
            console.log(`Daily Challenge: ✅ Fetched from fallback ${fallbackPlatform}:`, problem.title);
            break;
          }
        } catch (error) {
          console.warn(`Daily Challenge: ⚠️ Fallback ${fallbackPlatform} also failed`);
          continue;
        }
      }
    }

    // If all APIs failed, use deterministic fallback
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
