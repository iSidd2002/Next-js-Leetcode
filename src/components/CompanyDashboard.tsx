"use client"

import type { Problem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Star,
  Target,
  Award,
  Activity
} from 'lucide-react';
import { getCompanyStatistics, type CompanyStats } from '@/utils/companyStats';

interface CompanyDashboardProps {
  problems: Problem[];
}

const CompanyDashboard = ({ problems }: CompanyDashboardProps) => {
  const companyStats = getCompanyStatistics(problems);
  const topCompanies = companyStats.slice(0, 6);
  const totalCompanies = companyStats.length;
  const totalCompanyProblems = companyStats.reduce((sum, stat) => sum + stat.totalProblems, 0);
  const totalSolvedCompanyProblems = companyStats.reduce((sum, stat) => sum + stat.solvedProblems, 0);
  const overallProgress = totalCompanyProblems > 0 ? Math.round((totalSolvedCompanyProblems / totalCompanyProblems) * 100) : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (companyStats.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Company Problems Yet</h3>
          <p className="text-muted-foreground text-center">
            Import problems from companies to see detailed statistics and progress tracking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              Companies with problems
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompanyProblems}</div>
            <p className="text-xs text-muted-foreground">
              Across all companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solved Problems</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSolvedCompanyProblems}</div>
            <p className="text-xs text-muted-foreground">
              {overallProgress}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Top Companies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <span>Top Companies</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topCompanies.map((company) => (
              <Card key={company.name} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{company.name}</CardTitle>
                    <Badge variant="outline">
                      {company.totalProblems} problems
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{company.solvedPercentage}%</span>
                    </div>
                    <Progress value={company.solvedPercentage} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>{company.solvedProblems} solved</span>
                    </div>
                    {company.reviewProblems > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-600" />
                        <span>{company.reviewProblems} review</span>
                      </div>
                    )}
                    {company.dueForReview > 0 && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-red-600" />
                        <span>{company.dueForReview} due</span>
                      </div>
                    )}
                    {company.recentActivity > 0 && (
                      <div className="flex items-center space-x-1">
                        <Activity className="h-3 w-3 text-orange-600" />
                        <span>{company.recentActivity} this week</span>
                      </div>
                    )}
                  </div>

                  {/* Difficulty Distribution */}
                  <div className="flex justify-between text-xs">
                    <span className={getDifficultyColor('easy')}>
                      Easy: {company.difficulties.easy}
                    </span>
                    <span className={getDifficultyColor('medium')}>
                      Medium: {company.difficulties.medium}
                    </span>
                    <span className={getDifficultyColor('hard')}>
                      Hard: {company.difficulties.hard}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyDashboard;
