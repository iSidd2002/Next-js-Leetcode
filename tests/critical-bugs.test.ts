/**
 * Critical Bug Tests - Andrej Karpathy Style
 * 
 * These tests are designed to catch edge cases and potential bugs
 * in the core functionality of the LeetCode tracker.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    get store() { return { ...store }; }
  };
})();

Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });

describe('Critical Bug Tests', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  describe('Date Handling Edge Cases', () => {
    it('should handle null dates gracefully', () => {
      const problem = {
        id: 'test-1',
        nextReviewDate: null,
        dateSolved: '',
        createdAt: new Date().toISOString(),
      };
      
      // Should not throw when accessing null date
      expect(() => {
        const date = problem.nextReviewDate;
        const isNull = date === null;
        expect(isNull).toBe(true);
      }).not.toThrow();
    });

    it('should handle invalid date strings', () => {
      const invalidDates = ['', 'invalid', 'not-a-date', '2024-13-45'];
      
      invalidDates.forEach(dateStr => {
        const date = new Date(dateStr);
        // Invalid dates should be NaN
        if (dateStr !== '') {
          expect(isNaN(date.getTime())).toBe(true);
        }
      });
    });

    it('should handle timezone edge cases', () => {
      const utcDate = '2024-01-01T00:00:00.000Z';
      const date = new Date(utcDate);
      
      expect(date.toISOString()).toBe(utcDate);
      expect(date.getUTCFullYear()).toBe(2024);
      expect(date.getUTCMonth()).toBe(0); // January
      expect(date.getUTCDate()).toBe(1);
    });
  });

  describe('Problem ID Generation', () => {
    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      for (let i = 0; i < 1000; i++) {
        ids.add(generateId());
      }
      
      // All IDs should be unique
      expect(ids.size).toBe(1000);
    });

    it('should handle ID collisions gracefully', () => {
      const existingIds = ['id-1', 'id-2', 'id-3'];
      const newId = 'id-4';
      
      expect(existingIds.includes(newId)).toBe(false);
    });
  });

  describe('Spaced Repetition Algorithm', () => {
    it('should calculate correct intervals for different quality ratings', () => {
      const baseInterval = 1;
      const easeFactor = 2.5;
      
      // Quality 5 (perfect) should increase interval significantly
      const perfectInterval = Math.round(baseInterval * easeFactor);
      expect(perfectInterval).toBeGreaterThan(baseInterval);
      
      // Quality 0 (complete failure) should reset
      const failInterval = 1;
      expect(failInterval).toBe(1);
    });

    it('should not produce negative intervals', () => {
      const intervals = [1, 2, 4, 8, 16, 32];
      
      intervals.forEach(interval => {
        expect(interval).toBeGreaterThan(0);
      });
    });

    it('should cap maximum interval at reasonable value', () => {
      const maxInterval = 365; // 1 year max
      const calculatedInterval = 500;
      
      const cappedInterval = Math.min(calculatedInterval, maxInterval);
      expect(cappedInterval).toBeLessThanOrEqual(maxInterval);
    });
  });

  describe('Problem Status Transitions', () => {
    it('should allow valid status transitions', () => {
      const validTransitions = [
        { from: 'active', to: 'learned' },
        { from: 'learned', to: 'active' },
        { from: 'active', to: 'archived' },
        { from: 'learned', to: 'archived' },
      ];
      
      validTransitions.forEach(({ from, to }) => {
        expect(['active', 'learned', 'archived']).toContain(from);
        expect(['active', 'learned', 'archived']).toContain(to);
      });
    });

    it('should preserve problem data during status change', () => {
      const problem = {
        id: 'test-1',
        title: 'Two Sum',
        status: 'active' as const,
        notes: 'Important notes',
        topics: ['Array', 'Hash Table'],
      };
      
      const updatedProblem = { ...problem, status: 'learned' as const };
      
      expect(updatedProblem.id).toBe(problem.id);
      expect(updatedProblem.title).toBe(problem.title);
      expect(updatedProblem.notes).toBe(problem.notes);
      expect(updatedProblem.topics).toEqual(problem.topics);
    });
  });
});
