'use client';

import { useState, useEffect } from 'react';
import type { Problem, Contest, ActiveDailyCodingChallengeQuestion, Todo } from '@/types';
import StorageService from '@/utils/storage';
import ApiService from '@/services/api';
import { generateId } from '@/utils/id';
import { cleanupInvalidDates } from '@/utils/dateMigration';
import { initializeSpacedRepetition } from '@/utils/spacedRepetition';
import { calculateNextReviewEnhanced } from '@/utils/enhancedSpacedRepetition';
import { getReviewIntervals } from '@/utils/settingsStorage';
import { isToday, isPast } from 'date-fns';
import { logger } from '@/utils/logger';

// Components
import Dashboard from '@/components/Dashboard';
import ProblemForm from '@/components/ProblemForm';
import ProblemList from '@/components/ProblemList';
import CompanyGroupedProblemList from '@/components/CompanyGroupedProblemList';
import CompanyDashboard from '@/components/CompanyDashboard';
import Analytics from '@/components/Analytics';
import AuthModal from '@/components/AuthModal';
import ContestTracker from '@/components/ContestTracker';
import TodoList from '@/components/TodoList';
import MonthlyPotdList from '@/components/MonthlyPotdList';
import ExternalResources from '@/components/ExternalResources';
import Guide from '@/components/Guide';
import { CommandMenu } from '@/components/CommandMenu';
import { EnhancedSettings } from '@/components/EnhancedSettings';
import ClientOnly from '@/components/client-only';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppLoadingScreen } from '@/components/ui/loading';

// UI Components
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/theme-provider';
import { toast } from 'sonner';

// Icons
import { 
  Plus, Moon, Sun, Settings as SettingsIcon, LogOut, User, Command,
  LayoutDashboard, ListTodo, Building2, Calendar, Trophy, RefreshCcw,
  CheckCircle, BookOpen, BarChart3, Compass, Library
} from 'lucide-react';

