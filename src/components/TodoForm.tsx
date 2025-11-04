'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import type { Todo } from '@/types';

interface TodoFormProps {
  onSubmit: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Todo;
  isEditing?: boolean;
}

interface FormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  category: 'coding' | 'study' | 'interview-prep' | 'project' | 'personal' | 'other';
  dueDate: string;
  estimatedTime: string;
  actualTime: string;
  notes: string;
}

export default function TodoForm({ onSubmit, initialData, isEditing = false }: TodoFormProps) {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'medium',
      status: initialData?.status || 'pending',
      category: initialData?.category || 'other',
      dueDate: initialData?.dueDate || '',
      estimatedTime: initialData?.estimatedTime?.toString() || '',
      actualTime: initialData?.actualTime?.toString() || '',
      notes: initialData?.notes || ''
    }
  });

  const priority = watch('priority');
  const status = watch('status');
  const category = watch('category');

  useEffect(() => {
    if (initialData) {
      setTags(initialData.tags || []);
    }
  }, [initialData]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onFormSubmit = (data: FormData) => {
    const todoData = {
      title: data.title,
      description: data.description || undefined,
      priority: data.priority,
      status: data.status,
      category: data.category,
      dueDate: data.dueDate || undefined,
      estimatedTime: data.estimatedTime ? parseInt(data.estimatedTime) : undefined,
      actualTime: data.actualTime ? parseInt(data.actualTime) : undefined,
      notes: data.notes || undefined,
      tags,
      completedAt: data.status === 'completed' ? new Date().toISOString() : undefined
    };

    onSubmit(todoData);
    
    if (!isEditing) {
      reset();
      setTags([]);
      setNewTag('');
    }
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-amber-100 text-amber-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            {...register('title', { required: 'Title is required' })}
            placeholder="Enter todo title"
            className="mt-1"
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Enter todo description"
            className="mt-1"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={(value) => setValue('priority', value as any)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value) => setValue('status', value as any)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(value) => setValue('category', value as any)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coding">Coding</SelectItem>
              <SelectItem value="study">Study</SelectItem>
              <SelectItem value="interview-prep">Interview Prep</SelectItem>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            {...register('dueDate')}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
          <Input
            id="estimatedTime"
            type="number"
            {...register('estimatedTime')}
            placeholder="e.g., 60"
            className="mt-1"
            min="1"
          />
        </div>

        {status === 'completed' && (
          <div>
            <Label htmlFor="actualTime">Actual Time (minutes)</Label>
            <Input
              id="actualTime"
              type="number"
              {...register('actualTime')}
              placeholder="e.g., 75"
              className="mt-1"
              min="1"
            />
          </div>
        )}
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mt-2 mb-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleRemoveTag(tag)}
              />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
          />
          <Button type="button" onClick={handleAddTag} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Additional notes..."
          className="mt-1"
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">
        {isEditing ? 'Update Todo' : 'Add Todo'}
      </Button>
    </form>
  );
}
