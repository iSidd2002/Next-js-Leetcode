import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Todo from '@/models/Todo';
import { authenticateRequest } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;

    // Find the todo and verify ownership
    const todo = await Todo.findOne({ _id: id, userId: user.id });

    if (!todo) {
      return NextResponse.json({
        success: false,
        error: 'Todo not found'
      }, { status: 404 });
    }

    // Update fields
    if (todoData.title !== undefined) todo.title = todoData.title;
    if (todoData.description !== undefined) todo.description = todoData.description;
    if (todoData.priority !== undefined) todo.priority = todoData.priority;
    if (todoData.status !== undefined) {
      todo.status = todoData.status;
      // Set completedAt when status changes to completed
      if (todoData.status === 'completed' && !todo.completedAt) {
        todo.completedAt = new Date().toISOString();
      } else if (todoData.status !== 'completed') {
        todo.completedAt = undefined;
      }
    }
    if (todoData.category !== undefined) todo.category = todoData.category;
    if (todoData.dueDate !== undefined) todo.dueDate = todoData.dueDate;
    if (todoData.tags !== undefined) todo.tags = todoData.tags;
    if (todoData.estimatedTime !== undefined) todo.estimatedTime = todoData.estimatedTime;
    if (todoData.actualTime !== undefined) todo.actualTime = todoData.actualTime;
    if (todoData.notes !== undefined) todo.notes = todoData.notes;

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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    const { id } = params;

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
