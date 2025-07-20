import mongoose, { Document, Schema } from 'mongoose';

export interface IProblem extends Document {
  _id: string;
  userId: string;
  platform: 'leetcode' | 'codeforces' | 'atcoder';
  title: string;
  problemId: string;
  difficulty: string;
  url: string;
  dateSolved: string;
  createdAt: string;
  notes: string;
  isReview: boolean;
  repetition: number;
  interval: number;
  nextReviewDate: string | null;
  topics: string[];
  status: 'active' | 'learned';
  companies: string[];
}

const ProblemSchema = new Schema<IProblem>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
    // Note: Index created by compound indexes below, no need for individual index
  },
  platform: {
    type: String,
    enum: ['leetcode', 'codeforces', 'atcoder'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  problemId: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  dateSolved: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString()
  },
  notes: {
    type: String,
    default: '',
    maxlength: 10000
  },
  isReview: {
    type: Boolean,
    default: false
  },
  repetition: {
    type: Number,
    default: 0,
    min: 0
  },
  interval: {
    type: Number,
    default: 0,
    min: 0
  },
  nextReviewDate: {
    type: String,
    default: null
  },
  topics: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'learned'],
    default: 'active'
  },
  companies: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Compound indexes for efficient queries
ProblemSchema.index({ userId: 1, platform: 1 });
ProblemSchema.index({ userId: 1, status: 1 });
ProblemSchema.index({ userId: 1, isReview: 1 });
ProblemSchema.index({ userId: 1, dateSolved: 1 });
ProblemSchema.index({ userId: 1, companies: 1 });
ProblemSchema.index({ userId: 1, topics: 1 });

// Unique constraint for user + problem combination
ProblemSchema.index({ userId: 1, url: 1 }, { unique: true });

const Problem = mongoose.models.Problem || mongoose.model<IProblem>('Problem', ProblemSchema);

export default Problem;