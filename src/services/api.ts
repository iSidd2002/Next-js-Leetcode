import type { Problem, Contest, User, AuthResponse, ApiResponse, ActiveDailyCodingChallengeQuestion } from '@/types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || '/api'
  : '/api';

class ApiService {
  private static token: string | null = null;

  static setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth-token', token);
      } else {
        localStorage.removeItem('auth-token');
      }
    }
  }

  static getToken(): string | null {
    if (this.token) return this.token;
    
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth-token');
    }
    
    return this.token;
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  static async register(email: string, username: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
    
    if (response.success && response.data) {
      this.setToken(response.data.token);
    }
    
    return response.data!;
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
    }

    return response.data!;
  }

  static async getProfile(): Promise<User> {
    const response = await this.request<User>('/auth/profile');
    return response.data!;
  }

  static logout() {
    this.setToken(null);
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
    const response = await this.request<Problem>('/problems', {
      method: 'POST',
      body: JSON.stringify(problem),
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
}

export default ApiService;
