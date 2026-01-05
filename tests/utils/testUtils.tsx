import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppProvider } from '../../src/context/AppContext';
import { Problem } from '../../src/types';

// Mock problem data
export const mockProblem: Problem = {
  id: 'test-1',
  platform: 'leetcode',
  title: 'Two Sum',
  problemId: '1',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/two-sum/',
  dateSolved: '2024-01-01',
  createdAt: '2024-01-01T00:00:00.000Z',
  notes: 'Test notes',
  isReview: false,
  repetition: 0,
  interval: 1,
  nextReviewDate: null,
  topics: ['Array', 'Hash Table'],
  status: 'active' as const,
  companies: ['Google', 'Amazon'],
  source: 'manual' as const,
};

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock data generators
export const createMockProblem = (overrides: Partial<Problem> = {}): Problem => ({
  ...mockProblem,
  ...overrides,
  id: overrides.id || `test-${Math.random().toString(36).substr(2, 9)}`,
});

export const createMockProblems = (count: number): Problem[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockProblem({
      id: `test-${index + 1}`,
      title: `Problem ${index + 1}`,
      problemId: `${index + 1}`,
    })
  );
};

// Mock API responses
export function mockApiResponse<T>(data: T, delay = 0): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}

export function mockApiError(message = 'API Error', delay = 0): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
}

// Mock localStorage helpers
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get store() {
      return { ...store };
    }
  };
};

// Mock fetch helper
export const mockFetch = (response: any, ok = true, status = 200) => {
  return jest.fn().mockResolvedValue({
    ok,
    status,
    json: jest.fn().mockResolvedValue(response),
    text: jest.fn().mockResolvedValue(JSON.stringify(response)),
  });
};

// Test data constants
export const TEST_CONSTANTS = {
  PLATFORMS: ['leetcode', 'hackerrank', 'codechef', 'codeforces', 'atcoder'] as const,
  DIFFICULTIES: ['Easy', 'Medium', 'Hard'] as const,
  TOPICS: ['Array', 'String', 'Hash Table', 'Dynamic Programming', 'Tree'] as const,
  COMPANIES: ['Google', 'Amazon', 'Microsoft', 'Apple', 'Meta'] as const,
} as const;
