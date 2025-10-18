/**
 * Advanced Question Selector Service
 * Sophisticated algorithm for choosing optimal practice questions
 * Uses multiple selection strategies: difficulty progression, concept mastery, spaced repetition, etc.
 */

import { prisma } from '@/lib/prisma';

interface QuestionScore {
  questionId: string;
  title: string;
  difficulty: string;
  score: number;
  reasons: string[];
  platform: string;
  url?: string;
}

interface SelectionCriteria {
  userId: string;
  currentDifficulty: string;
  topics: string[];
  missingConcepts: string[];
  platform: string;
  reviewContext?: boolean;
  userSkillLevel?: number; // 0-100
  learningStyle?: 'progressive' | 'mixed' | 'challenging';
}

export class AdvancedQuestionSelector {
  /**
   * AtCoder Contest Progression Map - Natural learning path
   * ABC → ARC → AGC progression with difficulty levels
   */
  private readonly atcoderProgressionMap: { [key: string]: { next: string[]; difficulty: number } } = {
    'ABC_A': { next: ['ABC_B', 'ABC_C'], difficulty: 1 },
    'ABC_B': { next: ['ABC_C', 'ABC_D'], difficulty: 1.5 },
    'ABC_C': { next: ['ABC_D', 'ABC_E', 'ARC_A'], difficulty: 2 },
    'ABC_D': { next: ['ABC_E', 'ABC_F', 'ARC_B'], difficulty: 2.5 },
    'ABC_E': { next: ['ABC_F', 'ARC_A', 'ARC_B'], difficulty: 3 },
    'ABC_F': { next: ['ARC_A', 'ARC_B', 'ARC_C'], difficulty: 3.5 },
    'ARC_A': { next: ['ARC_B', 'ARC_C', 'AGC_A'], difficulty: 4 },
    'ARC_B': { next: ['ARC_C', 'ARC_D', 'AGC_B'], difficulty: 4.5 },
    'ARC_C': { next: ['ARC_D', 'ARC_E', 'AGC_C'], difficulty: 5 },
    'ARC_D': { next: ['ARC_E', 'ARC_F', 'AGC_D'], difficulty: 5.5 },
    'ARC_E': { next: ['ARC_F', 'AGC_A', 'AGC_B'], difficulty: 6 },
    'ARC_F': { next: ['AGC_A', 'AGC_B', 'AGC_C'], difficulty: 6.5 },
    'AGC_A': { next: ['AGC_B', 'AGC_C'], difficulty: 7 },
    'AGC_B': { next: ['AGC_C', 'AGC_D'], difficulty: 7.5 },
    'AGC_C': { next: ['AGC_D', 'AGC_E'], difficulty: 8 },
    'AGC_D': { next: ['AGC_E', 'AGC_F'], difficulty: 8.5 },
    'AGC_E': { next: ['AGC_F'], difficulty: 9 },
    'AGC_F': { next: [], difficulty: 10 },
  };

  /**
   * Concept-to-Difficulty Mapping for AtCoder
   * Maps concepts to typical difficulty levels
   */
  private readonly conceptDifficultyMap: { [key: string]: { letters: string[]; contests: string[] } } = {
    'Implementation': { letters: ['A', 'B'], contests: ['ABC'] },
    'Math': { letters: ['B', 'C', 'D'], contests: ['ABC', 'ARC'] },
    'DP': { letters: ['C', 'D', 'E'], contests: ['ABC', 'ARC', 'AGC'] },
    'Graph': { letters: ['D', 'E', 'F'], contests: ['ARC', 'AGC'] },
    'Advanced': { letters: ['E', 'F'], contests: ['ARC', 'AGC'] },
    'Greedy': { letters: ['B', 'C', 'D'], contests: ['ABC', 'ARC'] },
    'BinarySearch': { letters: ['C', 'D', 'E'], contests: ['ABC', 'ARC', 'AGC'] },
    'Simulation': { letters: ['A', 'B', 'C'], contests: ['ABC'] },
  };

  /**
   * Main selection method - combines multiple strategies
   */
  async selectOptimalQuestions(
    criteria: SelectionCriteria,
    availableQuestions: any[]
  ): Promise<QuestionScore[]> {
    const scores = await Promise.all(
      availableQuestions.map(async (question) => {
        const score = await this.calculateQuestionScore(question, criteria);
        return score;
      })
    );

    // Sort by score (highest first) and return top questions
    return scores
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }

