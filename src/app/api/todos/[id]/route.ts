import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Todo from '@/models/Todo';
import { authenticateRequest } from '@/lib/auth';
import { sanitizeString, sanitizeStringArray, isValidObjectId } from '@/lib/input-validation';
import { checkRateLimit, getRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limiter';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid todo ID format'
      }, { status: 400 });
    }

    // Find the todo and verify ownership
    const todo = await Todo.findOne({ _id: id, userId: user.id });

    if (!todo) {
      return NextResponse.json({
        success: false,
        error: 'Todo not found'
      }, { status: 404 });
    }

    // Sanitize and update fields
    try {
      if (todoData.title !== undefined) {
        const sanitizedTitle = sanitizeString(todoData.title, 'Title');
        if (sanitizedTitle.length > 500) throw new Error('Title must not exceed 500 characters');
        todo.title = sanitizedTitle;
      }
      if (todoData.description !== undefined) {
        const sanitizedDesc = sanitizeString(todoData.description, 'Description');
        if (sanitizedDesc.length > 5000) throw new Error('Description must not exceed 5000 characters');
        todo.description = sanitizedDesc;
      }
      if (todoData.priority !== undefined) todo.priority = sanitizeString(todoData.priority, 'Priority');
      if (todoData.status !== undefined) {
        todo.status = sanitizeString(todoData.status, 'Status');
        // Set completedAt when status changes to completed
        if (todoData.status === 'completed' && !todo.completedAt) {
          todo.completedAt = new Date().toISOString();
        } else if (todoData.status !== 'completed') {
          todo.completedAt = undefined;
        }
      }
      if (todoData.category !== undefined) todo.category = sanitizeString(todoData.category, 'Category');
      if (todoData.dueDate !== undefined) todo.dueDate = todoData.dueDate;
      if (todoData.tags !== undefined) todo.tags = sanitizeStringArray(todoData.tags, 'Tags');
      if (todoData.estimatedTime !== undefined) todo.estimatedTime = todoData.estimatedTime;
      if (todoData.actualTime !== undefined) todo.actualTime = todoData.actualTime;
      if (todoData.notes !== undefined) {
        const sanitizedNotes = sanitizeString(todoData.notes, 'Notes');
        if (sanitizedNotes.length > 10000) throw new Error('Notes must not exceed 10000 characters');
        todo.notes = sanitizedNotes;
      }
    } catch (validationError) {
      return NextResponse.json({
        success: false,
        error: validationError instanceof Error ? validationError.message : 'Invalid input'
      }, { status: 400 });
    }

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
    });

  } catch (error) {
    console.error('Update todo error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid todo ID format'
      }, { status: 400 });
    }

    // Find and delete the todo
    const todo = await Todo.findOneAndDelete({ _id: id, userId: user.id });

    if (!todo) {
      return NextResponse.json({
        success: false,
        error: 'Todo not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Todo deleted successfully'
    });

  } catch (error) {
    console.error('Delete todo error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
