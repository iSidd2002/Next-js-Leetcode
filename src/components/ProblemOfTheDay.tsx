import { useEffect, useState } from "react";
import type {
  ActiveDailyCodingChallengeQuestion,
} from "@/types";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, Plus } from "lucide-react";
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
      <SpotlightCard className="border-white/10 bg-card/30 backdrop-blur-md">
        <CardContent className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Daily POTD</span>
          </div>
          <div className="h-10 bg-white/5 rounded-lg animate-pulse" />
        </CardContent>
      </SpotlightCard>
    );
  }

  if (error && !problem) {
    return (
      <SpotlightCard className="border-red-500/20 bg-red-500/5 backdrop-blur-md">
        <CardContent className="px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-red-400" />
            <span className="text-xs text-red-400">Daily POTD — unavailable</span>
          </div>
          <Button variant="outline" size="sm" asChild className="w-full h-7 text-xs border-red-500/20 hover:bg-red-500/10 text-red-400">
            <a href="https://leetcode.com/problemset/all/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1.5" />
              Open LeetCode
            </a>
          </Button>
        </CardContent>
      </SpotlightCard>
    );
  }

  if (!problem) return null;

  const { question: { title, difficulty, topicTags }, link } = problem;

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "easy":   return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "medium": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case "hard":   return "text-rose-400 bg-rose-400/10 border-rose-400/20";
      default:       return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  return (
    <SpotlightCard className="border-primary/20 bg-slate-900/80 backdrop-blur-xl overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 opacity-60" />

      <CardContent className="relative z-10 px-4 py-3 space-y-2.5">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-white/80 tracking-tight">Daily POTD</span>
          </div>
          <Badge variant="outline" className={cn("text-[10px] h-5 px-2 font-medium border", getDifficultyColor(difficulty))}>
            {difficulty}
          </Badge>
        </div>

        {/* Title */}
        <a
          href={`https://leetcode.com${link}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm font-bold text-white hover:text-primary transition-colors line-clamp-2 leading-snug"
          title={title}
        >
          {title}
        </a>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {topicTags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center rounded border border-slate-700 bg-slate-800/60 px-1.5 h-5 text-[10px] text-slate-300"
            >
              {tag.name}
            </span>
          ))}
          {topicTags.length > 3 && (
            <span className="inline-flex items-center rounded border border-slate-700 bg-slate-800/60 px-1.5 h-5 text-[10px] text-slate-400">
              +{topicTags.length - 3}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => onAddPotd(problem)}
            size="sm"
            className="flex-1 h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1 h-7 text-xs border-slate-700 bg-slate-800/60 text-white/80 hover:bg-slate-800 hover:text-white"
          >
            <a href={`https://leetcode.com${link}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              Solve
            </a>
          </Button>
        </div>
      </CardContent>
    </SpotlightCard>
  );
};

export default ProblemOfTheDay;
