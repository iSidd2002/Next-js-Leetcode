const REVIEW_INTERVALS_KEY = 'leetcode-cf-tracker-review-intervals';
const NOTIFICATIONS_KEY = 'enableNotifications';

const DEFAULT_INTERVALS = [2, 5, 7];

// ─── Synchronous cache reads (used in hot paths like handleScheduleReview) ────

export const getReviewIntervals = (): number[] => {
  try {
    const data = localStorage.getItem(REVIEW_INTERVALS_KEY);
    if (data) {
      const intervals = JSON.parse(data);
      if (Array.isArray(intervals) && intervals.every(i => typeof i === 'number')) {
        return intervals;
      }
    }
  } catch (error) {
    console.error('Error loading review intervals:', error);
  }
  return DEFAULT_INTERVALS;
};

export const getNotificationsEnabled = (): boolean => {
  try {
    return localStorage.getItem(NOTIFICATIONS_KEY) === 'true';
  } catch {
    return true;
  }
};

// ─── Write to cache ────────────────────────────────────────────────────────────

export const saveReviewIntervals = (intervals: number[]): void => {
  try {
    localStorage.setItem(REVIEW_INTERVALS_KEY, JSON.stringify(intervals));
  } catch (error) {
    console.error('Error saving review intervals:', error);
  }
};

export const saveNotificationsEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, String(enabled));
  } catch (error) {
    console.error('Error saving notifications setting:', error);
  }
};

// ─── API sync (call on app load to prime cache from server) ──────────────────

export interface UserSettings {
  reviewIntervals: number[];
  notifications: boolean;
  theme: string;
  emailUpdates: boolean;
}

/**
 * Fetches settings from the server and writes them into the localStorage cache
 * so synchronous getters (getReviewIntervals, getNotificationsEnabled) always
 * return the most-recent server values after app load.
 */
export const loadSettingsFromServer = async (): Promise<UserSettings | null> => {
  try {
    const res = await fetch('/api/settings', { credentials: 'include' });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success) return null;

    const settings: UserSettings = json.data;
    // Prime the synchronous caches
    saveReviewIntervals(settings.reviewIntervals);
    saveNotificationsEnabled(settings.notifications);
    return settings;
  } catch (error) {
    console.error('Failed to load settings from server:', error);
    return null;
  }
};

/**
 * Persists settings to the server and updates the local cache atomically.
 */
export const saveSettingsToServer = async (settings: Partial<UserSettings>): Promise<boolean> => {
  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) return false;
    const json = await res.json();
    if (!json.success) return false;

    // Keep local cache in sync
    if (settings.reviewIntervals) saveReviewIntervals(settings.reviewIntervals);
    if (typeof settings.notifications === 'boolean') saveNotificationsEnabled(settings.notifications);
    return true;
  } catch (error) {
    console.error('Failed to save settings to server:', error);
    return false;
  }
};
