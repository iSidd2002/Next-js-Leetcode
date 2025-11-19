"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, Code, Target, Zap, Users, Trophy, Brain } from "lucide-react";

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
    color: 'text-cyan-700',
    bgGradient: 'from-cyan-50 to-teal-50 dark:from-cyan-950/15 dark:to-teal-950/25',
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
    color: 'text-sky-600',
    bgGradient: 'from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/15',
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
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/15',
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
    color: 'text-rose-700',
    bgGradient: 'from-rose-50 to-fuchsia-50 dark:from-rose-950/25 dark:to-fuchsia-950/20',
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
    color: 'text-rose-600',
    bgGradient: 'from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/15',
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
    color: 'text-amber-600',
    bgGradient: 'from-amber-50 to-yellow-50 dark:from-amber-950/15 dark:to-yellow-950/25',
    features: ['Algorithm Focus', 'Multiple Solutions', 'Time Complexity', 'Space Complexity']
  }
];

const getCategoryInfo = (category: string) => {
  switch (category) {
    case 'dsa':
      return { name: 'DSA', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' };
    case 'interview':
      return { name: 'Interview Prep', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    case 'practice':
      return { name: 'Practice', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200' };
    case 'algorithms':
      return { name: 'Algorithms', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' };
    default:
      return { name: 'General', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Intermediate':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'Advanced':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'All Levels':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const ExternalResources = () => {
  const handleResourceClick = (url: string, name: string) => {
    // Track analytics if needed
    console.log(`External Resource clicked: ${name}`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">External Resources</h2>
          <p className="text-muted-foreground">
            Popular coding practice platforms to complement your learning journey
          </p>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <ExternalLink className="h-4 w-4 mr-1" />
          All links open in new tab
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {EXTERNAL_RESOURCES.map((resource) => {
          const categoryInfo = getCategoryInfo(resource.category);
          
          return (
            <Card 
              key={resource.id} 
              className={`bg-gradient-to-br ${resource.bgGradient} border-l-4 border-l-current hover:shadow-lg transition-all duration-200 cursor-pointer group`}
              onClick={() => handleResourceClick(resource.url, resource.name)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`${resource.color} p-2 rounded-lg bg-white/50 dark:bg-black/20`}>
                      {resource.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:underline flex items-center">
                        {resource.name}
                        <ExternalLink className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardTitle>
                    </div>
                  </div>
                </div>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className={`text-xs ${categoryInfo.color}`}>
                    {categoryInfo.name}
                  </Badge>
                  <Badge className={`text-xs ${getDifficultyColor(resource.difficulty)}`}>
                    {resource.difficulty}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {resource.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Key Features:</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {resource.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-xs text-muted-foreground">
                        <div className="w-1 h-1 bg-current rounded-full mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResourceClick(resource.url, resource.name);
                  }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit {resource.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium mb-1">Pro Tip</h4>
            <p className="text-sm text-muted-foreground">
              Use these external resources to discover new problems, then add them to your POTD archive using the 
              "Add Problem" feature. This way you can track your progress and use the spaced repetition system 
              for long-term retention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalResources;