  /**
   * Calculate comprehensive score for a question
   * Combines multiple factors: difficulty, concepts, user history, etc.
   */
  private async calculateQuestionScore(
    question: any,
    criteria: SelectionCriteria
  ): Promise<QuestionScore> {
    const reasons: string[] = [];
    let totalScore = 0;

    // 1. Difficulty Alignment (25%)
    const difficultyScore = this.calculateDifficultyScore(
      question.difficulty,
      criteria.currentDifficulty,
      criteria.learningStyle || 'progressive',
      criteria.platform
    );
    totalScore += difficultyScore * 0.25;
    if (difficultyScore > 0.7) reasons.push('Good difficulty match');

    // 2. Concept Relevance (30%)
    const conceptScore = this.calculateConceptRelevance(
      question.tags || [],
      criteria.topics,
      criteria.missingConcepts,
      criteria.platform
    );
    totalScore += conceptScore * 0.3;
    if (conceptScore > 0.7) reasons.push('Covers missing concepts');

    // 3. User History (20%)
    const historyScore = await this.calculateUserHistoryScore(
      question.id,
      criteria.userId
    );
    totalScore += historyScore * 0.2;
    if (historyScore > 0.6) reasons.push('Optimal for your learning path');

    // 4. Spaced Repetition (15%)
    const spacedRepScore = await this.calculateSpacedRepetitionScore(
      question.id,
      criteria.userId
    );
    totalScore += spacedRepScore * 0.15;
    if (spacedRepScore > 0.6) reasons.push('Perfect timing for review');

    // 5. Diversity Bonus (10%)
    const diversityScore = this.calculateDiversityBonus(
      question.tags || [],
      criteria.topics
    );
    totalScore += diversityScore * 0.1;
    if (diversityScore > 0.5) reasons.push('Introduces new concepts');

    return {
      questionId: question.id,
      title: question.title,
      difficulty: question.difficulty,
      score: Math.min(totalScore, 1.0), // Normalize to 0-1
      reasons: reasons.length > 0 ? reasons : ['Recommended for practice'],
      platform: criteria.platform,
      url: question.url,
    };
  }

  /**
   * Strategy 1: Difficulty Alignment with AtCoder Progression Intelligence
   * Ensures questions match user's current level with optional challenge
   * ENHANCED: Uses AtCoder progression map for better recommendations
   */
  private calculateDifficultyScore(
    questionDifficulty: string,
    userDifficulty: string,
    learningStyle: 'progressive' | 'mixed' | 'challenging',
    platform?: string
  ): number {
    // For AtCoder, use progression-based scoring
    if (platform === 'atcoder' && this.atcoderProgressionMap[userDifficulty]) {
      const progression = this.atcoderProgressionMap[userDifficulty];
      const nextLevels = progression.next;

      // Perfect match: next level in progression
      if (nextLevels.includes(questionDifficulty)) {
        return learningStyle === 'challenging' ? 1.0 : 0.95;
      }

      // Good match: same level or one step back
      if (questionDifficulty === userDifficulty) {
        return learningStyle === 'progressive' ? 0.8 : 0.6;
      }

      // Check if it's in the progression chain
      const userProgression = this.atcoderProgressionMap[questionDifficulty];
      if (userProgression && nextLevels.some(l => userProgression.next.includes(userDifficulty))) {
        return 0.7; // Good for reinforcement
      }
    }

    // Fallback to standard difficulty mapping
    const difficultyMap: { [key: string]: number } = {
      'Easy': 1,
      'Medium': 2,
      'Hard': 3,
      '800': 1,
      '1200': 2,
      '1600': 3,
      'ABC_A': 1,
      'ABC_C': 2,
      'ABC_E': 3,
    };

    const qDiff = difficultyMap[questionDifficulty] || 2;
    const uDiff = difficultyMap[userDifficulty] || 2;

    if (learningStyle === 'progressive') {
      // Prefer same or slightly harder
      if (qDiff === uDiff) return 1.0;
      if (qDiff === uDiff + 1) return 0.8;
      if (qDiff === uDiff - 1) return 0.6;
      return Math.max(0, 1 - Math.abs(qDiff - uDiff) * 0.2);
    } else if (learningStyle === 'challenging') {
      // Prefer harder questions
      if (qDiff > uDiff) return 0.9 + (qDiff - uDiff) * 0.05;
      if (qDiff === uDiff) return 0.7;
      return Math.max(0, 0.5 - (uDiff - qDiff) * 0.1);
    } else {
      // Mixed: prefer variety
      if (qDiff === uDiff) return 0.8;
      if (Math.abs(qDiff - uDiff) === 1) return 0.9;
      return 0.5;
    }
  }

