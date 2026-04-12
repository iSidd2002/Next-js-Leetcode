/**
 * ApiService — Problem methods
 *
 * Uses jest.requireActual to bypass the global ApiService mock so we can
 * test the real implementation against a mocked global.fetch.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ApiService = jest.requireActual<{ default: typeof import('../services/api').default }>(
  '../services/api'
).default;

const mockProblem = {
  id: 'abc123def456abc123def456',
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
  topics: [],
  status: 'active' as const,
  companies: [],
  source: 'manual' as const,
};

function mockFetch(data: unknown, ok = true, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => data,
  });
}

beforeEach(() => {
  (global.fetch as jest.Mock).mockReset();
});

describe('ApiService.getProblems()', () => {
  test('GET /api/problems with credentials=include', async () => {
    mockFetch({ success: true, data: [mockProblem] });

    const result = await ApiService.getProblems();

    const [[url, config]] = (global.fetch as jest.Mock).mock.calls;
    expect(url).toContain('/api/problems');
    expect(config.credentials).toBe('include');
    expect(result).toHaveLength(1);
  });

  test('passes query filters as URL search params', async () => {
    mockFetch({ success: true, data: [] });

    await ApiService.getProblems({ platform: 'leetcode', status: 'active' });

    const [[url]] = (global.fetch as jest.Mock).mock.calls;
    expect(url).toContain('platform=leetcode');
    expect(url).toContain('status=active');
  });

  test('throws on non-ok response', async () => {
    mockFetch({ error: 'Unauthorized' }, false, 401);

    await expect(ApiService.getProblems()).rejects.toThrow();
  });
});

describe('ApiService.createProblem()', () => {
  test('POST /api/problems with problem body', async () => {
    mockFetch({ success: true, data: mockProblem });

    const { id: _id, createdAt: _ca, ...data } = mockProblem;
    const result = await ApiService.createProblem(data);

    const [[url, config]] = (global.fetch as jest.Mock).mock.calls;
    expect(url).toContain('/api/problems');
    expect(config.method).toBe('POST');
    const body = JSON.parse(config.body);
    expect(body.title).toBe('Two Sum');
    expect(result.id).toBe(mockProblem.id);
  });
});

describe('ApiService.updateProblem()', () => {
  test('PUT /api/problems/:id with partial update', async () => {
    mockFetch({ success: true, data: { ...mockProblem, notes: 'New notes' } });

    const result = await ApiService.updateProblem(mockProblem.id, { notes: 'New notes' });

    const [[url, config]] = (global.fetch as jest.Mock).mock.calls;
    expect(url).toContain(`/api/problems/${mockProblem.id}`);
    expect(config.method).toBe('PUT');
    expect(result.notes).toBe('New notes');
  });
});

describe('ApiService.deleteProblem()', () => {
  test('DELETE /api/problems/:id', async () => {
    mockFetch({ success: true });

    await ApiService.deleteProblem(mockProblem.id);

    const [[url, config]] = (global.fetch as jest.Mock).mock.calls;
    expect(url).toContain(`/api/problems/${mockProblem.id}`);
    expect(config.method).toBe('DELETE');
  });
});

describe('ApiService.deleteAllProblems()', () => {
  test('DELETE /api/problems/bulk and returns deleted count', async () => {
    mockFetch({ success: true, data: { deleted: 12 } });

    const count = await ApiService.deleteAllProblems();

    const [[url, config]] = (global.fetch as jest.Mock).mock.calls;
    expect(url).toContain('/api/problems/bulk');
    expect(config.method).toBe('DELETE');
    expect(count).toBe(12);
  });
});
