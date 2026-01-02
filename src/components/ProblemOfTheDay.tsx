import { useEffect, useState } from "react";
import type {
  ActiveDailyCodingChallengeQuestion,
} from "@/types";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, Plus, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

// ... (keep imports and constants)

// Use environment variable or fallback to Next.js API routes
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const LEETCODE_API_ENDPOINT = `${API_BASE_URL}/potd`;
// Note: This query is ignored by the backend for security reasons
// The backend uses a predefined safe query instead
const DAILY_PROBLEM_QUERY = `
  query questionOfToday {
    activeDailyCodingChallengeQuestion {
      date
      userStatus
      link
      question {
        acRate
        difficulty
        freqBar
        frontendQuestionId
        isFavor
        paidOnly
        status
        title
        titleSlug
        hasVideoSolution
        hasSolution
        topicTags {
          name
          id
          slug
        }
      }
    }
  }
`;

interface ProblemOfTheDayProps {
  onAddPotd: (potd: ActiveDailyCodingChallengeQuestion) => void;
}

const ProblemOfTheDay = ({ onAddPotd }: ProblemOfTheDayProps) => {
  const [problem, setProblem] =
    useState<ActiveDailyCodingChallengeQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDailyProblem = async () => {
      try {
        // Note: Backend ignores the query parameter for security
        // It uses a predefined safe query instead
        const response = await fetch(LEETCODE_API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: DAILY_PROBLEM_QUERY }),
        });

        if (!response.ok) {
          // Handle rate limiting specifically
          if (response.status === 429) {
            throw new Error("Rate limit exceeded. Please try again later.");
          }
          throw new Error(`Failed to fetch daily problem: ${response.status}`);
        }

        const result = await response.json();
        if (result.data?.activeDailyCodingChallengeQuestion) {
          setProblem(result.data.activeDailyCodingChallengeQuestion);
        } else {
          throw new Error("No daily problem found in response");
        }
      } catch (err) {
        console.error('Failed to fetch Problem of the Day:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDailyProblem();
  }, []);

  if (loading) {
    return (
      <SpotlightCard className="border-white/10 bg-card/30 backdrop-blur-md h-full">
        <CardHeader className="pb-4 pt-5 px-5">
          <CardTitle className="text-sm flex items-center gap-2.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Problem of the Day
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="h-24 bg-white/5 rounded-xl animate-pulse"></div>
        </CardContent>
      </SpotlightCard>
    );
  }

  // Error fallback UI
  if (error && !problem) {
    return (
      <SpotlightCard className="border-red-500/20 bg-red-500/5 backdrop-blur-md h-full">
        <CardHeader className="pb-4 pt-5 px-5">
           <CardTitle className="text-sm flex items-center gap-2.5 text-red-400">
            <Calendar className="h-4 w-4" />
            Problem of the Day
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          <div className="text-sm text-red-300/80">
            Unable to load daily problem.
          </div>
          <Button variant="outline" size="sm" asChild className="w-full border-red-500/20 hover:bg-red-500/10 text-red-400">
            <a
              href="https://leetcode.com/problemset/all/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-3 w-3" />
              Open LeetCode
            </a>
          </Button>
        </CardContent>
      </SpotlightCard>
    );
  }

  if (!problem) {
    return null;
  }

  const {
    question: { title, difficulty, topicTags },
    link,
  } = problem;

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "easy":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "medium":
        return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case "hard":
        return "text-rose-400 bg-rose-400/10 border-rose-400/20";
      default:
        return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  const handleAddToList = () => {
    if (problem) {
      onAddPotd(problem);
    }
  };

  return (
    <SpotlightCard className="border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden relative group h-full">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50" />
      
      <CardHeader className="pb-4 pt-5 px-5 relative z-10">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight text-foreground">Daily POTD</span>
          </div>
          <Badge variant="outline" className={cn("text-[10px] h-6 px-2.5 font-medium border", getDifficultyColor(difficulty))}>
            {difficulty}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10 px-5 pb-5 space-y-4">
        <div className="space-y-3.5">
          <a
            href={`https://leetcode.com${link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-base font-bold text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug"
            title={title}
          >
            {title}
          </a>
          
          <div className="flex flex-wrap gap-2">
            {topicTags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag.id} 
                variant="secondary" 
                className="text-[10px] px-2.5 h-6 bg-white/5 hover:bg-white/10 text-slate-300 border-transparent font-normal transition-colors"
              >
                {tag.name}
              </Badge>
            ))}
            {topicTags.length > 3 && (
              <Badge variant="secondary" className="text-[10px] px-2.5 h-6 bg-white/5 text-slate-400 font-normal">
                +{topicTags.length - 3}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2.5 pt-2">
           <Button 
            onClick={handleAddToList} 
            size="sm" 
            className="h-9 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all"
           >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add to List
           </Button>
           <Button 
            variant="outline" 
            size="sm" 
            asChild 
            className="h-9 text-xs font-medium border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all"
           >
              <a
                href={`https://leetcode.com${link}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Solve Now
              </a>
           </Button>
        </div>
      </CardContent>
    </SpotlightCard>
  );
};

export default ProblemOfTheDay;