  /**
   * Strategy 2: Concept Relevance with Weighted Matching
   * Prioritizes questions covering missing concepts
   * ENHANCED: Uses weighted concept matching for better relevance
   */
  private calculateConceptRelevance(
    questionTags: string[],
    userTopics: string[],
    missingConcepts: string[],
    platform?: string
  ): number {
    if (questionTags.length === 0) return 0.5;

    // Weight configuration for concept matching
    const conceptWeights = {
      'primary': 1.0,      // Missing concepts (40% weight)
      'secondary': 0.6,    // User topics (30% weight)
      'tertiary': 0.3,     // Related concepts (20% weight)
    };

    let totalScore = 0;

    // 1. Missing concepts (highest priority)
    const missingConceptMatches = missingConcepts.filter((concept) =>
      questionTags.some((tag) =>
        tag.toLowerCase().includes(concept.toLowerCase())
      )
    ).length;
    totalScore += Math.min(1.0, (missingConceptMatches / Math.max(missingConcepts.length, 1)) * 0.4) * conceptWeights.primary;

    // 2. User topics (secondary priority)
    const topicMatches = userTopics.filter((topic) =>
      questionTags.some((tag) =>
        tag.toLowerCase().includes(topic.toLowerCase())
      )
    ).length;
    totalScore += Math.min(1.0, (topicMatches / Math.max(userTopics.length, 1)) * 0.3) * conceptWeights.secondary;

    // 3. For AtCoder, check concept-difficulty alignment
    if (platform === 'atcoder') {
      const conceptDifficultyBonus = this.calculateConceptDifficultyBonus(
        questionTags,
        missingConcepts
      );
      totalScore += conceptDifficultyBonus * conceptWeights.tertiary;
    }

    return Math.min(1.0, totalScore);
  }

  /**
   * Calculate bonus for concept-difficulty alignment in AtCoder
   * Some concepts are naturally harder (DP, Graph) vs easier (Implementation)
   */
  private calculateConceptDifficultyBonus(
    questionTags: string[],
    missingConcepts: string[]
  ): number {
    let bonus = 0;

    for (const concept of missingConcepts) {
      const conceptLower = concept.toLowerCase();
      const mapping = Object.entries(this.conceptDifficultyMap).find(
        ([key]) => key.toLowerCase() === conceptLower
      );

      if (mapping && questionTags.some(tag => tag.toLowerCase().includes(conceptLower))) {
        bonus += 0.2; // Bonus for matching concept-difficulty alignment
      }
    }

    return Math.min(1.0, bonus);
  }

