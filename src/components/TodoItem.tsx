'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Clock, 
  Calendar,
  Flag,
  Tag,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import type { Todo } from '@/types';
import TodoForm from './TodoForm';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleStatusToggle = (checked: boolean) => {
    const newStatus = checked ? 'completed' : 'pending';
    const updates: Partial<Todo> = {
      status: newStatus,
      completedAt: checked ? new Date().toISOString() : undefined
    };
    onUpdate(todo.id, updates);
  };

  const handleEdit = (updatedTodo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    onUpdate(todo.id, updatedTodo);
    setIsEditDialogOpen(false);
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-amber-100 text-amber-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const categoryColors = {
    coding: 'bg-purple-100 text-purple-800',
    study: 'bg-teal-100 text-teal-800',
    'interview-prep': 'bg-indigo-100 text-indigo-800',
    project: 'bg-cyan-100 text-cyan-800',
    personal: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800'
  };

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== 'completed';
  const isCompleted = todo.status === 'completed';

  return (
    <>
      <Card className={`transition-all duration-200 hover:shadow-md ${
        isCompleted ? 'opacity-75' : ''
      } ${isOverdue ? 'border-red-200 bg-red-50/30' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <Checkbox
                checked={isCompleted}
                onCheckedChange={handleStatusToggle}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium text-sm ${
                  isCompleted ? 'line-through text-muted-foreground' : ''
                }`}>
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {todo.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${priorityColors[todo.priority]}`}
              >
                <Flag className="h-3 w-3 mr-1" />
                {todo.priority}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(todo.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className={statusColors[todo.status]}>
              {todo.status.replace('-', ' ')}
            </Badge>
            
            <Badge variant="outline" className={categoryColors[todo.category]}>
              {todo.category.replace('-', ' ')}
            </Badge>

            {todo.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {todo.dueDate && (
              <div className={`flex items-center ${isOverdue ? 'text-red-600' : ''}`}>
                <Calendar className="h-3 w-3 mr-1" />
                Due: {format(new Date(todo.dueDate), 'MMM dd, yyyy')}
              </div>
            )}
            
            {todo.estimatedTime && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Est: {todo.estimatedTime}m
              </div>
            )}
            
            {todo.actualTime && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Actual: {todo.actualTime}m
              </div>
            )}

            {todo.completedAt && (
              <div className="flex items-center text-green-600">
                <Calendar className="h-3 w-3 mr-1" />
                Completed: {format(new Date(todo.completedAt), 'MMM dd, yyyy')}
              </div>
            )}
          </div>

          {todo.notes && (
            <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
              <div className="flex items-start">
                <FileText className="h-3 w-3 mr-1 mt-0.5 text-muted-foreground" />
                <span className="text-muted-foreground">{todo.notes}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Todo</DialogTitle>
          </DialogHeader>
          <TodoForm
            onSubmit={handleEdit}
            initialData={todo}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
