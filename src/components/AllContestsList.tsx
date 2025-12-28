'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Users, 
  RefreshCw,
  Search,
  Globe,
  Play,
  CheckCircle,
  Timer
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';

interface Contest {
  id: string;
  name: string;
  platform: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'upcoming' | 'running' | 'finished';
  url: string;
  type?: string;
  participants?: number;
}

interface ContestData {
  all: Contest[];
  categorized: {
    upcoming: Contest[];
    running: Contest[];
    recent: Contest[];
  };
  summary: {
    total: number;
    upcoming: number;
    running: number;
    recent: number;
    platforms: string[];
  };
}

const AllContestsList = () => {
  const [contests, setContests] = useState<ContestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const fetchAllContests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/contests/all');
      const data = await response.json();
      
      if (data.success) {
        setContests(data.data);
        toast.success(`Loaded ${data.data.summary.total} contests from ${data.data.summary.platforms.length} platforms!`);
      } else {
        throw new Error(data.error || 'Failed to fetch contests');
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
      toast.error('Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllContests();
  }, []);

  const filterContests = (contestList: Contest[]) => {
    return contestList.filter(contest => {
      const matchesSearch = contest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contest.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (contest.type && contest.type.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPlatform = selectedPlatform === 'all' || contest.platform === selectedPlatform;
      
      return matchesSearch && matchesPlatform;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Calendar className="h-4 w-4" />;
      case 'running': return <Play className="h-4 w-4" />;
      case 'finished': return <CheckCircle className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-amber-500';
      case 'running': return 'bg-green-500';
      case 'finished': return 'bg-gray-500';
      default: return 'bg-rose-500';
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      'Codeforces': 'bg-red-500',
      'LeetCode': 'bg-orange-500',
      'AtCoder': 'bg-cyan-500',
      'CodeChef': 'bg-yellow-500',
      'HackerRank': 'bg-green-500',
      'TopCoder': 'bg-rose-500'
    };
    return colors[platform] || 'bg-gray-500';
  };

  const ContestCard = ({ contest }: { contest: Contest }) => {
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);
    const now = new Date();

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold line-clamp-2">
                {contest.name}
              </CardTitle>
              <CardDescription className="mt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`${getPlatformColor(contest.platform)} text-white`}>
                    {contest.platform}
                  </Badge>
                  <Badge variant="outline" className={`${getStatusColor(contest.status)} text-white`}>
                    {getStatusIcon(contest.status)}
                    <span className="ml-1 capitalize">{contest.status}</span>
                  </Badge>
                  {contest.type && (
                    <Badge variant="secondary">{contest.type}</Badge>
                  )}
                </div>
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(contest.url, '_blank')}
              className="ml-2"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(startTime, 'MMM dd, yyyy HH:mm')}
                {contest.status === 'upcoming' && (
                  <span className="text-muted-foreground ml-1">
                    ({formatDistanceToNow(startTime, { addSuffix: true })})
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{contest.duration}h duration</span>
            </div>
            {contest.participants && contest.participants > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{contest.participants.toLocaleString()} participants</span>
              </div>
            )}
            {contest.status === 'running' && (
              <div className="flex items-center gap-2 text-green-600">
                <Timer className="h-4 w-4" />
                <span className="font-medium">
                  Ends {formatDistanceToNow(endTime, { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!contests) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Contests</h2>
          <Button onClick={fetchAllContests} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Load All Contests'}
          </Button>
        </div>
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Fetching contests from all platforms...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">All Contests</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {contests.summary.total} contests from {contests.summary.platforms.length} platforms
          </p>
        </div>
        <Button onClick={fetchAllContests} disabled={loading} size="sm">
          <RefreshCw className={`h-4 w-4 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{contests.summary.upcoming}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{contests.summary.running}</p>
                <p className="text-sm text-muted-foreground">Running</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{contests.summary.recent}</p>
                <p className="text-sm text-muted-foreground">Recent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-rose-500" />
              <div>
                <p className="text-2xl font-bold">{contests.summary.platforms.length}</p>
                <p className="text-sm text-muted-foreground">Platforms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contests, platforms, or types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9"
          />
        </div>
        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {contests.summary.platforms.map(platform => (
              <SelectItem key={platform} value={platform}>{platform}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Contest Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">
            Upcoming ({filterContests(contests.categorized.upcoming).length})
          </TabsTrigger>
          <TabsTrigger value="running">
            Running ({filterContests(contests.categorized.running).length})
          </TabsTrigger>
          <TabsTrigger value="recent">
            Recent ({filterContests(contests.categorized.recent).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filterContests(contests.categorized.upcoming).map(contest => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
          {filterContests(contests.categorized.upcoming).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming contests found matching your filters.
            </div>
          )}
        </TabsContent>

        <TabsContent value="running" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filterContests(contests.categorized.running).map(contest => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
          {filterContests(contests.categorized.running).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No running contests found matching your filters.
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filterContests(contests.categorized.recent).map(contest => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
          {filterContests(contests.categorized.recent).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No recent contests found matching your filters.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AllContestsList;
