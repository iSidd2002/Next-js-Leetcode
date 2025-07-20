import type { Problem } from '@/types';

export interface CompanyStats {
  name: string;
  totalProblems: number;
  solvedProblems: number;
  activeProblemss: number;
  learnedProblems: number;
  reviewProblems: number;
  dueForReview: number;
  solvedPercentage: number;
  difficulties: {
    easy: number;
    medium: number;
    hard: number;
  };
  recentActivity: number; // Problems solved in last 7 days
}

export function getCompanyStatistics(problems: Problem[]): CompanyStats[] {
  const companyMap = new Map<string, Problem[]>();
  
  // Group problems by company
  problems.forEach(problem => {
    if (problem.companies && problem.companies.length > 0) {
      problem.companies.forEach(company => {
        if (!companyMap.has(company)) {
          companyMap.set(company, []);
        }
        companyMap.get(company)!.push(problem);
      });
    }
  });

  // Calculate statistics for each company
  return Array.from(companyMap.entries()).map(([company, companyProblems]) => {
    const totalProblems = companyProblems.length;
    const solvedProblems = companyProblems.filter(p => p.dateSolved && p.dateSolved.trim() !== '').length;
    const activeProblemss = companyProblems.filter(p => p.status === 'active').length;
    const learnedProblems = companyProblems.filter(p => p.status === 'learned').length;
    const reviewProblems = companyProblems.filter(p => p.isReview).length;
    
    // Calculate due for review
    const dueForReview = companyProblems.filter(p => {
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

    // Calculate difficulty distribution
    const difficulties = {
      easy: companyProblems.filter(p => p.difficulty.toLowerCase() === 'easy').length,
      medium: companyProblems.filter(p => p.difficulty.toLowerCase() === 'medium').length,
      hard: companyProblems.filter(p => p.difficulty.toLowerCase() === 'hard').length,
    };

    // Calculate recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentActivity = companyProblems.filter(p => {
      if (!p.dateSolved || p.dateSolved.trim() === '') return false;
      try {
        return new Date(p.dateSolved) >= weekAgo;
      } catch {
        return false;
      }
    }).length;

    const solvedPercentage = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

    return {
      name: company,
      totalProblems,
      solvedProblems,
      activeProblemss,
      learnedProblems,
      reviewProblems,
      dueForReview,
      solvedPercentage,
      difficulties,
      recentActivity
    };
  }).sort((a, b) => {
    // Sort by total problems descending, then by name
    if (a.totalProblems !== b.totalProblems) {
      return b.totalProblems - a.totalProblems;
    }
    return a.name.localeCompare(b.name);
  });
}

export function getTopCompanies(problems: Problem[], limit: number = 5): CompanyStats[] {
  return getCompanyStatistics(problems).slice(0, limit);
}

export function getCompanyProgress(problems: Problem[], companyName: string): CompanyStats | null {
  const stats = getCompanyStatistics(problems);
  return stats.find(stat => stat.name === companyName) || null;
}
