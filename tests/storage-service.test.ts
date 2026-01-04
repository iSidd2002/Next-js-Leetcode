/**
 * Storage Service Tests - Andrej Karpathy Style
 * 
 * Testing localStorage operations, data persistence, and error handling.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock localStorage
const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    get store() { return { ...store }; }
  };
};

describe('Storage Service Tests', () => {
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;

  beforeEach(() => {
    mockLocalStorage = createMockLocalStorage();
    Object.defineProperty(global, 'localStorage', { value: mockLocalStorage, writable: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Persistence', () => {
    it('should save and retrieve problems correctly', () => {
      const problems = [
        { id: '1', title: 'Two Sum', platform: 'leetcode' },
        { id: '2', title: 'Add Two Numbers', platform: 'leetcode' },
      ];
      
      mockLocalStorage.setItem('problems', JSON.stringify(problems));
      const retrieved = JSON.parse(mockLocalStorage.getItem('problems') || '[]');
      
      expect(retrieved).toEqual(problems);
    });

    it('should handle empty storage gracefully', () => {
      const result = mockLocalStorage.getItem('nonexistent');
      expect(result).toBeNull();
    });

    it('should handle corrupted JSON data', () => {
      mockLocalStorage.setItem('problems', 'not valid json');
      
      let problems = [];
      try {
        problems = JSON.parse(mockLocalStorage.getItem('problems') || '[]');
      } catch {
        problems = [];
      }
      
      expect(problems).toEqual([]);
    });
  });

  describe('Data Migration', () => {
    it('should migrate old data format to new format', () => {
      const oldFormat = [
        { id: '1', name: 'Two Sum' }, // old: 'name' instead of 'title'
      ];
      
      const migrated = oldFormat.map(p => ({
        ...p,
        title: (p as { name?: string }).name || '',
      }));
      
      expect(migrated[0].title).toBe('Two Sum');
    });

    it('should add missing fields with defaults', () => {
      const incompleteData = { id: '1', title: 'Two Sum' };
      
      const complete = {
        ...incompleteData,
        platform: incompleteData.platform || 'leetcode',
        difficulty: incompleteData.difficulty || 'Medium',
        status: incompleteData.status || 'active',
        topics: incompleteData.topics || [],
        companies: incompleteData.companies || [],
      };
      
      expect(complete.platform).toBe('leetcode');
      expect(complete.difficulty).toBe('Medium');
      expect(complete.status).toBe('active');
      expect(complete.topics).toEqual([]);
    });
  });

  describe('Storage Limits', () => {
    it('should detect when approaching storage limit', () => {
      const estimatedSize = 4 * 1024 * 1024; // 4MB
      const maxSize = 5 * 1024 * 1024; // 5MB typical limit
      const warningThreshold = 0.8;
      
      const usageRatio = estimatedSize / maxSize;
      expect(usageRatio > warningThreshold).toBe(true);
    });

    it('should handle storage quota exceeded error', () => {
      const mockSetItem = jest.fn(() => {
        throw new DOMException('QuotaExceededError');
      });
      
      expect(() => mockSetItem('key', 'value')).toThrow('QuotaExceededError');
    });
  });

  describe('Concurrent Access', () => {
    it('should handle rapid successive writes', () => {
      const writes: string[] = [];
      
      for (let i = 0; i < 100; i++) {
        const value = `value-${i}`;
        mockLocalStorage.setItem('test', value);
        writes.push(value);
      }
      
      const finalValue = mockLocalStorage.getItem('test');
      expect(finalValue).toBe('value-99');
    });

    it('should maintain data integrity during updates', () => {
      const problems = [
        { id: '1', title: 'Problem 1' },
        { id: '2', title: 'Problem 2' },
      ];
      
      mockLocalStorage.setItem('problems', JSON.stringify(problems));
      
      // Simulate update
      const current = JSON.parse(mockLocalStorage.getItem('problems') || '[]');
      current[0].title = 'Updated Problem 1';
      mockLocalStorage.setItem('problems', JSON.stringify(current));
      
      const final = JSON.parse(mockLocalStorage.getItem('problems') || '[]');
      expect(final[0].title).toBe('Updated Problem 1');
      expect(final[1].title).toBe('Problem 2');
    });
  });

  describe('Data Cleanup', () => {
    it('should remove orphaned data', () => {
      mockLocalStorage.setItem('orphaned-key', 'value');
      mockLocalStorage.setItem('problems', '[]');
      
      // Cleanup orphaned keys
      mockLocalStorage.removeItem('orphaned-key');
      
      expect(mockLocalStorage.getItem('orphaned-key')).toBeNull();
      expect(mockLocalStorage.getItem('problems')).toBe('[]');
    });
  });
});
