/**
 * No-primary-localStorage guard tests
 *
 * Confirms that in online (authenticated) mode every write operation
 * goes through the API. localStorage is only a cache — never the
 * sole place where user data lives.
 *
 * ApiService is mocked globally via jest.setup.js.
 */

import StorageService from '../utils/storage';
import ApiService from '../services/api';

// ─── Mock localStorage (with call-order tracking) ────────────────────────────
const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: jest.fn((key: string) => mockStorage[key] ?? null),
  setItem: jest.fn((key: string, value: string) => { mockStorage[key] = value; }),
  removeItem: jest.fn((key: string) => { delete mockStorage[key]; }),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

const mockedApi = ApiService as jest.Mocked<typeof ApiService>;

const savedProblem = {
  id: 'aabbccddeeff001122334455',
  platform: 'leetcode' as const,
  title: 'Valid Parentheses',
  problemId: 'valid-parentheses',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/valid-parentheses/',
  dateSolved: '2024-03-01T00:00:00.000Z',
  createdAt: '2024-03-01T00:00:00.000Z',
  notes: '',
  isReview: false,
  repetition: 0,
  interval: 0,
  nextReviewDate: null,
  topics: [],
  status: 'active' as const,
  companies: [],
  source: 'manual' as const,
};

const problemData = {
  platform: 'leetcode' as const,
  title: 'Valid Parentheses',
  problemId: 'valid-parentheses',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/valid-parentheses/',
  dateSolved: '2024-03-01T00:00:00.000Z',
  notes: '',
  isReview: false,
  repetition: 0,
  interval: 0,
  nextReviewDate: null as null,
  topics: [],
  status: 'active' as const,
  companies: [],
  source: 'manual' as const,
};

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  mockedApi.isAuthenticated.mockReturnValue(true);
  Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
});

// ─────────────────────────────────────────────────────────────────────────────

test('addProblem: API is called before localStorage is updated', async () => {
  const callOrder: string[] = [];
  mockedApi.createProblem.mockImplementation(async () => {
    callOrder.push('api');
    return savedProblem;
  });
  localStorageMock.setItem.mockImplementation((key: string, value: string) => {
    callOrder.push('localStorage');
    mockStorage[key] = value;
  });
  mockStorage['leetcode-cf-tracker-problems'] = JSON.stringify([]);

  await StorageService.addProblem(problemData);

  expect(callOrder[0]).toBe('api');
  expect(callOrder).toContain('localStorage');
});

test('addProblem: if API throws, the problem is NOT written to localStorage', async () => {
  mockedApi.createProblem.mockRejectedValue(new Error('server down'));

  await expect(StorageService.addProblem(problemData)).rejects.toThrow('server down');

  const calls = localStorageMock.setItem.mock.calls;
  const problemCacheWrite = calls.find(([key]: [string]) => key === 'leetcode-cf-tracker-problems');
  expect(problemCacheWrite).toBeUndefined();
});

test('updateProblem: result is the server response, not the local update argument', async () => {
  const serverVersion = { ...savedProblem, notes: 'server-side notes' };
  mockedApi.updateProblem.mockResolvedValue(serverVersion);
  mockStorage['leetcode-cf-tracker-problems'] = JSON.stringify([savedProblem]);

  const result = await StorageService.updateProblem(savedProblem.id, { notes: 'local-arg notes' });

  expect(result?.notes).toBe('server-side notes');
});

test('deleteProblem: API deletion fires before localStorage cache is updated', async () => {
  const callOrder: string[] = [];
  mockedApi.deleteProblem.mockImplementation(async () => {
    callOrder.push('api');
  });
  localStorageMock.setItem.mockImplementation((key: string, value: string) => {
    callOrder.push('localStorage');
    mockStorage[key] = value;
  });
  mockStorage['leetcode-cf-tracker-problems'] = JSON.stringify([savedProblem]);

  await StorageService.deleteProblem(savedProblem.id);

  expect(callOrder[0]).toBe('api');
  expect(callOrder).toContain('localStorage');
});

test('getProblems: returns server data even when localStorage has a stale version', async () => {
  const staleVersion = { ...savedProblem, notes: 'stale-local-notes' };
  mockStorage['leetcode-cf-tracker-problems'] = JSON.stringify([staleVersion]);
  mockedApi.getProblems.mockResolvedValue([savedProblem]);

  const result = await StorageService.getProblems();

  expect(result[0].notes).toBe('');
  expect(mockedApi.getProblems).toHaveBeenCalledTimes(1);
});

test('getProblems in online mode does NOT read localStorage as the primary source', async () => {
  mockedApi.getProblems.mockResolvedValue([savedProblem]);

  await StorageService.getProblems();

  // No primary read of the problems key from localStorage
  const primaryRead = localStorageMock.getItem.mock.calls.find(
    ([key]: [string]) => key === 'leetcode-cf-tracker-problems'
  );
  expect(primaryRead).toBeUndefined();
  expect(mockedApi.getProblems).toHaveBeenCalledTimes(1);
});
