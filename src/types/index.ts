export interface Problem {
  id: string;
  platform: 'leetcode' | 'codeforces' | 'atcoder';
  title: string;
  problemId: string;
  difficulty: string;
  url: string;
  dateSolved: string;
  createdAt: string;
  notes: string;
  isReview: boolean;
  repetition: number;
  interval: number;
  nextReviewDate: string | null;
  topics: string[];
  status: 'active' | 'learned';
  companies: string[];
}

export interface PlatformStats {
  leetcode: number;
  codeforces: number;
}

export interface DifficultyStats {
  leetcode: {
    easy: number;
    medium: number;
    hard: number;
  };
  codeforces: Record<string, number>;
}

export interface Contest {
  id: string;
  platform: 'leetcode' | 'codeforces' | 'atcoder' | 'codechef' | 'other';
  name: string;
  startTime: string;
  duration: number; // in minutes
  url: string;
  status: 'scheduled' | 'running' | 'finished';
  type?: string;
  rank?: number | null;
  rating?: number | null;
  problems?: {
    solved: number;
    total: number;
  };
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ActiveDailyCodingChallengeQuestion {
  date: string;
  userStatus: string;
  link: string;
  question: {
    acRate: number;
    difficulty: string;
    freqBar: number | null;
    frontendQuestionId: string;
    isFavor: boolean;
    paidOnly: boolean;
    status: string | null;
    title: string;
    titleSlug: string;
    topicTags: Array<{
      name: string;
      id: string;
      slug: string;
    }>;
    hasSolution: boolean;
    hasVideoSolution: boolean;
  };
}

export interface CompanyProblem {
  id: string;
  title: string;
  difficulty: string;
  url: string;
  company: string;
  frequency: number;
  topics: string[];
  isSolved: boolean;
  notes?: string;
}

// API Types
export interface User {
  id: string;
  email: string;
  username: string;
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  reviewIntervals: number[];
  enableNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Backend Types for Next.js API routes
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export interface DBProblem {
  _id: string;
  userId: string;
  platform: 'leetcode' | 'codeforces' | 'atcoder';
  title: string;
  problemId: string;
  difficulty: string;
  url: string;
  dateSolved: string;
  createdAt: string;
  notes: string;
  isReview: boolean;
  repetition: number;
  interval: number;
  nextReviewDate: string | null;
  topics: string[];
  status: 'active' | 'learned';
  companies: string[];
}

export interface DBContest {
  _id: string;
  userId: string;
  platform: 'leetcode' | 'codeforces' | 'atcoder' | 'codechef' | 'other';
  name: string;
  startTime: string;
  duration: number;
  url: string;
  status: 'scheduled' | 'running' | 'finished';
  type?: string;
  rank?: number | null;
  rating?: number | null;
  problems?: {
    solved: number;
    total: number;
  };
  notes?: string;
  createdAt: string;
}

export interface DBUser {
  _id: string;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  settings: UserSettings;
}
