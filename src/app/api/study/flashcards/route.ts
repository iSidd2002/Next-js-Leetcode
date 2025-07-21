import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Flashcard } from '@/models/StudyFeatures';
import { authenticateRequest } from '@/lib/auth';

// GET /api/study/flashcards - Get user's flashcards
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const dueForReview = searchParams.get('dueForReview') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    // Build query
    const query: any = { userId: user.id };
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    
    if (dueForReview) {
      const now = new Date().toISOString();
      query.$or = [
        { nextReview: { $lte: now } },
        { nextReview: null }
      ];
    }

    const flashcards = await Flashcard.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Flashcard.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        flashcards,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get flashcards error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST /api/study/flashcards - Create new flashcard
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const body = await request.json();
    const { title, front, back, category, difficulty, tags } = body;

    // Validation
    if (!title || !front || !back || !category || !difficulty) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    const flashcard = new Flashcard({
      userId: user.id,
      title: title.trim(),
      front: front.trim(),
      back: back.trim(),
      category,
      difficulty,
      tags: tags || []
    });

    await flashcard.save();

    return NextResponse.json({
      success: true,
      data: flashcard
    }, { status: 201 });

  } catch (error) {
    console.error('Create flashcard error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// PUT /api/study/flashcards - Update flashcard review
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const body = await request.json();
    const { flashcardId, correct, confidence } = body;

    if (!flashcardId || typeof correct !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    const flashcard = await Flashcard.findOne({
      _id: flashcardId,
      userId: user.id
    });

    if (!flashcard) {
      return NextResponse.json({
        success: false,
        error: 'Flashcard not found'
      }, { status: 404 });
    }

    // Update review statistics
    flashcard.reviewCount += 1;
    if (correct) {
      flashcard.correctCount += 1;
    }

    // Update confidence if provided
    if (confidence && confidence >= 1 && confidence <= 5) {
      flashcard.confidence = confidence;
    }

    // Calculate next review date using spaced repetition
    const now = new Date();
    let nextReviewDays = 1; // Default: review tomorrow

    if (correct) {
      // Successful review - increase interval
      const successRate = flashcard.correctCount / flashcard.reviewCount;
      const confidenceMultiplier = flashcard.confidence / 5;
      
      if (flashcard.reviewCount === 1) {
        nextReviewDays = 1;
      } else if (flashcard.reviewCount === 2) {
        nextReviewDays = 3;
      } else {
        // Exponential backoff based on success rate and confidence
        nextReviewDays = Math.min(
          Math.floor(nextReviewDays * 2 * successRate * confidenceMultiplier),
          30 // Max 30 days
        );
      }
    } else {
      // Failed review - reset to short interval
      nextReviewDays = 1;
    }

    const nextReview = new Date(now.getTime() + nextReviewDays * 24 * 60 * 60 * 1000);
    
    flashcard.lastReviewed = now.toISOString();
    flashcard.nextReview = nextReview.toISOString();
    flashcard.updatedAt = now.toISOString();

    await flashcard.save();

    return NextResponse.json({
      success: true,
      data: flashcard
    });

  } catch (error) {
    console.error('Update flashcard error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
