export interface ReviewEntry {
  date: string;
  quality: number; // 1-5
  timeTaken?: number; // minutes
  notes?: string;
  tags?: string[];
  nextReviewDate: string;
  interval: number;
}

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
  source: 'manual' | 'company' | 'potd'; // Track the source of the problem
  reviewHistory?: ReviewEntry[]; // Track review quality and progress
  averageQuality?: number; // Average quality score
  lastReviewQuality?: number; // Last review quality
  codeSnippet?: string; // Solution code (pika.style inspired)
  codeLanguage?: string; // Programming language
  codeFilename?: string; // Filename for code snippet
  // Enhanced tracking fields (comprehensive LeetCode tracking)
  subPatterns?: string[]; // Sub-patterns within topics (e.g., "Monotonic Stack" under "Stack")
  struggles?: string[]; // What the user struggled with on this problem
  learnings?: string[]; // Key learnings/takeaways from solving this problem
  solutionSummary?: string; // Brief 1-2 sentence summary of the approach in own words
  timeComplexity?: string; // Time complexity (e.g., "O(n)", "O(n log n)")
  spaceComplexity?: string; // Space complexity (e.g., "O(1)", "O(n)")
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
  // Enhanced tracking fields
  subPatterns?: string[];
  struggles?: string[];
  learnings?: string[];
  solutionSummary?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
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

// Todo interfaces
export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  category: 'coding' | 'study' | 'interview-prep' | 'project' | 'personal' | 'other';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  notes?: string;
}

export interface DBTodo {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  category: 'coding' | 'study' | 'interview-prep' | 'project' | 'personal' | 'other';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  estimatedTime?: number;
  actualTime?: number;
  notes?: string;
}
