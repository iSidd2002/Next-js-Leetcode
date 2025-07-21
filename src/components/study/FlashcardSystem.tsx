"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, RotateCcw, CheckCircle, XCircle, Plus, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface Flashcard {
  _id: string;
  title: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  reviewCount: number;
  correctCount: number;
  confidence: number;
}

interface FlashcardSystemProps {
  onCreateFlashcard: () => void;
}

const FlashcardSystem = ({ onCreateFlashcard }: FlashcardSystemProps) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    remaining: 0
  });
  const [loading, setLoading] = useState(true);
  const [reviewMode, setReviewMode] = useState<'due' | 'all' | 'category'>('due');

  useEffect(() => {
    loadFlashcards();
  }, [reviewMode]);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (reviewMode === 'due') {
        params.append('dueForReview', 'true');
      }
      
      const response = await fetch(`/api/study/flashcards?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setFlashcards(data.data.flashcards);
        setSessionStats({
          reviewed: 0,
          correct: 0,
          remaining: data.data.flashcards.length
        });
        
        if (data.data.flashcards.length > 0) {
          setCurrentCard(data.data.flashcards[0]);
        }
      }
    } catch (error) {
      console.error('Error loading flashcards:', error);
      toast.error('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (correct: boolean, confidence?: number) => {
    if (!currentCard) return;

    try {
      const response = await fetch('/api/study/flashcards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcardId: currentCard._id,
          correct,
          confidence
        })
      });

      if (response.ok) {
        // Update session stats
        setSessionStats(prev => ({
          reviewed: prev.reviewed + 1,
          correct: prev.correct + (correct ? 1 : 0),
          remaining: prev.remaining - 1
        }));

        // Move to next card
        const remainingCards = flashcards.filter(card => card._id !== currentCard._id);
        setFlashcards(remainingCards);
        
        if (remainingCards.length > 0) {
          setCurrentCard(remainingCards[0]);
          setShowAnswer(false);
        } else {
          setCurrentCard(null);
          toast.success('Review session completed!');
        }
      }
    } catch (error) {
      console.error('Error updating flashcard:', error);
      toast.error('Failed to update flashcard');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Flashcard Review
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={reviewMode === 'due' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setReviewMode('due')}
              >
                Due for Review
              </Button>
              <Button
                variant={reviewMode === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setReviewMode('all')}
              >
                All Cards
              </Button>
              <Button onClick={onCreateFlashcard} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sessionStats.reviewed}</div>
              <div className="text-sm text-muted-foreground">Reviewed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{sessionStats.remaining}</div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
          </div>
          
          {sessionStats.reviewed > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Accuracy</span>
                <span>{Math.round((sessionStats.correct / sessionStats.reviewed) * 100)}%</span>
              </div>
              <Progress value={(sessionStats.correct / sessionStats.reviewed) * 100} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Flashcard */}
      {currentCard ? (
        <Card className="min-h-[400px]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(currentCard.difficulty)}>
                  {currentCard.difficulty}
                </Badge>
                <Badge variant="outline">{currentCard.category}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {currentCard.reviewCount} reviews • {Math.round((currentCard.correctCount / Math.max(currentCard.reviewCount, 1)) * 100)}% accuracy
              </div>
            </div>
            <CardTitle>{currentCard.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">Question:</h3>
              <div className="whitespace-pre-wrap">{currentCard.front}</div>
            </div>

            {/* Answer (shown when revealed) */}
            {showAnswer && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium mb-2">Answer:</h3>
                <div className="whitespace-pre-wrap">{currentCard.back}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              {!showAnswer ? (
                <Button onClick={() => setShowAnswer(true)} size="lg">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Show Answer
                </Button>
              ) : (
                <div className="flex gap-4">
                  <Button
                    variant="destructive"
                    onClick={() => handleReview(false)}
                    size="lg"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Incorrect
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => handleReview(true)}
                    size="lg"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Correct
                  </Button>
                </div>
              )}
            </div>

            {/* Tags */}
            {currentCard.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentCard.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No flashcards to review</h3>
            <p className="text-muted-foreground mb-4">
              {reviewMode === 'due' 
                ? "Great job! No cards are due for review right now."
                : "You haven't created any flashcards yet."
              }
            </p>
            <Button onClick={onCreateFlashcard}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Flashcard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FlashcardSystem;
