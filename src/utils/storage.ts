import type { Problem, Contest, Todo } from '@/types';
import ApiService from '@/services/api';
import { cleanupExpiredPotdProblems, isCleanupNeeded, getCleanupSummary } from './potdCleanup';

const PROBLEMS_KEY = 'leetcode-cf-tracker-problems';
const POTD_PROBLEMS_KEY = 'potd-problems';
const COMPANY_PROBLEMS_KEY = 'company-problems';
const CONTESTS_KEY = 'contests';
const TODOS_KEY = 'todos';
const OFFLINE_MODE_KEY = 'offline-mode';

class StorageService {
  private static isOfflineMode(): boolean {
    try {
      const offlineFlag = localStorage.getItem(OFFLINE_MODE_KEY) === 'true';
      if (offlineFlag) return true;

      // Treat navigator offline as offline mode
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        return true;
      }

      // Fall back to auth status when available (test environments mock this)
      if (typeof ApiService.isAuthenticated === 'function') {
        return !ApiService.isAuthenticated();
      }

      return false;
    } catch (error) {
      console.error('Error accessing localStorage for offline mode:', error);
      // Default to online mode if localStorage is not accessible
      return false;
    }
  }

  static getOfflineMode(): boolean {
    try {
      return localStorage.getItem(OFFLINE_MODE_KEY) === 'true';
    } catch (error) {
      console.error('Error accessing localStorage for offline mode:', error);
      return false;
    }
  }

  static async getProblems(): Promise<Problem[]> {
    if (this.isOfflineMode()) {
      try {
        const problems = localStorage.getItem(PROBLEMS_KEY);
        return problems ? JSON.parse(problems) : [];
      } catch (error) {
        console.error('Error parsing problems from storage:', error);
        return [];
      }
    }

    try {
      const problems = await ApiService.getProblems();
      // Cache for offline use — guard against QuotaExceededError (localStorage ~5MB limit)
      try {
        localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
      } catch {
        // Storage full — clear the cache and continue without caching
        localStorage.removeItem(PROBLEMS_KEY);
      }
      return problems;
    } catch (error) {
      console.error('Error fetching problems from API:', error);
      // If it's an authentication error, don't fallback to localStorage
      if (error instanceof Error && error.message.includes('Access token required')) {
        throw error; // Re-throw authentication errors
      }
      // For other errors, fallback to local storage
      try {
        const problems = localStorage.getItem(PROBLEMS_KEY);
        return problems ? JSON.parse(problems) : [];
      } catch (storageError) {
        console.error('Error parsing problems from storage:', storageError);
        return [];
      }
    }
  }

  static async saveProblems(problems: Problem[]): Promise<void> {
    localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
  }

  static async getPotdProblems(): Promise<Problem[]> {
    try {
      const problems = localStorage.getItem(POTD_PROBLEMS_KEY);
      return problems ? JSON.parse(problems) : [];
    } catch (error) {
      console.error('Error parsing POTD problems from storage:', error);
      return [];
    }
  }

  static async savePotdProblems(problems: Problem[]): Promise<void> {
    localStorage.setItem(POTD_PROBLEMS_KEY, JSON.stringify(problems));
  }

  static async cleanupExpiredPotdProblems(): Promise<{
    removedCount: number;
    preservedCount: number;
    summary: string;
  }> {
    try {
      const potdProblems = await this.getPotdProblems();

      if (!isCleanupNeeded(potdProblems)) {
        return {
          removedCount: 0,
          preservedCount: 0,
          summary: '✨ No cleanup needed - all POTD problems are either current or saved by you!'
        };
      }

      const { cleanedProblems, removedCount, removedProblems, preservedCount } = cleanupExpiredPotdProblems(potdProblems);

      // Save cleaned problems back to storage
      await this.savePotdProblems(cleanedProblems);

      const summary = getCleanupSummary(removedCount, removedProblems, preservedCount);

      return {
        removedCount,
        preservedCount,
        summary
      };
    } catch (error) {
      console.error('🧹 POTD Cleanup: Error during cleanup:', error);
      return {
        removedCount: 0,
        preservedCount: 0,
        summary: 'Cleanup failed due to error'
      };
    }
  }

  static async getContests(): Promise<Contest[]> {
    if (this.isOfflineMode()) {
      try {
        const contests = localStorage.getItem(CONTESTS_KEY);
        return contests ? JSON.parse(contests) : [];
      } catch (error) {
        console.error('Error parsing contests from storage:', error);
        return [];
      }
    }

    try {
      const contests = await ApiService.getContests();
      // Cache for offline use
      localStorage.setItem(CONTESTS_KEY, JSON.stringify(contests));
      return contests;
    } catch (error) {
      console.error('Error fetching contests from API:', error);
      if (error instanceof Error && error.message.includes('Access token required')) {
        throw error;
      }
      try {
        const contests = localStorage.getItem(CONTESTS_KEY);
        return contests ? JSON.parse(contests) : [];
      } catch (storageError) {
        console.error('Error parsing contests from storage:', storageError);
        return [];
      }
    }
  }

  static async addContest(contestData: Omit<Contest, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contest> {
    if (this.isOfflineMode()) {
      const contests = await this.getContests();
      const newContest: Contest = {
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...contestData,
      };
      contests.push(newContest);
      localStorage.setItem(CONTESTS_KEY, JSON.stringify(contests));
      return newContest;
    }

    const newContest = await ApiService.createContest(contestData);
    const cached = JSON.parse(localStorage.getItem(CONTESTS_KEY) || '[]') as Contest[];
    cached.push(newContest);
    localStorage.setItem(CONTESTS_KEY, JSON.stringify(cached));
    return newContest;
  }

  static async updateContest(id: string, updates: Partial<Contest>): Promise<Contest | null> {
    if (this.isOfflineMode()) {
      const contests = await this.getContests();
      const index = contests.findIndex(c => c.id === id);
      if (index === -1) return null;
      contests[index] = { ...contests[index], ...updates, updatedAt: new Date() };
      localStorage.setItem(CONTESTS_KEY, JSON.stringify(contests));
      return contests[index];
    }

    try {
      const updatedContest = await ApiService.updateContest(id, updates);
      const cached = JSON.parse(localStorage.getItem(CONTESTS_KEY) || '[]') as Contest[];
      const index = cached.findIndex(c => c.id === id);
      if (index !== -1) {
        cached[index] = updatedContest;
        localStorage.setItem(CONTESTS_KEY, JSON.stringify(cached));
      }
      return updatedContest;
    } catch (error) {
      console.error('Error updating contest via API, falling back to local storage:', error);
      const contests = await this.getContests();
      const index = contests.findIndex(c => c.id === id);
      if (index === -1) return null;
      contests[index] = { ...contests[index], ...updates, updatedAt: new Date() };
      localStorage.setItem(CONTESTS_KEY, JSON.stringify(contests));
      return contests[index];
    }
  }

  static async deleteContest(id: string): Promise<boolean> {
    if (this.isOfflineMode()) {
      const contests = await this.getContests();
      const filtered = contests.filter(c => c.id !== id);
      localStorage.setItem(CONTESTS_KEY, JSON.stringify(filtered));
      return true;
    }

    try {
      await ApiService.deleteContest(id);
      const cached = JSON.parse(localStorage.getItem(CONTESTS_KEY) || '[]') as Contest[];
      localStorage.setItem(CONTESTS_KEY, JSON.stringify(cached.filter(c => c.id !== id)));
      return true;
    } catch (error) {
      console.error('Error deleting contest via API, falling back to local storage:', error);
      const contests = await this.getContests();
      localStorage.setItem(CONTESTS_KEY, JSON.stringify(contests.filter(c => c.id !== id)));
      return true;
    }
  }

  static async saveContests(contests: Contest[]): Promise<void> {
    // Only used for bulk offline caching — individual ops use addContest/updateContest/deleteContest
    localStorage.setItem(CONTESTS_KEY, JSON.stringify(contests));
  }

  // Company Problems methods (for imported company problems that are not yet solved)
  static async getCompanyProblems(): Promise<Problem[]> {
    try {
      const companyProblems = localStorage.getItem(COMPANY_PROBLEMS_KEY);
      return companyProblems ? JSON.parse(companyProblems) : [];
    } catch (error) {
      console.error('Error parsing company problems from storage:', error);
      return [];
    }
  }

  static async saveCompanyProblems(companyProblems: Problem[]): Promise<void> {
    // Company problems are stored locally only (they're reference lists, not user progress)
    localStorage.setItem(COMPANY_PROBLEMS_KEY, JSON.stringify(companyProblems));
  }

  static async addCompanyProblem(problemData: Partial<Problem>): Promise<Problem> {
    const companyProblems = await this.getCompanyProblems();

    // Check if problem already exists (by URL)
    const existingProblem = companyProblems.find(p => p.url === problemData.url);
    if (existingProblem) {
      throw new Error('Problem already exists in company problems list');
    }

    const newProblem: Problem = {
      id: crypto.randomUUID(),
      platform: 'leetcode',
      title: problemData.title || '',
      problemId: problemData.problemId || '',
      difficulty: problemData.difficulty || '',
      url: problemData.url || '',
      dateSolved: '', // Empty = not solved
      createdAt: new Date().toISOString(),
      notes: problemData.notes || '',
      isReview: false,
      repetition: 0,
      interval: 0,
      nextReviewDate: null,
      topics: problemData.topics || [],
      status: 'active', // Not solved yet
      companies: problemData.companies || [],
      source: 'company' // Company problems are imported from company lists
    };

    const updatedProblems = [...companyProblems, newProblem];
    await this.saveCompanyProblems(updatedProblems);
    return newProblem;
  }

  static async addProblem(problemData: Omit<Problem, 'id' | 'createdAt'>): Promise<Problem> {
    if (this.isOfflineMode()) {
      // Only use localStorage in offline mode
      const problems = await this.getProblems();

      const newProblem: Problem = {
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        ...problemData,
        source: problemData.source || 'manual', // Preserve provided source, default to manual
      };

      problems.push(newProblem);
      await this.saveProblems(problems);

      return newProblem;
    }

    // When authenticated, always save to database
    const newProblem = await ApiService.createProblem(problemData);

    // Update local cache with the new problem from server
    const problems = JSON.parse(localStorage.getItem(PROBLEMS_KEY) || '[]') as Problem[];
    problems.push(newProblem);
    localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));

    return newProblem;
  }

  static async updateProblem(id: string, updates: Partial<Problem>): Promise<Problem | null> {
    if (this.isOfflineMode()) {
      const problems = await this.getProblems();
      const index = problems.findIndex(p => p.id === id);

      if (index === -1) {
        console.error('Problem not found:', id);
        return null;
      }

      problems[index] = { ...problems[index], ...updates };
      await this.saveProblems(problems);

      return problems[index];
    }

    try {
      const updatedProblem = await ApiService.updateProblem(id, updates);

      // Update local cache with the updated problem from server
      const problems = JSON.parse(localStorage.getItem(PROBLEMS_KEY) || '[]') as Problem[];
      const index = problems.findIndex(p => p.id === id);
      if (index !== -1) {
        problems[index] = updatedProblem;
        localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
      }

      return updatedProblem;
    } catch (error) {
      console.error('Error updating problem via API, falling back to local storage:', error);
      // Fallback to local storage
      const problems = await this.getProblems();
      const index = problems.findIndex(p => p.id === id);

      if (index === -1) {
        console.error('Problem not found:', id);
        return null;
      }

      problems[index] = { ...problems[index], ...updates };
      await this.saveProblems(problems);

      return problems[index];
    }
  }

  static async deleteProblem(id: string): Promise<boolean> {
    // First, check if it's a POTD problem (stored locally only)
    const potdProblems = await this.getPotdProblems();
    const isPotdProblem = potdProblems.some(p => p.id === id);
    
    if (isPotdProblem) {
      // Delete from POTD storage
      const filteredPotdProblems = potdProblems.filter(p => p.id !== id);
      await this.savePotdProblems(filteredPotdProblems);
      console.log('✅ Deleted POTD problem:', id);
      return true;
    }

    // Not a POTD problem, delete from main problems
    if (this.isOfflineMode()) {
      const problems = await this.getProblems();
      const filteredProblems = problems.filter(p => p.id !== id);

      if (filteredProblems.length === problems.length) {
        console.error('Problem not found for deletion:', id);
        return false;
      }

      await this.saveProblems(filteredProblems);
      return true;
    }

    try {
      await ApiService.deleteProblem(id);

      // Update local cache by removing the deleted problem
      const problems = JSON.parse(localStorage.getItem(PROBLEMS_KEY) || '[]') as Problem[];
      const filteredProblems = problems.filter(p => p.id !== id);
      localStorage.setItem(PROBLEMS_KEY, JSON.stringify(filteredProblems));

      return true;
    } catch (error) {
      console.error('Error deleting problem via API, falling back to local storage:', error);
      // Fallback to local storage
      const problems = await this.getProblems();
      const filteredProblems = problems.filter(p => p.id !== id);

      if (filteredProblems.length === problems.length) {
        console.error('Problem not found for deletion:', id);
        return false;
      }

      await this.saveProblems(filteredProblems);
      return true;
    }
  }

  static async deleteAllProblems(): Promise<number> {
    if (this.isOfflineMode()) {
      await this.saveProblems([]);
      return 0;
    }
    try {
      const deleted = await ApiService.deleteAllProblems();
      localStorage.removeItem(PROBLEMS_KEY);
      return deleted;
    } catch (error) {
      console.error('Error deleting all problems via API:', error);
      throw error;
    }
  }

  /**
   * One-time migration: push locally-stored problems (created before auth was set up,
   * or added while offline-mode was active) up to the server.
   *
   * Detection: client-generated IDs look like "1713456789123-a4b5c6d7e" (timestamp-random),
   * while MongoDB ObjectIds are 24-char hex strings. Any problem whose ID doesn't match
   * the MongoDB format was never persisted to the database.
   *
   * Company problems are intentionally local-only and are skipped.
   *
   * Returns the number of problems successfully migrated.
   */
  static async migrateLocalProblemsToServer(): Promise<number> {
    if (this.isOfflineMode()) return 0;

    try {
      const raw = localStorage.getItem(PROBLEMS_KEY);
      if (!raw) return 0;

      let localProblems: Problem[];
      try {
        localProblems = JSON.parse(raw);
      } catch {
        return 0;
      }

      if (!localProblems.length) return 0;

      // MongoDB ObjectIds are 24 lowercase hex chars
      const isMongoId = (id: string) => /^[a-f0-9]{24}$/i.test(id);

      const toMigrate = localProblems.filter(
        p => !isMongoId(p.id) && p.source !== 'company'
      );

      if (!toMigrate.length) return 0;

      let migrated = 0;
      for (const problem of toMigrate) {
        try {
          // Strip local ID/createdAt so the server assigns real MongoDB ones
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: _id, createdAt: _ca, ...data } = problem;
          await ApiService.createProblem(data as Parameters<typeof ApiService.createProblem>[0]);
          migrated++;
        } catch {
          // Skip duplicates (409), validation failures (400), etc.
        }
      }

      return migrated;
    } catch (error) {
      console.error('Migration error:', error);
      return 0;
    }
  }

  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  // Utility methods for offline/online mode
  static setOfflineMode(offline: boolean): void {
    localStorage.setItem(OFFLINE_MODE_KEY, offline.toString());
  }

  // Sync methods
  static async syncWithServer(): Promise<void> {
    if (this.isOfflineMode()) {
      console.log('Cannot sync in offline mode');
      return;
    }

    try {
      console.log('🔄 Starting full sync with server...');

      // Sync problems and contests
      await Promise.all([
        this.syncProblemsWithServer(),
        this.syncContestsWithServer()
      ]);

      console.log('✅ Full sync completed successfully');
    } catch (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    }
  }


  // Todo methods
  static async getTodos(): Promise<Todo[]> {
    if (this.isOfflineMode()) {
      try {
        const todos = localStorage.getItem(TODOS_KEY);
        return todos ? JSON.parse(todos) : [];
      } catch (error) {
        console.error('Error parsing todos from storage:', error);
        return [];
      }
    }

    try {
      const todos = await ApiService.getTodos();
      // Cache for offline use
      localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
      return todos;
    } catch (error) {
      console.error('Error fetching todos from API:', error);
      // Fallback to localStorage if API fails
      try {
        const todos = localStorage.getItem(TODOS_KEY);
        return todos ? JSON.parse(todos) : [];
      } catch (storageError) {
        console.error('Error parsing todos from storage:', storageError);
        return [];
      }
    }
  }

  static async saveTodos(todos: Todo[]): Promise<void> {
    try {
      localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos to storage:', error);
      throw error;
    }
  }

  static async addTodo(todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> {
    if (this.isOfflineMode()) {
      // Only use localStorage in offline mode
      const todos = await this.getTodos();

      const newTodo: Todo = {
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...todoData,
      };

      todos.push(newTodo);
      await this.saveTodos(todos);

      return newTodo;
    }

    // When authenticated, always save to database
    const newTodo = await ApiService.createTodo(todoData);

    // Update local cache with the new todo from server
    const todos = JSON.parse(localStorage.getItem(TODOS_KEY) || '[]') as Todo[];
    todos.push(newTodo);
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));

    return newTodo;
  }

  static async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
    if (this.isOfflineMode()) {
      const todos = await this.getTodos();
      const todoIndex = todos.findIndex(t => t.id === id);

      if (todoIndex === -1) {
        throw new Error('Todo not found');
      }

      const updatedTodo = {
        ...todos[todoIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      todos[todoIndex] = updatedTodo;
      await this.saveTodos(todos);

      return updatedTodo;
    }

    // When authenticated, update in database
    const updatedTodo = await ApiService.updateTodo(id, updates);

    // Update local cache
    const todos = JSON.parse(localStorage.getItem(TODOS_KEY) || '[]') as Todo[];
    const todoIndex = todos.findIndex(t => t.id === id);
    if (todoIndex !== -1) {
      todos[todoIndex] = updatedTodo;
      localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
    }

    return updatedTodo;
  }

  static async deleteTodo(id: string): Promise<void> {
    if (this.isOfflineMode()) {
      const todos = await this.getTodos();
      const filteredTodos = todos.filter(t => t.id !== id);
      await this.saveTodos(filteredTodos);
      return;
    }

    // When authenticated, delete from database
    await ApiService.deleteTodo(id);

    // Update local cache
    const todos = JSON.parse(localStorage.getItem(TODOS_KEY) || '[]') as Todo[];
    const filteredTodos = todos.filter(t => t.id !== id);
    localStorage.setItem(TODOS_KEY, JSON.stringify(filteredTodos));
  }

  private static async syncProblemsWithServer(): Promise<void> {
    try {
      const serverProblems = await ApiService.getProblems();
      localStorage.setItem(PROBLEMS_KEY, JSON.stringify(serverProblems));
    } catch (error) {
      console.error('Failed to sync problems with server:', error);
      throw error;
    }
  }

  private static async syncContestsWithServer(): Promise<void> {
    try {
      console.log('🔄 Syncing contests with server...');

      // Get server contests
      const serverContests = await ApiService.getContests();

      // Update local cache
      localStorage.setItem(CONTESTS_KEY, JSON.stringify(serverContests));

      console.log(`✅ Synced ${serverContests.length} contests from server`);

    } catch (error) {
      console.error('Failed to sync contests with server:', error);
      throw error;
    }
  }

  static clearAppData(): void {
    try {
      localStorage.removeItem(PROBLEMS_KEY);
      localStorage.removeItem(POTD_PROBLEMS_KEY);
      localStorage.removeItem(COMPANY_PROBLEMS_KEY);
      localStorage.removeItem(CONTESTS_KEY);
      localStorage.removeItem(TODOS_KEY);
    } catch (error) {
      console.error('Error clearing app data from localStorage:', error);
    }
  }
}

export default StorageService;
