"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Code, 
  Lightbulb, 
  BookOpen, 
  Bug, 
  Plus,
  Sparkles,
  Target,
  Clock,
  TrendingUp
} from 'lucide-react';
import FlashcardSystem from './study/FlashcardSystem';
import AIAssistant from './ai/AIAssistant';

interface StudyHubProps {
  // Add any props you need
}

const StudyHub = ({}: StudyHubProps) => {
  const [activeTab, setActiveTab] = useState('flashcards');
  const [showCreateFlashcard, setShowCreateFlashcard] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-cyan-600" />
            Study Hub
            <div className="ml-auto flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Enhance your learning with AI-powered tools
              </div>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Brain className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="font-medium text-blue-900">Flashcards</div>
              <div className="text-sm text-blue-700">Spaced repetition learning</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Code className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-medium text-green-900">Code Templates</div>
              <div className="text-sm text-green-700">Reusable patterns</div>
            </div>
            <div className="text-center p-4 bg-rose-50 rounded-lg">
              <Lightbulb className="h-8 w-8 mx-auto mb-2 text-rose-600" />
              <div className="font-medium text-rose-900">AI Assistant</div>
              <div className="text-sm text-rose-700">Smart code review</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="font-medium text-orange-900">Learning Paths</div>
              <div className="text-sm text-orange-700">Structured progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Tools Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="flashcards" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Flashcards
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="paths" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Learning Paths
          </TabsTrigger>
        </TabsList>

        {/* Flashcards Tab */}
        <TabsContent value="flashcards" className="space-y-4">
          <FlashcardSystem 
            onCreateFlashcard={() => setShowCreateFlashcard(true)}
          />
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai-assistant" className="space-y-4">
          <AIAssistant />
        </TabsContent>

        {/* Code Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Code Templates
                <Button size="sm" className="ml-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Code Templates Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  Save and reuse code patterns for common algorithms and data structures.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">Two Pointers</div>
                    <div className="text-sm text-muted-foreground">
                      Template for two-pointer technique problems
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">Binary Search</div>
                    <div className="text-sm text-muted-foreground">
                      Standard binary search implementation
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">DFS/BFS</div>
                    <div className="text-sm text-muted-foreground">
                      Graph traversal templates
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Paths Tab */}
        <TabsContent value="paths" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Learning Paths
                <Button size="sm" className="ml-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Path
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Learning Paths Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  Structured learning paths to guide your algorithm and data structure journey.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <div className="font-medium">Beginner Path</div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Start with basic data structures and algorithms
                    </div>
                    <div className="text-xs text-green-600">4 weeks • 50 problems</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <div className="font-medium">Interview Prep</div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Comprehensive preparation for technical interviews
                    </div>
                    <div className="text-xs text-blue-600">8 weeks • 150 problems</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Flashcard Modal would go here */}
      {showCreateFlashcard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Create Flashcard - Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Flashcard creation form will be implemented here.
              </p>
              <Button onClick={() => setShowCreateFlashcard(false)}>
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudyHub;
