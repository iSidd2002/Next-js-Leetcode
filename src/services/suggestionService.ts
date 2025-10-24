/**
 * Suggestion Service
 * Handles LLM-based failure detection and suggestion generation
 * Integrates web search for real, up-to-date problem recommendations
 */

import { failureDetectionPrompt, suggestionGeneratorPrompt, fallbackSuggestions } from '@/lib/llm-prompts';
import { prisma } from '@/lib/prisma';
import { webSearchService } from './webSearchService';
import { advancedQuestionSelector } from './advancedQuestionSelector';

interface FailureDetectionResult {
  failed: boolean;
  failure_reason: string;
  missing_concepts: string[];
  confidence: number;
}

interface SuggestionsResult {
  prerequisites: Array<{
    title: string;
    difficulty: string;
    reason: string;
    estimatedTime: number;
  }>;
  similarProblems: Array<{
    title: string;
    tags: string[];
    reason: string;
    url?: string;
    platform?: string;
  }>;
  microtasks: Array<{
    title: string;
    description: string;
    duration: number;
  }>;
}

export class SuggestionService {
  private isValidObjectId(str: string | undefined): boolean {
    return !!str && /^[0-9a-fA-F]{24}$/.test(str);
  }
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    console.log('SuggestionService initialized. API Key configured:', !!this.apiKey);
    if (!this.apiKey) {
      console.warn('⚠️ GEMINI_API_KEY environment variable is not set!');
    }
  }

  /**
   * Call Gemini API with a prompt
   */
  private async callGeminiAPI(prompt: string, isFailureDetection: boolean = false): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Use lower temperature for failure detection (more deterministic)
    // Use slightly higher temperature for suggestions (more creative)
    const temperature = isFailureDetection ? 0.2 : 0.4;
    const maxTokens = isFailureDetection ? 1500 : 2500;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        topP: 0.95,
        topK: 40,
      },
    };

    const configuredModel = (process.env.GEMINI_MODEL || '').trim();
    const candidateModels = configuredModel
      ? [configuredModel]
      : [
          'gemini-1.5-flash-latest',
          'gemini-1.5-flash',
          'gemini-1.5-flash-8b',
          'gemini-1.5-pro-latest',
          'gemini-1.5-pro',
          'gemini-pro',
        ];
    const versions = ['v1', 'v1beta'];
    const endpoints: string[] = [];
    for (const v of versions) {
      for (const m of candidateModels) {
        endpoints.push(`https://generativelanguage.googleapis.com/${v}/models/${m}:generateContent`);
      }
    }

    let lastError: string | undefined;

    for (const base of endpoints) {
      const url = `${base}?key=${this.apiKey}`;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorBody: any = {};
          try {
            errorBody = await response.json();
          } catch {}
          const message = errorBody?.error?.message || response.statusText;
          console.warn('Gemini API attempt failed', { endpoint: base, status: response.status, message });
          lastError = message;
          continue;
        }

        const data = await response.json();
        console.log('Gemini API success via', base);
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) {
          console.warn('No content in Gemini response for endpoint', base, data);
          lastError = 'No content in Gemini response';
          continue;
        }
        return content;
      } catch (e: any) {
        console.warn('Gemini API fetch error via', base, e?.message || e);
        lastError = e?.message || String(e);
      }
    }

    throw new Error(`Gemini API error: ${lastError || 'All attempts failed'}`);
  }

  /**
   * Detect if user failed and identify missing concepts
   */
  async detectFailure(
    problemTitle: string,
    problemDescription: string,
    transcript: string,
    code?: string,
    difficulty?: string
  ): Promise<FailureDetectionResult> {
    try {
      const prompt = failureDetectionPrompt(
        problemTitle,
        problemDescription,
        transcript,
        code,
        difficulty
      );

      const response = await this.callGeminiAPI(prompt, true);

      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = response;
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const result: FailureDetectionResult = JSON.parse(jsonStr);
      return result;
    } catch (error) {
      console.error('Failure detection error:', error);
      throw error;
    }
  }

  /**
   * Generate suggestions based on failure analysis
   */
  async generateSuggestions(
    problemTitle: string,
    difficulty: string,
    topics: string[],
    missingConcepts: string[],
    failureReason: string,
    platform?: string,
    url?: string,
    companies?: string[],
    userId?: string
  ): Promise<SuggestionsResult> {
    try {
      const prompt = suggestionGeneratorPrompt(
        problemTitle,
        difficulty,
        topics,
        missingConcepts,
        failureReason,
        platform,
        url,
        companies
      );

      const response = await this.callGeminiAPI(prompt, false);

      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = response;
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const result: SuggestionsResult = JSON.parse(jsonStr);

      // Enrich similar problems with web search results
      if (platform) {
        console.log(`Enriching suggestions with web search for platform: ${platform}`);
        result.similarProblems = await this.enrichSimilarProblemsWithWebSearch(
          result.similarProblems,
          difficulty,
          topics,
          missingConcepts,
          platform,
          userId
        );
      }

      return result;
    } catch (error) {
      console.error('Suggestion generation error:', error);
      throw error;
    }
  }

  /**
   * Enrich similar problems with real web search results
   */
  /**
   * ENHANCED: Calculate tag relevance between current and recommended problems
   * Returns a score from 0-1 indicating how well tags match
   */
  private calculateTagRelevance(currentTags: string[], recommendedTags: string[]): number {
    if (currentTags.length === 0 || recommendedTags.length === 0) {
      return 0.5; // Neutral score if no tags
    }

    const exactMatches = currentTags.filter((tag) =>
      recommendedTags.some((rTag) => rTag.toLowerCase().includes(tag.toLowerCase()))
    ).length;

    const totalTags = Math.max(currentTags.length, recommendedTags.length);
    return exactMatches / totalTags;
  }

  /**
   * ENHANCED: Rank suggestions by tag relevance
   * Prioritizes suggestions with matching concepts
   */
  private rankSuggestionsByTags(
    suggestions: SuggestionsResult['similarProblems'],
    currentTags: string[]
  ): SuggestionsResult['similarProblems'] {
    return suggestions
      .map((suggestion) => ({
        ...suggestion,
        tagRelevance: this.calculateTagRelevance(currentTags, suggestion.tags),
      }))
      .sort((a, b) => (b as any).tagRelevance - (a as any).tagRelevance)
      .map(({ tagRelevance, ...suggestion }) => suggestion);
  }

  /**
   * ENHANCED: Get difficulty-varied suggestions (Easy, Medium, Hard mix)
   * Returns 5-6 problems with balanced difficulty distribution
   */
  private async getVariedDifficultySuggestions(
    difficulty: string,
    topics: string[],
    missingConcepts: string[],
    platform: string
  ): Promise<Array<{ title: string; url: string; reason: string; difficulty: string }>> {
    try {
      const results: Array<{ title: string; url: string; reason: string; difficulty: string }> = [];

      if (platform === 'codeforces') {
        // Get Easy, Medium, Hard problems
        const easyResults = await webSearchService.searchCodeForcesProblem('800', topics, missingConcepts);
        const mediumResults = await webSearchService.searchCodeForcesProblem(difficulty, topics, missingConcepts);
        const hardResults = await webSearchService.searchCodeForcesProblem('1600', topics, missingConcepts);

        // Add with difficulty labels
        easyResults.slice(0, 2).forEach(r => results.push({ ...r, difficulty: 'Easy' }));
        mediumResults.slice(0, 2).forEach(r => results.push({ ...r, difficulty: 'Medium' }));
        hardResults.slice(0, 2).forEach(r => results.push({ ...r, difficulty: 'Hard' }));
      } else if (platform === 'atcoder') {
        // Get Easy (ABC A/B), Medium (ABC C/D), Hard (ABC E/F, ARC)
        const easyResults = await webSearchService.searchAtCoderProblem('ABC_A', topics, missingConcepts);
        const mediumResults = await webSearchService.searchAtCoderProblem('ABC_C', topics, missingConcepts);
        const hardResults = await webSearchService.searchAtCoderProblem('ABC_E', topics, missingConcepts);

        easyResults.slice(0, 2).forEach(r => results.push({ ...r, difficulty: 'Easy' }));
        mediumResults.slice(0, 2).forEach(r => results.push({ ...r, difficulty: 'Medium' }));
        hardResults.slice(0, 2).forEach(r => results.push({ ...r, difficulty: 'Hard' }));
      } else if (platform === 'leetcode') {
        // Get Easy, Medium, Hard problems
        const easyResults = await webSearchService.searchLeetCodeProblem('Easy', topics, missingConcepts);
        const mediumResults = await webSearchService.searchLeetCodeProblem('Medium', topics, missingConcepts);
        const hardResults = await webSearchService.searchLeetCodeProblem('Hard', topics, missingConcepts);

        easyResults.slice(0, 2).forEach(r => results.push({ ...r, difficulty: 'Easy' }));
        mediumResults.slice(0, 2).forEach(r => results.push({ ...r, difficulty: 'Medium' }));
        hardResults.slice(0, 2).forEach(r => results.push({ ...r, difficulty: 'Hard' }));
      }

      return results;
    } catch (error) {
      console.error('Error getting varied difficulty suggestions:', error);
      return [];
    }
  }

  /**
   * ENHANCED: Add difficulty levels to LLM suggestions
   * Ensures all suggestions have difficulty tags for proper grouping
   */
  private addDifficultyToSuggestions(
    suggestions: SuggestionsResult['similarProblems'],
    _difficulty: string
  ): SuggestionsResult['similarProblems'] {
    return suggestions.map((suggestion, index) => {
      // Check if difficulty already in tags
      const hasDifficulty = suggestion.tags.some(tag =>
        ['Easy', 'Medium', 'Hard'].includes(tag)
      );

      if (hasDifficulty) {
        return suggestion;
      }

      // Add difficulty based on index (distribute across Easy, Medium, Hard)
      let difficultyLevel = 'Medium';
      if (index % 3 === 0) {
        difficultyLevel = 'Easy';
      } else if (index % 3 === 2) {
        difficultyLevel = 'Hard';
      }

      return {
        ...suggestion,
        tags: [...suggestion.tags, difficultyLevel],
      };
    });
  }

  private async enrichSimilarProblemsWithWebSearch(
    suggestions: SuggestionsResult['similarProblems'],
    difficulty: string,
    topics: string[],
    missingConcepts: string[],
    platform: string,
    userId?: string
  ): Promise<SuggestionsResult['similarProblems']> {
    try {
      // ENHANCED: Get 5-6 problems with mixed difficulties
      const variedResults = await this.getVariedDifficultySuggestions(
        difficulty,
        topics,
        missingConcepts,
        platform
      );

      if (variedResults.length > 0) {
        console.log(`Found ${variedResults.length} problems with varied difficulties`);

        // NEW: Use advanced selector if userId provided
        if (userId) {
          try {
            console.log(`Using advanced question selector for user: ${userId}`);
            const selectedQuestions = await advancedQuestionSelector.selectOptimalQuestions(
              {
                userId,
                currentDifficulty: difficulty,
                topics,
                missingConcepts,
                platform,
                learningStyle: 'progressive',
              },
              variedResults
            );

            return selectedQuestions.map((q) => ({
              title: q.title,
              tags: [...topics.slice(0, 2), q.difficulty],
              reason: q.reasons.join(', '),
              url: q.url,
              platform,
            }));
          } catch (advancedError) {
            console.error('Advanced selection error, falling back to standard enrichment:', advancedError);
            // Fall through to standard enrichment
          }
        }

        // Standard enrichment (existing code)
        const enrichedResults = variedResults.map((result) => ({
          title: result.title,
          tags: [...topics.slice(0, 2), result.difficulty],
          reason: result.reason,
          url: result.url,
          platform,
        }));

        // ENHANCED: Rank by tag relevance
        return this.rankSuggestionsByTags(enrichedResults, topics).slice(0, 6);
      }

      // Fallback: add platform info to LLM suggestions and rank by tags
      let fallbackSuggestions = suggestions.map((suggestion) => ({
        ...suggestion,
        platform,
      }));

      // ENHANCED: Add difficulty tags to LLM suggestions
      fallbackSuggestions = this.addDifficultyToSuggestions(fallbackSuggestions, difficulty) as typeof fallbackSuggestions;

      // ENHANCED: Rank by tag relevance
      return this.rankSuggestionsByTags(fallbackSuggestions, topics).slice(0, 6);
    } catch (error) {
      console.error('Error enriching suggestions with web search:', error);
      // Return original suggestions if enrichment fails
      let fallback = suggestions.map((suggestion) => ({
        ...suggestion,
        platform,
      }));

      // Add difficulty tags
      fallback = this.addDifficultyToSuggestions(fallback, difficulty) as typeof fallback;
      return fallback.slice(0, 6);
    }
  }

  /**
   * Cache suggestions in database
   * Note: Disabled due to MongoDB replica set requirement
   * Suggestions are still returned to users, just not cached
   */
  async cacheSuggestions(
    userId: string,
    problemId: string,
    _suggestions: SuggestionsResult,
    _failureReason: string,
    _confidence: number
  ): Promise<void> {
    try {
      // Caching disabled - MongoDB requires replica set for Prisma operations
      // This doesn't affect the feature - suggestions are still generated and returned
      console.log('Caching disabled (MongoDB replica set required)');
      console.log(`Would cache suggestions for user ${userId}, problem ${problemId}`);
    } catch (error) {
      console.error('Cache suggestions error:', error);
      // Don't throw - caching failure shouldn't break the feature
      // Suggestions are still returned to the user
    }
  }

  /**
   * Retrieve cached suggestions
   */
  async getSuggestions(userId: string, problemId: string): Promise<SuggestionsResult | null> {
    try {
      if (!this.isValidObjectId(userId) || !this.isValidObjectId(problemId)) {
        console.warn('Skipping cache lookup for non-ObjectId ids', { userId, problemId });
        return null;
      }
      const suggestion = await prisma.userProblemSuggestion.findUnique({
        where: {
          userId_problemId: {
            userId,
            problemId,
          },
        },
      });

      if (!suggestion) {
        return null;
      }

      // Check if expired
      if (new Date() > suggestion.expiresAt) {
        // Delete expired suggestion
        await prisma.userProblemSuggestion.delete({
          where: {
            userId_problemId: {
              userId,
              problemId,
            },
          },
        });
        return null;
      }

      return suggestion.suggestions as unknown as SuggestionsResult;
    } catch (error) {
      console.error('Get suggestions error:', error);
      return null;
    }
  }

  /**
   * Get fallback suggestions when LLM fails
   */
  getFallbackSuggestions(): SuggestionsResult {
    return fallbackSuggestions as SuggestionsResult;
  }
}

export const suggestionService = new SuggestionService();

