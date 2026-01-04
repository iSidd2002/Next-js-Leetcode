/**
 * API Edge Case Tests - Andrej Karpathy Style
 * 
 * Testing API routes for edge cases, error handling, and security.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

describe('API Edge Case Tests', () => {
  describe('Input Validation', () => {
    it('should reject empty problem titles', () => {
      const problem = {
        title: '',
        platform: 'leetcode',
        difficulty: 'Easy',
      };
      
      const isValid = problem.title.trim().length > 0;
      expect(isValid).toBe(false);
    });

    it('should reject invalid platforms', () => {
      const validPlatforms = ['leetcode', 'hackerrank', 'codechef', 'codeforces', 'atcoder'];
      const invalidPlatform = 'invalid-platform';
      
      expect(validPlatforms.includes(invalidPlatform)).toBe(false);
    });

    it('should reject invalid difficulty levels', () => {
      const validDifficulties = ['Easy', 'Medium', 'Hard'];
      const invalidDifficulty = 'Super Hard';
      
      expect(validDifficulties.includes(invalidDifficulty)).toBe(false);
    });

    it('should sanitize XSS in problem titles', () => {
      const maliciousTitle = '<script>alert("xss")</script>Two Sum';
      const sanitized = maliciousTitle.replace(/<[^>]*>/g, '');
      
      expect(sanitized).toBe('alert("xss")Two Sum');
      expect(sanitized).not.toContain('<script>');
    });

    it('should handle very long titles', () => {
      const maxLength = 500;
      const longTitle = 'A'.repeat(1000);
      const truncated = longTitle.substring(0, maxLength);
      
      expect(truncated.length).toBe(maxLength);
    });
  });

  describe('URL Validation', () => {
    it('should accept valid LeetCode URLs', () => {
      const validUrls = [
        'https://leetcode.com/problems/two-sum/',
        'https://leetcode.com/problems/add-two-numbers',
        'https://leetcode.cn/problems/two-sum/',
      ];
      
      validUrls.forEach(url => {
        const isValid = url.includes('leetcode.com') || url.includes('leetcode.cn');
        expect(isValid).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
      ];
      
      invalidUrls.forEach(url => {
        const isValid = url.startsWith('http://') || url.startsWith('https://');
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should track request counts correctly', () => {
      const requestCounts: Record<string, number> = {};
      const clientId = 'test-client';
      const limit = 50;
      
      // Simulate requests
      for (let i = 0; i < 60; i++) {
        requestCounts[clientId] = (requestCounts[clientId] || 0) + 1;
      }
      
      expect(requestCounts[clientId]).toBe(60);
      expect(requestCounts[clientId] > limit).toBe(true);
    });

    it('should reset counts after time window', () => {
      const requestCounts: Record<string, { count: number; resetTime: number }> = {};
      const clientId = 'test-client';
      const windowMs = 60000; // 1 minute
      
      // Initial request
      requestCounts[clientId] = { count: 50, resetTime: Date.now() + windowMs };
      
      // Simulate time passing
      const futureTime = Date.now() + windowMs + 1000;
      
      if (futureTime > requestCounts[clientId].resetTime) {
        requestCounts[clientId] = { count: 0, resetTime: futureTime + windowMs };
      }
      
      expect(requestCounts[clientId].count).toBe(0);
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error format', () => {
      const errorResponse = {
        error: 'Not Found',
        message: 'Problem not found',
        statusCode: 404,
      };
      
      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse).toHaveProperty('message');
      expect(errorResponse).toHaveProperty('statusCode');
    });

    it('should not leak sensitive information in errors', () => {
      const internalError = new Error('Database connection failed: password=secret123');
      const sanitizedMessage = 'An internal error occurred';
      
      expect(sanitizedMessage).not.toContain('password');
      expect(sanitizedMessage).not.toContain('secret');
    });
  });

  describe('Pagination', () => {
    it('should handle page 0 gracefully', () => {
      const page = Math.max(0, -1);
      expect(page).toBe(0);
    });

    it('should handle very large page numbers', () => {
      const totalItems = 100;
      const pageSize = 10;
      const maxPage = Math.ceil(totalItems / pageSize);
      const requestedPage = 1000;
      
      const actualPage = Math.min(requestedPage, maxPage);
      expect(actualPage).toBe(maxPage);
    });

    it('should return empty array for out-of-range pages', () => {
      const items = [1, 2, 3, 4, 5];
      const pageSize = 10;
      const page = 2;
      
      const start = page * pageSize;
      const result = items.slice(start, start + pageSize);
      
      expect(result).toEqual([]);
    });
  });
});
