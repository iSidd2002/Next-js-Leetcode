"use client"

import type { Contest } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, ExternalLink, Clock, Calendar, Trophy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ContestListProps {
  contests: Contest[];
  onEditContest: (contest: Contest) => void;
  onDeleteContest: (id: string) => void;
}

export default function ContestList({ contests, onEditContest, onDeleteContest }: ContestListProps) {
  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'leetcode':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'codeforces':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'atcoder':
        return 'text-white bg-black/80 border-white/20 dark:bg-white/10';
      case 'codechef':
        return 'text-orange-700 bg-orange-700/10 border-orange-700/20';
      default:
        return 'text-muted-foreground bg-secondary border-border';
    }
  };

  const getStatus = (startTime: string | Date) => {
    const start = new Date(startTime);
    const now = new Date();
    if (start < now) return { label: 'Ended', color: 'text-muted-foreground' };
    if (start.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return { label: 'Upcoming', color: 'text-green-500 animate-pulse' };
    return { label: 'Scheduled', color: 'text-blue-500' };
  };

  if (contests.length === 0) {
      return (
        <div className="text-center py-12 border border-dashed rounded-xl bg-card/30">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No contests scheduled</h3>
            <p className="text-sm text-muted-foreground/60 mt-1">Add a contest to start tracking your competitions.</p>
        </div>
      )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {contests.map((contest) => {
        const status = getStatus(contest.startTime);
        const platformStyle = getPlatformColor(contest.platform);
        
        return (
          <SpotlightCard key={contest.id} className="group hover:shadow-lg transition-all duration-300 border-border/30 bg-card/50 backdrop-blur-sm">
            <div className="p-5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className={cn("capitalize font-medium", platformStyle)}>
                  {contest.platform}
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditContest(contest)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteContest(contest.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex-1 mb-4">
                <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                   {contest.url ? (
                    <a href={contest.url} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-primary/50 underline-offset-4">
                      {contest.name}
                    </a>
                   ) : (
                     contest.name
                   )}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                   <Calendar className="h-3.5 w-3.5" />
                   <span>{format(new Date(contest.startTime), 'MMM d, yyyy • h:mm a')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                   <Clock className="h-3.5 w-3.5" />
                   <span>{contest.duration} mins</span>
                   <span>•</span>
                   <span className={cn("font-medium", status.color)}>{status.label}</span>
                </div>
              </div>

              <div className="pt-4 mt-auto border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
                 <span>
                    {new Date(contest.startTime) > new Date() 
                        ? `Starts ${formatDistanceToNow(new Date(contest.startTime), { addSuffix: true })}`
                        : `Ended ${formatDistanceToNow(new Date(contest.startTime), { addSuffix: true })}`
                    }
                 </span>
                 {contest.url && (
                     <a 
                        href={contest.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-primary transition-colors"
                     >
                        View <ExternalLink className="ml-1 h-3 w-3" />
                     </a>
                 )}
              </div>
            </div>
          </SpotlightCard>
        );
      })}
    </div>
  );
}
