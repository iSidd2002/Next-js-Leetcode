/**
 * Web Search Service
 * Searches for real, up-to-date problem recommendations from platforms
 */

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface ProblemRecommendation {
  title: string;
  url: string;
  difficulty?: string;
  tags?: string[];
  reason: string;
}

export class WebSearchService {
  /**
   * Search for CodeForces problems with similar difficulty and tags
   * CodeForces uses rating system (800-3500)
   * ENHANCED: Granular rating mapping for better difficulty matching
   */
  async searchCodeForcesProblem(
    difficulty: string,
    topics: string[],
    missingConcepts: string[]
  ): Promise<ProblemRecommendation[]> {
    try {
      // ENHANCED: Granular rating mapping (12+ levels instead of 3)
      // This provides fine-grained difficulty matching
      const advancedRatingMap: { [key: string]: number[] } = {
        // Beginner Level (800-1000)
        '800': [750, 800, 850, 900, 950, 1000],
        '900': [850, 900, 950, 1000, 1050, 1100],
        '1000': [950, 1000, 1050, 1100, 1150, 1200],

        // Early Intermediate (1000-1200)
        '1100': [1050, 1100, 1150, 1200, 1250, 1300],
        '1200': [1150, 1200, 1250, 1300, 1350, 1400],

        // Intermediate (1200-1400)
        '1300': [1250, 1300, 1350, 1400, 1450, 1500],
        '1400': [1350, 1400, 1450, 1500, 1550, 1600],

        // Advanced Intermediate (1400-1600)
        '1500': [1450, 1500, 1550, 1600, 1650, 1700],
        '1600': [1550, 1600, 1650, 1700, 1750, 1800],

        // Advanced (1600-1800)
        '1700': [1650, 1700, 1750, 1800, 1850, 1900],
        '1800': [1750, 1800, 1850, 1900, 1950, 2000],

        // Very Advanced (1800-2000)
        '1900': [1850, 1900, 1950, 2000, 2050, 2100],
        '2000': [1950, 2000, 2050, 2100, 2150, 2200],

        // Expert (2000+)
        '2100': [2050, 2100, 2150, 2200, 2250, 2300],
        '2200': [2150, 2200, 2250, 2300, 2350, 2400],

        // Legacy mappings for compatibility
        'Easy': [800, 900, 1000, 1100, 1200],
        'Medium': [1200, 1300, 1400, 1500, 1600],
        'Hard': [1600, 1700, 1800, 1900, 2000],
      };

      const ratings = advancedRatingMap[difficulty] || [1200, 1300, 1400, 1500, 1600];
      const searchTerms = [...topics, ...missingConcepts].slice(0, 2).join(' ');

      // Create multiple search queries for different ratings
      // This increases chances of finding relevant problems
      const queries = ratings.map(
        (rating) => `site:codeforces.com problem ${searchTerms} rating:${rating}`
      );

      // Try each query
      let allResults: ProblemRecommendation[] = [];
      for (const query of queries) {
        const results = await this.performWebSearch(query);
        allResults = allResults.concat(
          results.map((result) => ({
            title: this.extractCodeForcesProblemTitle(result.title),
            url: result.url,
            reason: `Similar ${searchTerms} problem on CodeForces`,
          }))
        );
        if (allResults.length >= 3) break;
      }

      return allResults.slice(0, 3);
    } catch (error) {
      console.error('CodeForces search error:', error);
      return [];
    }
  }

