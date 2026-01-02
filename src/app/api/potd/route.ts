import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limiter';

interface LeetCodeGraphQLResponse {
  data: {
    activeDailyCodingChallengeQuestion: {
      date: string;
      userStatus: string | null;
      link: string;
      question: {
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
      };
    };
  };
}

const LEETCODE_GRAPHQL_ENDPOINT = 'https://leetcode.com/graphql';

// Predefined safe query for POTD - prevents arbitrary GraphQL queries
const POTD_QUERY = `
  query questionOfToday {
    activeDailyCodingChallengeQuestion {
      date
      userStatus
      link
      question {
        acRate
        difficulty
        freqBar
        frontendQuestionId
        isFavor
        paidOnly
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
  }
`;

// Helper function to make LeetCode API request with retry logic
const fetchWithRetry = async (query: string, maxRetries: number = 3): Promise<globalThis.Response> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`POTD API attempt ${attempt}/${maxRetries}`);

      const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
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
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (response.ok) {
        return response;
      }

      // Continue retrying for certain status codes
      const errorText = await response.text();

      // Don't retry for client errors (4xx) except 429 (rate limit)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(`LeetCode API responded with status: ${response.status} - ${errorText}`);
      }

      lastError = new Error(`LeetCode API responded with status: ${response.status} - ${errorText}`);

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Max 5 seconds
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } catch (error) {
      console.warn(`POTD API attempt ${attempt} error:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry for timeout or network errors on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('All retry attempts failed');
};

// Helper function to create consistent fallback data
const createFallbackProblem = (): LeetCodeGraphQLResponse => ({
  data: {
    activeDailyCodingChallengeQuestion: {
      date: new Date().toISOString().split('T')[0],
      userStatus: "NotStart",
      link: "/problems/two-sum/",
      question: {
        acRate: 54.5,
        difficulty: "Easy",
        freqBar: null,
        frontendQuestionId: "1",
        isFavor: false,
        paidOnly: false,
        status: null,
        title: "Two Sum (Fallback Problem)",
        titleSlug: "two-sum",
        hasVideoSolution: true,
        hasSolution: true,
        topicTags: [
          {
            name: "Array",
            id: "VG9waWNUYWdOb2RlOjU=",
            slug: "array"
          },
          {
            name: "Hash Table",
            id: "VG9waWNUYWdOb2RlOjY=",
            slug: "hash-table"
          }
        ]
      }
    }
  }
});

export async function POST(request: NextRequest) {
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

    // Security: Ignore user-provided query and use predefined safe query
    // This prevents arbitrary GraphQL queries being proxied through our server

    // Try to get real data from LeetCode using predefined safe query
    const response = await fetchWithRetry(POTD_QUERY);
    const data = await response.json() as unknown as LeetCodeGraphQLResponse;

    // Check if we got valid data
    if (data.data && data.data.activeDailyCodingChallengeQuestion) {
      console.log('POTD API: ✅ Successfully fetched real LeetCode POTD');
      return NextResponse.json(data);
    }

  } catch (error) {
    console.warn('POTD API: ⚠️ Failed to fetch real data, using fallback:', error instanceof Error ? error.message : 'Unknown error');
  }

  // Always return fallback data with 200 status if real data fails
  console.log('POTD API: 🔄 Using fallback problem: Two Sum');
  const fallbackProblem = createFallbackProblem();
  return NextResponse.json(fallbackProblem);
}

// Alternative endpoint for CodeForces POTD (if needed in the future)
export async function GET() {
  try {
    // CodeForces doesn't have a daily problem concept like LeetCode
    // But we could implement a random problem selector or featured problem
    return NextResponse.json({
      success: false,
      error: 'CodeForces daily problem not implemented yet'
    }, { status: 501 });
  } catch (error) {
    console.error('CodeForces POTD error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
