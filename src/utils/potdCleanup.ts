import type { Problem } from '@/types';

/**
 * POTD (Problem of the Day) Cleanup Utilities
 * Handles automatic cleanup of old POTD problems to prevent accumulation
 * 
 * 🔒 SMART PRESERVATION: Problems are kept FOREVER if user has:
 *   - Marked for review (isReview = true)
 *   - Added custom notes
 *   - Started spaced repetition (repetition > 0)
 *   - Manually edited the problem
 * 
 * Only untouched POTD problems older than 7 days are cleaned up.
 */

// Configuration
const POTD_RETENTION_DAYS = 7; // Keep POTD problems for 7 days

/**
 * Check if a POTD problem should be preserved forever
 * Returns true if the user has interacted with the problem in any meaningful way
 */
export function shouldPreservePotdForever(problem: Problem): boolean {
  if (problem.source !== 'potd') {
    return false; // Only applies to POTD problems
  }

  // Preserve if marked for review
  if (problem.isReview) {
    return true;
  }

  // Preserve if user added notes (shows they care about it)
  if (problem.notes && problem.notes.trim().length > 0) {
    return true;
  }

  // Preserve if user has started spaced repetition
  if (problem.repetition > 0) {
    return true;
  }

  // Preserve if user has a scheduled review date
  if (problem.nextReviewDate) {
    return true;
  }

  // Preserve if user manually edited tags (non-default companies or edited topics)
  if (problem.companies && problem.companies.length > 0) {
    return true;
  }

  return false;
}

/**
 * Check if a POTD problem is expired (older than retention period)
 * This only checks the age, not whether it should be preserved
 */
