import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limiter';

// Contest platforms and their APIs
const CONTEST_APIS = {
  codeforces: 'https://codeforces.com/api/contest.list',
  atcoder: 'https://atcoder.jp/contests/',
  leetcode: 'https://leetcode.com/graphql',
  codechef: 'https://www.codechef.com/api/list/contests/all',
  hackerrank: 'https://www.hackerrank.com/rest/contests/upcoming',
  topcoder: 'https://api.topcoder.com/v5/challenges'
};

interface Contest {
  id: string;
  name: string;
  platform: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'upcoming' | 'running' | 'finished';
  url: string;
  type?: string;
  participants?: number;
}

async function fetchCodeforcesContests(): Promise<Contest[]> {
  try {
    const response = await fetch(CONTEST_APIS.codeforces, {
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    const data = await response.json();
    
    if (data.status !== 'OK') return [];
    
    return data.result.map((contest: any) => ({
      id: `cf-${contest.id}`,
      name: contest.name,
      platform: 'Codeforces',
      startTime: new Date(contest.startTimeSeconds * 1000).toISOString(),
      endTime: new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000).toISOString(),
      duration: contest.durationSeconds / 3600, // Convert to hours
      status: contest.phase === 'BEFORE' ? 'upcoming' : 
              contest.phase === 'CODING' ? 'running' : 'finished',
      url: `https://codeforces.com/contest/${contest.id}`,
      type: contest.type,
      participants: contest.participants || 0
    }));
  } catch (error) {
    console.error('Error fetching Codeforces contests:', error);
    return [];
  }
}

async function fetchLeetCodeContests(): Promise<Contest[]> {
  try {
    const query = `
      query {
        allContests {
          title
          titleSlug
          startTime
          duration
          isVirtual
          cardImg
        }
      }
    `;
    
    const response = await fetch(CONTEST_APIS.leetcode, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });
    
    const data = await response.json();
    
    if (!data.data?.allContests) return [];
    
    return data.data.allContests.map((contest: any, index: number) => {
      const startTime = new Date(contest.startTime * 1000);
      const endTime = new Date(startTime.getTime() + contest.duration * 1000);
      const now = new Date();
      
      return {
        id: `lc-${contest.titleSlug || index}`,
        name: contest.title,
        platform: 'LeetCode',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: contest.duration / 3600, // Convert to hours
        status: startTime > now ? 'upcoming' : 
                endTime > now ? 'running' : 'finished',
        url: `https://leetcode.com/contest/${contest.titleSlug}`,
        type: contest.isVirtual ? 'Virtual' : 'Regular'
      };
    });
  } catch (error) {
    console.error('Error fetching LeetCode contests:', error);
    return [];
  }
}

async function fetchMockContests(): Promise<Contest[]> {
  // Mock data for other platforms (since their APIs might require authentication)
  const now = new Date();
  const mockContests: Contest[] = [
    {
      id: 'ac-001',
      name: 'AtCoder Beginner Contest 350',
      platform: 'AtCoder',
      startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(now.getTime() + 25.5 * 60 * 60 * 1000).toISOString(),
      duration: 1.5,
      status: 'upcoming',
      url: 'https://atcoder.jp/contests/abc350',
      type: 'ABC'
    },
    {
      id: 'cc-001',
      name: 'CodeChef Starters 120',
      platform: 'CodeChef',
      startTime: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(now.getTime() + 51 * 60 * 60 * 1000).toISOString(),
      duration: 3,
      status: 'upcoming',
      url: 'https://www.codechef.com/START120',
      type: 'Starters'
    },
    {
      id: 'hr-001',
      name: 'HackerRank Weekly Contest',
      platform: 'HackerRank',
      startTime: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(now.getTime() + 75 * 60 * 60 * 1000).toISOString(),
      duration: 3,
      status: 'upcoming',
      url: 'https://www.hackerrank.com/contests/weekly-contest',
      type: 'Weekly'
    },
    {
      id: 'tc-001',
      name: 'TopCoder SRM 850',
      platform: 'TopCoder',
      startTime: new Date(now.getTime() + 96 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(now.getTime() + 97.5 * 60 * 60 * 1000).toISOString(),
      duration: 1.5,
      status: 'upcoming',
      url: 'https://arena.topcoder.com',
      type: 'SRM'
    }
  ];
  
  return mockContests;
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting for public endpoint
    const rateLimit = checkRateLimit(request, RateLimitPresets.PUBLIC);
    if (rateLimit.limited) {
      const headers = getRateLimitHeaders(rateLimit, RateLimitPresets.PUBLIC);
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      }, {
        status: 429,
        headers
      });
    }

    console.log('Fetching contests from all platforms...');
    
    // Fetch contests from multiple platforms in parallel
    const [
      codeforcesContests,
      leetcodeContests,
      mockContests
    ] = await Promise.allSettled([
      fetchCodeforcesContests(),
      fetchLeetCodeContests(),
      fetchMockContests()
    ]);
    
    // Combine all contests
    const allContests: Contest[] = [];
    
    if (codeforcesContests.status === 'fulfilled') {
      allContests.push(...codeforcesContests.value);
    }
    
    if (leetcodeContests.status === 'fulfilled') {
      allContests.push(...leetcodeContests.value);
    }
    
    if (mockContests.status === 'fulfilled') {
      allContests.push(...mockContests.value);
    }
    
    // Sort contests by start time
    allContests.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    // Categorize contests
    const now = new Date();
    const categorized = {
      upcoming: allContests.filter(c => new Date(c.startTime) > now),
      running: allContests.filter(c => new Date(c.startTime) <= now && new Date(c.endTime) > now),
      recent: allContests.filter(c => new Date(c.endTime) <= now).slice(0, 20) // Last 20 finished contests
    };
    
    console.log(`Fetched ${allContests.length} contests total`);
    console.log(`Upcoming: ${categorized.upcoming.length}, Running: ${categorized.running.length}, Recent: ${categorized.recent.length}`);
    
    return NextResponse.json({
      success: true,
      data: {
        all: allContests,
        categorized,
        summary: {
          total: allContests.length,
          upcoming: categorized.upcoming.length,
          running: categorized.running.length,
          recent: categorized.recent.length,
          platforms: [...new Set(allContests.map(c => c.platform))]
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching all contests:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch contests',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
