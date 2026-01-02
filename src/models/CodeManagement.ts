import mongoose, { Document, Schema } from 'mongoose';

// Solution Repository
export interface ISolution extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  problemId: string; // Reference to Problem
  problemTitle: string;
  problemUrl: string;
  language: 'javascript' | 'python' | 'java' | 'cpp' | 'c' | 'go' | 'rust' | 'typescript';
  code: string;
  explanation: string;
  approach: string; // e.g., "Two Pointers", "Dynamic Programming", "BFS"
  timeComplexity: string;
  spaceComplexity: string;
  runtime: number; // in milliseconds
  memoryUsage: number; // in MB
  isOptimal: boolean;
  tags: string[];
  notes: string;
  version: number; // For tracking multiple solutions to same problem
  isPublic: boolean;
  likes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

const SolutionSchema = new Schema<ISolution>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: String, required: true },
  problemTitle: { type: String, required: true, trim: true },
  problemUrl: { type: String, required: true },
  language: { 
    type: String, 
    enum: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'typescript'],
    required: true 
  },
  code: { type: String, required: true, maxlength: 50000 },
  explanation: { type: String, required: true, maxlength: 5000 },
  approach: { type: String, required: true, trim: true },
  timeComplexity: { type: String, required: true },
  spaceComplexity: { type: String, required: true },
  runtime: { type: Number, min: 0 },
  memoryUsage: { type: Number, min: 0 },
  isOptimal: { type: Boolean, default: false },
  tags: [{ type: String, trim: true }],
  notes: { type: String, maxlength: 2000 },
  version: { type: Number, default: 1 },
  isPublic: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false });

// Code Comparison
export interface ICodeComparison extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  problemId: string;
  title: string;
  description: string;
  solutions: {
    id: string;
    solutionId: string;
    label: string; // e.g., "Brute Force", "Optimized", "Alternative"
    language: string;
    code: string;
    timeComplexity: string;
    spaceComplexity: string;
    runtime?: number;
    memoryUsage?: number;
    pros: string[];
    cons: string[];
  }[];
  conclusion: string;
  recommendation: string;
  createdAt: string;
  updatedAt: string;
}

const CodeComparisonSchema = new Schema<ICodeComparison>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, maxlength: 2000 },
  solutions: [{
    id: { type: String, required: true },
    solutionId: { type: String, required: true },
    label: { type: String, required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    timeComplexity: { type: String, required: true },
    spaceComplexity: { type: String, required: true },
    runtime: { type: Number },
    memoryUsage: { type: Number },
    pros: [{ type: String }],
    cons: [{ type: String }]
  }],
  conclusion: { type: String, required: true, maxlength: 1000 },
  recommendation: { type: String, required: true, maxlength: 1000 },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false });

// Performance Benchmark
export interface IPerformanceBenchmark extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  problemId: string;
  solutionId: string;
  language: string;
  testCases: {
    input: string;
    expectedOutput: string;
    actualOutput: string;
    runtime: number;
    memoryUsage: number;
    passed: boolean;
  }[];
  overallStats: {
    averageRuntime: number;
    averageMemory: number;
    passRate: number;
    totalTests: number;
  };
  improvements: {
    timeComplexityBefore: string;
    timeComplexityAfter: string;
    spaceComplexityBefore: string;
    spaceComplexityAfter: string;
    runtimeImprovement: number; // percentage
    memoryImprovement: number; // percentage
  };
  createdAt: string;
}

const PerformanceBenchmarkSchema = new Schema<IPerformanceBenchmark>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: String, required: true },
  solutionId: { type: String, required: true },
  language: { type: String, required: true },
  testCases: [{
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    actualOutput: { type: String, required: true },
    runtime: { type: Number, required: true },
    memoryUsage: { type: Number, required: true },
    passed: { type: Boolean, required: true }
  }],
  overallStats: {
    averageRuntime: { type: Number, required: true },
    averageMemory: { type: Number, required: true },
    passRate: { type: Number, required: true },
    totalTests: { type: Number, required: true }
  },
  improvements: {
    timeComplexityBefore: { type: String },
    timeComplexityAfter: { type: String },
    spaceComplexityBefore: { type: String },
    spaceComplexityAfter: { type: String },
    runtimeImprovement: { type: Number },
    memoryImprovement: { type: Number }
  },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false });

// Code Review
export interface ICodeReview extends Document {
  _id: string;
  reviewerId: mongoose.Types.ObjectId;
  solutionId: string;
  rating: number; // 1-5 stars
  feedback: {
    codeQuality: {
      score: number;
      comments: string;
    };
    efficiency: {
      score: number;
      comments: string;
    };
    readability: {
      score: number;
      comments: string;
    };
    bestPractices: {
      score: number;
      comments: string;
    };
  };
  suggestions: string[];
  overallComments: string;
  isHelpful: boolean;
  createdAt: string;
}

const CodeReviewSchema = new Schema<ICodeReview>({
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  solutionId: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  feedback: {
    codeQuality: {
      score: { type: Number, min: 1, max: 5, required: true },
      comments: { type: String, maxlength: 1000 }
    },
    efficiency: {
      score: { type: Number, min: 1, max: 5, required: true },
      comments: { type: String, maxlength: 1000 }
    },
    readability: {
      score: { type: Number, min: 1, max: 5, required: true },
      comments: { type: String, maxlength: 1000 }
    },
    bestPractices: {
      score: { type: Number, min: 1, max: 5, required: true },
      comments: { type: String, maxlength: 1000 }
    }
  },
  suggestions: [{ type: String, maxlength: 500 }],
  overallComments: { type: String, required: true, maxlength: 2000 },
  isHelpful: { type: Boolean, default: true },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false });

// Indexes for performance
SolutionSchema.index({ userId: 1, problemId: 1 });
SolutionSchema.index({ userId: 1, language: 1 });
SolutionSchema.index({ userId: 1, approach: 1 });
SolutionSchema.index({ isPublic: 1, likes: -1 });
SolutionSchema.index({ userId: 1, createdAt: -1 });

CodeComparisonSchema.index({ userId: 1, problemId: 1 });
PerformanceBenchmarkSchema.index({ userId: 1, solutionId: 1 });
CodeReviewSchema.index({ solutionId: 1, createdAt: -1 });

export const Solution = mongoose.models.Solution || mongoose.model<ISolution>('Solution', SolutionSchema);
export const CodeComparison = mongoose.models.CodeComparison || mongoose.model<ICodeComparison>('CodeComparison', CodeComparisonSchema);
export const PerformanceBenchmark = mongoose.models.PerformanceBenchmark || mongoose.model<IPerformanceBenchmark>('PerformanceBenchmark', PerformanceBenchmarkSchema);
export const CodeReview = mongoose.models.CodeReview || mongoose.model<ICodeReview>('CodeReview', CodeReviewSchema);
