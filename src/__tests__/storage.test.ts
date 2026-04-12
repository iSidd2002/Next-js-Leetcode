/**
 * StorageService unit tests
 *
 * Verifies that:
 * 1. Online mode reads from / writes to MongoDB via ApiService.
 * 2. localStorage is used only as an offline cache.
 * 3. Auth errors are re-thrown (not swallowed by a localStorage fallback).
 *
 * ApiService is mocked globally via jest.setup.js.
 * localStorage is controlled via the mockStorage object below.
 */

import StorageService from '../utils/storage';
import ApiService from '../services/api';

// ─── Mock localStorage ────────────────────────────────────────────────────────
const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: jest.fn((key: string) => mockStorage[key] ?? null),
  setItem: jest.fn((key: string, value: string) => { mockStorage[key] = value; }),
  removeItem: jest.fn((key: string) => { delete mockStorage[key]; }),
  clear: jest.fn(() => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

const mockedApi = ApiService as jest.Mocked<typeof ApiService>;
const PROBLEMS_KEY = 'leetcode-cf-tracker-problems';
const CONTESTS_KEY = 'contests';
const TODOS_KEY = 'todos';

const mockProblem = {
  id: 'aabbccddeeff001122334455',
  platform: 'leetcode' as const,
  title: 'Two Sum',
  problemId: 'two-sum',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/two-sum/',
  dateSolved: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  notes: '',
  isReview: false,
  repetition: 0,
  interval: 0,
  nextReviewDate: null,
  topics: ['Arrays'],
  status: 'active' as const,
  companies: [],
  source: 'manual' as const,
};

const mockContest = {
  id: 'contest000001122334455aa',
  platform: 'leetcode' as const,
  name: 'Weekly Contest 400',
  startTime: '2024-01-01T00:00:00.000Z',
  duration: 90,
  url: 'https://leetcode.com/contest/',
  status: 'finished' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockTodo = {
  id: 'todo0000001122334455aabb',
  title: 'Review sliding window',
  description: '',
  status: 'pending' as const,
  priority: 'medium' as const,
  category: 'study' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  // Default: online/authenticated mode
  mockedApi.isAuthenticated.mockReturnValue(true);
  Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// Problems
// ─────────────────────────────────────────────────────────────────────────────

describe('StorageService.getProblems()', () => {
  test('online mode: fetches from API and caches in localStorage', async () => {
    mockedApi.getProblems.mockResolvedValue([mockProblem]);

    const result = await StorageService.getProblems();

    expect(mockedApi.getProblems).toHaveBeenCalledTimes(1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(PROBLEMS_KEY, expect.any(String));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(mockProblem.id);
  });

  test('offline mode: reads from localStorage, does NOT call API', async () => {
    mockStorage['offline-mode'] = 'true';
    mockStorage[PROBLEMS_KEY] = JSON.stringify([mockProblem]);

    const result = await StorageService.getProblems();

    expect(mockedApi.getProblems).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  test('online mode: falls back to localStorage cache when API throws a non-auth error', async () => {
    mockedApi.getProblems.mockRejectedValue(new Error('Network error'));
    mockStorage[PROBLEMS_KEY] = JSON.stringify([mockProblem]);

    const result = await StorageService.getProblems();

    expect(result).toHaveLength(1);
  });

  test('online mode: re-throws auth error instead of falling back to cache', async () => {
    mockedApi.getProblems.mockRejectedValue(new Error('Access token required'));

    await expect(StorageService.getProblems()).rejects.toThrow('Access token required');
  });
});

describe('StorageService.addProblem()', () => {
  const newProblemData = {
    platform: 'leetcode' as const,
    title: 'Three Sum',
    problemId: 'three-sum',
    difficulty: 'Medium',
    url: 'https://leetcode.com/problems/3sum/',
    dateSolved: '2024-01-02T00:00:00.000Z',
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

  test('online mode: saves via API and updates localStorage cache', async () => {
    const serverProblem = { ...mockProblem, ...newProblemData, id: 'server_id_abc123def456' };
    mockedApi.createProblem.mockResolvedValue(serverProblem);
    mockStorage[PROBLEMS_KEY] = JSON.stringify([]);

    const result = await StorageService.addProblem(newProblemData);

    expect(mockedApi.createProblem).toHaveBeenCalledTimes(1);
    expect(localStorageMock.setItem).toHaveBeenCalled();
    expect(result.id).toBe('server_id_abc123def456');
  });

  test('offline mode: saves to localStorage with client-generated id, does NOT call API', async () => {
    mockStorage['offline-mode'] = 'true';
    mockStorage[PROBLEMS_KEY] = JSON.stringify([]);

    const result = await StorageService.addProblem(newProblemData);

    expect(mockedApi.createProblem).not.toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.title).toBe('Three Sum');
  });
});

describe('StorageService.updateProblem()', () => {
  test('online mode: updates via API, result reflects server response', async () => {
    const serverVersion = { ...mockProblem, notes: 'server-notes' };
    mockedApi.updateProblem.mockResolvedValue(serverVersion);
    mockStorage[PROBLEMS_KEY] = JSON.stringify([mockProblem]);

    const result = await StorageService.updateProblem(mockProblem.id, { notes: 'server-notes' });

    expect(mockedApi.updateProblem).toHaveBeenCalledWith(mockProblem.id, { notes: 'server-notes' });
    expect(result?.notes).toBe('server-notes');
  });

  test('offline mode: updates localStorage only', async () => {
    mockStorage['offline-mode'] = 'true';
    mockStorage[PROBLEMS_KEY] = JSON.stringify([mockProblem]);

    const result = await StorageService.updateProblem(mockProblem.id, { notes: 'offline notes' });

    expect(mockedApi.updateProblem).not.toHaveBeenCalled();
    expect(result?.notes).toBe('offline notes');
  });
});

describe('StorageService.deleteProblem()', () => {
  test('online mode: deletes via API and removes from localStorage cache', async () => {
    mockedApi.deleteProblem.mockResolvedValue(undefined);
    mockStorage[PROBLEMS_KEY] = JSON.stringify([mockProblem]);

    const result = await StorageService.deleteProblem(mockProblem.id);

    expect(mockedApi.deleteProblem).toHaveBeenCalledWith(mockProblem.id);
    expect(result).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });
});

describe('StorageService.deleteAllProblems()', () => {
  test('online mode: calls bulk delete API and clears localStorage cache', async () => {
    mockedApi.deleteAllProblems.mockResolvedValue(5);

    const deleted = await StorageService.deleteAllProblems();

    expect(mockedApi.deleteAllProblems).toHaveBeenCalledTimes(1);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(PROBLEMS_KEY);
    expect(deleted).toBe(5);
  });

  test('offline mode: clears localStorage, returns 0, does NOT call API', async () => {
    mockStorage['offline-mode'] = 'true';
    mockStorage[PROBLEMS_KEY] = JSON.stringify([mockProblem]);

    const deleted = await StorageService.deleteAllProblems();

    expect(mockedApi.deleteAllProblems).not.toHaveBeenCalled();
    expect(deleted).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Contests
// ─────────────────────────────────────────────────────────────────────────────

describe('StorageService.getContests()', () => {
  test('online mode: fetches from API and caches', async () => {
    mockedApi.getContests.mockResolvedValue([mockContest]);

    const result = await StorageService.getContests();

    expect(mockedApi.getContests).toHaveBeenCalledTimes(1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(CONTESTS_KEY, expect.any(String));
    expect(result).toHaveLength(1);
  });

  test('offline mode: reads from localStorage', async () => {
    mockStorage['offline-mode'] = 'true';
    mockStorage[CONTESTS_KEY] = JSON.stringify([mockContest]);

    const result = await StorageService.getContests();

    expect(mockedApi.getContests).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });
});

describe('StorageService.addContest()', () => {
  test('online mode: creates via API', async () => {
    mockedApi.createContest.mockResolvedValue(mockContest);
    mockStorage[CONTESTS_KEY] = JSON.stringify([]);

    await StorageService.addContest({
      platform: 'leetcode',
      name: 'Weekly 401',
      startTime: '2024-02-01T00:00:00.000Z',
      duration: 90,
      url: 'https://leetcode.com/contest/weekly-401/',
      status: 'scheduled',
    });

    expect(mockedApi.createContest).toHaveBeenCalledTimes(1);
  });
});

describe('StorageService.deleteContest()', () => {
  test('online mode: deletes via API', async () => {
    mockedApi.deleteContest.mockResolvedValue(undefined);
    mockStorage[CONTESTS_KEY] = JSON.stringify([mockContest]);

    await StorageService.deleteContest(mockContest.id);

    expect(mockedApi.deleteContest).toHaveBeenCalledWith(mockContest.id);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Todos
// ─────────────────────────────────────────────────────────────────────────────

describe('StorageService.getTodos()', () => {
  test('online mode: fetches from API and caches', async () => {
    mockedApi.getTodos.mockResolvedValue([mockTodo]);

    const result = await StorageService.getTodos();

    expect(mockedApi.getTodos).toHaveBeenCalledTimes(1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(TODOS_KEY, expect.any(String));
    expect(result).toHaveLength(1);
  });
});

describe('StorageService.addTodo()', () => {
  test('online mode: creates via API and updates cache', async () => {
    mockedApi.createTodo.mockResolvedValue(mockTodo);
    mockStorage[TODOS_KEY] = JSON.stringify([]);

    const { id: _id, createdAt: _ca, updatedAt: _ua, ...todoData } = mockTodo;
    const result = await StorageService.addTodo(todoData);

    expect(mockedApi.createTodo).toHaveBeenCalledTimes(1);
    expect(result.id).toBe(mockTodo.id);
  });
});

describe('StorageService.deleteTodo()', () => {
  test('online mode: deletes via API', async () => {
    mockedApi.deleteTodo.mockResolvedValue(undefined);
    mockStorage[TODOS_KEY] = JSON.stringify([mockTodo]);

    await StorageService.deleteTodo(mockTodo.id);

    expect(mockedApi.deleteTodo).toHaveBeenCalledWith(mockTodo.id);
  });
});
