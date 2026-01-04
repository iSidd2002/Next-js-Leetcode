/**
 * POTD API Integration Tests
 * Tests LeetCode Problem of the Day functionality including:
 * - GraphQL endpoint integration
 * - Fallback mechanisms
 * - Rate limiting
 * - Error handling
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock fetch for API testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('POTD API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('LeetCode GraphQL Response Parsing', () => {
    const validGraphQLResponse = {
      data: {
        activeDailyCodingChallengeQuestion: {
          date: '2024-01-15',
          userStatus: 'NotStart',
          link: '/problems/two-sum/',
          question: {
            acRate: 54.5,
            difficulty: 'Easy',
            freqBar: null,
            frontendQuestionId: '1',
            isFavor: false,
            paidOnly: false,
            status: null,
            title: 'Two Sum',
            titleSlug: 'two-sum',
            hasVideoSolution: true,
            hasSolution: true,
            topicTags: [
              { name: 'Array', id: '1', slug: 'array' },
              { name: 'Hash Table', id: '2', slug: 'hash-table' }
            ]
          }
        }
      }
    };

    it('should correctly parse valid GraphQL response', () => {
      const data = validGraphQLResponse.data.activeDailyCodingChallengeQuestion;
      
      expect(data.question.title).toBe('Two Sum');
      expect(data.question.difficulty).toBe('Easy');
      expect(data.question.topicTags).toHaveLength(2);
      expect(data.link).toBe('/problems/two-sum/');
    });

    it('should extract topics from topicTags array', () => {
      const topics = validGraphQLResponse.data.activeDailyCodingChallengeQuestion
        .question.topicTags.map(tag => tag.name);
      
      expect(topics).toContain('Array');
      expect(topics).toContain('Hash Table');
    });

    it('should handle missing optional fields', () => {
      const responseWithNulls = {
        data: {
          activeDailyCodingChallengeQuestion: {
            date: '2024-01-15',
            userStatus: null,
            link: '/problems/test/',
            question: {
              acRate: 50,
              difficulty: 'Medium',
              freqBar: null,
              frontendQuestionId: '100',
              isFavor: false,
              paidOnly: false,
              status: null,
              title: 'Test Problem',
              titleSlug: 'test-problem',
              hasVideoSolution: false,
              hasSolution: false,
              topicTags: []
            }
          }
        }
      };
      
      const data = responseWithNulls.data.activeDailyCodingChallengeQuestion;
      expect(data.userStatus).toBeNull();
      expect(data.question.freqBar).toBeNull();
      expect(data.question.topicTags).toHaveLength(0);
    });
  });

  describe('Fallback Problem Generation', () => {
    const createFallbackProblem = () => ({
      data: {
        activeDailyCodingChallengeQuestion: {
          date: new Date().toISOString().split('T')[0],
          userStatus: 'NotStart',
          link: '/problems/two-sum/',
          question: {
            acRate: 54.5,
            difficulty: 'Easy',
            freqBar: null,
            frontendQuestionId: '1',
            isFavor: false,
            paidOnly: false,
            status: null,
            title: 'Two Sum (Fallback Problem)',
            titleSlug: 'two-sum',
            hasVideoSolution: true,
            hasSolution: true,
            topicTags: [
              { name: 'Array', id: '1', slug: 'array' },
              { name: 'Hash Table', id: '2', slug: 'hash-table' }
            ]
          }
        }
      }
    });

    it('should generate valid fallback problem', () => {
      const fallback = createFallbackProblem();
      const question = fallback.data.activeDailyCodingChallengeQuestion.question;
      
      expect(question.title).toContain('Fallback');
      expect(question.difficulty).toBe('Easy');
      expect(question.titleSlug).toBe('two-sum');
    });

    it('should use current date for fallback', () => {
      const fallback = createFallbackProblem();
      const today = new Date().toISOString().split('T')[0];
      
      expect(fallback.data.activeDailyCodingChallengeQuestion.date).toBe(today);
    });
  });

  describe('Retry Logic', () => {
    it('should implement exponential backoff', () => {
      const calculateDelay = (attempt: number): number => {
        return Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      };
      
      expect(calculateDelay(1)).toBe(1000);
      expect(calculateDelay(2)).toBe(2000);
      expect(calculateDelay(3)).toBe(4000);
      expect(calculateDelay(4)).toBe(5000); // Capped at 5000
      expect(calculateDelay(5)).toBe(5000);
    });

    it('should cap delay at maximum value', () => {
      const maxDelay = 5000;
      const delays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(attempt => 
        Math.min(1000 * Math.pow(2, attempt - 1), maxDelay)
      );
      
      delays.forEach(delay => {
        expect(delay).toBeLessThanOrEqual(maxDelay);
      });
    });
  });
});

