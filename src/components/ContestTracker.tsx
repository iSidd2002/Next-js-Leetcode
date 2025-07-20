"use client"

import { useState } from 'react';
import type { Contest } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchContests } from '@/utils/contestFetcher';
import ContestList from './ContestList';
import ContestForm from './ContestForm';
import { toast } from 'sonner';

interface ContestTrackerProps {
  contests: Contest[];
  onAddContest: (contest: Omit<Contest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateContest: (contest: Contest) => void;
  onDeleteContest: (id: string) => void;
}

export default function ContestTracker({ contests, onAddContest, onUpdateContest, onDeleteContest }: ContestTrackerProps) {
  const [isFetching, setIsFetching] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [contestToEdit, setContestToEdit] = useState<Contest | null>(null);

  const handleFetchContests = async () => {
    setIsFetching(true);
    try {
      console.log('🔄 Starting contest fetch...');
      const fetchedContests = await fetchContests();

      if (fetchedContests.length === 0) {
        toast.warning('No contests found from any platform');
        return;
      }

      const newContests = fetchedContests.filter(
        (fc) => !contests.some((c) => c.name === fc.name && c.platform === fc.platform)
      );

      if (newContests.length === 0) {
        toast.info('All contests are already in your list');
        return;
      }

      // Add contests one by one
      newContests.forEach(c => onAddContest(c as Omit<Contest, 'id' | 'createdAt' | 'updatedAt'>));

      toast.success(`Successfully fetched ${newContests.length} new contests!`);
      console.log(`✅ Added ${newContests.length} new contests`);

    } catch (error) {
      console.error("❌ Failed to fetch contests:", error);
      toast.error('Failed to fetch contests. Please try again later.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleOpenForm = (contest: Contest | null = null) => {
    setContestToEdit(contest);
    setIsFormOpen(true);
  };
  
  const handleEditContest = (contest: Contest) => {
    onUpdateContest(contest);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Contest Tracker</CardTitle>
        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-muted-foreground">
            {contests.length} contests tracked
          </p>
          <div className="flex space-x-2">
            <Button onClick={handleFetchContests} disabled={isFetching}>
              {isFetching ? 'Fetching...' : 'Fetch Upcoming Contests'}
            </Button>
            <Button onClick={() => handleOpenForm()}>Add Contest</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ContestList
          contests={contests}
          onDeleteContest={onDeleteContest}
          onEditContest={handleOpenForm}
        />
        <ContestForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onAddContest={onAddContest}
          onUpdateContest={handleEditContest}
          contestToEdit={contestToEdit}
        />
      </CardContent>
    </Card>
  );
} 