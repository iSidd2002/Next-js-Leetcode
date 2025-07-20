import type { Problem } from '@/types';

/**
 * Clean up invalid dates in problems data
 * This function fixes any problems that have invalid nextReviewDate values
 */
export function cleanupInvalidDates(problems: Problem[]): Problem[] {
  return problems.map(problem => {
    // If nextReviewDate is null or undefined, that's valid
    if (!problem.nextReviewDate) {
      return problem;
    }

    // Check if the date is valid
    const date = new Date(problem.nextReviewDate);
    if (isNaN(date.getTime())) {
      console.warn(`Fixing invalid nextReviewDate for problem ${problem.id}: "${problem.nextReviewDate}"`);
      
      // Reset the review data for this problem
      return {
        ...problem,
        nextReviewDate: null,
        isReview: false,
        repetition: 0,
        interval: 0
      };
    }

    return problem;
  });
}

/**
 * Validate and fix a single date string
 */
export function validateAndFixDate(dateString: string | null): string | null {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date detected: "${dateString}"`);
      return null;
    }
    
    // Return the date as ISO string to ensure consistency
    return date.toISOString();
  } catch (error) {
    console.warn(`Error parsing date "${dateString}":`, error);
    return null;
  }
}

/**
 * Check if a date string is valid
 */
export function isValidDateString(dateString: string | null): boolean {
  if (!dateString) return true; // null is considered valid

  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Format a date string for display
 */
export function formatDate(dateString: string | Date | null): string {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    // Format as MM/DD/YYYY
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Invalid Date';
  }
}
