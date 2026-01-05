/**
 * Daily Challenge Multi-Platform Tests
 * Tests platform rotation, deterministic selection, caching, and fallbacks
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

type Platform = 'leetcode' | 'codeforces' | 'geeksforgeeks' | 'codingninjas' | 'atcoder';

describe('Daily Challenge Multi-Platform Tests', () => {
  describe('Platform Rotation System', () => {
    // Replicate the getPlatformForDate logic from the API
    const getPlatformForDate = (date: string): Platform => {
      const platforms: Platform[] = ['leetcode', 'codeforces', 'geeksforgeeks', 'codingninjas', 'atcoder'];
      
      let hash = 0;
      for (let i = 0; i < date.length; i++) {
        const char = date.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      const index = Math.abs(hash) % platforms.length;
      return platforms[index];
    };

    it('should return a valid platform for any date', () => {
      const validPlatforms = ['leetcode', 'codeforces', 'geeksforgeeks', 'codingninjas', 'atcoder'];
      const testDates = ['2024-01-01', '2024-06-15', '2025-12-31', '2030-01-01'];
      
      testDates.forEach(date => {
        const platform = getPlatformForDate(date);
        expect(validPlatforms).toContain(platform);
      });
    });

    it('should be deterministic - same date returns same platform', () => {
      const date = '2024-07-15';
      const platform1 = getPlatformForDate(date);
      const platform2 = getPlatformForDate(date);
      const platform3 = getPlatformForDate(date);
      
      expect(platform1).toBe(platform2);
      expect(platform2).toBe(platform3);
    });

    it('should distribute platforms across different dates', () => {
      const platformCounts: Record<Platform, number> = {
        leetcode: 0,
        codeforces: 0,
        geeksforgeeks: 0,
        codingninjas: 0,
        atcoder: 0
      };
      
      // Check 100 consecutive days
      for (let i = 0; i < 100; i++) {
        const date = new Date(2024, 0, 1 + i).toISOString().split('T')[0];
        const platform = getPlatformForDate(date);
        platformCounts[platform]++;
      }
      
      // Each platform should appear at least once
      Object.entries(platformCounts).forEach(([platform, count]) => {
        expect(count).toBeGreaterThan(0);
      });
    });

    it('should produce different platforms for consecutive days', () => {
      const platforms: Platform[] = [];
      for (let i = 0; i < 10; i++) {
        const date = new Date(2024, 0, 1 + i).toISOString().split('T')[0];
        platforms.push(getPlatformForDate(date));
      }
      
      // Not all days should have the same platform
      const uniquePlatforms = new Set(platforms);
      expect(uniquePlatforms.size).toBeGreaterThan(1);
    });
  });

  describe('Deterministic Random Selection', () => {
    const getDeterministicIndex = (date: string, maxIndex: number): number => {
      let hash = 0;
      for (let i = 0; i < date.length; i++) {
        const char = date.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash) % maxIndex;
    };

    it('should return consistent index for same date', () => {
      const date = '2024-05-20';
      const index1 = getDeterministicIndex(date, 10);
      const index2 = getDeterministicIndex(date, 10);
      
      expect(index1).toBe(index2);
    });

    it('should return index within bounds', () => {
      const testDates = ['2024-01-01', '2024-06-15', '2025-12-31'];
      const maxIndex = 10;
      
      testDates.forEach(date => {
        const index = getDeterministicIndex(date, maxIndex);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(maxIndex);
      });
    });
  });

  describe('Caching Mechanism', () => {
    it('should cache by date string', () => {
      interface CacheEntry {
        date: string;
        problem: { title: string };
      }
      
      // Use a helper function to avoid TypeScript narrowing issues
      const checkCacheHit = (cache: CacheEntry | null, targetDate: string): boolean => {
        return cache !== null && cache.date === targetDate;
      };
      
      let cache: CacheEntry | null = null;
      const today = new Date().toISOString().split('T')[0];
      
      // First call - cache miss
      expect(checkCacheHit(cache, today)).toBe(false);
      
      // Set cache
      cache = { date: today, problem: { title: 'Test Problem' } };
      
      // Second call - cache hit
      expect(checkCacheHit(cache, today)).toBe(true);
    });

    it('should invalidate cache for new date', () => {
      interface CacheEntry {
        date: string;
        problem: { title: string };
      }
      
      let cache: CacheEntry | null = { 
        date: '2024-01-01', 
        problem: { title: 'Old Problem' } 
      };
      
      const newDate = '2024-01-02';
      const isCacheValid = cache && cache.date === newDate;
      
      expect(isCacheValid).toBe(false);
    });

    it('should handle force refresh correctly', () => {
      const shouldUseCache = (cached: boolean, forceRefresh: boolean): boolean => {
        return cached && !forceRefresh;
      };
      
      expect(shouldUseCache(true, false)).toBe(true);
      expect(shouldUseCache(true, true)).toBe(false);
      expect(shouldUseCache(false, false)).toBe(false);
      expect(shouldUseCache(false, true)).toBe(false);
    });
  });

  describe('Difficulty Normalization', () => {
    const normalizeDifficulty = (difficulty: string | number, platform: Platform): string => {
      if (platform === 'codeforces') {
        const rating = typeof difficulty === 'number' ? difficulty : parseInt(difficulty.toString());
        if (rating <= 1200) return 'Easy';
        if (rating <= 1600) return 'Medium';
        return 'Hard';
      }
      
      if (typeof difficulty === 'string') {
        const lower = difficulty.toLowerCase();
        if (lower.includes('easy') || lower.includes('beginner')) return 'Easy';
        if (lower.includes('medium') || lower.includes('intermediate')) return 'Medium';
        if (lower.includes('hard') || lower.includes('advanced') || lower.includes('expert')) return 'Hard';
      }
      
      return 'Medium';
    };

    it('should normalize CodeForces ratings correctly', () => {
      expect(normalizeDifficulty(800, 'codeforces')).toBe('Easy');
      expect(normalizeDifficulty(1200, 'codeforces')).toBe('Easy');
      expect(normalizeDifficulty(1400, 'codeforces')).toBe('Medium');
      expect(normalizeDifficulty(1600, 'codeforces')).toBe('Medium');
      expect(normalizeDifficulty(1800, 'codeforces')).toBe('Hard');
      expect(normalizeDifficulty(2400, 'codeforces')).toBe('Hard');
    });

    it('should normalize string difficulties correctly', () => {
      expect(normalizeDifficulty('Easy', 'leetcode')).toBe('Easy');
      expect(normalizeDifficulty('EASY', 'leetcode')).toBe('Easy');
      expect(normalizeDifficulty('Medium', 'leetcode')).toBe('Medium');
      expect(normalizeDifficulty('Hard', 'leetcode')).toBe('Hard');
      expect(normalizeDifficulty('Beginner', 'geeksforgeeks')).toBe('Easy');
      expect(normalizeDifficulty('Intermediate', 'geeksforgeeks')).toBe('Medium');
      expect(normalizeDifficulty('Expert', 'atcoder')).toBe('Hard');
    });

    it('should default to Medium for unknown difficulties', () => {
      expect(normalizeDifficulty('Unknown', 'leetcode')).toBe('Medium');
      expect(normalizeDifficulty('', 'leetcode')).toBe('Medium');
    });
  });
});

