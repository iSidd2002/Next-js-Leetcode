'use client';

import { useState, useCallback } from 'react';
import type { Contest } from '@/types';
import StorageService from '@/utils/storage';
import { generateId } from '@/utils/id';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

interface UseContestsReturn {
  contests: Contest[];
  isLoading: boolean;
  loadContests: () => Promise<void>;
  addContest: (contest: Omit<Contest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContest: (contest: Contest) => Promise<void>;
  deleteContest: (id: string) => Promise<void>;
}

export function useContests(): UseContestsReturn {
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadContests = useCallback(async () => {
    try {
      setIsLoading(true);
      const contestsData = await StorageService.getContests();
      setContests(contestsData);
      logger.info('Contests loaded', { count: contestsData.length });
    } catch (error) {
      logger.error('Failed to load contests', error);
      setContests([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addContest = useCallback(async (contest: Omit<Contest, 'id' | 'createdAt' | 'updatedAt'>) => {
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
      logger.info('Contest added', { name: newContest.name });
    } catch (error) {
      logger.error('Failed to add contest', error);
      toast.error('Failed to add contest');
    }
  }, [contests]);

  const updateContest = useCallback(async (updatedContest: Contest) => {
    try {
      const updated = contests.map(c =>
        c.id === updatedContest.id ? { ...updatedContest, updatedAt: new Date() } : c
      );
      setContests(updated);
      await StorageService.saveContests(updated);
      toast.success('Contest updated!');
      logger.info('Contest updated', { id: updatedContest.id });
    } catch (error) {
      logger.error('Failed to update contest', error);
      toast.error('Failed to update contest');
    }
  }, [contests]);

  const deleteContest = useCallback(async (id: string) => {
    try {
      const updated = contests.filter(c => c.id !== id);
      setContests(updated);
      await StorageService.saveContests(updated);
      toast.success('Contest deleted!');
      logger.info('Contest deleted', { id });
    } catch (error) {
      logger.error('Failed to delete contest', error);
      toast.error('Failed to delete contest');
    }
  }, [contests]);

  return {
    contests,
    isLoading,
    loadContests,
    addContest,
    updateContest,
    deleteContest,
  };
}

export default useContests;
