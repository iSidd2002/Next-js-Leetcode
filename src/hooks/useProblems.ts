'use client';

import { useState, useCallback } from 'react';
import type { Problem, ActiveDailyCodingChallengeQuestion } from '@/types';
import StorageService from '@/utils/storage';
import { generateId } from '@/utils/id';
import { cleanupInvalidDates } from '@/utils/dateMigration';
import { initializeSpacedRepetition } from '@/utils/spacedRepetition';
import { calculateNextReviewEnhanced } from '@/utils/enhancedSpacedRepetition';
import { getReviewIntervals } from '@/utils/settingsStorage';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

interface UseProblemsReturn {
  problems: Problem[];
  potdProblems: Problem[];
  isLoading: boolean;
  loadProblems: () => Promise<void>;
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
}

export function useProblems(isAuthenticated: boolean): UseProblemsReturn {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [potdProblems, setPotdProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProblems = useCallback(async () => {
    try {
      setIsLoading(true);
      const [problemsData, potdData] = await Promise.all([
        StorageService.getProblems(),
        StorageService.getPotdProblems(),
      ]);

      const cleanedProblems = cleanupInvalidDates(problemsData);
      const cleanedPotdProblems = cleanupInvalidDates(potdData);

      setProblems(cleanedProblems);
      setPotdProblems(cleanedPotdProblems);

      // Auto-cleanup POTD
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

      logger.info('Problems loaded', { 
        problems: cleanedProblems.length, 
        potd: cleanedPotdProblems.length 
      });
    } catch (error) {
      logger.error('Failed to load problems', error);
      setProblems([]);
      setPotdProblems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addProblem = useCallback(async (problem: Omit<Problem, 'id' | 'createdAt'>) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add problems');
      return;
    }

    try {
      const newProblem = await StorageService.addProblem(problem);
      setProblems(prev => [newProblem, ...prev]);
      toast.success('Problem added successfully!');
      logger.info('Problem added', { title: newProblem.title });
    } catch (error) {
      logger.error('Failed to add problem', error);
      toast.error('Failed to add problem');
    }
  }, [isAuthenticated]);

  const updateProblem = useCallback(async (id: string, updates: Partial<Problem>) => {
    try {
      let existingProblem = problems.find(p => p.id === id);
      let isPotd = false;

      if (!existingProblem) {
        existingProblem = potdProblems.find(p => p.id === id);
        isPotd = true;
      }

      if (!existingProblem) {
        toast.error('Problem not found');
        return;
      }

      const updatedProblem = { ...existingProblem, ...updates };
      await StorageService.updateProblem(id, updates);

      if (isPotd) {
        setPotdProblems(prev => prev.map(p => p.id === id ? updatedProblem : p));
      } else {
        setProblems(prev => prev.map(p => p.id === id ? updatedProblem : p));
      }

      toast.success('Problem updated!');
      logger.info('Problem updated', { id, updates });
    } catch (error) {
      logger.error('Failed to update problem', error);
      toast.error('Failed to update problem');
    }
  }, [problems, potdProblems]);

  const deleteProblem = useCallback(async (id: string) => {
    try {
      const isPotd = potdProblems.some(p => p.id === id);
      await StorageService.deleteProblem(id);

      if (isPotd) {
        const refreshed = await StorageService.getPotdProblems();
        setPotdProblems(refreshed);
      } else {
        const refreshed = await StorageService.getProblems();
        setProblems(refreshed);
      }

      toast.success('Problem deleted!');
      logger.info('Problem deleted', { id });
    } catch (error) {
      logger.error('Failed to delete problem', error);
      toast.error('Failed to delete problem');
    }
  }, [potdProblems]);

  const toggleReview = useCallback(async (id: string, updates: Partial<Problem>) => {
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

      await updateProblem(problem.id, updatedProblem);

      // Reload to ensure UI updates
      const [updatedProblems, updatedPotd] = await Promise.all([
        StorageService.getProblems(),
        StorageService.getPotdProblems()
      ]);
      setProblems(updatedProblems);
      setPotdProblems(updatedPotd);
    } catch (error) {
      logger.error('Failed to toggle review', error);
      toast.error('Failed to update review status');
    }
  }, [problems, potdProblems, updateProblem]);

  const markAsReviewed = useCallback(async (
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

      await updateProblem(problem.id, updatedProblem);

      if (moveToLearned) {
        const [updatedProblems, updatedPotd] = await Promise.all([
          StorageService.getProblems(),
          StorageService.getPotdProblems()
        ]);
        setProblems(updatedProblems);
        setPotdProblems(updatedPotd);
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
  }, [problems, potdProblems, updateProblem]);

  const addPotdProblem = useCallback((potd: ActiveDailyCodingChallengeQuestion) => {
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
    toast.success('POTD added to tracking list!');
  }, [potdProblems]);

  const addDailyChallengeToPotd = useCallback(async (dailyProblem: any) => {
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
  }, [potdProblems]);

  const addPotdToProblem = useCallback(async (id: string, targetStatus: 'active' | 'learned' = 'active') => {
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

      const sectionName = targetStatus === 'active' ? 'Problems' : 'Learned';
      toast.success(`Problem added to ${sectionName}!`);
    } catch (error) {
      logger.error('Failed to add POTD to problems', error);
      toast.error('Failed to add problem');
    }
  }, [potdProblems, problems]);

  const cleanupPotd = useCallback(async () => {
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
  }, []);

  const clearAllProblems = useCallback(async () => {
    try {
      const problemsToClear = problems.filter(p => 
        p.source === 'manual' || p.source === 'potd' || !p.source
      );

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
  }, [problems]);

  const importProblems = useCallback(async (companyName: string, problemsToImport: any[]) => {
    try {
      const newProblems: Problem[] = [];
      const duplicates: string[] = [];
      const failed: string[] = [];

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
          const created = await StorageService.addProblem(problemData);
          newProblems.push(created);
        } catch (error: any) {
          const isDuplicate = error.message?.includes('already exists') || error.status === 409;
          if (isDuplicate) duplicates.push(problem.title);
          else failed.push(problem.title);
        }
      }

      const refreshed = await StorageService.getProblems();
      setProblems(refreshed);

      let message = '';
      if (newProblems.length > 0) message += `Imported ${newProblems.length} problems!`;
      if (duplicates.length > 0) message += ` ${duplicates.length} duplicates skipped.`;
      if (failed.length > 0) message += ` ${failed.length} failed.`;

      if (newProblems.length > 0) toast.success(message);
      else if (duplicates.length > 0) toast.info(message);
      else toast.error(message || 'No problems imported');
    } catch (error) {
      logger.error('Failed to import problems', error);
      toast.error('Failed to import problems');
    }
  }, []);

  const isPotdInProblems = useCallback((potdProblem: Problem) => {
    const inProblems = problems.some(p => p.url === potdProblem.url && p.status === 'active');
    const inLearned = problems.some(p => p.url === potdProblem.url && p.status === 'learned');
    let status = '';
    if (inProblems && inLearned) status = 'In Both';
    else if (inProblems) status = 'In Problems';
    else if (inLearned) status = 'In Learned';
    return { inProblems, inLearned, status };
  }, [problems]);

  return {
    problems,
    potdProblems,
    isLoading,
    loadProblems,
    addProblem,
    updateProblem,
    deleteProblem,
    toggleReview,
    markAsReviewed,
    addPotdProblem,
    addDailyChallengeToPotd,
    addPotdToProblem,
    cleanupPotd,
    clearAllProblems,
    importProblems,
    isPotdInProblems,
  };
}

export default useProblems;
