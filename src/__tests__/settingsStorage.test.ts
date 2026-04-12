/**
 * settingsStorage tests
 *
 * Verifies that:
 * 1. getReviewIntervals / getNotificationsEnabled read from the localStorage cache.
 * 2. loadSettingsFromServer fetches from /api/settings and primes the cache.
 * 3. saveSettingsToServer calls PUT /api/settings and updates the cache.
 * 4. Default values are returned when nothing is cached.
 */

import {
  getReviewIntervals,
  getNotificationsEnabled,
  saveReviewIntervals,
  saveNotificationsEnabled,
  loadSettingsFromServer,
  saveSettingsToServer,
} from '../utils/settingsStorage';

const INTERVALS_KEY = 'leetcode-cf-tracker-review-intervals';
const NOTIFICATIONS_KEY = 'enableNotifications';

// ─── Mock localStorage ────────────────────────────────────────────────────────
const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: jest.fn((key: string) => mockStorage[key] ?? null),
  setItem: jest.fn((key: string, value: string) => { mockStorage[key] = value; }),
  removeItem: jest.fn((key: string) => { delete mockStorage[key]; }),
  clear: jest.fn(() => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  (global.fetch as jest.Mock).mockReset();
});

// ─────────────────────────────────────────────────────────────────────────────
// Synchronous cache accessors
// ─────────────────────────────────────────────────────────────────────────────

describe('getReviewIntervals()', () => {
  test('returns default [2,5,7] when nothing is cached', () => {
    expect(getReviewIntervals()).toEqual([2, 5, 7]);
  });

  test('returns cached value when present', () => {
    mockStorage[INTERVALS_KEY] = JSON.stringify([1, 3, 14]);
    expect(getReviewIntervals()).toEqual([1, 3, 14]);
  });

  test('returns default when cached value is malformed JSON', () => {
    mockStorage[INTERVALS_KEY] = 'not-json{{{';
    expect(getReviewIntervals()).toEqual([2, 5, 7]);
  });
});

describe('getNotificationsEnabled()', () => {
  test('returns false when nothing is cached', () => {
    expect(getNotificationsEnabled()).toBe(false);
  });

  test('returns true when cached as "true"', () => {
    mockStorage[NOTIFICATIONS_KEY] = 'true';
    expect(getNotificationsEnabled()).toBe(true);
  });

  test('returns false when cached as "false"', () => {
    mockStorage[NOTIFICATIONS_KEY] = 'false';
    expect(getNotificationsEnabled()).toBe(false);
  });
});

describe('saveReviewIntervals()', () => {
  test('writes serialized array to localStorage', () => {
    saveReviewIntervals([1, 7, 30]);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(INTERVALS_KEY, JSON.stringify([1, 7, 30]));
  });
});

describe('saveNotificationsEnabled()', () => {
  test('writes boolean string to localStorage for true', () => {
    saveNotificationsEnabled(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(NOTIFICATIONS_KEY, 'true');
  });

  test('writes boolean string to localStorage for false', () => {
    saveNotificationsEnabled(false);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(NOTIFICATIONS_KEY, 'false');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// API sync
// ─────────────────────────────────────────────────────────────────────────────

describe('loadSettingsFromServer()', () => {
  test('fetches GET /api/settings with credentials and primes localStorage cache', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { reviewIntervals: [3, 7, 21], notifications: true, theme: 'dark', emailUpdates: false },
      }),
    });

    const result = await loadSettingsFromServer();

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/settings',
      expect.objectContaining({ credentials: 'include' })
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(INTERVALS_KEY, JSON.stringify([3, 7, 21]));
    expect(localStorageMock.setItem).toHaveBeenCalledWith(NOTIFICATIONS_KEY, 'true');
    expect(result?.reviewIntervals).toEqual([3, 7, 21]);
    expect(result?.notifications).toBe(true);
  });

  test('returns null and does not write cache when API returns non-ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    const result = await loadSettingsFromServer();

    expect(result).toBeNull();
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  test('returns null when fetch throws', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await loadSettingsFromServer();

    expect(result).toBeNull();
  });
});

describe('saveSettingsToServer()', () => {
  test('sends PUT /api/settings with the provided values and updates cache', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { reviewIntervals: [1, 5, 14], notifications: false, theme: 'light', emailUpdates: false },
      }),
    });

    const ok = await saveSettingsToServer({ reviewIntervals: [1, 5, 14], notifications: false });

    const [[url, config]] = (global.fetch as jest.Mock).mock.calls;
    expect(url).toBe('/api/settings');
    expect(config.method).toBe('PUT');
    expect(config.credentials).toBe('include');
    expect(JSON.parse(config.body)).toMatchObject({ reviewIntervals: [1, 5, 14], notifications: false });
    expect(ok).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(INTERVALS_KEY, JSON.stringify([1, 5, 14]));
    expect(localStorageMock.setItem).toHaveBeenCalledWith(NOTIFICATIONS_KEY, 'false');
  });

  test('returns false and skips cache update when API returns non-ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    const ok = await saveSettingsToServer({ reviewIntervals: [2, 5, 7] });

    expect(ok).toBe(false);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  test('returns false when fetch throws', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const ok = await saveSettingsToServer({ notifications: true });

    expect(ok).toBe(false);
  });
});
