"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { ExternalLink, BookOpen, Code, Target, Zap, Users, Trophy, Brain, Sparkles, Palette as PaletteIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExternalResource {
  id: string;
  name: string;
  description: string;
  url: string;
  category: 'dsa' | 'interview' | 'practice' | 'algorithms';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  features: string[];
}

const EXTERNAL_RESOURCES: ExternalResource[] = [
  {
    id: 'codeforces-roadmap',
    name: 'Competitive Programming Guide Till Expert',
    description: 'Complete roadmap from newbie to expert in Codeforces with structured learning path and practice strategies',
    url: 'https://www.shivambhadani.com/student-guide/roadmap-from-newbie-to-expert-in-codeforces',
    category: 'practice',
    difficulty: 'All Levels',
    icon: <Target className="h-5 w-5" />,
    color: 'text-primary',
    bgGradient: 'from-primary/10 via-teal-500/5 to-cyan-500/10',
    features: ['Beginner to Expert', 'Codeforces Focused', 'Step-by-step Roadmap', 'Competitive Programming']
  },
  {
    id: 'striver-a2z',
    name: 'Striver A2Z DSA Sheet',
    description: 'Comprehensive A-Z Data Structures and Algorithms practice sheet with step-by-step learning path',
    url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
    category: 'dsa',
    difficulty: 'All Levels',
    icon: <BookOpen className="h-5 w-5" />,
    color: 'text-secondary',
    bgGradient: 'from-secondary/10 via-amber-500/5 to-yellow-500/10',
    features: ['450+ Problems', 'Step-by-step Guide', 'Video Solutions', 'Beginner Friendly']
  },
  {
    id: 'neetcode-150',
    name: 'NeetCode 150',
    description: 'Curated list of 150 essential LeetCode problems for technical interview preparation',
    url: 'https://neetcode.io/practice',
    category: 'interview',
    difficulty: 'Intermediate',
    icon: <Target className="h-5 w-5" />,
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-500/10 via-green-500/5 to-teal-500/10',
    features: ['150 Essential Problems', 'Interview Focused', 'Video Explanations', 'Pattern-based Learning']
  },
  {
    id: 'learnyard-dsa',
    name: 'LearnYard DSA Practice',
    description: 'Additional data structures and algorithms practice with interactive learning approach',
    url: 'https://learnyard.com/practice/dsa',
    category: 'practice',
    difficulty: 'All Levels',
    icon: <Brain className="h-5 w-5" />,
    color: 'text-accent',
    bgGradient: 'from-accent/10 via-rose-500/5 to-pink-500/10',
    features: ['Interactive Practice', 'Multiple Topics', 'Progress Tracking', 'Concept Building']
  },
  {
    id: 'codingninjas',
    name: 'Coding Ninjas',
    description: 'Comprehensive coding practice platform with structured courses and interview preparation',
    url: 'https://www.codingninjas.com/studio/problems',
    category: 'practice',
    difficulty: 'All Levels',
    icon: <Code className="h-5 w-5" />,
    color: 'text-primary',
    bgGradient: 'from-primary/10 via-teal-500/5 to-cyan-500/10',
    features: ['Structured Learning', 'Interview Prep', 'Multiple Languages', 'Guided Practice']
  },
  {
    id: 'algoexpert',
    name: 'AlgoExpert Problems',
    description: 'Algorithm practice problems with detailed explanations and multiple solution approaches',
    url: 'https://algo.theffox.workers.dev/',
    category: 'algorithms',
    difficulty: 'Advanced',
    icon: <Code className="h-5 w-5" />,
    color: 'text-secondary',
    bgGradient: 'from-secondary/10 via-amber-500/5 to-yellow-500/10',
    features: ['Algorithm Focus', 'Multiple Solutions', 'Time Complexity', 'Space Complexity']
  }
];

