'use client';

import { useState, useEffect } from 'react';
import type { Problem, Contest, ActiveDailyCodingChallengeQuestion, Todo } from '@/types';
import StorageService from '@/utils/storage';
import ApiService from '@/services/api';
import { generateId } from '@/utils/id';
import { cleanupInvalidDates } from '@/utils/dateMigration';
import { markAsReviewed, initializeSpacedRepetition } from '@/utils/spacedRepetition';
import { calculateNextReviewEnhanced } from '@/utils/enhancedSpacedRepetition';
import { getReviewIntervals } from '@/utils/settingsStorage';
import { isToday, isPast } from 'date-fns';
import Dashboard from '@/components/Dashboard';
import ProblemForm from '@/components/ProblemForm';
import ProblemList from '@/components/ProblemList';
import CompanyGroupedProblemList from '@/components/CompanyGroupedProblemList';
import CompanyDashboard from '@/components/CompanyDashboard';
import Analytics from '@/components/Analytics';
import AuthModal from '@/components/AuthModal';
import MoreProjects from '@/components/MoreProjects';
import { Home as HomeIcon, Plus, List, BarChart3, Moon, Sun, Star, Settings as SettingsIcon, LogOut, User, CheckSquare, ExternalLink, BookOpen, Briefcase, Trophy, Building2, History, Archive as LearnedIcon, Command, HelpCircle, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/components/theme-provider';
import { toast } from 'sonner';
import ContestTracker from '@/components/ContestTracker';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ClientOnly from '@/components/client-only';
import TodoList from '@/components/TodoList';
import MonthlyPotdList from '@/components/MonthlyPotdList';
import ExternalResources from '@/components/ExternalResources';
import Guide from '@/components/Guide';
import { CommandMenu } from '@/components/CommandMenu';
import { EnhancedSettings } from '@/components/EnhancedSettings';

export default function HomePage() {
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

  // Load data on component mount
  useEffect(() => {
    initializeApp();
  }, []);

  // Reliable app initialization with hybrid authentication check
  const initializeApp = async () => {
    console.log('🚀 App initialization started');

    try {
      // First, check if auth-status cookie indicates authentication
      const hasAuthCookie = ApiService.isAuthenticated();
      
      if (!hasAuthCookie) {
        setIsAuthenticated(false);
        setShowAuthModal(true);
        setIsLoaded(true);
        return;
      }

      // Auth cookie present, verify with server
      try {
        const userProfile = await ApiService.getProfile();
        setCurrentUser(userProfile);
        setIsAuthenticated(true);

        // Load user data
        await loadUserData();

      } catch (error: any) {
        console.error('❌ Server verification failed:', error);
        setIsAuthenticated(false);
        setCurrentUser(null);
        setShowAuthModal(true);
        ApiService.clearAuthState();
      }

    } catch (error) {
      console.error('❌ App initialization failed:', error);
      setIsAuthenticated(false);
      setShowAuthModal(true);
    } finally {
      setIsLoaded(true);
      console.log('🏁 App initialization completed');
    }
  };

  // Load user data after authentication is verified
  const loadUserData = async () => {
    try {
      const [problemsData, potdData, contestsData, todosData] = await Promise.all([
        StorageService.getProblems(),
        StorageService.getPotdProblems(),
        StorageService.getContests(),
        StorageService.getTodos()
      ]);

      // Clean up any invalid dates before setting state
      const cleanedProblems = cleanupInvalidDates(problemsData);
      const cleanedPotdProblems = cleanupInvalidDates(potdData);

      setProblems(cleanedProblems);
      setPotdProblems(cleanedPotdProblems);
      setContests(contestsData);
      setTodos(todosData);

      // Automatic POTD cleanup - remove expired POTD problems (keeps saved ones forever)
      try {
        const cleanupResult = await StorageService.cleanupExpiredPotdProblems();
        if (cleanupResult.removedCount > 0 || cleanupResult.preservedCount > 0) {
          // Reload POTD problems after cleanup
          const updatedPotdProblems = await StorageService.getPotdProblems();
          setPotdProblems(updatedPotdProblems);
          
          if (cleanupResult.removedCount > 0) {
            toast.info(`🧹 Cleaned up ${cleanupResult.removedCount} old POTD problem${cleanupResult.removedCount === 1 ? '' : 's'}${cleanupResult.preservedCount > 0 ? `, kept ${cleanupResult.preservedCount} saved` : ''}`);
          }
        }
      } catch (error) {
        console.error('POTD Auto-cleanup failed:', error);
      }

      // Auto-sync with server if online
      if (!StorageService.getOfflineMode()) {
        StorageService.syncWithServer().catch(error => {
          console.warn('Auto-sync failed:', error);
        });
      }

    } catch (error) {
      console.error('Failed to load user data:', error);
      setProblems([]);
      setPotdProblems([]);
      setContests([]);
      setTodos([]);
    }
  };

  // ... [Keep existing handler functions: handleAddProblem, handleUpdateProblem, etc. unchanged]
  const handleAddProblem = async (problem: Omit<Problem, 'id' | 'createdAt'>) => {
    try {
      if (!isAuthenticated) {
        toast.error('Please log in to add problems');
        setShowAuthModal(true);
        return;
      }
      const newProblem = await StorageService.addProblem(problem);
      setProblems(prevProblems => [newProblem, ...prevProblems]);
      toast.success('Problem added successfully!');
    } catch (error) {
      console.error('Failed to add problem:', error);
      toast.error('Failed to add problem. Please try again.');
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
      console.log('📝 Updating problem:', {
        id,
        title: existingProblem.title,
        isPotdProblem,
        statusUpdate: updates.status,
        updatedProblemStatus: updatedProblem.status
      });
      
      await StorageService.updateProblem(id, updates);

      if (isPotdProblem) {
        setPotdProblems(potdProblems.map(p => p.id === id ? updatedProblem : p));
        console.log('✅ Updated in potdProblems state');
      } else {
        setProblems(problems.map(p => p.id === id ? updatedProblem : p));
        console.log('✅ Updated in problems state');
      }
      toast.success('Problem updated successfully!');
    } catch (error) {
      console.error('Failed to update problem:', error);
      toast.error('Failed to update problem');
    }
  };

  const handleToggleReview = async (id: string, updates: Partial<Problem>) => {
    try {
      let problem = problems.find(p => p.id === id);
      if (!problem) problem = potdProblems.find(p => p.id === id);

      if (!problem) {
        toast.error('Problem not found');
        return;
      }

      let updatedProblem: Problem;

      if (updates.isReview && !problem.isReview) {
        updatedProblem = initializeSpacedRepetition({ ...problem, ...updates }, true);
        toast.success('Problem marked for review! First review scheduled.');
      } else if (!updates.isReview && problem.isReview) {
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
        updatedProblem = { ...problem, ...updates };
      }

      await handleUpdateProblem(problem.id, updatedProblem);
    } catch (error) {
      console.error('Failed to toggle review:', error);
      toast.error('Failed to update review status');
    }
  };

  const handleDeleteProblem = async (id: string) => {
    try {
      const isPotdProblem = potdProblems.some(p => p.id === id);
      await StorageService.deleteProblem(id);

      if (isPotdProblem) {
        const refreshedPotdProblems = await StorageService.getPotdProblems();
        setPotdProblems(refreshedPotdProblems);
      } else {
        const refreshedProblems = await StorageService.getProblems();
        setProblems(refreshedProblems);
      }
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
      let problem = problems.find(p => p.id === id);
      let isPotdProblem = false;
      
      if (!problem) {
        problem = potdProblems.find(p => p.id === id);
        isPotdProblem = true;
      }

      if (!problem) {
        toast.error('Problem not found');
        return;
      }

      let updatedProblem;
      let intervalDays;

      if (moveToLearned) {
        // Move to Learned - no review scheduling needed
        updatedProblem = {
          ...problem,
          status: 'learned' as const,
          isReview: false, // Remove from review queue
          notes: notes ? (problem.notes ? `${problem.notes}\n\n---\n\n${notes}` : notes) : problem.notes,
          dateSolved: new Date().toISOString(),
          repetition: (problem.repetition || 0) + 1,
          // Keep existing interval/nextReviewDate but not active since isReview is false
        };
        console.log('🎓 Moving to Learned:', {
          problemId: problem.id,
          title: problem.title,
          source: problem.source,
          isPotd: isPotdProblem,
          statusBefore: problem.status,
          statusAfter: updatedProblem.status
        });
        intervalDays = 0; // Not used for learned problems
      } else if (customDays !== undefined) {
        // Manual days mode - use custom interval directly
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
        // Quality-based mode - use enhanced spaced repetition
        const customIntervals = getReviewIntervals();
        
        const enhancedData = calculateNextReviewEnhanced(
          problem,
          quality,
          customIntervals,
          timeTaken,
          notes,
          tags
        );
        
        updatedProblem = {
          ...problem,
          ...enhancedData,
          notes: notes ? (problem.notes ? `${problem.notes}\n\n---\n\n${notes}` : notes) : problem.notes,
          dateSolved: new Date().toISOString()
        };
        
        intervalDays = updatedProblem.interval;
      }
      
      await handleUpdateProblem(problem.id, updatedProblem);
      
      // Success message
      if (moveToLearned) {
        toast.success(`🎓 Problem moved to Learned! You've mastered it!`);
      } else if (customDays !== undefined) {
        toast.success(`Review scheduled! Next review in ${customDays} days. 📅`);
      } else {
        const qualityLabels = ['', 'Again', 'Hard', 'Good', 'Easy', 'Perfect'];
        const qualityLabel = qualityLabels[quality] || 'Good';
        toast.success(`${qualityLabel} review! Next review in ${intervalDays} days. 🎯`);
      }
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
      const problemsToClear = problems.filter(p => p.source === 'manual' || p.source === 'potd' || !p.source);
      if (problemsToClear.length === 0) {
        toast.info('No problems to clear');
        return;
      }
      for (const problem of problemsToClear) {
        try {
          if (!StorageService.getOfflineMode()) await ApiService.deleteProblem(problem.id);
        } catch (error) {
          console.warn(`Failed to delete problem ${problem.id} from server:`, error);
        }
      }
      const remainingProblems = problems.filter(p => p.source === 'company');
      setProblems(remainingProblems);
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
      source: 'potd',
    };
    const updatedPotdProblems = [...potdProblems, newProblem];
    setPotdProblems(updatedPotdProblems);
    StorageService.savePotdProblems(updatedPotdProblems);
    toast.success('Problem of the day added to your list!');
  };

  const handleAddDailyChallengeToPotd = async (dailyProblem: any) => {
    try {
      const isDuplicate = potdProblems.some(p => p.url === dailyProblem.url);
      if (isDuplicate) {
        toast.info('Daily challenge already exists in your POTD archive.');
        return;
      }
      const newProblem: Problem = {
        id: generateId(),
        platform: dailyProblem.platform,
        title: dailyProblem.title,
        problemId: dailyProblem.id,
        difficulty: dailyProblem.difficulty,
        url: dailyProblem.url,
        dateSolved: new Date().toISOString(),
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
      const updatedPotdProblems = [...potdProblems, newProblem];
      setPotdProblems(updatedPotdProblems);
      await StorageService.savePotdProblems(updatedPotdProblems);
      await StorageService.addProblem(newProblem);
    } catch (error) {
      console.error('Failed to add daily challenge to POTD:', error);
      throw error;
    }
  };

  const handleCleanupPotd = async () => {
    try {
      const cleanupResult = await StorageService.cleanupExpiredPotdProblems();
      
      // Reload POTD problems after cleanup
      const updatedPotdProblems = await StorageService.getPotdProblems();
      setPotdProblems(updatedPotdProblems);

      if (cleanupResult.removedCount > 0) {
        let message = `🧹 Cleaned up ${cleanupResult.removedCount} old POTD problem${cleanupResult.removedCount === 1 ? '' : 's'}`;
        if (cleanupResult.preservedCount > 0) {
          message += `\n✨ Kept ${cleanupResult.preservedCount} saved problem${cleanupResult.preservedCount === 1 ? '' : 's'} forever (with notes/reviews)`;
        }
        toast.success(message);
      } else if (cleanupResult.preservedCount > 0) {
        toast.success(`✨ No cleanup needed - all ${cleanupResult.preservedCount} old problem${cleanupResult.preservedCount === 1 ? ' is' : 's are'} saved by you!`);
      } else {
        toast.info('✅ No expired POTD problems found - everything is current!');
      }
    } catch (error) {
      console.error('POTD cleanup failed:', error);
      toast.error('Failed to cleanup POTD problems');
    }
  };

  const isPotdInProblems = (potdProblem: Problem): { inProblems: boolean; inLearned: boolean; status: string } => {
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
      const existsWithTargetStatus = problems.some(p => p.url === potdProblem.url && p.status === targetStatus);
      if (existsWithTargetStatus) {
        const sectionName = targetStatus === 'active' ? 'Problems' : 'Learned';
        toast.info(`Problem already exists in ${sectionName} section`);
        return;
      }
      const newProblemForProblems: Problem = {
        ...potdProblem,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: 'manual',
        status: targetStatus,
        createdAt: new Date().toISOString()
      };
      await StorageService.addProblem(newProblemForProblems);
      const updatedProblems = [...problems, newProblemForProblems];
      setProblems(updatedProblems);
      await StorageService.saveProblems(updatedProblems);
      const sectionName = targetStatus === 'active' ? 'Problems' : 'Learned';
      toast.success(`Problem added to ${sectionName} section successfully!`);
    } catch (error) {
      console.error('Failed to add POTD problem to Problems:', error);
      const sectionName = targetStatus === 'active' ? 'Problems' : 'Learned';
      toast.error(`Failed to add problem to ${sectionName} section`);
    }
  };

  const handleImportProblems = async (companyName: string, problemsToImport: any[]) => {
    try {
      const newProblems: Problem[] = [];
      const duplicateProblems: string[] = [];
      const failedProblems: string[] = [];
      console.log(`Starting import of ${problemsToImport.length} problems from ${companyName}`);

      for (const problem of problemsToImport) {
        const problemData = {
          platform: 'leetcode' as const,
          title: problem.title,
          problemId: problem.titleSlug || problem.title.toLowerCase().replace(/\s+/g, '-'),
          difficulty: problem.difficulty,
          url: problem.url || `https://leetcode.com/problems/${problem.titleSlug || problem.title.toLowerCase().replace(/\s+/g, '-')}/`,
          dateSolved: '',
          notes: `Imported from ${companyName} problems`,
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
          const createdProblem = await StorageService.addProblem(problemData);
          newProblems.push(createdProblem);
        } catch (error: any) {
           const isDuplicate = error.message && (
            error.message.includes('already exists') ||
            error.message.includes('HTTP error! status: 409') ||
            error.status === 409
          );
          if (isDuplicate) duplicateProblems.push(problem.title);
          else failedProblems.push(problem.title);
        }
      }

      const refreshedProblems = await StorageService.getProblems();
      setProblems(refreshedProblems);

      let message = '';
      if (newProblems.length > 0) message += `Successfully imported ${newProblems.length} new problems!`;
      if (duplicateProblems.length > 0) message += ` ${duplicateProblems.length} duplicates skipped.`;
      if (failedProblems.length > 0) message += ` ${failedProblems.length} failed.`;

      if (newProblems.length > 0) toast.success(message);
      else if (duplicateProblems.length > 0) toast.info(message);
      else toast.error(message || 'No problems were imported.');
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

  const manualProblems = problems.filter(p => p.source === 'manual' || p.source === 'potd' || !p.source);
  const activeProblems = manualProblems.filter(p => p.status === 'active');
  const allProblemsForReview = [...problems, ...potdProblems];
  const reviewProblems = allProblemsForReview.filter(p => p.isReview);
  const dueReviewProblems = reviewProblems.filter(p =>
    p.nextReviewDate &&
    (isToday(new Date(p.nextReviewDate)) || isPast(new Date(p.nextReviewDate)))
  );
  // Include learned problems from both problems and potdProblems lists
  const learnedProblemsFromMain = manualProblems.filter(p => p.status === 'learned');
  const learnedProblemsFromPotd = potdProblems.filter(p => p.status === 'learned');
  const learnedProblems = [...learnedProblemsFromMain, ...learnedProblemsFromPotd];
  console.log('📚 Learned Problems Filter:', {
    totalProblems: problems.length,
    totalPotd: potdProblems.length,
    learnedFromMain: learnedProblemsFromMain.length,
    learnedFromPotd: learnedProblemsFromPotd.length,
    totalLearned: learnedProblems.length,
    learnedTitles: learnedProblems.map(p => ({ title: p.title, status: p.status, source: p.source }))
  });
  const companyProblems = problems.filter(p => p.source === 'company');

  return (
    <div className="min-h-screen font-sans antialiased pb-8">
      <CommandMenu 
        open={isCommandMenuOpen} 
        onOpenChange={setIsCommandMenuOpen} 
        onAddProblem={() => handleOpenForm()}
      />
      
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
                  <span className="text-white font-bold text-lg">LC</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight hidden sm:block">
                  Tracker
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Search Trigger Button for Desktop */}
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex w-64 justify-start text-muted-foreground bg-muted/50 hover:bg-muted/80"
                onClick={() => setIsCommandMenuOpen(true)}
              >
                 <Command className="mr-2 h-4 w-4" />
                 <span className="inline-flex">Search...</span>
                 <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                 </kbd>
              </Button>

              {/* Search Trigger Button for Mobile */}
              <Button
                 variant="ghost"
                 size="icon"
                 className="md:hidden"
                 onClick={() => setIsCommandMenuOpen(true)}
              >
                <Command className="h-5 w-5" />
              </Button>

              {isAuthenticated && (
                <div className="hidden md:flex items-center space-x-2 mr-4">
                   <Button
                    onClick={() => handleOpenForm()}
                    className="hidden lg:flex shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Problem
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="rounded-full"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-rose-600 rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform">
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
                    <DropdownMenuItem onClick={async () => {
                      try {
                        await ApiService.logout();
                        setIsAuthenticated(false);
                        setCurrentUser(null);
                        toast.success('Logged out successfully');
                        loadDataUserData();
                      } catch (error) {
                        console.error('Logout error:', error);
                        toast.error('Logout failed');
                      }
                    }} className="text-red-500 focus:text-red-500">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setShowAuthModal(true)}>
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ClientOnly>
          <Tabs defaultValue="dashboard" className="space-y-8">
            
            {/* Navigation Tabs - Floating Pill Style */}
            <div className="overflow-x-auto pb-2 hide-scrollbar">
               <TabsList className="inline-flex h-12 items-center justify-center rounded-full bg-muted/50 p-1 text-muted-foreground backdrop-blur-sm">
                <TabsTrigger value="dashboard" className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
                   Dashboard
                </TabsTrigger>
                <TabsTrigger value="problems" className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
                   Problems
                   {activeProblems.length > 0 && <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">{activeProblems.length}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="companies" className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
                   Companies
                </TabsTrigger>
                <TabsTrigger value="potd" className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
                   POTD
                   {potdProblems.length > 0 && <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">{potdProblems.length}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="contests" className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
                   Contests
                </TabsTrigger>
                 <TabsTrigger value="review" className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
                   Review
                   {dueReviewProblems.length > 0 && <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-[10px]">{dueReviewProblems.length}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="todos" className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
                   Tasks
                </TabsTrigger>
                 <TabsTrigger value="learned" className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
                   Learned
                </TabsTrigger>
                 <TabsTrigger value="analytics" className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
                   Analytics
                </TabsTrigger>
                 <TabsTrigger value="guide" className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
                   Guide
                </TabsTrigger>
                 <TabsTrigger value="resources" className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
                   Resources
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="animate-fade-in">
              <TabsContent value="dashboard" className="mt-0">
                <Dashboard
                  problems={manualProblems}
                  todos={todos}
                  onUpdateProblem={handleUpdateProblem}
                  onAddPotd={handleAddPotdProblem}
                  onImportProblems={handleImportProblems}
                  onCleanupPotd={handleCleanupPotd}
                  onAddDailyChallenge={handleAddDailyChallengeToPotd}
                />
              </TabsContent>

              <TabsContent value="companies" className="mt-0 space-y-6">
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

              <TabsContent value="potd" className="mt-0 space-y-6">
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
              </TabsContent>

              <TabsContent value="contests" className="mt-0 space-y-6">
                <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-1">
                  <ContestTracker
                    contests={contests}
                    onAddContest={handleAddContest}
                    onUpdateContest={handleUpdateContest}
                    onDeleteContest={handleDeleteContest}
                  />
                </div>
              </TabsContent>

              <TabsContent value="todos" className="mt-0 space-y-6">
                <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6">
                  <TodoList
                    todos={todos}
                    onAddTodo={handleAddTodo}
                    onUpdateTodo={handleUpdateTodo}
                    onDeleteTodo={handleDeleteTodo}
                  />
                </div>
              </TabsContent>

              <TabsContent value="problems" className="mt-0 space-y-6">
                <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-1">
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

              <TabsContent value="review" className="mt-0 space-y-6">
                <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-1">
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

              <TabsContent value="learned" className="mt-0 space-y-6">
                <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-1">
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

              <TabsContent value="analytics" className="mt-0 space-y-6">
                <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-1">
                  <Analytics
                    problems={manualProblems}
                  />
                </div>
              </TabsContent>

              <TabsContent value="guide" className="mt-0 space-y-6">
                <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6">
                  <Guide />
                </div>
              </TabsContent>

              <TabsContent value="resources" className="mt-0 space-y-6">
                <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6">
                  <ExternalResources />
                </div>
              </TabsContent>
            </div>
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
          setIsAuthenticated(true);
          setTimeout(async () => {
            try {
              const userProfile = await ApiService.getProfile();
              setCurrentUser(userProfile);
              await loadUserData();
            } catch (error: any) {
              console.error('Post-auth data loading failed:', error);
              await initializeApp();
            }
          }, 1000);
        }}
      />

      {/* Enhanced Settings Dialog */}
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
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl shadow-primary/20 transition-all duration-300 z-50"
          size="icon"
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      )}
    </div>
  );
}
