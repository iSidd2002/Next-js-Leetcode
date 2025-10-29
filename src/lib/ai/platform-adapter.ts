// Platform normalization for multi-platform AI recommendations
// Converts platform-specific problem data to unified format

export interface NormalizedProblem {
  id: string;
  title: string;
  platform: 'leetcode' | 'codeforces' | 'atcoder';
  difficulty: {
    original: string;           // Original difficulty (e.g., "Easy", "1200", "ABC-C")
    normalized: number;         // 1-10 scale
    category: 'Easy' | 'Medium' | 'Hard';
  };
  topics: string[];            // Normalized topic names
  companies?: string[];        // For LeetCode
  rating?: number;            // For Codeforces
  contest?: string;           // For AtCoder/Codeforces
  url?: string;
  description?: string;
  constraints?: string;
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  metadata: {
    solvedCount?: number;
    acceptanceRate?: number;
    timeLimit?: string;
    memoryLimit?: string;
    tags?: string[];
  };
}

export interface PlatformConfig {
  name: string;
  difficultyMapping: Record<string, number>;
  topicMapping: Record<string, string>;
  urlPattern: string;
}

// Platform-specific configurations
const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  leetcode: {
    name: 'LeetCode',
    difficultyMapping: {
      'Easy': 3,
      'Medium': 6,
      'Hard': 9
    },
    topicMapping: {
      'Array': 'Arrays',
      'String': 'Strings',
      'Hash Table': 'Hash Tables',
      'Linked List': 'Linked Lists',
      'Two Pointers': 'Two Pointers',
      'Binary Search': 'Binary Search',
      'Sliding Window': 'Sliding Window',
      'Stack': 'Stack',
      'Queue': 'Queue',
      'Heap (Priority Queue)': 'Heap',
      'Tree': 'Trees',
      'Binary Tree': 'Binary Trees',
      'Binary Search Tree': 'Binary Search Trees',
      'Graph': 'Graphs',
      'Dynamic Programming': 'Dynamic Programming',
      'Backtracking': 'Backtracking',
      'Greedy': 'Greedy Algorithms',
      'Math': 'Mathematics',
      'Bit Manipulation': 'Bit Manipulation',
      'Sorting': 'Sorting',
      'Recursion': 'Recursion'
    },
    urlPattern: 'https://leetcode.com/problems/{slug}/'
  },
  
  codeforces: {
    name: 'Codeforces',
    difficultyMapping: {
      // Rating-based mapping to 1-10 scale
      '800': 1, '900': 1,
      '1000': 2, '1100': 2,
      '1200': 3, '1300': 3,
      '1400': 4, '1500': 4,
      '1600': 5, '1700': 5,
      '1800': 6, '1900': 6,
      '2000': 7, '2100': 7,
      '2200': 8, '2300': 8,
      '2400': 9, '2500': 9,
      '2600': 10, '2700': 10, '2800': 10, '2900': 10, '3000': 10
    },
    topicMapping: {
      'implementation': 'Implementation',
      'math': 'Mathematics',
      'greedy': 'Greedy Algorithms',
      'dp': 'Dynamic Programming',
      'data structures': 'Data Structures',
      'brute force': 'Brute Force',
      'constructive algorithms': 'Constructive Algorithms',
      'graphs': 'Graphs',
      'sortings': 'Sorting',
      'binary search': 'Binary Search',
      'dfs and similar': 'DFS',
      'trees': 'Trees',
      'strings': 'Strings',
      'number theory': 'Number Theory',
      'combinatorics': 'Combinatorics',
      'two pointers': 'Two Pointers'
    },
    urlPattern: 'https://codeforces.com/problemset/problem/{contestId}/{index}'
  },
  
  atcoder: {
    name: 'AtCoder',
    difficultyMapping: {
      // Contest-based mapping
      'ABC-A': 1, 'ABC-B': 2, 'ABC-C': 3, 'ABC-D': 4, 'ABC-E': 5, 'ABC-F': 6,
      'ARC-A': 3, 'ARC-B': 4, 'ARC-C': 6, 'ARC-D': 7, 'ARC-E': 8, 'ARC-F': 9,
      'AGC-A': 5, 'AGC-B': 6, 'AGC-C': 7, 'AGC-D': 8, 'AGC-E': 9, 'AGC-F': 10
    },
    topicMapping: {
      'implementation': 'Implementation',
      'math': 'Mathematics',
      'greedy': 'Greedy Algorithms',
      'dp': 'Dynamic Programming',
      'graph': 'Graphs',
      'data_structures': 'Data Structures',
      'string': 'Strings',
      'binary_search': 'Binary Search',
      'brute_force': 'Brute Force',
      'constructive': 'Constructive Algorithms'
    },
    urlPattern: 'https://atcoder.jp/contests/{contest}/tasks/{taskId}'
  }
};