export function isPotdExpired(problem: Problem): boolean {
  if (problem.source !== 'potd') {
    return false; // Only check POTD problems
  }

  const problemDate = new Date(problem.dateSolved || problem.createdAt);
  const now = new Date();
  const daysDifference = Math.floor((now.getTime() - problemDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysDifference > POTD_RETENTION_DAYS;
}

/**
 * Clean up expired POTD problems from a list
 * 
 * ⚠️ SMART CLEANUP: Only removes POTD problems that are:
 *   1. Older than 7 days AND
 *   2. User has NOT interacted with (no review, notes, or edits)
 * 
 * 🔒 PRESERVED FOREVER if user has:
 *   - Marked for review
 *   - Added notes
 *   - Started spaced repetition
 *   - Added companies/tags
 *   - Scheduled next review
 */
export function cleanupExpiredPotdProblems(problems: Problem[]): {
  cleanedProblems: Problem[];
  removedCount: number;
  removedProblems: Problem[];
  preservedCount: number;
} {
  const cleanedProblems: Problem[] = [];
  const removedProblems: Problem[] = [];
  let preservedCount = 0;

  for (const problem of problems) {
    // Check if problem should be preserved forever
    const shouldPreserve = shouldPreservePotdForever(problem);
    
    // Check if problem is expired (old)
    const isExpired = isPotdExpired(problem);

    if (isExpired && shouldPreserve) {
      // Problem is old but user has interacted with it - KEEP FOREVER
      cleanedProblems.push(problem);
      preservedCount++;
    } else if (isExpired && !shouldPreserve) {
      // Problem is old and untouched - safe to remove
      removedProblems.push(problem);
    } else {
      // Problem is not expired yet - keep it
      cleanedProblems.push(problem);
    }
  }

  const removedCount = removedProblems.length;

  return {
    cleanedProblems,
    removedCount,
    removedProblems,
    preservedCount
  };
}

/**
 * Get statistics about POTD problems
 */
export function getPotdStatistics(problems: Problem[]): {
  total: number;
  active: number;
  expired: number;
  preserved: number;
  reviewProblems: number;
  oldestDate: string | null;
  newestDate: string | null;
} {
  const potdProblems = problems.filter(p => p.source === 'potd');
  
  if (potdProblems.length === 0) {
    return {
      total: 0,
      active: 0,
      expired: 0,
      preserved: 0,
      reviewProblems: 0,
      oldestDate: null,
      newestDate: null
    };
  }

  const active = potdProblems.filter(p => !isPotdExpired(p)).length;
  const preserved = potdProblems.filter(p => isPotdExpired(p) && shouldPreservePotdForever(p)).length;
  const expired = potdProblems.filter(p => isPotdExpired(p) && !shouldPreservePotdForever(p)).length;
  const reviewProblems = potdProblems.filter(p => p.isReview).length;

  // Find oldest and newest dates
  const dates = potdProblems.map(p => new Date(p.dateSolved || p.createdAt));
  const oldestDate = new Date(Math.min(...dates.map(d => d.getTime()))).toISOString().split('T')[0];
  const newestDate = new Date(Math.max(...dates.map(d => d.getTime()))).toISOString().split('T')[0];

  return {
    total: potdProblems.length,
    active,
    expired,
    preserved,
    reviewProblems,
    oldestDate,
    newestDate
  };
}

/**
 * Check if cleanup is needed (has expired POTD problems that can be removed)
 */
export function isCleanupNeeded(problems: Problem[]): boolean {
  return problems.some(p => isPotdExpired(p) && !shouldPreservePotdForever(p));
}

/**
 * Get a summary message for cleanup results
 */
export function getCleanupSummary(
  removedCount: number, 
  removedProblems: Problem[], 
  preservedCount: number = 0
): string {
  if (removedCount === 0 && preservedCount === 0) {
    return 'No expired POTD problems found. All POTD problems are current.';
  }

  if (removedCount === 0 && preservedCount > 0) {
    return `✨ All ${preservedCount} old POTD problem${preservedCount === 1 ? '' : 's'} preserved due to user interactions (notes, reviews, or edits).`;
  }

  const titles = removedProblems.slice(0, 3).map(p => `"${p.title}"`).join(', ');
  const moreText = removedCount > 3 ? ` and ${removedCount - 3} more` : '';
  
  let summary = `🧹 Removed ${removedCount} expired POTD problem${removedCount === 1 ? '' : 's'}: ${titles}${moreText}`;
  
  if (preservedCount > 0) {
    summary += `\n✨ Preserved ${preservedCount} problem${preservedCount === 1 ? '' : 's'} with user interactions (kept forever).`;
  }
  
  return summary;
}

/**
 * Validate POTD problem data
 */
export function validatePotdProblem(problem: Problem): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (problem.source !== 'potd') {
    errors.push('Problem source must be "potd"');
  }

  if (!problem.dateSolved && !problem.createdAt) {
    errors.push('Problem must have either dateSolved or createdAt');
  }

  if (problem.dateSolved) {
    const date = new Date(problem.dateSolved);
    if (isNaN(date.getTime())) {
      errors.push('Invalid dateSolved format');
    }
  }

  if (problem.createdAt) {
    const date = new Date(problem.createdAt);
    if (isNaN(date.getTime())) {
      errors.push('Invalid createdAt format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get next cleanup date (when the oldest active POTD will expire)
 */
export function getNextCleanupDate(problems: Problem[]): Date | null {
  const activePotdProblems = problems.filter(p => p.source === 'potd' && !isPotdExpired(p));
  
  if (activePotdProblems.length === 0) {
    return null;
  }

  // Find the oldest active POTD problem
  const oldestActiveProblem = activePotdProblems.reduce((oldest, current) => {
    const oldestDate = new Date(oldest.dateSolved || oldest.createdAt);
    const currentDate = new Date(current.dateSolved || current.createdAt);
    return currentDate < oldestDate ? current : oldest;
  });

  const oldestDate = new Date(oldestActiveProblem.dateSolved || oldestActiveProblem.createdAt);
  const nextCleanupDate = new Date(oldestDate);
  nextCleanupDate.setDate(nextCleanupDate.getDate() + POTD_RETENTION_DAYS + 1);

  return nextCleanupDate;
}

export { POTD_RETENTION_DAYS };
