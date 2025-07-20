import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Todo from '@/models/Todo';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter
    const filter: any = { userId: user.id };
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

    const todo = new Todo({
      userId: user.id,
      title: todoData.title,
      description: todoData.description,
      priority: todoData.priority || 'medium',
      status: todoData.status || 'pending',
      category: todoData.category || 'other',
      dueDate: todoData.dueDate,
      tags: todoData.tags || [],
      estimatedTime: todoData.estimatedTime,
      notes: todoData.notes
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