const getCategoryInfo = (category: string) => {
  switch (category) {
    case 'dsa':
      return { name: 'DSA', color: 'bg-primary/10 text-primary border-primary/20' };
    case 'interview':
      return { name: 'Interview', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    case 'practice':
      return { name: 'Practice', color: 'bg-accent/10 text-accent border-accent/20' };
    case 'algorithms':
      return { name: 'Algorithms', color: 'bg-secondary/10 text-secondary border-secondary/20' };
    default:
      return { name: 'General', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Intermediate':
      return 'bg-secondary/10 text-secondary border-secondary/20';
    case 'Advanced':
      return 'bg-accent/10 text-accent border-accent/20';
    case 'All Levels':
      return 'bg-primary/10 text-primary border-primary/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};

const ExternalResources = () => {
  const handleResourceClick = (url: string, name: string) => {
    console.log(`External Resource clicked: ${name}`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Artistic Header - Asymmetrical */}
      <div className="relative">
        {/* Decorative Elements */}
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl rotate-[-15deg]" />
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-tr from-secondary/10 to-primary/10 rounded-full blur-2xl rotate-12" />
        
        <div className="relative flex items-start gap-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-primary via-accent to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            {/* Accent dots */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-full border-2 border-background" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-secondary rounded-full" />
          </div>
          <div className="flex-1 pt-3">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-2">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent block">
                Discover
              </span>
              <span className="text-foreground italic block" style={{ transform: 'rotate(1deg)', marginTop: '4px' }}>
                Your Next Challenge
              </span>
            </h2>
            <p className="text-muted-foreground text-lg italic max-w-2xl">
              Hand-picked resources to accelerate your competitive programming journey
            </p>
          </div>
        </div>
      </div>

      {/* Resources Grid - Asymmetrical Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {EXTERNAL_RESOURCES.map((resource, idx) => {
          const categoryInfo = getCategoryInfo(resource.category);
          const rotations = ['-1deg', '1deg', '-0.5deg', '0.5deg', '-1deg', '1deg'];
          const rotation = rotations[idx % rotations.length];
          
          return (
            <SpotlightCard
              key={resource.id}
              className={cn(
                "border-white/10 bg-black/30 backdrop-blur-xl overflow-hidden relative group cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                `bg-gradient-to-br ${resource.bgGradient}`
              )}
              style={{ transform: `rotate(${rotation})` }}
              onClick={() => handleResourceClick(resource.url, resource.name)}
            >
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-xl" />
              
              <CardHeader className="relative z-10 pb-4 pt-6 px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn(
                      "p-3 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform",
                      "rotate-[-3deg] group-hover:rotate-0"
                    )}>
                      <div className={cn("text-white", resource.color)}>
                        {resource.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {resource.name}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={cn("text-[10px] px-2 h-5 font-medium border", categoryInfo.color)}>
                          {categoryInfo.name}
                        </Badge>
                        <Badge className={cn("text-[10px] px-2 h-5 font-medium border", getDifficultyColor(resource.difficulty))}>
                          {resource.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </div>
              </CardHeader>

              <CardContent className="relative z-10 px-6 pb-6 space-y-4">
                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {resource.description}
                </p>

                {/* Features - Creative Layout */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Key Features</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {resource.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", resource.color.replace('text-', 'bg-'))} />
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button - Artistic */}
                <Button
                  className={cn(
                    "w-full mt-4 h-10 bg-gradient-to-r from-primary via-secondary to-accent",
                    "hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90",
                    "text-white font-semibold rounded-xl shadow-lg shadow-primary/20",
                    "hover:shadow-xl hover:shadow-primary/30 transition-all duration-300",
                    "group/btn"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResourceClick(resource.url, resource.name);
                  }}
                >
                  <span>Explore Resource</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </SpotlightCard>
          );
        })}
      </div>

      {/* Footer Note - Hand-written Style */}
      <div className="relative mt-10 p-6 bg-gradient-to-br from-secondary/10 via-background/50 to-primary/10 border-2 border-secondary/20 rounded-3xl rotate-[0.5deg]">
        <div className="absolute top-3 right-3 w-10 h-10 bg-secondary/10 rounded-full blur-sm" />
        <div className="absolute bottom-3 left-3 w-8 h-8 bg-primary/10 rounded-full blur-sm" />
        
        <div className="relative flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-base font-bold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary" />
              Pro Tip from the Team
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Use these external resources to discover new problems, then add them to your POTD archive using the 
              "Add Problem" feature. This way you can track your progress and use the spaced repetition system 
              for long-term retention. <span className="font-semibold text-primary">Happy coding! 🚀</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalResources;
