/**
 * ApiService — Pattern Path methods
 *
 * Uses jest.requireActual to bypass the global ApiService mock so we can
 * test the real implementation against a mocked global.fetch.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ApiService = jest.requireActual<{ default: typeof import('../services/api').default }>(
  '../services/api'
).default;

const mockPath = {
  id: 'abc123def456abc123def459',
  name: 'Two Pointers',
  topic: 'Arrays',
  description: 'Master shrink/expand on sorted arrays',
  problems: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
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

describe('ApiService.getPatternPaths()', () => {
  test('GET /api/patterns with credentials=include and returns array', async () => {
    mockFetch({ success: true, data: [mockPath] });

    const result = await ApiService.getPatternPaths();

    const [[url, config]] = (global.fetch as jest.Mock).mock.calls;
    expect(url).toContain('/api/patterns');
    expect(config.credentials).toBe('include');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(mockPath.id);
  });

  test('throws when server returns non-ok status', async () => {
    mockFetch({ error: 'Access token required' }, false, 401);

    await expect(ApiService.getPatternPaths()).rejects.toThrow();
  });
});

describe('ApiService.createPatternPath()', () => {
  test('POST /api/patterns with JSON body and returns created path', async () => {
    mockFetch({ success: true, data: mockPath });

    const { id: _id, createdAt: _ca, updatedAt: _ua, ...pathData } = mockPath;
    const result = await ApiService.createPatternPath(pathData);

    const [[url, config]] = (global.fetch as jest.Mock).mock.calls;
    expect(url).toContain('/api/patterns');
    expect(config.method).toBe('POST');
    expect(JSON.parse(config.body)).toMatchObject({ name: 'Two Pointers', topic: 'Arrays' });
    expect(result.id).toBe(mockPath.id);
  });
});

describe('ApiService.updatePatternPath()', () => {
  test('PUT /api/patterns/:id with patch body', async () => {
    const updated = { ...mockPath, name: 'Fast & Slow Pointers' };
    mockFetch({ success: true, data: updated });

    const result = await ApiService.updatePatternPath(mockPath.id, { name: 'Fast & Slow Pointers' });

    const [[url, config]] = (global.fetch as jest.Mock).mock.calls;
    expect(url).toContain(`/api/patterns/${mockPath.id}`);
    expect(config.method).toBe('PUT');
    expect(result.name).toBe('Fast & Slow Pointers');
  });
});

describe('ApiService.deletePatternPath()', () => {
  test('DELETE /api/patterns/:id', async () => {
    mockFetch({ success: true });

    await ApiService.deletePatternPath(mockPath.id);

    const [[url, config]] = (global.fetch as jest.Mock).mock.calls;
    expect(url).toContain(`/api/patterns/${mockPath.id}`);
    expect(config.method).toBe('DELETE');
  });

  test('throws when server returns non-ok', async () => {
    mockFetch({ error: 'Not found' }, false, 404);

    await expect(ApiService.deletePatternPath('nonexistent')).rejects.toThrow();
  });
});