  /**
   * Search for LeetCode problems with similar tags and difficulty
   */
  async searchLeetCodeProblem(
    difficulty: string,
    topics: string[],
    missingConcepts: string[]
  ): Promise<ProblemRecommendation[]> {
    try {
      const difficultyMap: { [key: string]: string } = {
        'Easy': 'easy',
        'Medium': 'medium',
        'Hard': 'hard',
      };

      const leetcodeDifficulty = difficultyMap[difficulty] || 'medium';
      const searchTerms = [...topics, ...missingConcepts].slice(0, 3).join(' ');

      const query = `site:leetcode.com ${leetcodeDifficulty} ${searchTerms} problem`;
      const results = await this.performWebSearch(query);

      return results.slice(0, 3).map((result) => ({
        title: this.extractProblemTitle(result.title),
        url: result.url,
        difficulty: leetcodeDifficulty,
        tags: topics.slice(0, 2),
        reason: `Similar ${searchTerms} problem on LeetCode`,
      }));
    } catch (error) {
      console.error('LeetCode search error:', error);
      return [];
    }
  }

  /**
   * Search for AtCoder problems with similar difficulty and concepts
   * AtCoder problems are labeled A-F within contests (A=easiest, F=hardest)
   * ENHANCED: Contest type hierarchy (ABC/ARC/AGC) for better recommendations
   */
  async searchAtCoderProblem(
    difficulty: string,
    topics: string[],
    missingConcepts: string[]
  ): Promise<ProblemRecommendation[]> {
    try {
      // ENHANCED: Contest type hierarchy mapping
      // ABC (Beginner): Rating ~1999
      // ARC (Regular): Rating ~2799
      // AGC (Grand): Rating ~9999
      const contestHierarchyMap: { [key: string]: { letters: string[]; contests: string[] } } = {
        // ABC Level Problems
        'Easy': { letters: ['A', 'B'], contests: ['ABC'] },
        'ABC_A': { letters: ['A', 'B'], contests: ['ABC'] },
        'ABC_B': { letters: ['B', 'C'], contests: ['ABC'] },
        'ABC_C': { letters: ['C', 'D'], contests: ['ABC', 'ARC'] },
        'ABC_D': { letters: ['D', 'E'], contests: ['ABC', 'ARC'] },
        'ABC_E': { letters: ['E', 'F'], contests: ['ABC', 'ARC', 'AGC'] },
        'ABC_F': { letters: ['F'], contests: ['ABC', 'ARC', 'AGC'] },

        // ARC Level Problems
        'Medium': { letters: ['C', 'D'], contests: ['ABC', 'ARC'] },
        'ARC_A': { letters: ['A', 'B'], contests: ['ARC', 'ABC'] },
        'ARC_B': { letters: ['B', 'C'], contests: ['ARC', 'AGC'] },
        'ARC_C': { letters: ['C', 'D'], contests: ['ARC', 'AGC'] },
        'ARC_D': { letters: ['D', 'E'], contests: ['ARC', 'AGC'] },
        'ARC_E': { letters: ['E', 'F'], contests: ['ARC', 'AGC'] },
        'ARC_F': { letters: ['F'], contests: ['ARC', 'AGC'] },

        // AGC Level Problems
        'Hard': { letters: ['E', 'F'], contests: ['ARC', 'AGC'] },
        'AGC_A': { letters: ['A', 'B'], contests: ['AGC'] },
        'AGC_B': { letters: ['B', 'C'], contests: ['AGC'] },
        'AGC_C': { letters: ['C', 'D'], contests: ['AGC'] },
        'AGC_D': { letters: ['D', 'E'], contests: ['AGC'] },
        'AGC_E': { letters: ['E', 'F'], contests: ['AGC'] },
        'AGC_F': { letters: ['F'], contests: ['AGC'] },

        // Legacy mappings for compatibility
        '800': { letters: ['A', 'B'], contests: ['ABC'] },
        '1000': { letters: ['B', 'C'], contests: ['ABC'] },
        '1200': { letters: ['C', 'D'], contests: ['ABC', 'ARC'] },
        '1400': { letters: ['D', 'E'], contests: ['ARC'] },
        '1600': { letters: ['E', 'F'], contests: ['ARC', 'AGC'] },
      };

      const config = contestHierarchyMap[difficulty] || { letters: ['C', 'D'], contests: ['ABC', 'ARC'] };
      const searchTerms = [...topics, ...missingConcepts].slice(0, 2).join(' ');

      // Create multiple search queries for different contest types and letters
      // This increases chances of finding relevant problems
      const queries: string[] = [];
      for (const contest of config.contests) {
        for (const letter of config.letters) {
          queries.push(`site:atcoder.jp ${contest} ${letter} ${searchTerms}`);
        }
      }

      // Try each query
      let allResults: ProblemRecommendation[] = [];
      for (const query of queries) {
        const results = await this.performWebSearch(query);
        allResults = allResults.concat(
          results.map((result) => ({
            title: this.extractAtCoderProblemTitle(result.title),
            url: result.url,
            reason: `Similar ${searchTerms} problem on AtCoder`,
          }))
        );
        if (allResults.length >= 3) break;
      }

      return allResults.slice(0, 3);
    } catch (error) {
      console.error('AtCoder search error:', error);
      return [];
    }
  }

