import mongoose, { Document, Schema } from 'mongoose';

// Flashcard System
export interface IFlashcard extends Document {
  _id: string;
  userId: string;
  title: string;
  front: string; // Question/Concept
  back: string; // Answer/Explanation
  category: 'algorithm' | 'data-structure' | 'concept' | 'pattern' | 'complexity';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  reviewCount: number;
  correctCount: number;
  lastReviewed: string;
  nextReview: string;
  confidence: number; // 1-5 scale
  createdAt: string;
  updatedAt: string;
}

const FlashcardSchema = new Schema<IFlashcard>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  front: { type: String, required: true, maxlength: 2000 },
  back: { type: String, required: true, maxlength: 5000 },
  category: { 
    type: String, 
    enum: ['algorithm', 'data-structure', 'concept', 'pattern', 'complexity'],
    required: true 
  },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    required: true 
  },
  tags: [{ type: String, trim: true }],
  reviewCount: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  lastReviewed: { type: String, default: null },
  nextReview: { type: String, default: null },
  confidence: { type: Number, min: 1, max: 5, default: 1 },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false });

// Code Templates
export interface ICodeTemplate extends Document {
  _id: string;
  userId: string;
  name: string;
  description: string;
  language: 'javascript' | 'python' | 'java' | 'cpp' | 'c' | 'go' | 'rust';
  category: 'algorithm' | 'data-structure' | 'pattern' | 'utility';
  pattern: string; // e.g., 'two-pointers', 'sliding-window', 'dfs', 'bfs'
  code: string;
  usage: string; // When to use this template
  timeComplexity: string;
  spaceComplexity: string;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

const CodeTemplateSchema = new Schema<ICodeTemplate>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, maxlength: 1000 },
  language: { 
    type: String, 
    enum: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust'],
    required: true 
  },
  category: { 
    type: String, 
    enum: ['algorithm', 'data-structure', 'pattern', 'utility'],
    required: true 
  },
  pattern: { type: String, required: true, trim: true },
  code: { type: String, required: true, maxlength: 10000 },
  usage: { type: String, required: true, maxlength: 1000 },
  timeComplexity: { type: String, required: true },
  spaceComplexity: { type: String, required: true },
  tags: [{ type: String, trim: true }],
  isPublic: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false });

// Learning Paths
export interface ILearningPath extends Document {
  _id: string;
  userId: string;
  name: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced' | 'interview-prep' | 'topic-specific';
  estimatedDuration: number; // in days
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
  milestones: {
    id: string;
    title: string;
    description: string;
    requiredProblems: number;
    topics: string[];
    isCompleted: boolean;
    completedAt: string | null;
  }[];
  progress: {
    currentMilestone: number;
    completedMilestones: number;
    totalProblems: number;
    solvedProblems: number;
    startedAt: string;
    estimatedCompletion: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const LearningPathSchema = new Schema<ILearningPath>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, maxlength: 2000 },
  category: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'interview-prep', 'topic-specific'],
    required: true 
  },
  estimatedDuration: { type: Number, required: true, min: 1 },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    required: true 
  },
  topics: [{ type: String, trim: true }],
  milestones: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    requiredProblems: { type: Number, required: true },
    topics: [{ type: String }],
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: String, default: null }
  }],
  progress: {
    currentMilestone: { type: Number, default: 0 },
    completedMilestones: { type: Number, default: 0 },
    totalProblems: { type: Number, default: 0 },
    solvedProblems: { type: Number, default: 0 },
    startedAt: { type: String, default: () => new Date().toISOString() },
    estimatedCompletion: { type: String, required: true }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false });

// Concept Notes
export interface IConceptNote extends Document {
  _id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  linkedProblems: string[]; // Problem IDs
  linkedTemplates: string[]; // Template IDs
  linkedFlashcards: string[]; // Flashcard IDs
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

const ConceptNoteSchema = new Schema<IConceptNote>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, maxlength: 20000 },
  category: { type: String, required: true, trim: true },
  tags: [{ type: String, trim: true }],
  linkedProblems: [{ type: String }],
  linkedTemplates: [{ type: String }],
  linkedFlashcards: [{ type: String }],
  isPublic: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false });

// Indexes for performance
FlashcardSchema.index({ userId: 1, category: 1 });
FlashcardSchema.index({ userId: 1, nextReview: 1 });
FlashcardSchema.index({ userId: 1, tags: 1 });

CodeTemplateSchema.index({ userId: 1, category: 1 });
CodeTemplateSchema.index({ userId: 1, pattern: 1 });
CodeTemplateSchema.index({ userId: 1, language: 1 });
CodeTemplateSchema.index({ isPublic: 1, category: 1 });

LearningPathSchema.index({ userId: 1, isActive: 1 });
LearningPathSchema.index({ userId: 1, category: 1 });

ConceptNoteSchema.index({ userId: 1, category: 1 });
ConceptNoteSchema.index({ userId: 1, tags: 1 });

export const Flashcard = mongoose.models.Flashcard || mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);
export const CodeTemplate = mongoose.models.CodeTemplate || mongoose.model<ICodeTemplate>('CodeTemplate', CodeTemplateSchema);
export const LearningPath = mongoose.models.LearningPath || mongoose.model<ILearningPath>('LearningPath', LearningPathSchema);
export const ConceptNote = mongoose.models.ConceptNote || mongoose.model<IConceptNote>('ConceptNote', ConceptNoteSchema);
