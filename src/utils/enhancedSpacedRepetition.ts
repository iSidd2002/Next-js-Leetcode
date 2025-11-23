import type { Problem } from '@/types';

/**
 * Enhanced Spaced Repetition System with Review History Tracking
 * Extends the base SM-2 algorithm with quality tracking and history
 */

export interface ReviewEntry {
  date: string;
  quality: number; // 1-5
  timeTaken?: number; // minutes
  notes?: string;
  tags?: string[];
  nextReviewDate: string;
  interval: number;
}

export interface EnhancedSpacedRepetitionData {
  repetition: number;
  interval: number;
  nextReviewDate: string | null;
  isReview: boolean;
  reviewHistory?: ReviewEntry[];
  averageQuality?: number;
  lastReviewQuality?: number;
}

// Interval presets
export const INTERVAL_PRESETS = {
  aggressive: [1, 2, 4, 7, 14, 21, 30, 60],
  balanced: [1, 3, 7, 14, 30, 60, 90, 180],
  relaxed: [2, 5, 10, 20, 40, 80, 120, 240]
};

/**
 * Calculate next review with quality-based adjustment
 */
export function calculateNextReviewEnhanced(
  problem: Problem,
  quality: number,
  customIntervals: number[],
  timeTaken?: number,
  notes?: string,
  tags?: string[]
): EnhancedSpacedRepetitionData {
  const { repetition = 0, interval = 0 } = problem;
  
  let newRepetition = repetition;
  let newInterval = interval;
  
  // Quality-based progression
  if (quality >= 3) {
    // Successful recall
    newRepetition = repetition + 1;
    
    if (newRepetition < customIntervals.length) {
      newInterval = customIntervals[newRepetition];
    } else {
      // Exponential growth with quality multiplier
      const qualityMultiplier = quality / 3; // 1.0 to 1.67x
      newInterval = Math.round(interval * 2.5 * qualityMultiplier);
    }
    
    // Bonus for perfect recall
    if (quality === 5) {
      newInterval = Math.round(newInterval * 1.2);
    }
  } else {
    // Failed recall
    if (quality === 1) {
      // Complete reset
      newRepetition = 0;
      newInterval = customIntervals[0] || 1;
    } else {
      // Partial reset (quality 2)
      newRepetition = Math.max(0, Math.floor(repetition * 0.5));
      newInterval = customIntervals[newRepetition] || customIntervals[0] || 1;
    }
  }
  
  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  
  // Create review entry
  const reviewEntry: ReviewEntry = {
    date: new Date().toISOString(),
    quality,
    timeTaken,
    notes,
    tags,
    nextReviewDate: nextReviewDate.toISOString(),
    interval: newInterval
  };
  
  // Get existing review history
  const reviewHistory = (problem as any).reviewHistory || [];
  const updatedHistory = [...reviewHistory, reviewEntry];
  
  // Calculate average quality
  const totalQuality = updatedHistory.reduce((sum, entry) => sum + entry.quality, 0);
  const averageQuality = totalQuality / updatedHistory.length;
  
  return {
    repetition: newRepetition,
    interval: newInterval,
    nextReviewDate: nextReviewDate.toISOString(),
    isReview: true,
    reviewHistory: updatedHistory,
    averageQuality: Math.round(averageQuality * 10) / 10,
    lastReviewQuality: quality
  };
}

/**
 * Get review performance analytics
 */
