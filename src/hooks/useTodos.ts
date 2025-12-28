'use client';

import { useState, useCallback } from 'react';
import type { Todo } from '@/types';
import StorageService from '@/utils/storage';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

interface UseTodosReturn {
  todos: Todo[];
  isLoading: boolean;
  loadTodos: () => Promise<void>;
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  completeTodo: (id: string) => Promise<void>;
  // Computed values
  stats: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    overdue: number;
    urgent: number;
  };
}

export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      const todosData = await StorageService.getTodos();
      setTodos(todosData);
      logger.info('Todos loaded', { count: todosData.length });
    } catch (error) {
      logger.error('Failed to load todos', error);
      setTodos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTodo = useCallback(async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTodo = await StorageService.addTodo(todoData);
      setTodos(prev => [...prev, newTodo]);
      toast.success('Todo added!');
      logger.info('Todo added', { title: newTodo.title });
    } catch (error) {
      logger.error('Failed to add todo', error);
      toast.error('Failed to add todo');
    }
  }, []);

  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    try {
      const updatedTodo = await StorageService.updateTodo(id, updates);
      setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
      toast.success('Todo updated!');
      logger.info('Todo updated', { id, updates });
    } catch (error) {
      logger.error('Failed to update todo', error);
      toast.error('Failed to update todo');
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      await StorageService.deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
      toast.success('Todo deleted!');
      logger.info('Todo deleted', { id });
    } catch (error) {
      logger.error('Failed to delete todo', error);
      toast.error('Failed to delete todo');
    }
  }, []);

  const completeTodo = useCallback(async (id: string) => {
    try {
      const updatedTodo = await StorageService.updateTodo(id, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
      toast.success('Todo completed!');
      logger.info('Todo completed', { id });
    } catch (error) {
      logger.error('Failed to complete todo', error);
      toast.error('Failed to complete todo');
    }
  }, []);

  // Computed stats
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.status === 'completed').length,
    pending: todos.filter(t => t.status === 'pending').length,
    inProgress: todos.filter(t => t.status === 'in-progress').length,
    overdue: todos.filter(t =>
      t.dueDate &&
      new Date(t.dueDate) < new Date() &&
      t.status !== 'completed'
    ).length,
    urgent: todos.filter(t =>
      t.priority === 'urgent' &&
      t.status !== 'completed'
    ).length,
  };

  return {
    todos,
    isLoading,
    loadTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    completeTodo,
    stats,
  };
}

export default useTodos;
