/**
 * Smart POTD Cleanup - Test Suite
 * Verifies that POTD problems are preserved forever when user interacts with them
 */

import { shouldPreservePotdForever, isPotdExpired, cleanupExpiredPotdProblems } from '@/utils/potdCleanup';
import type { Problem } from '@/types';

describe('Smart POTD Cleanup', () => {
  const createMockPotdProblem = (overrides: Partial<Problem> = {}): Problem => ({
    id: '1',
    platform: 'leetcode',
    title: 'Two Sum',
    problemId: 'two-sum',
    difficulty: 'Easy',
    url: 'https://leetcode.com/problems/two-sum',
    dateSolved: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    notes: '',
    isReview: false,
    repetition: 0,
    interval: 0,
    nextReviewDate: null,
    topics: ['Array', 'Hash Table'],
    status: 'active',
    companies: [],
    source: 'potd',
    ...overrides,
  });

  describe('shouldPreservePotdForever', () => {
    it('should preserve POTD with notes', () => {
      const problem = createMockPotdProblem({ notes: 'Important problem to review' });
      expect(shouldPreservePotdForever(problem)).toBe(true);
    });

    it('should preserve POTD marked for review', () => {
      const problem = createMockPotdProblem({ isReview: true });
      expect(shouldPreservePotdForever(problem)).toBe(true);
    });

    it('should preserve POTD with spaced repetition progress', () => {
      const problem = createMockPotdProblem({ repetition: 2 });
      expect(shouldPreservePotdForever(problem)).toBe(true);
    });

    it('should preserve POTD with scheduled review', () => {
      const problem = createMockPotdProblem({ 
        nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() 
      });
      expect(shouldPreservePotdForever(problem)).toBe(true);
    });

    it('should preserve POTD with company tags', () => {
      const problem = createMockPotdProblem({ companies: ['Google', 'Facebook'] });
      expect(shouldPreservePotdForever(problem)).toBe(true);
    });

    it('should NOT preserve untouched POTD', () => {
      const problem = createMockPotdProblem();
      expect(shouldPreservePotdForever(problem)).toBe(false);
    });

    it('should return false for non-POTD problems', () => {
      const problem = createMockPotdProblem({ 
        source: 'manual',
        notes: 'Has notes but not POTD' 
      });
      expect(shouldPreservePotdForever(problem)).toBe(false);
    });
  });

  describe('isPotdExpired', () => {
    it('should detect expired POTD (30 days old)', () => {
      const problem = createMockPotdProblem();
      expect(isPotdExpired(problem)).toBe(true);
    });

    it('should NOT detect recent POTD as expired (2 days old)', () => {
      const problem = createMockPotdProblem({
        dateSolved: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      });
      expect(isPotdExpired(problem)).toBe(false);
    });

    it('should return false for non-POTD problems', () => {
      const problem = createMockPotdProblem({ source: 'manual' });
      expect(isPotdExpired(problem)).toBe(false);
    });
  });

  describe('cleanupExpiredPotdProblems', () => {
    it('should remove old untouched POTD problems', () => {
      const problems = [
        createMockPotdProblem({ id: '1' }), // Old & untouched - should be removed
      ];

      const result = cleanupExpiredPotdProblems(problems);

      expect(result.removedCount).toBe(1);
      expect(result.preservedCount).toBe(0);
      expect(result.cleanedProblems).toHaveLength(0);
      expect(result.removedProblems).toHaveLength(1);
    });

    it('should preserve old POTD with notes', () => {
      const problems = [
        createMockPotdProblem({ 
          id: '1', 
          notes: 'Review this again' 
        }), // Old but has notes - should be preserved
      ];

      const result = cleanupExpiredPotdProblems(problems);

      expect(result.removedCount).toBe(0);
      expect(result.preservedCount).toBe(1);
      expect(result.cleanedProblems).toHaveLength(1);
      expect(result.removedProblems).toHaveLength(0);
    });

    it('should preserve old POTD marked for review', () => {
      const problems = [
        createMockPotdProblem({ 
          id: '1', 
          isReview: true 
        }), // Old but marked for review - should be preserved
      ];

      const result = cleanupExpiredPotdProblems(problems);

      expect(result.removedCount).toBe(0);
      expect(result.preservedCount).toBe(1);
      expect(result.cleanedProblems).toHaveLength(1);
    });

    it('should keep recent POTD problems regardless of interaction', () => {
      const problems = [
        createMockPotdProblem({ 
          id: '1', 
          dateSolved: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() 
        }), // 2 days old - should be kept (not expired yet)
      ];

      const result = cleanupExpiredPotdProblems(problems);

      expect(result.removedCount).toBe(0);
      expect(result.preservedCount).toBe(0); // Not counted as preserved, just not expired
      expect(result.cleanedProblems).toHaveLength(1);
    });

    it('should handle mixed scenario correctly', () => {
      const problems = [
        createMockPotdProblem({ 
          id: '1', 
          dateSolved: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() 
        }), // Old & untouched - REMOVE
        
        createMockPotdProblem({ 
          id: '2', 
          dateSolved: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Important' 
        }), // Old but has notes - PRESERVE
        
        createMockPotdProblem({ 
          id: '3', 
          dateSolved: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() 
        }), // Recent - KEEP
        
        createMockPotdProblem({ 
          id: '4', 
          dateSolved: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          isReview: true 
        }), // Old but marked for review - PRESERVE
      ];

      const result = cleanupExpiredPotdProblems(problems);

      expect(result.removedCount).toBe(1); // Problem 1
      expect(result.preservedCount).toBe(2); // Problems 2 & 4
      expect(result.cleanedProblems).toHaveLength(3); // Problems 2, 3, 4
      expect(result.removedProblems).toHaveLength(1); // Problem 1
    });

    it('should not affect non-POTD problems', () => {
      const problems = [
        createMockPotdProblem({ 
          id: '1', 
          source: 'manual',
          dateSolved: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() 
        }), // Old manual problem - should be kept
      ];

      const result = cleanupExpiredPotdProblems(problems);

      expect(result.removedCount).toBe(0);
      expect(result.cleanedProblems).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty problem list', () => {
      const result = cleanupExpiredPotdProblems([]);
      
      expect(result.removedCount).toBe(0);
      expect(result.preservedCount).toBe(0);
      expect(result.cleanedProblems).toHaveLength(0);
      expect(result.removedProblems).toHaveLength(0);
    });

    it('should handle POTD with whitespace-only notes as untouched', () => {
      const problem = createMockPotdProblem({ notes: '   \n  \t  ' });
      expect(shouldPreservePotdForever(problem)).toBe(false);
    });

    it('should preserve POTD with minimal notes', () => {
      const problem = createMockPotdProblem({ notes: 'x' });
      expect(shouldPreservePotdForever(problem)).toBe(true);
    });

    it('should handle POTD exactly 7 days old', () => {
      const problem = createMockPotdProblem({
        dateSolved: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      // 7 days old is NOT expired (retention is > 7 days)
      expect(isPotdExpired(problem)).toBe(false);
    });

    it('should handle POTD exactly 8 days old', () => {
      const problem = createMockPotdProblem({
        dateSolved: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      });
      // 8 days old IS expired (> 7 days)
      expect(isPotdExpired(problem)).toBe(true);
    });
  });
});