export function getReviewAnalytics(reviewHistory: ReviewEntry[]) {
  if (!reviewHistory || reviewHistory.length === 0) {
    return {
      totalReviews: 0,
      averageQuality: 0,
      successRate: 0,
      averageTime: 0,
      streak: 0,
      improvement: 0,
      commonTags: []
    };
  }
  
  const totalReviews = reviewHistory.length;
  const totalQuality = reviewHistory.reduce((sum, entry) => sum + entry.quality, 0);
  const averageQuality = totalQuality / totalReviews;
  
  // Success rate (quality >= 3)
  const successfulReviews = reviewHistory.filter(entry => entry.quality >= 3).length;
  const successRate = (successfulReviews / totalReviews) * 100;
  
  // Average time
  const reviewsWithTime = reviewHistory.filter(entry => entry.timeTaken);
  const averageTime = reviewsWithTime.length > 0
    ? reviewsWithTime.reduce((sum, entry) => sum + (entry.timeTaken || 0), 0) / reviewsWithTime.length
    : 0;
  
  // Current streak (consecutive quality >= 3)
  let streak = 0;
  for (let i = reviewHistory.length - 1; i >= 0; i--) {
    if (reviewHistory[i].quality >= 3) {
      streak++;
    } else {
      break;
    }
  }
  
  // Improvement trend (last 3 vs first 3)
  let improvement = 0;
  if (totalReviews >= 6) {
    const firstThree = reviewHistory.slice(0, 3);
    const lastThree = reviewHistory.slice(-3);
    const firstAvg = firstThree.reduce((sum, e) => sum + e.quality, 0) / 3;
    const lastAvg = lastThree.reduce((sum, e) => sum + e.quality, 0) / 3;
    improvement = ((lastAvg - firstAvg) / firstAvg) * 100;
  }
  
  // Common tags
  const tagCounts: Record<string, number> = {};
  reviewHistory.forEach(entry => {
    entry.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const commonTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);
  
  return {
    totalReviews,
    averageQuality: Math.round(averageQuality * 10) / 10,
    successRate: Math.round(successRate * 10) / 10,
    averageTime: Math.round(averageTime),
    streak,
    improvement: Math.round(improvement),
    commonTags
  };
}

/**
 * Get personalized review recommendations
 */
export function getReviewRecommendation(
  problem: Problem & { reviewHistory?: ReviewEntry[] }
): {
  shouldReview: boolean;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  tips: string[];
} {
  const analytics = getReviewAnalytics(problem.reviewHistory || []);
  
  // Check if due
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reviewDate = problem.nextReviewDate ? new Date(problem.nextReviewDate) : null;
  
  if (!reviewDate) {
    return {
      shouldReview: false,
      priority: 'low',
      reason: 'Not scheduled for review',
      tips: []
    };
  }
  
  reviewDate.setHours(0, 0, 0, 0);
  const daysOverdue = Math.floor((today.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let priority: 'high' | 'medium' | 'low' = 'low';
  let reason = '';
  const tips: string[] = [];
  
  if (daysOverdue > 3) {
    priority = 'high';
    reason = `Overdue by ${daysOverdue} days!`;
    tips.push('Review as soon as possible to maintain retention');
  } else if (daysOverdue >= 0) {
    priority = 'high';
    reason = 'Due today';
    tips.push('Perfect timing for optimal retention');
  } else if (daysOverdue >= -2) {
    priority = 'medium';
    reason = `Due in ${Math.abs(daysOverdue)} days`;
    tips.push('Can review early if you have time');
  } else {
    priority = 'low';
    reason = `Not due yet (${Math.abs(daysOverdue)} days)`;
  }
  
  // Add tips based on history
  if (analytics.averageQuality < 3) {
    tips.push('Focus on understanding core concepts');
    tips.push('Consider breaking down the problem into smaller steps');
  } else if (analytics.averageQuality >= 4) {
    tips.push('You\'re doing great! Keep up the momentum');
  }
  
  if (analytics.streak === 0) {
    tips.push('Start a new success streak today!');
  } else if (analytics.streak >= 3) {
    tips.push(`Amazing ${analytics.streak}-review streak! 🔥`);
  }
  
  if (analytics.improvement < 0) {
    tips.push('Review your notes from previous attempts');
  }
  
  return {
    shouldReview: daysOverdue >= 0,
    priority,
    reason,
    tips: tips.slice(0, 3) // Max 3 tips
  };
}

/**
 * Export review history for analysis
 */
export function exportReviewHistory(problems: (Problem & { reviewHistory?: ReviewEntry[] })[]) {
  const data = problems
    .filter(p => p.reviewHistory && p.reviewHistory.length > 0)
    .map(p => ({
      problemTitle: p.title,
      difficulty: p.difficulty,
      platform: p.platform,
      totalReviews: p.reviewHistory?.length || 0,
      reviews: p.reviewHistory,
      analytics: getReviewAnalytics(p.reviewHistory || [])
    }));
  
  return data;
}