export class PlatformAdapter {
  
  /**
   * Normalize a problem from any platform to unified format
   */
  static normalizeProblem(problemData: any, platform: string): NormalizedProblem {
    try {
      const normalizedPlatform = platform?.toLowerCase() as 'leetcode' | 'codeforces' | 'atcoder';
      const config = PLATFORM_CONFIGS[normalizedPlatform];

      if (!config) {
        console.warn(`⚠️ Unsupported platform: ${platform}, using fallback normalization`);
        return this.createFallbackNormalizedProblem(problemData, normalizedPlatform);
      }

      switch (normalizedPlatform) {
        case 'leetcode':
          return this.normalizeLeetCodeProblem(problemData, config);
        case 'codeforces':
          return this.normalizeCodeforcesProblem(problemData, config);
        case 'atcoder':
          return this.normalizeAtCoderProblem(problemData, config);
        default:
          console.warn(`⚠️ Platform ${platform} not implemented, using fallback`);
          return this.createFallbackNormalizedProblem(problemData, normalizedPlatform);
      }
    } catch (error) {
      console.error(`❌ Error normalizing problem for platform ${platform}:`, error);
      return this.createFallbackNormalizedProblem(problemData, platform as any);
    }
  }

  /**
   * Create a fallback normalized problem when platform-specific normalization fails
   */
  private static createFallbackNormalizedProblem(data: any, platform: string): NormalizedProblem {
    // Determine difficulty category from various possible formats
    let difficultyCategory: 'Easy' | 'Medium' | 'Hard' = 'Medium';
    let normalizedDifficulty = 6;

    const difficulty = data.difficulty?.toString() || '';

    if (difficulty.toLowerCase().includes('easy') ||
        (platform === 'codeforces' && parseInt(difficulty) <= 1200) ||
        (platform === 'atcoder' && difficulty.includes('A'))) {
      difficultyCategory = 'Easy';
      normalizedDifficulty = 3;
    } else if (difficulty.toLowerCase().includes('hard') ||
               (platform === 'codeforces' && parseInt(difficulty) >= 1800) ||
               (platform === 'atcoder' && difficulty.includes('C'))) {
      difficultyCategory = 'Hard';
      normalizedDifficulty = 8;
    }

    return {
      id: data._id || data.id || data.problemId || 'unknown',
      title: data.title || 'Unknown Problem',
      platform: platform as 'leetcode' | 'codeforces' | 'atcoder',
      difficulty: {
        original: difficulty || 'Unknown',
        normalized: normalizedDifficulty,
        category: difficultyCategory
      },
      topics: Array.isArray(data.topics) ? data.topics : [],
      companies: Array.isArray(data.companies) ? data.companies : [],
      url: data.url || '',
      description: data.description || `Problem: ${data.title || 'Unknown'}`,
      metadata: {
        tags: Array.isArray(data.tags) ? data.tags : []
      }
    };
  }

  /**
   * Normalize LeetCode problem
   */
  private static normalizeLeetCodeProblem(data: any, config: PlatformConfig): NormalizedProblem {
    const difficulty = data.difficulty || 'Medium';
    const normalizedDifficulty = config.difficultyMapping[difficulty] || 6;
    
    return {
      id: data._id || data.id,
      title: data.title,
      platform: 'leetcode',
      difficulty: {
        original: difficulty,
        normalized: normalizedDifficulty,
        category: this.getDifficultyCategory(normalizedDifficulty)
      },
      topics: this.normalizeTopics(data.topics || [], config.topicMapping),
      companies: data.companies || [],
      url: data.url || config.urlPattern.replace('{slug}', data.slug || ''),
      description: data.description,
      constraints: data.constraints,
      examples: data.examples,
      metadata: {
        solvedCount: data.solvedCount,
        acceptanceRate: data.acceptanceRate,
        tags: data.tags
      }
    };
  }