  /**
   * Strategy 3: User History
   * Considers user's past performance and learning patterns
   */
  private async calculateUserHistoryScore(
    questionId: string,
    userId: string
  ): Promise<number> {
    try {
      // Check if user has solved this question before
      const userProblem = await prisma.problem.findFirst({
        where: {
          id: questionId,
          userId,
        },
      });

      if (!userProblem) {
        return 0.8; // New question - good for learning
      }

      // If solved, check performance
      if (userProblem.status === 'solved') {
        // Check time since last attempt
        const daysSinceSolved = Math.floor(
          (Date.now() - new Date(userProblem.lastAttemptDate || Date.now()).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        // Boost score if it's been a while (good for spaced repetition)
        if (daysSinceSolved > 7) return 0.9;
        if (daysSinceSolved > 3) return 0.7;
        return 0.4; // Recently solved - lower priority
      }

      // If attempted but not solved
      if (userProblem.status === 'attempted') {
        return 0.85; // Good for retry
      }

      return 0.6;
    } catch (error) {
      console.error('Error calculating user history score:', error);
      return 0.5; // Default neutral score
    }
  }

  /**
   * Strategy 4: Spaced Repetition
   * Optimal timing for reviewing previously solved problems
   */
  private async calculateSpacedRepetitionScore(
    questionId: string,
    userId: string
  ): Promise<number> {
    try {
      const userProblem = await prisma.problem.findFirst({
        where: {
          id: questionId,
          userId,
        },
      });

      if (!userProblem || userProblem.status !== 'solved') {
        return 0.5; // Not applicable for unsolved problems
      }

      const nextReviewDate = userProblem.nextReviewDate;
      if (!nextReviewDate) return 0.5;

      const now = new Date();
      const daysUntilReview = Math.floor(
        (nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Perfect score if review is due today
      if (daysUntilReview <= 0) return 1.0;
      // Good score if due within 3 days
      if (daysUntilReview <= 3) return 0.8;
      // Moderate score if due within a week
      if (daysUntilReview <= 7) return 0.6;
      // Lower score if not due soon
      return Math.max(0.2, 1 - daysUntilReview * 0.05);
    } catch (error) {
      console.error('Error calculating spaced repetition score:', error);
      return 0.5;
    }
  }

  /**
   * Strategy 5: Diversity Bonus
   * Encourages learning different concepts
   */
  private calculateDiversityBonus(
    questionTags: string[],
    userTopics: string[]
  ): number {
    // Find tags that are NOT in user's current topics
    const newConcepts = questionTags.filter(
      (tag) =>
        !userTopics.some((topic) =>
          topic.toLowerCase().includes(tag.toLowerCase())
        )
    ).length;

    // Bonus for introducing new concepts
    const diversityScore = Math.min(newConcepts / 3, 1.0);
    return diversityScore;
  }

  /**
   * Get personalized learning path
   * Recommends a sequence of questions for optimal learning
   */
  async getLearningPath(
    userId: string,
    platform: string,
    targetDifficulty: string,
    numberOfQuestions: number = 10
  ): Promise<QuestionScore[]> {
    try {
      // Get user's current stats
      const userProblems = await prisma.problem.findMany({
        where: { userId },
        select: {
          difficulty: true,
          topics: true,
          status: true,
          lastAttemptDate: true,
        },
      });

      // Calculate user's average difficulty
      const avgDifficulty = this.calculateAverageDifficulty(userProblems);

      // Get available questions
      const availableQuestions = await this.getAvailableQuestions(
        platform,
        targetDifficulty
      );

      // Select optimal questions
      const criteria: SelectionCriteria = {
        userId,
        currentDifficulty: avgDifficulty,
        topics: this.extractTopics(userProblems),
        missingConcepts: await this.identifyMissingConcepts(userId),
        platform,
        learningStyle: 'progressive',
      };

      return this.selectOptimalQuestions(criteria, availableQuestions);
    } catch (error) {
      console.error('Error generating learning path:', error);
      return [];
    }
  }

  /**
   * Helper: Calculate average difficulty from user's problems
   */
  private calculateAverageDifficulty(problems: any[]): string {
    if (problems.length === 0) return 'Medium';

    const difficultyMap: { [key: string]: number } = {
      'Easy': 1,
      'Medium': 2,
      'Hard': 3,
    };

    const avg =
      problems.reduce((sum, p) => sum + (difficultyMap[p.difficulty] || 2), 0) /
      problems.length;

    if (avg < 1.5) return 'Easy';
    if (avg < 2.5) return 'Medium';
    return 'Hard';
  }

  /**
   * Helper: Extract unique topics from problems
   */
  private extractTopics(problems: any[]): string[] {
    const topics = new Set<string>();
    problems.forEach((p) => {
      if (p.topics && Array.isArray(p.topics)) {
        p.topics.forEach((t: string) => topics.add(t));
      }
    });
    return Array.from(topics);
  }

  /**
   * Helper: Identify concepts user hasn't mastered
   */
  private async identifyMissingConcepts(userId: string): Promise<string[]> {
    try {
      const weakConcepts = await prisma.problem.findMany({
        where: {
          userId,
          status: { not: 'solved' },
        },
        select: { topics: true },
        take: 5,
      });

      const concepts = new Set<string>();
      weakConcepts.forEach((p) => {
        if (p.topics && Array.isArray(p.topics)) {
          p.topics.forEach((t: string) => concepts.add(t));
        }
      });

      return Array.from(concepts);
    } catch (error) {
      console.error('Error identifying missing concepts:', error);
      return [];
    }
  }

  /**
   * Helper: Get available questions from platform
   */
  private async getAvailableQuestions(
    platform: string,
    difficulty: string
  ): Promise<any[]> {
    try {
      return await prisma.problem.findMany({
        where: {
          platform,
          difficulty,
        },
        take: 50,
      });
    } catch (error) {
      console.error('Error fetching available questions:', error);
      return [];
    }
  }

  /**
   * Get next difficulty levels for AtCoder progression
   * Returns the natural next steps in the learning path
   */
  getNextAtCoderLevels(currentLevel: string): string[] {
    return this.atcoderProgressionMap[currentLevel]?.next || [];
  }

  /**
   * Get difficulty level for a concept in AtCoder
   * Helps recommend problems based on concept difficulty
   */
  getConceptDifficultyLevels(concept: string): { letters: string[]; contests: string[] } | null {
    return this.conceptDifficultyMap[concept] || null;
  }

  /**
   * Check if a problem is in the natural progression path
   * Used to validate if a recommendation makes sense
   */
  isInProgressionPath(currentLevel: string, targetLevel: string, maxSteps: number = 3): boolean {
    const visited = new Set<string>();
    const queue: Array<{ level: string; steps: number }> = [{ level: currentLevel, steps: 0 }];

    while (queue.length > 0) {
      const { level, steps } = queue.shift()!;

      if (level === targetLevel) return true;
      if (steps >= maxSteps || visited.has(level)) continue;

      visited.add(level);
      const nextLevels = this.atcoderProgressionMap[level]?.next || [];
      nextLevels.forEach(next => {
        queue.push({ level: next, steps: steps + 1 });
      });
    }

    return false;
  }
}

export const advancedQuestionSelector = new AdvancedQuestionSelector();

