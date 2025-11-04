"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, BookOpen, Target, Zap } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  showFeatures?: boolean;
}

export default function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  onAction, 
  icon,
  showFeatures = false 
}: EmptyStateProps) {
  const defaultIcon = <BookOpen className="h-12 w-12 text-muted-foreground/50" />;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-muted/50 rounded-full">
              {icon || defaultIcon}
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-6">{description}</p>
          
          {onAction && actionLabel && (
            <Button 
              onClick={onAction}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {actionLabel}
            </Button>
          )}
        </CardContent>
      </Card>

      {showFeatures && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <div className="text-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit mx-auto mb-4">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium mb-2">Track Progress</h4>
            <p className="text-sm text-muted-foreground">
              Monitor your coding journey across multiple platforms
            </p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-fit mx-auto mb-4">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-medium mb-2">Spaced Repetition</h4>
            <p className="text-sm text-muted-foreground">
              Review problems at optimal intervals to retain knowledge
            </p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full w-fit mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-medium mb-2">Analytics</h4>
            <p className="text-sm text-muted-foreground">
              Visualize your progress with detailed charts and insights
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
