import type { Problem, Contest, User, AuthResponse, ApiResponse, ActiveDailyCodingChallengeQuestion, Todo } from '@/types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || '/api'
  : '/api';

class ApiService {
  static isAuthenticated(): boolean {
    // Check if we have auth cookies
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';');
      const hasAuthToken = cookies.some(cookie => {
        const trimmed = cookie.trim();
        return trimmed.startsWith('auth-token=') && trimmed.length > 'auth-token='.length;
      });

      const hasUserId = cookies.some(cookie => {
        const trimmed = cookie.trim();
        return trimmed.startsWith('user-id=') && trimmed.length > 'user-id='.length;
      });

      // Both cookies should be present for proper authentication
      return hasAuthToken && hasUserId;
    }
    return false;
  }

  // More reliable authentication check by making an API call
  static async checkAuthStatus(): Promise<boolean> {
    try {
      // First check if we have cookies
      if (!this.isAuthenticated()) {
        return false;
      }

      await this.getProfile();
      return true;
    } catch (error: any) {
      // Silently handle auth failures - user is simply not logged in
      if (error.status === 401 || error.status === 404 || error.message?.includes('User not found')) {
        return false;
      }
      // Only log unexpected errors
      console.log('Unexpected auth check error:', error.message);

      // If it's a "User not found" error, clear any stale tokens
      if (error.message === 'User not found' || error.status === 404) {
        console.log('User not found in database, clearing stale authentication');
        // Only clear auth state in browser environment
        if (typeof window !== 'undefined') {
          this.clearAuthState();
        }
      }

      return false;
    }
  }

  // Check authentication with retry logic for post-login scenarios
  static async checkAuthStatusWithRetry(maxRetries: number = 3, delay: number = 100): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        // First check if cookies are present
        if (!this.isAuthenticated()) {
          console.log(`🍪 No cookies found on attempt ${i + 1}`);
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1))); // Exponential backoff
            continue;
          }
          return false;
        }

        // Then verify with API call
        const isAuth = await this.checkAuthStatus();
        if (isAuth) return true;

        // If not authenticated and we have more retries, wait and try again
        if (i < maxRetries - 1) {
          console.log(`🔄 Auth check failed, retrying in ${delay * (i + 1)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      } catch (error) {
        console.log(`Auth check attempt ${i + 1} failed:`, error);
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    return false;
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies in requests
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || `HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        (error as any).statusText = response.statusText;
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Auth methods
  static async register(email: string, username: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });

    return response.data!;
  }

  static async login(email: string, password: string): Promise<{ user: User }> {
    const response = await this.request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.data) {
      throw new Error('Login failed: no user data returned');
    }

    return response.data;
  }

  static async getProfile(): Promise<User> {
    const response = await this.request<User>('/auth/profile');
    return response.data!;
  }

  static async logout(): Promise<void> {
    await this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Clear authentication state (useful for handling stale tokens)
  static clearAuthState(): void {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Clear auth cookie
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // Clear any localStorage auth data if present
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
  }

  // Problem methods
  static async getProblems(filters?: {
    platform?: string;
    status?: string;
    isReview?: boolean;
    company?: string;
    topic?: string;
    limit?: number;
    offset?: number;
  }): Promise<Problem[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await this.request<Problem[]>(`/problems?${params}`);
    return response.data!;
  }

  static async createProblem(problem: Omit<Problem, 'id' | 'createdAt'>): Promise<Problem> {
    // Clean the problem data to only include necessary fields
    const cleanProblem = {
      platform: problem.platform,
      title: problem.title,
      problemId: problem.problemId || problem.title.toLowerCase().replace(/\s+/g, '-'),
      difficulty: problem.difficulty,
      url: problem.url || '', // Ensure URL is always provided, even if empty
      dateSolved: problem.dateSolved,
      notes: problem.notes || '',
      isReview: problem.isReview || false,
      repetition: problem.repetition || 0,
      interval: problem.interval || 0,
      nextReviewDate: problem.nextReviewDate,
      topics: problem.topics || [],
      status: problem.status || 'active',
      companies: problem.companies || [],
      source: problem.source || 'manual'
    };

    const response = await this.request<Problem>('/problems', {
      method: 'POST',
      body: JSON.stringify(cleanProblem),
    });
    return response.data!;
  }

  static async updateProblem(id: string, problem: Partial<Problem>): Promise<Problem> {
    const response = await this.request<Problem>(`/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(problem),
    });
    return response.data!;
  }

  static async deleteProblem(id: string): Promise<void> {
    await this.request(`/problems/${id}`, {
      method: 'DELETE',
    });
  }

  // Contest methods
  static async getContests(): Promise<Contest[]> {
    const response = await this.request<Contest[]>('/contests');
    return response.data!;
  }

  static async createContest(contest: Omit<Contest, 'id' | 'createdAt'>): Promise<Contest> {
    const response = await this.request<Contest>('/contests', {
      method: 'POST',
      body: JSON.stringify(contest),
    });
    return response.data!;
  }

  static async updateContest(id: string, contest: Partial<Contest>): Promise<Contest> {
    const response = await this.request<Contest>(`/contests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contest),
    });
    return response.data!;
  }

  static async deleteContest(id: string): Promise<void> {
    await this.request(`/contests/${id}`, {
      method: 'DELETE',
    });
  }

  // Problem of the Day
  static async getDailyProblem(query?: string, variables?: any): Promise<ActiveDailyCodingChallengeQuestion> {
    const response = await this.request<ActiveDailyCodingChallengeQuestion>('/potd', {
      method: 'POST',
      body: JSON.stringify({ query, variables }),
    });
    return response.data!;
  }

  // Todo methods
  static async getTodos(filters?: {
    status?: string;
    category?: string;
    priority?: string;
    limit?: number;
    offset?: number;
  }): Promise<Todo[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await this.request<Todo[]>(`/todos?${params}`);
    return response.data!;
  }

  static async createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> {
    const response = await this.request<Todo>('/todos', {
      method: 'POST',
      body: JSON.stringify(todo),
    });
    return response.data!;
  }

  static async updateTodo(id: string, todo: Partial<Todo>): Promise<Todo> {
    const response = await this.request<Todo>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(todo),
    });
    return response.data!;
  }

  static async deleteTodo(id: string): Promise<void> {
    await this.request(`/todos/${id}`, {
      method: 'DELETE',
    });
  }
}

export default ApiService;
