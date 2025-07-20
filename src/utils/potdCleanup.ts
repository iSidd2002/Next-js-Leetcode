import type { Problem } from '@/types';

/**
 * POTD (Problem of the Day) Cleanup Utilities
 * Handles automatic cleanup of old POTD problems to prevent accumulation
 */

// Configuration
const POTD_RETENTION_DAYS = 7; // Keep POTD problems for 7 days
const CLEANUP_LOG_PREFIX = '🧹 POTD Cleanup:';

/**
 * Check if a POTD problem is expired (older than retention period)
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
 */
export function cleanupExpiredPotdProblems(problems: Problem[]): {
  cleanedProblems: Problem[];
  removedCount: number;
  removedProblems: Problem[];
} {
  const cleanedProblems: Problem[] = [];
  const removedProblems: Problem[] = [];

  for (const problem of problems) {
    if (isPotdExpired(problem)) {
      removedProblems.push(problem);
      console.log(`${CLEANUP_LOG_PREFIX} Removing expired POTD: "${problem.title}" (${problem.dateSolved})`);
    } else {
      cleanedProblems.push(problem);
    }
  }

  const removedCount = removedProblems.length;

  if (removedCount > 0) {
    console.log(`${CLEANUP_LOG_PREFIX} Removed ${removedCount} expired POTD problems`);
  } else {
    console.log(`${CLEANUP_LOG_PREFIX} No expired POTD problems found`);
  }

  return {
    cleanedProblems,
    removedCount,
    removedProblems
  };
}

/**
 * Get statistics about POTD problems
 */
export function getPotdStatistics(problems: Problem[]): {
  total: number;
  active: number;
  expired: number;
  oldestDate: string | null;
  newestDate: string | null;
} {
  const potdProblems = problems.filter(p => p.source === 'potd');
  
  if (potdProblems.length === 0) {
    return {
      total: 0,
      active: 0,
      expired: 0,
      oldestDate: null,
      newestDate: null
    };
  }

  const active = potdProblems.filter(p => !isPotdExpired(p)).length;
  const expired = potdProblems.filter(p => isPotdExpired(p)).length;

  // Find oldest and newest dates
  const dates = potdProblems.map(p => new Date(p.dateSolved || p.createdAt));
  const oldestDate = new Date(Math.min(...dates.map(d => d.getTime()))).toISOString().split('T')[0];
  const newestDate = new Date(Math.max(...dates.map(d => d.getTime()))).toISOString().split('T')[0];

  return {
    total: potdProblems.length,
    active,
    expired,
    oldestDate,
    newestDate
  };
}

/**
 * Check if cleanup is needed (has expired POTD problems)
 */
export function isCleanupNeeded(problems: Problem[]): boolean {
  return problems.some(p => isPotdExpired(p));
}

/**
 * Get a summary message for cleanup results
 */
export function getCleanupSummary(removedCount: number, removedProblems: Problem[]): string {
  if (removedCount === 0) {
    return 'No expired POTD problems found. All POTD problems are current.';
  }

  const titles = removedProblems.slice(0, 3).map(p => `"${p.title}"`).join(', ');
  const moreText = removedCount > 3 ? ` and ${removedCount - 3} more` : '';
  
  return `Removed ${removedCount} expired POTD problem${removedCount === 1 ? '' : 's'}: ${titles}${moreText}`;
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