export default function HomePage() {
  // State
  const [problems, setProblems] = useState<Problem[]>([]);
  const [potdProblems, setPotdProblems] = useState<Problem[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [problemToEdit, setProblemToEdit] = useState<Problem | null>(null);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    logger.info('App initialization started');

    try {
      const hasAuthCookie = ApiService.isAuthenticated();
      
      if (!hasAuthCookie) {
        setIsAuthenticated(false);
        setShowAuthModal(true);
        setIsLoaded(true);
        return;
      }

      try {
        const userProfile = await ApiService.getProfile();
        setCurrentUser(userProfile);
        setIsAuthenticated(true);
        await loadUserData();
      } catch (error: any) {
        logger.error('Server verification failed', error);
        setIsAuthenticated(false);
        setCurrentUser(null);
        setShowAuthModal(true);
        ApiService.clearAuthState();
      }
    } catch (error) {
      logger.error('App initialization failed', error);
      setIsAuthenticated(false);
      setShowAuthModal(true);
    } finally {
      setIsLoaded(true);
      logger.info('App initialization completed');
    }
  };

  const loadUserData = async () => {
    try {
      const [problemsData, potdData, contestsData, todosData] = await Promise.all([
        StorageService.getProblems(),
        StorageService.getPotdProblems(),
        StorageService.getContests(),
        StorageService.getTodos()
      ]);

      const cleanedProblems = cleanupInvalidDates(problemsData);
      const cleanedPotdProblems = cleanupInvalidDates(potdData);

      setProblems(cleanedProblems);
      setPotdProblems(cleanedPotdProblems);
      setContests(contestsData);
      setTodos(todosData);

      // Auto POTD cleanup
      try {
        const cleanupResult = await StorageService.cleanupExpiredPotdProblems();
        if (cleanupResult.removedCount > 0) {
          const updatedPotdProblems = await StorageService.getPotdProblems();
          setPotdProblems(updatedPotdProblems);
          toast.info(`Cleaned up ${cleanupResult.removedCount} old POTD problems`);
        }
      } catch (error) {
        logger.error('POTD Auto-cleanup failed', error);
      }

      // Auto-sync
      if (!StorageService.getOfflineMode()) {
        StorageService.syncWithServer().catch(error => {
          logger.warn('Auto-sync failed', error);
        });
      }
    } catch (error) {
      logger.error('Failed to load user data', error);
      setProblems([]);
      setPotdProblems([]);
      setContests([]);
      setTodos([]);
    }
  };

  // Problem handlers
  const handleAddProblem = async (problem: Omit<Problem, 'id' | 'createdAt'>) => {
    try {
      if (!isAuthenticated) {
        toast.error('Please log in to add problems');
        setShowAuthModal(true);
        return;
      }
      const newProblem = await StorageService.addProblem(problem);
      setProblems(prev => [newProblem, ...prev]);
      toast.success('Problem added successfully!');
    } catch (error) {
      logger.error('Failed to add problem', error);
      toast.error('Failed to add problem');
    }
  };

  const handleUpdateProblem = async (id: string, updates: Partial<Problem>) => {
    try {
      let existingProblem = problems.find(p => p.id === id);
      let isPotdProblem = false;

      if (!existingProblem) {
        existingProblem = potdProblems.find(p => p.id === id);
        isPotdProblem = true;
      }

      if (!existingProblem) {
        toast.error('Problem not found');
        return;
      }

      const updatedProblem = { ...existingProblem, ...updates };
      await StorageService.updateProblem(id, updates);

      if (isPotdProblem) {
        setPotdProblems(prev => prev.map(p => p.id === id ? updatedProblem : p));
      } else {
        setProblems(prev => prev.map(p => p.id === id ? updatedProblem : p));
      }
      toast.success('Problem updated!');
    } catch (error) {
      logger.error('Failed to update problem', error);
      toast.error('Failed to update problem');
    }
  };

  const handleToggleReview = async (id: string, updates: Partial<Problem>) => {
    try {
      let problem = problems.find(p => p.id === id) || potdProblems.find(p => p.id === id);

      if (!problem) {
        toast.error('Problem not found');
        return;
      }

      let updatedProblem: Problem;

      if (updates.isReview && !problem.isReview) {
        updatedProblem = initializeSpacedRepetition({ ...problem, ...updates }, true);
        toast.success('Problem marked for review!');
      } else if (!updates.isReview && problem.isReview) {
        updatedProblem = {
          ...problem,
          ...updates,
          repetition: 0,
          interval: 0,
          nextReviewDate: null,
          isReview: false
        };
        toast.success('Problem unmarked from review');
      } else {
        updatedProblem = { ...problem, ...updates };
      }

      await handleUpdateProblem(problem.id, updatedProblem);

      const [updatedProblems, updatedPotdProblems] = await Promise.all([
        StorageService.getProblems(),
        StorageService.getPotdProblems()
      ]);
      setProblems(updatedProblems);
      setPotdProblems(updatedPotdProblems);
    } catch (error) {
      logger.error('Failed to toggle review', error);
      toast.error('Failed to update review status');
    }
  };

  const handleDeleteProblem = async (id: string) => {
    try {
      const isPotdProblem = potdProblems.some(p => p.id === id);
      await StorageService.deleteProblem(id);

      if (isPotdProblem) {
        const refreshed = await StorageService.getPotdProblems();
        setPotdProblems(refreshed);
      } else {
        const refreshed = await StorageService.getProblems();
        setProblems(refreshed);
      }
      toast.success('Problem deleted!');
    } catch (error) {
      logger.error('Failed to delete problem', error);
      toast.error('Failed to delete problem');
    }
  };

  const handleOpenForm = (problem?: Problem) => {
    setProblemToEdit(problem || null);
    setIsFormOpen(true);
  };

  const handleEditProblem = (problem: Problem) => {
    setProblemToEdit(problem);
    setIsFormOpen(true);
  };

  const handleProblemReviewed = async (
    id: string,
    quality: number = 4,
    notes?: string,
    timeTaken?: number,
    tags?: string[],
    customDays?: number,
    moveToLearned?: boolean
  ) => {
    try {
      let problem = problems.find(p => p.id === id) || potdProblems.find(p => p.id === id);

      if (!problem) {
        toast.error('Problem not found');
        return;
      }

      let updatedProblem;
      let intervalDays;

      if (moveToLearned) {
        updatedProblem = {
          ...problem,
          status: 'learned' as const,
          isReview: false,
          notes: notes ? (problem.notes ? `${problem.notes}\n\n---\n\n${notes}` : notes) : problem.notes,
          dateSolved: new Date().toISOString(),
          repetition: (problem.repetition || 0) + 1,
        };
        intervalDays = 0;
      } else if (customDays !== undefined) {
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + customDays);

        updatedProblem = {
          ...problem,
          interval: customDays,
          nextReviewDate: nextReviewDate.toISOString(),
          repetition: (problem.repetition || 0) + 1,
          isReview: true,
          notes: notes ? (problem.notes ? `${problem.notes}\n\n---\n\n${notes}` : notes) : problem.notes,
          dateSolved: new Date().toISOString()
        };
        intervalDays = customDays;
      } else {
        const customIntervals = getReviewIntervals();
        const enhancedData = calculateNextReviewEnhanced(problem, quality, customIntervals, timeTaken, notes, tags);

        updatedProblem = {
          ...problem,
          ...enhancedData,
          notes: notes ? (problem.notes ? `${problem.notes}\n\n---\n\n${notes}` : notes) : problem.notes,
          dateSolved: new Date().toISOString()
        };
        intervalDays = updatedProblem.interval;
      }

      await handleUpdateProblem(problem.id, updatedProblem);

      if (moveToLearned) {
        const [updatedProblems, updatedPotdProblems] = await Promise.all([
          StorageService.getProblems(),
          StorageService.getPotdProblems()
        ]);
        setProblems(updatedProblems);
        setPotdProblems(updatedPotdProblems);
        toast.success('Problem moved to Learned!');
      } else if (customDays !== undefined) {
        toast.success(`Next review in ${customDays} days`);
      } else {
        const qualityLabels = ['', 'Again', 'Hard', 'Good', 'Easy', 'Perfect'];
        toast.success(`${qualityLabels[quality]} review! Next in ${intervalDays} days`);
      }
    } catch (error) {
      logger.error('Failed to mark as reviewed', error);
      toast.error('Failed to mark as reviewed');
    }
  };

  // Contest handlers
  const handleAddContest = async (contest: Omit<Contest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newContest: Contest = {
        ...contest,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const updated = [...contests, newContest];
      setContests(updated);
      await StorageService.saveContests(updated);
      toast.success('Contest added!');
    } catch (error) {
      logger.error('Failed to add contest', error);
      toast.error('Failed to add contest');
    }
  };

  const handleUpdateContest = async (updatedContest: Contest) => {
    try {
      const updated = contests.map(c =>
        c.id === updatedContest.id ? { ...updatedContest, updatedAt: new Date() } : c
      );
      setContests(updated);
      await StorageService.saveContests(updated);
      toast.success('Contest updated!');
    } catch (error) {
      logger.error('Failed to update contest', error);
      toast.error('Failed to update contest');
    }
  };

  const handleDeleteContest = async (id: string) => {
    try {
      const updated = contests.filter(c => c.id !== id);
      setContests(updated);
      await StorageService.saveContests(updated);
      toast.success('Contest deleted!');
    } catch (error) {
      logger.error('Failed to delete contest', error);
      toast.error('Failed to delete contest');
    }
  };

  // Todo handlers
  const handleAddTodo = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTodo = await StorageService.addTodo(todoData);
      setTodos(prev => [...prev, newTodo]);
      toast.success('Todo added!');
    } catch (error) {
      logger.error('Failed to add todo', error);
      toast.error('Failed to add todo');
    }
  };

  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const updatedTodo = await StorageService.updateTodo(id, updates);
      setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
      toast.success('Todo updated!');
    } catch (error) {
      logger.error('Failed to update todo', error);
      toast.error('Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await StorageService.deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
      toast.success('Todo deleted!');
    } catch (error) {
      logger.error('Failed to delete todo', error);
      toast.error('Failed to delete todo');
    }
  };

  // POTD handlers
  const handleAddPotdProblem = (potd: ActiveDailyCodingChallengeQuestion) => {
    const isDuplicate = potdProblems.some(p => p.problemId === potd.question.titleSlug);
    if (isDuplicate) {
      toast.info('Problem already exists in POTD list');
      return;
    }

    const newProblem: Problem = {
      id: generateId(),
      platform: 'leetcode',
      title: potd.question.title,
      problemId: potd.question.titleSlug,
      difficulty: potd.question.difficulty,
      url: `https://leetcode.com${potd.link}`,
      dateSolved: '',
      createdAt: new Date().toISOString(),
      notes: '',
      isReview: false,
      repetition: 0,
      interval: 0,
      nextReviewDate: null,
      topics: potd.question.topicTags.map(t => t.name),
      status: 'active',
      companies: [],
      source: 'potd',
    };

    const updated = [...potdProblems, newProblem];
    setPotdProblems(updated);
    StorageService.savePotdProblems(updated);
    toast.success('POTD added!');
  };

  const handleAddDailyChallengeToPotd = async (dailyProblem: any) => {
    try {
      const isDuplicate = potdProblems.some(p => p.url === dailyProblem.url);
      if (isDuplicate) {
        toast.info('Daily challenge already exists');
        return;
      }

      const newProblem: Problem = {
        id: generateId(),
        platform: dailyProblem.platform,
        title: dailyProblem.title,
        problemId: dailyProblem.id,
        difficulty: dailyProblem.difficulty,
        url: dailyProblem.url,
        dateSolved: '',
        createdAt: new Date().toISOString(),
        notes: '',
        isReview: false,
        repetition: 0,
        interval: 0,
        nextReviewDate: null,
        topics: dailyProblem.topics || [],
        status: 'active',
        companies: [],
        source: 'potd',
      };

      const updated = [...potdProblems, newProblem];
      setPotdProblems(updated);
      await StorageService.savePotdProblems(updated);
      toast.success('Daily challenge added!');
    } catch (error) {
      logger.error('Failed to add daily challenge', error);
      throw error;
    }
  };

  const handleCleanupPotd = async () => {
    try {
      const result = await StorageService.cleanupExpiredPotdProblems();
      const updated = await StorageService.getPotdProblems();
      setPotdProblems(updated);

      if (result.removedCount > 0) {
        toast.success(`Cleaned up ${result.removedCount} old POTD problems`);
      } else {
        toast.info('No expired POTD problems found');
      }
    } catch (error) {
      logger.error('POTD cleanup failed', error);
      toast.error('Failed to cleanup POTD');
    }
  };

  const isPotdInProblems = (potdProblem: Problem) => {
    const inProblems = problems.some(p => p.url === potdProblem.url && p.status === 'active');
    const inLearned = problems.some(p => p.url === potdProblem.url && p.status === 'learned');
    let status = '';
    if (inProblems && inLearned) status = 'In Both';
    else if (inProblems) status = 'In Problems';
    else if (inLearned) status = 'In Learned';
    return { inProblems, inLearned, status };
  };

  const handleAddPotdToProblem = async (id: string, targetStatus: 'active' | 'learned' = 'active') => {
    try {
      const potdProblem = potdProblems.find(p => p.id === id);
      if (!potdProblem) {
        toast.error('POTD problem not found');
        return;
      }

      const existsWithStatus = problems.some(p => p.url === potdProblem.url && p.status === targetStatus);
      if (existsWithStatus) {
        toast.info(`Problem already exists in ${targetStatus === 'active' ? 'Problems' : 'Learned'}`);
        return;
      }

      const newProblem: Problem = {
        ...potdProblem,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        source: 'manual',
        status: targetStatus,
        dateSolved: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      await StorageService.addProblem(newProblem);
      const updated = [...problems, newProblem];
      setProblems(updated);
      await StorageService.saveProblems(updated);
      toast.success(`Problem added to ${targetStatus === 'active' ? 'Problems' : 'Learned'}!`);
    } catch (error) {
      logger.error('Failed to add POTD to problems', error);
      toast.error('Failed to add problem');
    }
  };

  const handleClearAllProblems = async () => {
    try {
      const problemsToClear = problems.filter(p => p.source === 'manual' || p.source === 'potd' || !p.source);
      if (problemsToClear.length === 0) {
        toast.info('No problems to clear');
        return;
      }

      for (const problem of problemsToClear) {
        try {
          await StorageService.deleteProblem(problem.id);
        } catch (error) {
          logger.warn(`Failed to delete problem ${problem.id}`, error);
        }
      }

      const remaining = problems.filter(p => p.source === 'company');
      setProblems(remaining);
      await StorageService.saveProblems(remaining);
      toast.success(`Cleared ${problemsToClear.length} problems!`);
    } catch (error) {
      logger.error('Failed to clear problems', error);
      toast.error('Failed to clear problems');
    }
  };

  const handleImportProblems = async (companyName: string, problemsToImport: any[]) => {
    try {
      const newProblems: Problem[] = [];
      const duplicates: string[] = [];

      for (const problem of problemsToImport) {
        const problemData = {
          platform: 'leetcode' as const,
          title: problem.title,
          problemId: problem.titleSlug || problem.title.toLowerCase().replace(/\s+/g, '-'),
          difficulty: problem.difficulty,
          url: problem.url || `https://leetcode.com/problems/${problem.titleSlug}/`,
          dateSolved: '',
          notes: `Imported from ${companyName}`,
          isReview: false,
          repetition: 0,
          interval: 0,
          nextReviewDate: null,
          topics: problem.topics || [],
          status: 'active' as const,
          companies: [companyName],
          source: 'company' as const,
        };

        try {
          const created = await StorageService.addProblem(problemData);
          newProblems.push(created);
        } catch (error: any) {
          if (error.message?.includes('already exists')) {
            duplicates.push(problem.title);
          }
        }
      }

      const refreshed = await StorageService.getProblems();
      setProblems(refreshed);

      if (newProblems.length > 0) {
        toast.success(`Imported ${newProblems.length} problems!`);
      } else if (duplicates.length > 0) {
        toast.info(`${duplicates.length} duplicates skipped`);
      }
    } catch (error) {
      logger.error('Failed to import problems', error);
      toast.error('Failed to import problems');
    }
  };

  // Computed values
  const manualProblems = problems.filter(p => p.source === 'manual' || p.source === 'potd' || !p.source);
  const activeProblems = manualProblems.filter(p => p.status === 'active');
  const allProblemsForReview = [...problems, ...potdProblems];
  const reviewProblems = allProblemsForReview.filter(p => p.isReview);
  const dueReviewProblems = reviewProblems.filter(p =>
    p.nextReviewDate && (isToday(new Date(p.nextReviewDate)) || isPast(new Date(p.nextReviewDate)))
  );
  const learnedProblems = [
    ...problems.filter(p => p.status === 'learned'),
    ...potdProblems.filter(p => p.status === 'learned')
  ];
  const companyProblems = problems.filter(p => p.source === 'company');

  // Loading state
  if (!isLoaded) {
    return <AppLoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen font-sans antialiased">
        {/* Command Menu */}
        <CommandMenu
          open={isCommandMenuOpen}
          onOpenChange={setIsCommandMenuOpen}
          onAddProblem={() => handleOpenForm()}
        />

        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
                  <div className="relative">
                    <img
                      src="/logo.png"
                      alt="LeetCode Tracker"
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold gradient-text-static">Tracker</h1>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Search Button - Desktop */}
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex w-64 justify-start text-muted-foreground"
                  onClick={() => setIsCommandMenuOpen(true)}
                >
                  <Command className="mr-2 h-4 w-4" />
                  <span>Search...</span>
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>

                {/* Search Button - Mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsCommandMenuOpen(true)}
                >
                  <Command className="h-5 w-5" />
                </Button>

                {/* Add Problem - Desktop */}
                {isAuthenticated && (
                  <Button
                    onClick={() => handleOpenForm()}
                    size="sm"
                    className="hidden lg:flex gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    New Problem
                  </Button>
                )}

                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="rounded-full"
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>

                {/* User Menu */}
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform">
                          <User className="h-4 w-4" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">Signed in as</p>
                        <p className="text-xs text-muted-foreground truncate">{currentUser?.email || 'User'}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setShowSettingsModal(true)}>
                        <SettingsIcon className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          try {
                            await ApiService.logout();
                            setIsAuthenticated(false);
                            setCurrentUser(null);
                            toast.success('Logged out successfully');
                          } catch (error) {
                            logger.error('Logout error', error);
                            toast.error('Logout failed');
                          }
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button onClick={() => setShowAuthModal(true)}>Login</Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <ClientOnly>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Tab Navigation */}
              <div className="overflow-x-auto pb-2 hide-scrollbar">
                <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-muted/50 p-1.5 text-muted-foreground">
                  <TabsTrigger value="dashboard" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="problems" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all gap-2">
                    <ListTodo className="h-4 w-4" />
                    <span className="hidden sm:inline">Problems</span>
                    {activeProblems.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{activeProblems.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="companies" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all gap-2">
                    <Building2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Companies</span>
                  </TabsTrigger>
                  <TabsTrigger value="potd" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">POTD</span>
                    {potdProblems.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{potdProblems.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="contests" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all gap-2">
                    <Trophy className="h-4 w-4" />
                    <span className="hidden sm:inline">Contests</span>
                  </TabsTrigger>
                  <TabsTrigger value="review" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    <span className="hidden sm:inline">Review</span>
                    {dueReviewProblems.length > 0 && (
                      <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">{dueReviewProblems.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="todos" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Tasks</span>
                  </TabsTrigger>
                  <TabsTrigger value="learned" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Learned</span>
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Analytics</span>
                  </TabsTrigger>
                  <TabsTrigger value="guide" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all gap-2">
                    <Compass className="h-4 w-4" />
                    <span className="hidden sm:inline">Guide</span>
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all gap-2">
                    <Library className="h-4 w-4" />
                    <span className="hidden sm:inline">Resources</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="animate-fade-in">
                <TabsContent value="dashboard" className="mt-0">
                  <ErrorBoundary>
                    <Dashboard
                      problems={manualProblems}
                      todos={todos}
                      onUpdateProblem={handleUpdateProblem}
                      onAddPotd={handleAddPotdProblem}
                      onImportProblems={handleImportProblems}
                      onCleanupPotd={handleCleanupPotd}
                      onAddDailyChallenge={handleAddDailyChallengeToPotd}
                    />
                  </ErrorBoundary>
                </TabsContent>

                <TabsContent value="problems" className="mt-0">
                  <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden">
                    <ErrorBoundary>
                      <ProblemList
                        problems={activeProblems}
                        onUpdateProblem={handleUpdateProblem}
                        onToggleReview={handleToggleReview}
                        onDeleteProblem={handleDeleteProblem}
                        onEditProblem={handleEditProblem}
                        onProblemReviewed={handleProblemReviewed}
                        onClearAll={handleClearAllProblems}
                        isReviewList={false}
                      />
                    </ErrorBoundary>
                  </div>
                </TabsContent>

                <TabsContent value="companies" className="mt-0 space-y-6">
                  <ErrorBoundary>
                    <CompanyDashboard problems={companyProblems} />
                    <CompanyGroupedProblemList
                      problems={companyProblems}
                      onUpdateProblem={handleUpdateProblem}
                      onToggleReview={handleToggleReview}
                      onDeleteProblem={handleDeleteProblem}
                      onEditProblem={handleEditProblem}
                      onProblemReviewed={handleProblemReviewed}
                      onImportProblems={handleImportProblems}
                      isReviewList={false}
                      title="Problems by Company"
                    />
                  </ErrorBoundary>
                </TabsContent>

                <TabsContent value="potd" className="mt-0">
                  <ErrorBoundary>
                    <MonthlyPotdList
                      problems={potdProblems}
                      onUpdateProblem={handleUpdateProblem}
                      onToggleReview={handleToggleReview}
                      onDeleteProblem={handleDeleteProblem}
                      onEditProblem={handleEditProblem}
                      onProblemReviewed={handleProblemReviewed}
                      onAddToProblem={handleAddPotdToProblem}
                      isPotdInProblems={isPotdInProblems}
                    />
                  </ErrorBoundary>
                </TabsContent>

                <TabsContent value="contests" className="mt-0">
                  <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden">
                    <ErrorBoundary>
                      <ContestTracker
                        contests={contests}
                        onAddContest={handleAddContest}
                        onUpdateContest={handleUpdateContest}
                        onDeleteContest={handleDeleteContest}
                      />
                    </ErrorBoundary>
                  </div>
                </TabsContent>

                <TabsContent value="review" className="mt-0">
                  <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden">
                    <ErrorBoundary>
                      <ProblemList
                        problems={reviewProblems}
                        onUpdateProblem={handleUpdateProblem}
                        onToggleReview={handleToggleReview}
                        onDeleteProblem={handleDeleteProblem}
                        onEditProblem={handleEditProblem}
                        onProblemReviewed={handleProblemReviewed}
                        isReviewList={true}
                      />
                    </ErrorBoundary>
                  </div>
                </TabsContent>

                <TabsContent value="todos" className="mt-0">
                  <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6">
                    <ErrorBoundary>
                      <TodoList
                        todos={todos}
                        onAddTodo={handleAddTodo}
                        onUpdateTodo={handleUpdateTodo}
                        onDeleteTodo={handleDeleteTodo}
                      />
                    </ErrorBoundary>
                  </div>
                </TabsContent>

                <TabsContent value="learned" className="mt-0">
                  <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden">
                    <ErrorBoundary>
                      <ProblemList
                        problems={learnedProblems}
                        onUpdateProblem={handleUpdateProblem}
                        onToggleReview={handleToggleReview}
                        onDeleteProblem={handleDeleteProblem}
                        onEditProblem={handleEditProblem}
                        onProblemReviewed={handleProblemReviewed}
                        isReviewList={false}
                      />
                    </ErrorBoundary>
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="mt-0">
                  <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden">
                    <ErrorBoundary>
                      <Analytics problems={manualProblems} />
                    </ErrorBoundary>
                  </div>
                </TabsContent>

                <TabsContent value="guide" className="mt-0">
                  <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6">
                    <ErrorBoundary>
                      <Guide />
                    </ErrorBoundary>
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="mt-0">
                  <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6">
                    <ErrorBoundary>
                      <ExternalResources />
                    </ErrorBoundary>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </ClientOnly>
        </main>

        {/* Modals */}
        {isFormOpen && (
          <ProblemForm
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            onAddProblem={handleAddProblem}
            onUpdateProblem={(id: string, updates: Partial<Problem>) => handleUpdateProblem(id, updates)}
            problemToEdit={problemToEdit}
          />
        )}

        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          onAuthSuccess={async () => {
            setIsAuthenticated(true);
            setTimeout(async () => {
              try {
                const userProfile = await ApiService.getProfile();
                setCurrentUser(userProfile);
                await loadUserData();
              } catch (error) {
                logger.error('Post-auth data loading failed', error);
                await initializeApp();
              }
            }, 1000);
          }}
        />

        <EnhancedSettings
          open={showSettingsModal}
          onOpenChange={setShowSettingsModal}
          onSettingsSave={(intervals) => {
            toast.success(`Review intervals updated: ${intervals.join(', ')} days`);
          }}
        />

        {/* Floating Action Button */}
        {isAuthenticated && (
          <Button
            onClick={() => handleOpenForm()}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl hover:shadow-2xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 z-50 lg:hidden"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}
      </div>
    </ErrorBoundary>
  );
}
