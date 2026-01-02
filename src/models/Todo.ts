import mongoose, { Document, Schema } from 'mongoose';

export interface ITodo extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  category: 'coding' | 'study' | 'interview-prep' | 'project' | 'personal' | 'other';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  notes?: string;
}

const TodoSchema = new Schema<ITodo>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
    // Note: Index created by compound indexes below, no need for individual index
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  category: {
    type: String,
    enum: ['coding', 'study', 'interview-prep', 'project', 'personal', 'other'],
    default: 'other'
  },
  dueDate: {
    type: String
  },
  completedAt: {
    type: String
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString()
  },
  updatedAt: {
    type: String,
    default: () => new Date().toISOString()
  },
  tags: {
    type: [String],
    default: []
  },
  estimatedTime: {
    type: Number,
    min: 1
  },
  actualTime: {
    type: Number,
    min: 1
  },
  notes: {
    type: String,
    maxlength: 2000
  }
}, {
  timestamps: false // We handle timestamps manually
});

// Indexes for efficient queries
TodoSchema.index({ userId: 1, status: 1 });
TodoSchema.index({ userId: 1, priority: 1 });
TodoSchema.index({ userId: 1, category: 1 });
TodoSchema.index({ userId: 1, dueDate: 1 });
TodoSchema.index({ userId: 1, createdAt: 1 });

// Update the updatedAt field before saving
TodoSchema.pre('save', function(next) {
  this.updatedAt = new Date().toISOString();
  next();
});

const Todo = mongoose.models.Todo || mongoose.model<ITodo>('Todo', TodoSchema);

export default Todo;
