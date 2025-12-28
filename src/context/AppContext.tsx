'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { Problem, Contest, Todo, ActiveDailyCodingChallengeQuestion } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useProblems } from '@/hooks/useProblems';
import { useTodos } from '@/hooks/useTodos';
import { useContests } from '@/hooks/useContests';
import StorageService from '@/utils/storage';
import { logger } from '@/utils/logger';
import { isToday, isPast } from 'date-fns';

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  currentUser: any;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => Promise<void>;

  // Problems
  problems: Problem[];
  potdProblems: Problem[];
  isProblemsLoading: boolean;
  addProblem: (problem: Omit<Problem, 'id' | 'createdAt'>) => Promise<void>;
  updateProblem: (id: string, updates: Partial<Problem>) => Promise<void>;
  deleteProblem: (id: string) => Promise<void>;
  toggleReview: (id: string, updates: Partial<Problem>) => Promise<void>;
  markAsReviewed: (
    id: string,
    quality?: number,
    notes?: string,
    timeTaken?: number,
    tags?: string[],
    customDays?: number,
    moveToLearned?: boolean
  ) => Promise<void>;
  addPotdProblem: (potd: ActiveDailyCodingChallengeQuestion) => void;
  addDailyChallengeToPotd: (dailyProblem: any) => Promise<void>;
  addPotdToProblem: (id: string, targetStatus?: 'active' | 'learned') => Promise<void>;
  cleanupPotd: () => Promise<void>;
  clearAllProblems: () => Promise<void>;
  importProblems: (companyName: string, problemsToImport: any[]) => Promise<void>;
  isPotdInProblems: (potdProblem: Problem) => { inProblems: boolean; inLearned: boolean; status: string };

  // Todos
  todos: Todo[];
  isTodosLoading: boolean;
  todoStats: { total: number; completed: number; pending: number; inProgress: number; overdue: number; urgent: number };
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;

  // Contests
  contests: Contest[];
  isContestsLoading: boolean;
  addContest: (contest: Omit<Contest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContest: (contest: Contest) => Promise<void>;
  deleteContest: (id: string) => Promise<void>;

  // Computed
  manualProblems: Problem[];
  activeProblems: Problem[];
  reviewProblems: Problem[];
  dueReviewProblems: Problem[];
  learnedProblems: Problem[];
  companyProblems: Problem[];

  // App state
  isAppLoaded: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAppLoaded, setIsAppLoaded] = useState(false);

  // Use custom hooks
  const auth = useAuth();
  const problemsHook = useProblems(auth.isAuthenticated);
  const todosHook = useTodos();
  const contestsHook = useContests();

  // Load all data when authenticated
  const loadAllData = useCallback(async () => {
    if (!auth.isAuthenticated) return;

    logger.info('Loading all user data...');
    await Promise.all([
      problemsHook.loadProblems(),
      todosHook.loadTodos(),
      contestsHook.loadContests(),
    ]);

    // Auto-sync if online
    if (!StorageService.getOfflineMode()) {
      StorageService.syncWithServer().catch(error => {
        logger.warn('Auto-sync failed', error);
      });
    }

    logger.info('All data loaded');
  }, [auth.isAuthenticated, problemsHook, todosHook, contestsHook]);

  // Initialize app
  useEffect(() => {
    const init = async () => {
      if (!auth.isLoading && auth.isAuthenticated) {
        await loadAllData();
      }
      setIsAppLoaded(!auth.isLoading);
    };
    init();
  }, [auth.isLoading, auth.isAuthenticated, loadAllData]);

  // Computed values
  const allProblemsForReview = [...problemsHook.problems, ...problemsHook.potdProblems];
  
  const manualProblems = problemsHook.problems.filter(p => 
    p.source === 'manual' || p.source === 'potd' || !p.source
  );
  
  const activeProblems = manualProblems.filter(p => p.status === 'active');
  
  const reviewProblems = allProblemsForReview.filter(p => p.isReview);
  
  const dueReviewProblems = reviewProblems.filter(p =>
    p.nextReviewDate &&
    (isToday(new Date(p.nextReviewDate)) || isPast(new Date(p.nextReviewDate)))
  );
  
  const learnedProblems = [
    ...problemsHook.problems.filter(p => p.status === 'learned'),
    ...problemsHook.potdProblems.filter(p => p.status === 'learned')
  ];
  
  const companyProblems = problemsHook.problems.filter(p => p.source === 'company');

  const refreshData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  const value: AppContextType = {
    // Auth
    isAuthenticated: auth.isAuthenticated,
    isAuthLoading: auth.isLoading,
    currentUser: auth.currentUser,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,

    // Problems
    problems: problemsHook.problems,
    potdProblems: problemsHook.potdProblems,
    isProblemsLoading: problemsHook.isLoading,
    addProblem: problemsHook.addProblem,
    updateProblem: problemsHook.updateProblem,
    deleteProblem: problemsHook.deleteProblem,
    toggleReview: problemsHook.toggleReview,
    markAsReviewed: problemsHook.markAsReviewed,
    addPotdProblem: problemsHook.addPotdProblem,
    addDailyChallengeToPotd: problemsHook.addDailyChallengeToPotd,
    addPotdToProblem: problemsHook.addPotdToProblem,
    cleanupPotd: problemsHook.cleanupPotd,
    clearAllProblems: problemsHook.clearAllProblems,
    importProblems: problemsHook.importProblems,
    isPotdInProblems: problemsHook.isPotdInProblems,

    // Todos
    todos: todosHook.todos,
    isTodosLoading: todosHook.isLoading,
    todoStats: todosHook.stats,
    addTodo: todosHook.addTodo,
    updateTodo: todosHook.updateTodo,
    deleteTodo: todosHook.deleteTodo,

    // Contests
    contests: contestsHook.contests,
    isContestsLoading: contestsHook.isLoading,
    addContest: contestsHook.addContest,
    updateContest: contestsHook.updateContest,
    deleteContest: contestsHook.deleteContest,

    // Computed
    manualProblems,
    activeProblems,
    reviewProblems,
    dueReviewProblems,
    learnedProblems,
    companyProblems,

    // App state
    isAppLoaded,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
