"use client"

import { useState } from 'react';
import type { Problem } from '@/types';
import { formatDate } from '@/utils/dateMigration';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  Building2,
  Users,
  CheckCircle,
  Clock,
  Star,
  Download,
  Plus
} from 'lucide-react';
import ProblemList from './ProblemList';
import ImportProblems from './ImportProblems';

interface CompanyGroupedProblemListProps {
  problems: Problem[];
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onToggleReview?: (id: string, updates: Partial<Problem>) => void;
  onDeleteProblem: (id: string) => void;
  onEditProblem: (problem: Problem) => void;
  onProblemReviewed: (id: string, quality?: number) => void;
  onImportProblems?: (companyName: string, problemsToImport: any[]) => void;
  isReviewList?: boolean;
  title?: string;
}

interface CompanyGroup {
  company: string;
  problems: Problem[];
  totalCount: number;
  solvedCount: number;
  reviewCount: number;
  dueForReviewCount: number;
}

const CompanyGroupedProblemList = ({
  problems,
  onUpdateProblem,
  onToggleReview,
  onDeleteProblem,
  onEditProblem,
  onProblemReviewed,
  onImportProblems,
  isReviewList = false,
  title = "Problems by Company"
}: CompanyGroupedProblemListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);

  // Group problems by company
  const groupProblemsByCompany = (): CompanyGroup[] => {
    const companyMap = new Map<string, Problem[]>();
    
    // Filter problems first
    const filteredProblems = problems.filter((problem) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesTitle = problem.title.toLowerCase().includes(searchTermLower);
      const matchesTopics = problem.topics && problem.topics.some(topic => topic.toLowerCase().includes(searchTermLower));
      const matchesCompanies = problem.companies && problem.companies.some(company => company.toLowerCase().includes(searchTermLower));
      return matchesTitle || matchesTopics || matchesCompanies;
    });

    // Group by company
    filteredProblems.forEach(problem => {
      if (problem.companies && problem.companies.length > 0) {
        problem.companies.forEach(company => {
          if (!companyMap.has(company)) {
            companyMap.set(company, []);
          }
          companyMap.get(company)!.push(problem);
        });
      } else {
        // Problems without company association
        if (!companyMap.has('Other')) {
          companyMap.set('Other', []);
        }
        companyMap.get('Other')!.push(problem);
      }
    });

    // Convert to CompanyGroup array with statistics
    return Array.from(companyMap.entries()).map(([company, companyProblems]) => {
      const solvedCount = companyProblems.filter(p => p.dateSolved && p.dateSolved.trim() !== '').length;
      const reviewCount = companyProblems.filter(p => p.isReview).length;
      const dueForReviewCount = companyProblems.filter(p => {
        if (!p.isReview || !p.nextReviewDate) return false;
        try {
          const reviewDate = new Date(p.nextReviewDate);
          const today = new Date();
          reviewDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          return reviewDate <= today;
        } catch {
          return false;
        }
      }).length;

      return {
        company,
        problems: companyProblems,
        totalCount: companyProblems.length,
        solvedCount,
        reviewCount,
        dueForReviewCount
      };
    }).sort((a, b) => {
      // Sort by total count descending, then alphabetically
      if (a.totalCount !== b.totalCount) {
        return b.totalCount - a.totalCount;
      }
      return a.company.localeCompare(b.company);
    });
  };

  const toggleCompanyExpansion = (company: string) => {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(company)) {
        newSet.delete(company);
      } else {
        newSet.add(company);
      }
      return newSet;
    });
  };

  const companyGroups = groupProblemsByCompany();
  const totalProblems = problems.length;
  const totalCompanies = companyGroups.length;

  return (
    <div className="space-y-6">
      {/* Header with search and stats */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Building2 className="h-4 w-4" />
                <span>{totalCompanies} companies</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{totalProblems} problems</span>
              </div>
            </div>
            {onImportProblems && (
              <Button onClick={() => setIsImporting(true)} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Import Problems
              </Button>
            )}
          </div>
        </div>

        <Input
          placeholder="Search problems by title, topic, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Company groups */}
      <div className="space-y-4">
        {companyGroups.length > 0 ? (
          companyGroups.map((group) => (
            <Card key={group.company} className="overflow-hidden">
              <Collapsible
                open={expandedCompanies.has(group.company)}
                onOpenChange={() => toggleCompanyExpansion(group.company)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {expandedCompanies.has(group.company) ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{group.company}</CardTitle>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{group.totalCount}</span>
                        </Badge>
                        
                        {group.solvedCount > 0 && (
                          <Badge variant="success" className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>{group.solvedCount}</span>
                          </Badge>
                        )}
                        
                        {group.reviewCount > 0 && (
                          <Badge variant="secondary" className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>{group.reviewCount}</span>
                          </Badge>
                        )}
                        
                        {group.dueForReviewCount > 0 && (
                          <Badge variant="destructive" className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{group.dueForReviewCount}</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <ProblemList
                      problems={group.problems}
                      onUpdateProblem={onUpdateProblem}
                      onToggleReview={onToggleReview}
                      onDeleteProblem={onDeleteProblem}
                      onEditProblem={onEditProblem}
                      onProblemReviewed={onProblemReviewed}
                      isReviewList={isReviewList}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No company problems found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm 
                  ? "No problems match your search criteria." 
                  : "Import problems from companies to see them organized here."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Import Problems Dialog */}
      {onImportProblems && (
        <ImportProblems
          open={isImporting}
          onOpenChange={setIsImporting}
          onImport={onImportProblems}
        />
      )}
    </div>
  );
};

export default CompanyGroupedProblemList;
