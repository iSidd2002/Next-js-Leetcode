import type { Problem } from '@/types';

/**
 * Spaced Repetition System for LeetCode Problem Review
 * Based on the SM-2 algorithm with modifications for coding problems
 */

export interface SpacedRepetitionData {
  repetition: number;
  interval: number;
  nextReviewDate: string | null;
  isReview: boolean;
}

// Default review intervals (in days)
const DEFAULT_INTERVALS = [1, 3, 7, 14, 30, 90, 180, 365];

/**
 * Calculate the next review date based on spaced repetition algorithm
 * @param problem - The problem to calculate next review for
 * @param quality - Quality of recall (0-5, where 3+ is considered successful)
 * @param customIntervals - Custom intervals to use instead of defaults
 * @returns Updated spaced repetition data
 */
export function calculateNextReview(
  problem: Problem,
  quality: number = 4,
  customIntervals: number[] = DEFAULT_INTERVALS
): SpacedRepetitionData {
  const { repetition = 0, interval = 0 } = problem;
  
  let newRepetition = repetition;
  let newInterval = interval;
  
  if (quality >= 3) {
    // Successful recall
    newRepetition = repetition + 1;
    
    if (newRepetition < customIntervals.length) {
      newInterval = customIntervals[newRepetition];
    } else {
      // Use exponential growth after exhausting predefined intervals
      newInterval = Math.round(interval * 2.5);
    }
  } else {
    // Failed recall - reset to beginning but keep some progress
    newRepetition = Math.max(0, repetition - 1);
    newInterval = customIntervals[0] || 1;
  }
  
  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  // Ensure the date is valid
  if (isNaN(nextReviewDate.getTime())) {
    console.error('Invalid date calculated in spaced repetition:', nextReviewDate);
    throw new Error('Invalid date calculated in spaced repetition');
  }

  return {
    repetition: newRepetition,
    interval: newInterval,
    nextReviewDate: nextReviewDate.toISOString(),
    isReview: true
  };
}

/**
 * Mark a problem as reviewed with a quality rating
 * @param problem - The problem that was reviewed
 * @param quality - Quality of recall (0-5)
 * @param customIntervals - Custom intervals to use
 * @returns Updated problem with new spaced repetition data
 */
export function markAsReviewed(
  problem: Problem,
  quality: number = 4,
  customIntervals?: number[]
): Problem {
  const spacedRepetitionData = calculateNextReview(problem, quality, customIntervals);
  
  return {
    ...problem,
    ...spacedRepetitionData,
    dateSolved: new Date().toISOString() // Update last solved date
  };
}

/**
 * Get problems that are due for review
 * @param problems - Array of all problems
 * @returns Array of problems due for review
 */
export function getProblemsForReview(problems: Problem[]): Problem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of day
  
  return problems.filter(problem => {
    if (!problem.isReview || !problem.nextReviewDate) {
      return false;
    }
    
    const reviewDate = new Date(problem.nextReviewDate);
    reviewDate.setHours(0, 0, 0, 0); // Start of day
    
    return reviewDate <= today;
  });
}

/**
 * Initialize spaced repetition for a new problem
 * @param problem - The problem to initialize
 * @param startReview - Whether to start the review cycle immediately
 * @returns Problem with initialized spaced repetition data
 */
export function initializeSpacedRepetition(
  problem: Problem,
  startReview: boolean = false
): Problem {
  if (!startReview) {
    return {
      ...problem,
      repetition: 0,
      interval: 0,
      nextReviewDate: null,
      isReview: false
    };
  }
  
  // Start review cycle with first interval
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + DEFAULT_INTERVALS[0]);

  // Ensure the date is valid
  if (isNaN(nextReviewDate.getTime())) {
    console.error('Invalid date calculated in spaced repetition initialization:', nextReviewDate);
    throw new Error('Invalid date calculated in spaced repetition initialization');
  }

  return {
    ...problem,
    repetition: 0,
    interval: DEFAULT_INTERVALS[0],
    nextReviewDate: nextReviewDate.toISOString(),
    isReview: true
  };
}

/**
 * Get review statistics for a user
 * @param problems - Array of all problems
 * @returns Review statistics
 */
export function getReviewStats(problems: Problem[]) {
  const reviewProblems = problems.filter(p => p.isReview);
  const dueProblems = getProblemsForReview(problems);
  
  const totalReviews = reviewProblems.length;
  const dueReviews = dueProblems.length;
  const completedReviews = reviewProblems.filter(p => p.repetition > 0).length;
  
  // Calculate average interval for active review problems
  const activeReviews = reviewProblems.filter(p => p.interval > 0);
  const averageInterval = activeReviews.length > 0
    ? activeReviews.reduce((sum, p) => sum + p.interval, 0) / activeReviews.length
    : 0;
  
  // Calculate retention rate (problems with repetition >= 3)
  const retainedProblems = reviewProblems.filter(p => p.repetition >= 3).length;
  const retentionRate = totalReviews > 0 ? (retainedProblems / totalReviews) * 100 : 0;
  
  return {
    totalReviews,
    dueReviews,
    completedReviews,
    averageInterval: Math.round(averageInterval),
    retentionRate: Math.round(retentionRate * 100) / 100
  };
}

/**
 * Get the next few problems to review (sorted by priority)
 * @param problems - Array of all problems
 * @param limit - Maximum number of problems to return
 * @returns Array of problems sorted by review priority
 */
export function getNextReviewProblems(problems: Problem[], limit: number = 10): Problem[] {
  const dueProblems = getProblemsForReview(problems);
  
  // Sort by review date (oldest first) and then by repetition (lower first)
  return dueProblems
    .sort((a, b) => {
      const dateA = new Date(a.nextReviewDate!).getTime();
      const dateB = new Date(b.nextReviewDate!).getTime();
      
      if (dateA !== dateB) {
        return dateA - dateB;
      }
      
      // If dates are the same, prioritize problems with lower repetition
      return a.repetition - b.repetition;
    })
    .slice(0, limit);
}

/**
 * Mark a problem as mastered (no longer needs review)
 * @param problem - The problem to mark as mastered
 * @returns Updated problem marked as learned
 */
export function markAsMastered(problem: Problem): Problem {
  return {
    ...problem,
    status: 'learned',
    isReview: false,
    nextReviewDate: null
  };
}

/**
 * Reset spaced repetition for a problem (start over)
 * @param problem - The problem to reset
 * @returns Problem with reset spaced repetition data
 */
export function resetSpacedRepetition(problem: Problem): Problem {
  return initializeSpacedRepetition(problem, true);
}