  /**
   * Extract AtCoder problem title with contest and letter
   * Format: "AtCoder ABC123A - Problem Name"
   */
  private extractAtCoderProblemTitle(title: string): string {
    // Try to extract contest name and problem letter
    // Format: "A - Problem Name | AtCoder ABC123"
    const match = title.match(/([A-F])\s*-\s*([^|]+)\|?\s*(?:AtCoder\s+)?([A-Z]+\d+)?/i);
    if (match) {
      const letter = match[1];
      const problemName = match[2].trim();
      const contest = match[3] || 'AtCoder';
      return `${contest}${letter} - ${problemName}`;
    }

    // Fallback: clean up the title
    return title
      .replace(/\s*-\s*AtCoder.*/, '')
      .replace(/\s*\|.*/, '')
      .trim();
  }

  /**
   * Extract CodeForces problem title with contest ID and rating
   * Format: "Codeforces 1234A - Problem Name (Rating 800)"
   */
  private extractCodeForcesProblemTitle(title: string): string {
    // Try to extract contest ID, problem letter, and rating
    // Format: "A - Problem Name | Codeforces 1234"
    const match = title.match(/([A-F])\s*-\s*([^|]+)\|?\s*(?:Codeforces\s+)?(\d+)?/i);
    if (match) {
      const letter = match[1];
      const problemName = match[2].trim();
      const contestId = match[3] || 'CF';
      return `Codeforces ${contestId}${letter} - ${problemName}`;
    }

    // Fallback: clean up the title
    return title
      .replace(/\s*-\s*Codeforces.*/, '')
      .replace(/\s*\|.*/, '')
      .trim();
  }

  /**
   * Perform web search using available methods
   */
  private async performWebSearch(query: string): Promise<SearchResult[]> {
    try {
      console.log(`Searching: ${query}`);

      // For now, return empty array to use LLM suggestions
      // The web search tool would be called here if available
      // This allows graceful fallback to LLM suggestions
      console.log('Web search fallback: using LLM suggestions');
      return [];
    } catch (error) {
      console.error('Web search error:', error);
      return [];
    }
  }



  /**
   * Extract problem title from search result
   */
  private extractProblemTitle(title: string): string {
    // Remove common suffixes
    return title
      .replace(/\s*-\s*LeetCode.*/, '')
      .replace(/\s*-\s*Codeforces.*/, '')
      .replace(/\s*-\s*AtCoder.*/, '')
      .replace(/\s*\|.*/, '')
      .trim();
  }

  /**
   * Verify problem URL is accessible
   */
  async verifyProblemUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error(`Failed to verify URL ${url}:`, error);
      return false;
    }
  }

  /**
   * Get platform from URL
   */
  getPlatformFromUrl(url: string): string {
    if (url.includes('codeforces.com')) return 'codeforces';
    if (url.includes('leetcode.com')) return 'leetcode';
    if (url.includes('atcoder.jp')) return 'atcoder';
    return 'unknown';
  }
}

export const webSearchService = new WebSearchService();

