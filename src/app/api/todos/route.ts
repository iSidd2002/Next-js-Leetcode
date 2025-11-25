import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Todo from '@/models/Todo';
import { authenticateRequest } from '@/lib/auth';
import { sanitizeQueryParam, sanitizeString, sanitizeInteger, sanitizeStringArray } from '@/lib/input-validation';
import { checkRateLimit, getRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = checkRateLimit(request, RateLimitPresets.API);
    if (rateLimit.limited) {
      const headers = getRateLimitHeaders(rateLimit, RateLimitPresets.API);
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      }, { 
        status: 429,
        headers
      });
    }

    await connectDB();

    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Sanitize query parameters
    const status = sanitizeQueryParam(searchParams.get('status'));
    const category = sanitizeQueryParam(searchParams.get('category'));
    const priority = sanitizeQueryParam(searchParams.get('priority'));
    
    // Sanitize and validate numeric parameters
    let limit: number;
    let offset: number;
    try {
      limit = sanitizeInteger(searchParams.get('limit') || '100', 1, 1000);
      offset = sanitizeInteger(searchParams.get('offset') || '0', 0, 100000);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid parameters'
      }, { status: 400 });
    }

    // Build filter with proper typing
    const filter: Record<string, unknown> = { userId: user.id };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const todos = await Todo.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    // Convert to frontend format
    const formattedTodos = todos.map(t => ({
      id: t._id.toString(),
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      category: t.category,
      dueDate: t.dueDate,
      completedAt: t.completedAt,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      tags: t.tags,
      estimatedTime: t.estimatedTime,
      actualTime: t.actualTime,
      notes: t.notes
    }));

    return NextResponse.json({
      success: true,
      data: formattedTodos
    });

  } catch (error) {
    console.error('Get todos error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = checkRateLimit(request, RateLimitPresets.API);
    if (rateLimit.limited) {
      const headers = getRateLimitHeaders(rateLimit, RateLimitPresets.API);
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      }, { 
        status: 429,
        headers
      });
    }

    await connectDB();

    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    const todoData = await request.json();

    // Validation
    if (!todoData.title) {
      return NextResponse.json({
        success: false,
        error: 'Title is required'
      }, { status: 400 });
    }

    // Sanitize inputs
    let sanitizedTitle: string;
    let sanitizedDescription: string | undefined;
    let sanitizedNotes: string | undefined;
    let sanitizedTags: string[];
    let sanitizedPriority: string;
    let sanitizedStatus: string;
    let sanitizedCategory: string;
    
    try {
      sanitizedTitle = sanitizeString(todoData.title, 'Title');
      sanitizedDescription = todoData.description ? sanitizeString(todoData.description, 'Description') : undefined;
      sanitizedNotes = todoData.notes ? sanitizeString(todoData.notes, 'Notes') : undefined;
      sanitizedTags = sanitizeStringArray(todoData.tags, 'Tags');
      sanitizedPriority = todoData.priority ? sanitizeString(todoData.priority, 'Priority') : 'medium';
      sanitizedStatus = todoData.status ? sanitizeString(todoData.status, 'Status') : 'pending';
      sanitizedCategory = todoData.category ? sanitizeString(todoData.category, 'Category') : 'other';
      
      // Validate title length
      if (sanitizedTitle.length > 500) {
        throw new Error('Title must not exceed 500 characters');
      }
      if (sanitizedDescription && sanitizedDescription.length > 5000) {
        throw new Error('Description must not exceed 5000 characters');
      }
      if (sanitizedNotes && sanitizedNotes.length > 10000) {
        throw new Error('Notes must not exceed 10000 characters');
      }
    } catch (validationError) {
      return NextResponse.json({
        success: false,
        error: validationError instanceof Error ? validationError.message : 'Invalid input'
      }, { status: 400 });
    }

    const todo = new Todo({
      userId: user.id,
      title: sanitizedTitle,
      description: sanitizedDescription,
      priority: sanitizedPriority,
      status: sanitizedStatus,
      category: sanitizedCategory,
      dueDate: todoData.dueDate,
      tags: sanitizedTags,
      estimatedTime: todoData.estimatedTime,
      notes: sanitizedNotes
    });

    await todo.save();

    const formattedTodo = {
      id: todo._id.toString(),
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      status: todo.status,
      category: todo.category,
      dueDate: todo.dueDate,
      completedAt: todo.completedAt,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
      tags: todo.tags,
      estimatedTime: todo.estimatedTime,
      actualTime: todo.actualTime,
      notes: todo.notes
    };

    return NextResponse.json({
      success: true,
      data: formattedTodo
    }, { status: 201 });

  } catch (error) {
    console.error('Create todo error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