  /**
   * Normalize Codeforces problem
   */
  private static normalizeCodeforcesProblem(data: any, config: PlatformConfig): NormalizedProblem {
    const rating = data.rating?.toString() || '1200';
    const normalizedDifficulty = this.getCodeforcesNormalizedDifficulty(parseInt(rating));
    
    return {
      id: `${data.contestId}${data.index}`,
      title: data.name || data.title,
      platform: 'codeforces',
      difficulty: {
        original: rating,
        normalized: normalizedDifficulty,
        category: this.getDifficultyCategory(normalizedDifficulty)
      },
      topics: this.normalizeTopics(data.tags || [], config.topicMapping),
      rating: parseInt(rating),
      contest: data.contestId?.toString(),
      url: config.urlPattern
        .replace('{contestId}', data.contestId)
        .replace('{index}', data.index),
      description: data.description,
      metadata: {
        solvedCount: data.solvedCount,
        timeLimit: data.timeLimit,
        memoryLimit: data.memoryLimit,
        tags: data.tags
      }
    };
  }

  /**
   * Normalize AtCoder problem
   */
  private static normalizeAtCoderProblem(data: any, config: PlatformConfig): NormalizedProblem {
    const contestType = this.getAtCoderContestType(data.contest || '');
    const problemIndex = data.index || 'A';
    const difficultyKey = `${contestType}-${problemIndex}`;
    const normalizedDifficulty = config.difficultyMapping[difficultyKey] || 3;
    
    return {
      id: data.id || `${data.contest}_${data.index}`,
      title: data.title || data.name,
      platform: 'atcoder',
      difficulty: {
        original: difficultyKey,
        normalized: normalizedDifficulty,
        category: this.getDifficultyCategory(normalizedDifficulty)
      },
      topics: this.normalizeTopics(data.tags || [], config.topicMapping),
      contest: data.contest,
      url: config.urlPattern
        .replace('{contest}', data.contest)
        .replace('{taskId}', data.taskId || data.id),
      description: data.description,
      metadata: {
        timeLimit: data.timeLimit,
        memoryLimit: data.memoryLimit,
        tags: data.tags
      }
    };
  }

  /**
   * Normalize topic names using platform mapping
   */
  private static normalizeTopics(topics: string[], mapping: Record<string, string>): string[] {
    return topics
      .map(topic => mapping[topic] || topic)
      .filter((topic, index, arr) => arr.indexOf(topic) === index); // Remove duplicates
  }

  /**
   * Get difficulty category from normalized score (1-10)
   */
  private static getDifficultyCategory(normalized: number): 'Easy' | 'Medium' | 'Hard' {
    if (normalized <= 3) return 'Easy';
    if (normalized <= 7) return 'Medium';
    return 'Hard';
  }

  /**
   * Get normalized difficulty for Codeforces rating
   */
  private static getCodeforcesNormalizedDifficulty(rating: number): number {
    if (rating <= 900) return 1;
    if (rating <= 1100) return 2;
    if (rating <= 1300) return 3;
    if (rating <= 1500) return 4;
    if (rating <= 1700) return 5;
    if (rating <= 1900) return 6;
    if (rating <= 2100) return 7;
    if (rating <= 2300) return 8;
    if (rating <= 2500) return 9;
    return 10;
  }

  /**
   * Determine AtCoder contest type from contest name
   */
  private static getAtCoderContestType(contest: string): string {
    if (contest.includes('abc') || contest.includes('ABC')) return 'ABC';
    if (contest.includes('arc') || contest.includes('ARC')) return 'ARC';
    if (contest.includes('agc') || contest.includes('AGC')) return 'AGC';
    return 'ABC'; // Default to ABC
  }

  /**
   * Get platform configuration
   */
  static getPlatformConfig(platform: string): PlatformConfig {
    const config = PLATFORM_CONFIGS[platform];
    if (!config) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    return config;
  }

  /**
   * Get all supported platforms
   */
  static getSupportedPlatforms(): string[] {
    return Object.keys(PLATFORM_CONFIGS);
  }
}
