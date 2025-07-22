'use client';

import { useState, useEffect } from 'react';
import type { Problem, Contest, ActiveDailyCodingChallengeQuestion, Todo } from '@/types';
import StorageService from '@/utils/storage';
import ApiService from '@/services/api';
import { generateId } from '@/utils/id';
import { cleanupInvalidDates } from '@/utils/dateMigration';
import { isCleanupNeeded } from '@/utils/potdCleanup';
import { markAsReviewed, initializeSpacedRepetition } from '@/utils/spacedRepetition';
import { isToday, isPast } from 'date-fns';
import Dashboard from '@/components/Dashboard';
import ProblemForm from '@/components/ProblemForm';
import ProblemList from '@/components/ProblemList';
import CompanyGroupedProblemList from '@/components/CompanyGroupedProblemList';
import CompanyDashboard from '@/components/CompanyDashboard';
import Analytics from '@/components/Analytics';
import AuthModal from '@/components/AuthModal';
import { Home as HomeIcon, Plus, List, BarChart3, Moon, Sun, Star, Settings as SettingsIcon, Archive as LearnedIcon, History, Trophy, Building2, LogOut, User, FileText, CheckSquare, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/components/theme-provider';
import { Settings as SettingsComponent } from '@/components/Settings';
import { toast } from 'sonner';
import ContestTracker from '@/components/ContestTracker';
import { Badge } from '@/components/ui/badge';
import CompanyView from '@/components/CompanyView';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Sheets from '@/components/Sheets';
import ClientOnly from '@/components/client-only';
import TodoList from '@/components/TodoList';
import StudyHub from '@/components/StudyHub';

export default function HomePage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [potdProblems, setPotdProblems] = useState<Problem[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [problemToEdit, setProblemToEdit] = useState<Problem | null>(null);
  const [activePlatform, setActivePlatform] = useState('leetcode');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load data after successful authentication (doesn't change auth state)
  const loadDataAfterAuth = async (maxRetries = 5) => {
    console.log('🔄 Loading data after authentication...');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📊 Data loading attempt ${attempt}/${maxRetries}`);

        // Load all data without checking auth status (we know user is authenticated)
        let problemsData: Problem[] = [];
        let potdData: Problem[] = [];
        let contestsData: Contest[] = [];
        let todosData: Todo[] = [];

        try {
          [problemsData, potdData, contestsData, todosData] = await Promise.all([
            StorageService.getProblems(),
            StorageService.getPotdProblems(),
            StorageService.getContests(),
            StorageService.getTodos()
          ]);

          console.log('✅ Post-auth data loaded successfully:', {
            problems: problemsData.length,
            potd: potdData.length,
            contests: contestsData.length,
            todos: todosData.length
          });

        } catch (error) {
          console.error('❌ Error loading post-auth data:', error);

          // If it's an auth error and we have more retries, continue
          if (error instanceof Error && error.message.includes('Access token required') && attempt < maxRetries) {
            console.log(`⏳ Access token error, retrying in ${attempt * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            continue;
          }

          // Use empty arrays as fallback
          problemsData = [];
          potdData = [];
          contestsData = [];
          todosData = [];
        }

        // Set the data
        setProblems(problemsData);
        setPotdProblems(potdData);
        setContests(contestsData);
        setTodos(todosData);
        setIsLoaded(true);

        console.log('🎉 Post-auth data loading completed successfully');
        return; // Success, exit retry loop

      } catch (error) {
        console.error(`❌ Post-auth data load attempt ${attempt} failed:`, error);

        if (attempt === maxRetries) {
          console.error('💥 All post-auth retry attempts failed');
          // Set empty data as fallback
          setProblems([]);
          setPotdProblems([]);
          setContests([]);
          setTodos([]);
          setIsLoaded(true);
        } else {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }
  };

  // Load data with retry logic for post-authentication scenarios
  const loadDataWithRetry = async (maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Loading data attempt ${attempt}/${maxRetries}`);

        // Check authentication status with retry
        const authenticated = await ApiService.checkAuthStatusWithRetry(3, 200);
        console.log('🔐 Authentication status:', authenticated);

        // Don't set authentication to false during post-login retry attempts
        // Only set to true if authenticated, or false on final attempt
        if (authenticated) {
          setIsAuthenticated(true);
        } else if (attempt === maxRetries) {
          console.log('❌ Authentication failed after all retries');
          setIsAuthenticated(false);
          setShowAuthModal(true);
          return;
        }

        if (authenticated) {
          try {
            // Get user profile first
            console.log('👤 Fetching user profile...');
            const userProfile = await ApiService.getProfile();
            setCurrentUser(userProfile);
            console.log('✅ User profile loaded:', userProfile.email);
          } catch (error: any) {
            console.error('❌ Failed to get user profile:', error);

            if (error.message === 'User not found' || error.status === 404) {
              console.log('🧹 User not found, clearing auth state');
              setIsAuthenticated(false);
              setCurrentUser(null);
              ApiService.clearAuthState();
              return;
            }

            // If it's an auth error and we have more retries, continue
            if (error.status === 401 && attempt < maxRetries) {
              console.log(`⏳ Auth error, retrying in ${attempt * 200}ms...`);
              await new Promise(resolve => setTimeout(resolve, attempt * 200));
              continue;
            }
          }
        }

        // Load all data
        console.log('📊 Loading application data...');
        let problemsData: Problem[] = [];
        let potdData: Problem[] = [];
        let contestsData: Contest[] = [];
        let todosData: Todo[] = [];

        try {
          [problemsData, potdData, contestsData, todosData] = await Promise.all([
            StorageService.getProblems(),
            StorageService.getPotdProblems(),
            StorageService.getContests(),
            StorageService.getTodos()
          ]);

          console.log('✅ Data loaded successfully:', {
            problems: problemsData.length,
            potd: potdData.length,
            contests: contestsData.length,
            todos: todosData.length
          });

        } catch (error) {
          console.error('❌ Error loading data:', error);

          // If it's an auth error and we have more retries, continue
          if (error instanceof Error && error.message.includes('Access token required') && attempt < maxRetries) {
            console.log(`⏳ Access token error, retrying in ${attempt * 500}ms...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 500));
            continue;
          }

          // If it's an auth error on final attempt, show login modal
          if (error instanceof Error && error.message.includes('Access token required') && attempt === maxRetries) {
            console.log('❌ Authentication failed after all retries, showing login modal');
            setIsAuthenticated(false);
            setShowAuthModal(true);
            return;
          }

          // For other errors or final attempt, use empty arrays
          problemsData = [];
          potdData = [];
          contestsData = [];
          todosData = [];
        }

        // Set the data
        setProblems(problemsData);
        setPotdProblems(potdData);
        setContests(contestsData);
        setTodos(todosData);
        setIsLoaded(true);

        console.log('🎉 Data loading completed successfully');
        return; // Success, exit retry loop

      } catch (error) {
        console.error(`❌ Load data attempt ${attempt} failed:`, error);

        if (attempt === maxRetries) {
          console.error('💥 All retry attempts failed');
          // Set empty data as fallback
          setProblems([]);
          setPotdProblems([]);
          setContests([]);
          setTodos([]);
          setIsLoaded(true);
        } else {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, attempt * 500));
        }
      }
    }
  };

  const loadData = async () => {
    try {
      // Check authentication status more reliably
      const authenticated = await ApiService.checkAuthStatus();
      setIsAuthenticated(authenticated);

      // If authenticated, try to get user profile
      if (authenticated) {
        try {
          const userProfile = await ApiService.getProfile();
          setCurrentUser(userProfile);
        } catch (error: any) {
          console.error('Failed to get user profile:', error);

          // If user not found, clear auth state and set as unauthenticated
          if (error.message === 'User not found' || error.status === 404) {
            console.log('User profile not found, clearing authentication state');
            setIsAuthenticated(false);
            setCurrentUser(null);
            ApiService.clearAuthState();
            return; // Exit early if user not found
          }
        }
      }

      // Load data (will use API if authenticated, localStorage if offline)
      let problemsData: Problem[] = [];
      let potdData: Problem[] = [];
      let contestsData: Contest[] = [];
      let todosData: Todo[] = [];

      try {
        [problemsData, potdData, contestsData, todosData] = await Promise.all([
          StorageService.getProblems(),
          StorageService.getPotdProblems(),
          StorageService.getContests(),
          StorageService.getTodos()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        // If API calls fail due to authentication, show login modal
        if (error instanceof Error && error.message.includes('Access token required')) {
          setIsAuthenticated(false);
          setShowAuthModal(true);
          toast.error('Please log in to access your data');
        }
        // Use empty arrays as fallback
        problemsData = [];
        potdData = [];
        contestsData = [];
        todosData = [];
      }

      // Clean up any invalid dates before setting state
      const cleanedProblems = cleanupInvalidDates(problemsData);
      const cleanedPotdProblems = cleanupInvalidDates(potdData);

      setProblems(cleanedProblems);
      setPotdProblems(cleanedPotdProblems);
      setContests(contestsData);
      setTodos(todosData);

      // Save cleaned data back if any changes were made
      if (JSON.stringify(cleanedProblems) !== JSON.stringify(problemsData)) {
        console.log('Cleaned up invalid dates in problems data');
        StorageService.saveProblems(cleanedProblems);
      }
      if (JSON.stringify(cleanedPotdProblems) !== JSON.stringify(potdData)) {
        console.log('Cleaned up invalid dates in POTD data');
        StorageService.savePotdProblems(cleanedPotdProblems);
      }

      // Automatic POTD cleanup - remove expired POTD problems
      try {
        const cleanupResult = await StorageService.cleanupExpiredPotdProblems();
        if (cleanupResult.removedCount > 0) {
          console.log('🧹 POTD Auto-cleanup:', cleanupResult.summary);
          // Reload POTD problems after cleanup
          const updatedPotdProblems = await StorageService.getPotdProblems();
          setPotdProblems(updatedPotdProblems);
          toast.info(`Cleaned up ${cleanupResult.removedCount} expired POTD problem${cleanupResult.removedCount === 1 ? '' : 's'}`);
        }
      } catch (error) {
        console.error('🧹 POTD Auto-cleanup failed:', error);
      }

      // Auto-sync with server if authenticated and online
      if (authenticated && !StorageService.getOfflineMode()) {
        StorageService.syncWithServer().catch(error => {
          console.warn('Auto-sync failed:', error);
        });
      }

      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
      setIsLoaded(true);
    }
  };

  const handleAddProblem = async (problem: Omit<Problem, 'id' | 'createdAt'>) => {
    try {
      if (!isAuthenticated) {
        toast.error('Please log in to add problems');
        setShowAuthModal(true);
        return;
      }

      // Create the problem via API (which handles user association)
      const newProblem = await StorageService.addProblem(problem);

      // Add to local state immediately for better UX
      setProblems(prevProblems => [newProblem, ...prevProblems]);

      toast.success('Problem added successfully!');
    } catch (error) {
      console.error('Failed to add problem:', error);
      if (error instanceof Error && error.message.includes('Access token required')) {
        setIsAuthenticated(false);
        setShowAuthModal(true);
        toast.error('Please log in to add problems');
      } else {
        toast.error('Failed to add problem. Please try again.');
      }
    }
  };
  const handleUpdateProblem = async (id: string, updates: Partial<Problem>) => {
    try {
      // Find the existing problem
      const existingProblem = problems.find(p => p.id === id);
      if (!existingProblem) {
        toast.error('Problem not found');
        return;
      }

      // Create the updated problem
      const updatedProblem = { ...existingProblem, ...updates };

      // Use the API to update the problem (which handles user association)
      await StorageService.updateProblem(id, updates);

      // Update local state
      setProblems(problems.map(p => p.id === id ? updatedProblem : p));

      toast.success('Problem updated successfully!');
    } catch (error) {
      console.error('Failed to update problem:', error);
      toast.error('Failed to update problem');
    }
  };

  const handleToggleReview = async (id: string, updates: Partial<Problem>) => {
    try {
      const problem = problems.find(p => p.id === id);
      if (!problem) return;

      let updatedProblem: Problem;

      if (updates.isReview && !problem.isReview) {
        // Starting review cycle - initialize spaced repetition
        updatedProblem = initializeSpacedRepetition({ ...problem, ...updates }, true);
        toast.success('Problem marked for review! First review scheduled.');
      } else if (!updates.isReview && problem.isReview) {
        // Stopping review cycle - reset spaced repetition
        updatedProblem = {
          ...problem,
          ...updates,
          repetition: 0,
          interval: 0,
          nextReviewDate: null,
          isReview: false
        };
        toast.success('Problem unmarked from review.');
      } else {
        // Regular update
        updatedProblem = { ...problem, ...updates };
      }

      await handleUpdateProblem(problem.id, updates);
    } catch (error) {
      console.error('Failed to toggle review:', error);
      toast.error('Failed to update review status');
    }
  };

  const handleDeleteProblem = async (id: string) => {
    try {
      // Use the API to delete the problem (which handles user association)
      await StorageService.deleteProblem(id);

      // Refresh the problems list from the server to get the latest data
      const refreshedProblems = await StorageService.getProblems();
      setProblems(refreshedProblems);

      toast.success('Problem deleted successfully!');
    } catch (error) {
      console.error('Failed to delete problem:', error);
      toast.error('Failed to delete problem');
    }
  };

  const handleOpenForm = (problem?: Problem) => {
    setProblemToEdit(problem || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setProblemToEdit(null);
  };

  const handleEditProblem = (problem: Problem) => {
    setProblemToEdit(problem);
    setIsFormOpen(true);
  };

  const handleProblemReviewed = async (id: string, quality: number = 4) => {
    try {
      const problem = problems.find(p => p.id === id);
      if (!problem) return;

      // Use the proper spaced repetition algorithm
      const updatedProblem = markAsReviewed(problem, quality);

      await handleUpdateProblem(problem.id, updatedProblem);
      toast.success(`Problem marked as reviewed! Next review in ${updatedProblem.interval} days.`);
    } catch (error) {
      console.error('Failed to mark problem as reviewed:', error);
      toast.error('Failed to mark problem as reviewed');
    }
  };

  const handleAddContest = async (contest: Omit<Contest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newContest: Contest = {
        ...contest,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const updatedContests = [...contests, newContest];
      setContests(updatedContests);
      await StorageService.saveContests(updatedContests);

      toast.success('Contest added successfully!');
    } catch (error) {
      console.error('Failed to add contest:', error);
      toast.error('Failed to add contest');
    }
  };

  const handleUpdateContest = async (updatedContest: Contest) => {
    try {
      const updatedContests = contests.map(c =>
        c.id === updatedContest.id ? { ...updatedContest, updatedAt: new Date() } : c
      );
      setContests(updatedContests);
      await StorageService.saveContests(updatedContests);

      toast.success('Contest updated successfully!');
    } catch (error) {
      console.error('Failed to update contest:', error);
      toast.error('Failed to update contest');
    }
  };

  const handleDeleteContest = async (id: string) => {
    try {
      const updatedContests = contests.filter(c => c.id !== id);
      setContests(updatedContests);
      await StorageService.saveContests(updatedContests);

      toast.success('Contest deleted successfully!');
    } catch (error) {
      console.error('Failed to delete contest:', error);
      toast.error('Failed to delete contest');
    }
  };

  // Todo handlers
  const handleAddTodo = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTodo = await StorageService.addTodo(todoData);
      setTodos([...todos, newTodo]);
      toast.success('Todo added successfully!');
    } catch (error) {
      console.error('Failed to add todo:', error);
      toast.error('Failed to add todo');
    }
  };

  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const updatedTodo = await StorageService.updateTodo(id, updates);
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
      toast.success('Todo updated successfully!');
    } catch (error) {
      console.error('Failed to update todo:', error);
      toast.error('Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await StorageService.deleteTodo(id);
      setTodos(todos.filter(t => t.id !== id));
      toast.success('Todo deleted successfully!');
    } catch (error) {
      console.error('Failed to delete todo:', error);
      toast.error('Failed to delete todo');
    }
  };

  const handleClearAllProblems = async () => {
    try {
      // Get manual and POTD problems to clear (exclude company problems)
      const problemsToClear = problems.filter(p => p.source === 'manual' || p.source === 'potd' || !p.source);

      if (problemsToClear.length === 0) {
        toast.info('No problems to clear');
        return;
      }

      // Delete each problem individually to ensure proper cleanup
      for (const problem of problemsToClear) {
        try {
          if (!StorageService.getOfflineMode()) {
            await ApiService.deleteProblem(problem.id);
          }
        } catch (error) {
          console.warn(`Failed to delete problem ${problem.id} from server:`, error);
        }
      }

      // Update local state - keep only company problems
      const remainingProblems = problems.filter(p => p.source === 'company');
      setProblems(remainingProblems);

      // Update localStorage
      await StorageService.saveProblems(remainingProblems);

      toast.success(`Successfully cleared ${problemsToClear.length} problems!`);
    } catch (error) {
      console.error('Failed to clear problems:', error);
      toast.error('Failed to clear problems');
    }
  };

  const handleAddPotdProblem = (potd: ActiveDailyCodingChallengeQuestion) => {
    const isDuplicate = potdProblems.some(p => p.problemId === potd.question.titleSlug);
    if (isDuplicate) {
      toast.info('Problem of the day already exists in your POTD list.');
      return;
    }

    const newProblem: Problem = {
      id: generateId(),
      platform: 'leetcode',
      title: potd.question.title,
      problemId: potd.question.titleSlug,
      difficulty: potd.question.difficulty,
      url: `https://leetcode.com${potd.link}`,
      dateSolved: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      notes: '',
      isReview: false,
      repetition: 0,
      interval: 0,
      nextReviewDate: null,
      topics: potd.question.topicTags.map(t => t.name),
      status: 'active',
      companies: [],
      source: 'potd', // Mark as Problem of the Day
    };

    const updatedPotdProblems = [...potdProblems, newProblem];
    setPotdProblems(updatedPotdProblems);
    StorageService.savePotdProblems(updatedPotdProblems);
    toast.success('Problem of the day added to your list!');
  };

  const handleCleanupPotd = async () => {
    try {
      const cleanupResult = await StorageService.cleanupExpiredPotdProblems();
      if (cleanupResult.removedCount > 0) {
        // Reload POTD problems after cleanup
        const updatedPotdProblems = await StorageService.getPotdProblems();
        setPotdProblems(updatedPotdProblems);
        toast.success(`Cleaned up ${cleanupResult.removedCount} expired POTD problem${cleanupResult.removedCount === 1 ? '' : 's'}`);
      } else {
        toast.info('No expired POTD problems found');
      }
    } catch (error) {
      console.error('POTD cleanup failed:', error);
      toast.error('Failed to cleanup POTD problems');
    }
  };

  const handleImportProblems = async (companyName: string, problemsToImport: any[]) => {
    try {
      const newProblems: Problem[] = [];
      const duplicateProblems: string[] = [];
      const failedProblems: string[] = [];

      console.log(`Starting import of ${problemsToImport.length} problems from ${companyName}`);

      // Create problems one by one using the API (which handles user association)
      for (const problem of problemsToImport) {
        const problemData = {
          platform: 'leetcode' as const,
          title: problem.title,
          problemId: problem.titleSlug || problem.title.toLowerCase().replace(/\s+/g, '-'),
          difficulty: problem.difficulty,
          url: problem.url || `https://leetcode.com/problems/${problem.titleSlug || problem.title.toLowerCase().replace(/\s+/g, '-')}/`,
          dateSolved: '', // Empty = not solved yet
          notes: `Imported from ${companyName} problems`,
          isReview: false,
          repetition: 0,
          interval: 0,
          nextReviewDate: null,
          topics: problem.topics || [],
          status: 'active' as const,
          companies: [companyName],
          source: 'company' as const, // Mark as company-imported problem
        };

        try {
          const createdProblem = await StorageService.addProblem(problemData);
          newProblems.push(createdProblem);
          console.log(`✅ Imported: ${problem.title} with source: ${createdProblem.source}`);
        } catch (error: any) {
          console.warn(`Failed to import problem: ${problem.title}`, error);

          // Check if it's a duplicate error (409 status or "already exists" message)
          const isDuplicate = error.message && (
            error.message.includes('already exists') ||
            error.message.includes('HTTP error! status: 409') ||
            error.status === 409
          );

          if (isDuplicate) {
            duplicateProblems.push(problem.title);
            console.log(`🔄 Duplicate detected: ${problem.title}`);
          } else {
            failedProblems.push(problem.title);
            console.error(`❌ Failed to import: ${problem.title}`, error);
          }
        }
      }

      // Refresh the problems list from the server to get the latest data
      const refreshedProblems = await StorageService.getProblems();
      setProblems(refreshedProblems);

      // Provide detailed feedback
      let message = '';
      if (newProblems.length > 0) {
        message += `Successfully imported ${newProblems.length} new problems from ${companyName}!`;
      }
      if (duplicateProblems.length > 0) {
        message += ` ${duplicateProblems.length} problems were already imported.`;
      }
      if (failedProblems.length > 0) {
        message += ` ${failedProblems.length} problems failed to import.`;
      }

      if (newProblems.length > 0) {
        message += ' Check the Companies tab to see them organized.';
        toast.success(message);
      } else if (duplicateProblems.length > 0) {
        toast.info(message);
      } else {
        toast.error(message || 'No problems were imported.');
      }

      console.log(`Import completed: ${newProblems.length} new, ${duplicateProblems.length} duplicates, ${failedProblems.length} failed`);
    } catch (error) {
      console.error('Failed to import problems:', error);
      toast.error('Failed to import problems');
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your data...</p>
        </div>
      </div>
    );
  }

  // Filter problems based on source for proper separation
  // Manual problems (for Problems tab) - exclude company-imported problems
  const manualProblems = problems.filter(p => p.source === 'manual' || p.source === 'potd' || !p.source); // Include legacy problems without source
  const activeProblems = manualProblems.filter(p => p.status === 'active');
  const reviewProblems = manualProblems.filter(p =>
    p.isReview &&
    p.nextReviewDate &&
    (isToday(new Date(p.nextReviewDate)) || isPast(new Date(p.nextReviewDate)))
  );
  const learnedProblems = manualProblems.filter(p => p.status === 'learned');

  // Company problems (for Companies tab) - only company-imported problems
  const companyProblems = problems.filter(p => p.source === 'company');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 font-sans antialiased">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm sm:text-lg">LC</span>
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LeetCode Tracker
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Master coding problems</p>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              {isAuthenticated && (
                <div className="hidden md:flex items-center space-x-2 mr-2 sm:mr-4">
                  <div className="flex items-center space-x-1 px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">Online</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenForm()}
                    className="hidden lg:flex"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Problem
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
              >
                {theme === 'light' ? <Moon className="h-4 w-4 sm:h-5 sm:w-5" /> : <Sun className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">Welcome back!</p>
                      <p className="text-xs text-muted-foreground">Manage your account</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowAuthModal(true)}>
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      try {
                        await ApiService.logout();
                        setIsAuthenticated(false);
                        setCurrentUser(null);
                        toast.success('Logged out successfully');
                        // Reload data to clear user-specific content
                        loadData();
                      } catch (error) {
                        console.error('Logout error:', error);
                        toast.error('Logout failed');
                      }
                    }}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setShowAuthModal(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <ClientOnly>
          <Tabs defaultValue="dashboard" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Problem Tracker
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Track your coding journey across LeetCode, CodeForces & more
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {isAuthenticated && (
                <Button
                  onClick={() => handleOpenForm()}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 md:hidden"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Problem
                </Button>
              )}
            </div>
          </div>

          <div className="border-b overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-10 h-auto p-1 bg-muted/50 min-w-max sm:min-w-full">
              <TabsTrigger value="dashboard" className="flex-col h-14 sm:h-16 lg:h-10 lg:flex-row px-2 sm:px-3">
                <HomeIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:mr-2" />
                <span className="text-xs lg:text-sm mt-1 lg:mt-0">Dashboard</span>
              </TabsTrigger>

              <TabsTrigger value="companies" className="flex-col h-14 sm:h-16 lg:h-10 lg:flex-row px-2 sm:px-3">
                <Building2 className="h-3 w-3 sm:h-4 sm:w-4 lg:mr-2" />
                <span className="text-xs lg:text-sm mt-1 lg:mt-0">Companies</span>
              </TabsTrigger>

              <TabsTrigger value="potd" className="flex-col h-14 sm:h-16 lg:h-10 lg:flex-row relative px-2 sm:px-3">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 lg:mr-2 text-yellow-500" />
                <span className="text-xs lg:text-sm mt-1 lg:mt-0">POTD</span>
                {potdProblems.length > 0 && (
                  <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs lg:static lg:ml-2 lg:h-auto lg:w-auto lg:p-1">
                    {potdProblems.length}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger value="contests" className="hidden sm:flex flex-col h-14 sm:h-16 lg:h-10 lg:flex-row px-2 sm:px-3">
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4 lg:mr-2 text-amber-500" />
                <span className="text-xs lg:text-sm mt-1 lg:mt-0">Contests</span>
              </TabsTrigger>

              <TabsTrigger value="todos" className="flex-col h-14 sm:h-16 lg:h-10 lg:flex-row relative px-2 sm:px-3">
                <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 lg:mr-2 text-purple-500" />
                <span className="text-xs lg:text-sm mt-1 lg:mt-0">Todos</span>
                {todos.length > 0 && (
                  <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs lg:static lg:ml-2 lg:h-auto lg:w-auto lg:p-1">
                    {todos.length}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger value="study" className="hidden sm:flex flex-col h-14 sm:h-16 lg:h-10 lg:flex-row px-2 sm:px-3">
                <Brain className="h-3 w-3 sm:h-4 sm:w-4 lg:mr-2 text-indigo-500" />
                <span className="text-xs lg:text-sm mt-1 lg:mt-0">Study</span>
              </TabsTrigger>

              <TabsTrigger value="problems" className="hidden sm:flex flex-col h-14 sm:h-16 lg:h-10 lg:flex-row relative px-2 sm:px-3">
                <List className="h-3 w-3 sm:h-4 sm:w-4 lg:mr-2" />
                <span className="text-xs lg:text-sm mt-1 lg:mt-0">Problems</span>
                {activeProblems.length > 0 && (
                  <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs lg:static lg:ml-2 lg:h-auto lg:w-auto lg:p-1">
                    {activeProblems.length}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger value="review" className="hidden sm:flex flex-col h-14 sm:h-16 lg:h-10 lg:flex-row relative px-2 sm:px-3">
                <History className="h-3 w-3 sm:h-4 sm:w-4 lg:mr-2 text-orange-500" />
                <span className="text-xs lg:text-sm mt-1 lg:mt-0">Review</span>
                {reviewProblems.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs lg:static lg:ml-2 lg:h-auto lg:w-auto lg:p-1">
                    {reviewProblems.length}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger value="learned" className="hidden sm:flex flex-col h-14 sm:h-16 lg:h-10 lg:flex-row relative px-2 sm:px-3">
                <LearnedIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:mr-2 text-green-500" />
                <span className="text-xs lg:text-sm mt-1 lg:mt-0">Learned</span>
                {learnedProblems.length > 0 && (
                  <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs lg:static lg:ml-2 lg:h-auto lg:w-auto lg:p-1">
                    {learnedProblems.length}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger value="analytics" className="hidden sm:flex flex-col h-14 sm:h-16 lg:h-10 lg:flex-row px-2 sm:px-3">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 lg:mr-2 text-blue-500" />
                <span className="text-xs lg:text-sm mt-1 lg:mt-0">Analytics</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard
              problems={manualProblems}
              todos={todos}
              onUpdateProblem={handleUpdateProblem}
              onAddPotd={handleAddPotdProblem}
              onImportProblems={handleImportProblems}
              onCleanupPotd={handleCleanupPotd}
            />
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
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
          </TabsContent>



          <TabsContent value="potd" className="space-y-6">
            <div className="rounded-lg border bg-card">
              <ProblemList
                problems={potdProblems}
                onUpdateProblem={handleUpdateProblem}
                onToggleReview={handleToggleReview}
                onDeleteProblem={handleDeleteProblem}
                onEditProblem={handleEditProblem}
                onProblemReviewed={handleProblemReviewed}
                isReviewList={false}
              />
            </div>
          </TabsContent>

          <TabsContent value="contests" className="space-y-6">
            <div className="rounded-lg border bg-card">
              <ContestTracker
                contests={contests}
                onAddContest={handleAddContest}
                onUpdateContest={handleUpdateContest}
                onDeleteContest={handleDeleteContest}
              />
            </div>
          </TabsContent>

          <TabsContent value="todos" className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <TodoList
                todos={todos}
                onAddTodo={handleAddTodo}
                onUpdateTodo={handleUpdateTodo}
                onDeleteTodo={handleDeleteTodo}
              />
            </div>
          </TabsContent>

          <TabsContent value="study" className="space-y-6">
            <StudyHub />
          </TabsContent>

          <TabsContent value="problems" className="space-y-6">
            <div className="rounded-lg border bg-card">
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
            </div>
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            <div className="rounded-lg border bg-card">
              <ProblemList
                problems={reviewProblems}
                onUpdateProblem={handleUpdateProblem}
                onToggleReview={handleToggleReview}
                onDeleteProblem={handleDeleteProblem}
                onEditProblem={handleEditProblem}
                onProblemReviewed={handleProblemReviewed}
                isReviewList={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="learned" className="space-y-6">
            <div className="rounded-lg border bg-card">
              <ProblemList
                problems={learnedProblems}
                onUpdateProblem={handleUpdateProblem}
                onToggleReview={handleToggleReview}
                onDeleteProblem={handleDeleteProblem}
                onEditProblem={handleEditProblem}
                onProblemReviewed={handleProblemReviewed}
                isReviewList={false}
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="rounded-lg border bg-card">
              <Analytics
                problems={manualProblems}
              />
            </div>
          </TabsContent>
        </Tabs>
        </ClientOnly>
      </main>

      {/* Problem Form Modal */}
      {isFormOpen && (
        <ProblemForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onAddProblem={handleAddProblem}
          onUpdateProblem={(id: string, updates: Partial<Problem>) => {
            handleUpdateProblem(id, updates);
          }}
          problemToEdit={problemToEdit}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onAuthSuccess={async () => {
          console.log('🔐 Auth success callback triggered');

          // Set authenticated state immediately
          setIsAuthenticated(true);

          // Wait for cookies and then load data without interfering with auth state
          setTimeout(async () => {
            console.log('🍪 Starting post-auth data loading...');

            // Wait for cookies to be fully available
            await new Promise(resolve => setTimeout(resolve, 1000));

            try {
              // First, try to get user profile to verify authentication
              console.log('👤 Attempting to fetch user profile...');
              const userProfile = await ApiService.getProfile();
              setCurrentUser(userProfile);
              console.log('✅ User profile loaded:', userProfile.email);

              // Load all data without changing authentication state
              await loadDataAfterAuth(5);

            } catch (error: any) {
              console.error('❌ Post-auth profile fetch failed:', error);

              // If profile fails, try loading data anyway (with retries)
              console.log('🔄 Profile failed, but continuing with data load...');
              await loadDataAfterAuth(5);
            }
          }, 500); // Initial delay to ensure cookies are available
        }}
      />

      {/* Floating Action Button */}
      {isAuthenticated && (
        <Button
          onClick={() => handleOpenForm()}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
