"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Code, 
  Lightbulb, 
  BookOpen, 
  Bug, 
  Target,
  Sparkles,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface AIAssistantProps {
  problemTitle?: string;
  problemDescription?: string;
  userCode?: string;
  language?: string;
}

const AIAssistant = ({ 
  problemTitle = '', 
  problemDescription = '', 
  userCode = '', 
  language = 'javascript' 
}: AIAssistantProps) => {
  const [activeTab, setActiveTab] = useState('review');
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(userCode);
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [hint, setHint] = useState<any>(null);
  const [explanation, setExplanation] = useState<any>(null);
  const [bugs, setBugs] = useState<any>(null);

  const handleCodeReview = async () => {
    if (!code.trim()) {
      toast.error('Please enter code to review');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/code-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          code,
          language,
          problemTitle,
          problemDescription
        })
      });

      const data = await response.json();
      if (data.success) {
        setReviewResult(data.data);
        toast.success('Code review completed!');
      } else {
        toast.error('Failed to review code');
      }
    } catch (error) {
      console.error('Code review error:', error);
      toast.error('Failed to review code');
    } finally {
      setLoading(false);
    }
  };

  const handleGetHint = async () => {
    if (!problemTitle || !problemDescription) {
      toast.error('Problem information required for hints');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          problemTitle,
          problemDescription,
          difficulty: 'medium', // Could be dynamic
          currentAttempt: code
        })
      });

      const data = await response.json();
      if (data.success) {
        setHint(data.data);
        toast.success('Hint generated!');
      } else {
        toast.error('Failed to generate hint');
      }
    } catch (error) {
      console.error('Hint error:', error);
      toast.error('Failed to generate hint');
    } finally {
      setLoading(false);
    }
  };

  const handleExplainSolution = async () => {
    if (!code.trim()) {
      toast.error('Please enter code to explain');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          code,
          language,
          problemTitle
        })
      });

      const data = await response.json();
      if (data.success) {
        setExplanation(data.data);
        toast.success('Explanation generated!');
      } else {
        toast.error('Failed to generate explanation');
      }
    } catch (error) {
      console.error('Explanation error:', error);
      toast.error('Failed to generate explanation');
    } finally {
      setLoading(false);
    }
  };

  const handleBugDetection = async () => {
    if (!code.trim()) {
      toast.error('Please enter code to analyze');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          code,
          language,
          problemContext: `${problemTitle}: ${problemDescription}`
        })
      });

      const data = await response.json();
      if (data.success) {
        setBugs(data.data);
        toast.success('Bug analysis completed!');
      } else {
        toast.error('Failed to analyze bugs');
      }
    } catch (error) {
      console.error('Bug detection error:', error);
      toast.error('Failed to analyze bugs');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800';
    if (score >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            AI Coding Assistant
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by GPT-4
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Code:</label>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here for AI analysis..."
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
            
            {problemTitle && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900">Problem: {problemTitle}</div>
                {problemDescription && (
                  <div className="text-sm text-blue-700 mt-1">{problemDescription.slice(0, 200)}...</div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Features Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="review" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Review
          </TabsTrigger>
          <TabsTrigger value="hints" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Hints
          </TabsTrigger>
          <TabsTrigger value="explain" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Explain
          </TabsTrigger>
          <TabsTrigger value="bugs" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Debug
          </TabsTrigger>
        </TabsList>

        {/* Code Review Tab */}
        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                AI Code Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleCodeReview} 
                disabled={loading || !code.trim()}
                className="w-full"
              >
                {loading ? 'Analyzing...' : 'Review My Code'}
              </Button>

              {reviewResult && (
                <div className="space-y-4">
                  {/* Overall Score */}
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold mb-2">
                      <span className={getScoreColor(reviewResult.overallScore)}>
                        {reviewResult.overallScore}/10
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>

                  {/* Detailed Scores */}
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(reviewResult).map(([key, value]: [string, any]) => {
                      if (key === 'overallScore' || key === 'summary' || key === 'bugs') return null;
                      
                      return (
                        <div key={key} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <Badge className={getScoreBadgeColor(value.score)}>
                              {value.score}/10
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {value.feedback}
                          </div>
                          {value.suggestions && value.suggestions.length > 0 && (
                            <div className="space-y-1">
                              {value.suggestions.map((suggestion: string, index: number) => (
                                <div key={index} className="text-xs text-blue-600 flex items-start gap-1">
                                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-sm text-blue-900">{reviewResult.summary}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hints Tab */}
        <TabsContent value="hints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Smart Hints
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGetHint} 
                disabled={loading || !problemTitle}
                className="w-full"
              >
                {loading ? 'Thinking...' : 'Get a Hint'}
              </Button>

              {hint && (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-900">Hint</span>
                      <Badge variant="outline">{hint.level}</Badge>
                    </div>
                    <p className="text-yellow-900">{hint.hint}</p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Suggested Approach</h4>
                    <p className="text-sm text-blue-900">{hint.approach}</p>
                  </div>

                  {hint.nextSteps && hint.nextSteps.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium mb-2">Next Steps</h4>
                      <ul className="space-y-1">
                        {hint.nextSteps.map((step: string, index: number) => (
                          <li key={index} className="text-sm text-green-900 flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {hint.relatedConcepts && hint.relatedConcepts.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Related Concepts to Review</h4>
                      <div className="flex flex-wrap gap-2">
                        {hint.relatedConcepts.map((concept: string, index: number) => (
                          <Badge key={index} variant="secondary">{concept}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Explanation Tab */}
        <TabsContent value="explain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Solution Explanation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleExplainSolution} 
                disabled={loading || !code.trim()}
                className="w-full"
              >
                {loading ? 'Analyzing...' : 'Explain This Solution'}
              </Button>

              {explanation && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Overview</h4>
                    <p className="text-sm text-blue-900">{explanation.overview}</p>
                  </div>

                  {explanation.stepByStep && explanation.stepByStep.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Step-by-Step Breakdown</h4>
                      {explanation.stepByStep.map((step: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Step {step.step}</Badge>
                            <span className="font-medium">{step.description}</span>
                          </div>
                          {step.codeSnippet && (
                            <div className="bg-gray-100 p-2 rounded text-sm font-mono mb-2">
                              {step.codeSnippet}
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground">{step.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-1">Time Complexity</h5>
                      <div className="text-sm font-mono text-green-800 mb-1">
                        {explanation.timeComplexity?.analysis}
                      </div>
                      <p className="text-xs text-green-700">{explanation.timeComplexity?.explanation}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h5 className="font-medium text-purple-900 mb-1">Space Complexity</h5>
                      <div className="text-sm font-mono text-purple-800 mb-1">
                        {explanation.spaceComplexity?.analysis}
                      </div>
                      <p className="text-xs text-purple-700">{explanation.spaceComplexity?.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bug Detection Tab */}
        <TabsContent value="bugs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Bug Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleBugDetection} 
                disabled={loading || !code.trim()}
                className="w-full"
              >
                {loading ? 'Scanning...' : 'Scan for Bugs'}
              </Button>

              {bugs && (
                <div className="space-y-4">
                  {bugs.bugs && bugs.bugs.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Issues Found
                      </h4>
                      {bugs.bugs.map((bug: any, index: number) => (
                        <div key={index} className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{bug.type}</span>
                            <Badge 
                              variant={bug.severity === 'high' ? 'destructive' : 
                                     bug.severity === 'medium' ? 'default' : 'secondary'}
                            >
                              {bug.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-orange-900 mb-2">{bug.description}</p>
                          {bug.suggestedFix && (
                            <div className="text-sm">
                              <span className="font-medium">Suggested Fix: </span>
                              <span className="text-green-700">{bug.suggestedFix}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-medium text-green-900">No Issues Found</h4>
                      <p className="text-sm text-green-700">Your code looks good!</p>
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Overall Assessment</h4>
                    <p className="text-sm text-muted-foreground">{bugs.overallAssessment}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistant;
