"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, Code, Target, Brain, ArrowRight } from "lucide-react";

interface QuickResource {
  id: string;
  name: string;
  shortDescription: string;
  url: string;
  category: string;
  icon: React.ReactNode;
  color: string;
}

const QUICK_RESOURCES: QuickResource[] = [
  {
    id: 'striver-a2z',
    name: 'Striver A2Z DSA',
    shortDescription: '450+ problems with step-by-step guide',
    url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
    category: 'DSA',
    icon: <BookOpen className="h-4 w-4" />,
    color: 'text-blue-600'
  },
  {
    id: 'neetcode-150',
    name: 'NeetCode 150',
    shortDescription: '150 essential interview problems',
    url: 'https://neetcode.io/practice',
    category: 'Interview',
    icon: <Target className="h-4 w-4" />,
    color: 'text-green-600'
  },
  {
    id: 'learnyard-dsa',
    name: 'LearnYard DSA',
    shortDescription: 'Interactive DSA practice',
    url: 'https://learnyard.com/practice/dsa',
    category: 'Practice',
    icon: <Brain className="h-4 w-4" />,
    color: 'text-purple-600'
  },
  {
    id: 'algoexpert',
    name: 'AlgoExpert',
    shortDescription: 'Advanced algorithm problems',
    url: 'https://algo.theffox.workers.dev/',
    category: 'Algorithms',
    icon: <Code className="h-4 w-4" />,
    color: 'text-orange-600'
  }
];

interface ExternalResourcesCardProps {
  onViewAll?: () => void;
}

const ExternalResourcesCard = ({ onViewAll }: ExternalResourcesCardProps) => {
  const handleResourceClick = (url: string, name: string) => {
    console.log(`Quick Resource clicked: ${name}`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <ExternalLink className="h-5 w-5 mr-2 text-indigo-600" />
            Practice Resources
          </CardTitle>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="text-xs">
              View All
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {QUICK_RESOURCES.map((resource) => (
          <div
            key={resource.id}
            className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 transition-colors cursor-pointer group"
            onClick={() => handleResourceClick(resource.url, resource.name)}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className={`${resource.color} p-1.5 rounded-md bg-white/70 dark:bg-black/30`}>
                {resource.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium truncate group-hover:underline">
                    {resource.name}
                  </h4>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {resource.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {resource.shortDescription}
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        ))}

        {/* Quick Access Note */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>Tip:</strong> Find problems on these platforms, then add them to your POTD archive for tracking and spaced repetition.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExternalResourcesCard;
