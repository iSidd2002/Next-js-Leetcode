import mongoose, { Document, Schema } from 'mongoose';

export interface IContest extends Document {
  _id: string;
  userId: string;
  name: string;
  platform: 'leetcode' | 'codeforces' | 'atcoder' | 'codechef' | 'other';
  startTime: string;
  duration: number;
  url: string;
  rank?: number;
  problemsSolved?: number;
  totalProblems?: number;
  status: 'scheduled' | 'live' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const ContestSchema = new Schema<IContest>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
    // Note: Index created by compound indexes below, no need for individual index
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    enum: ['leetcode', 'codeforces', 'atcoder', 'codechef', 'other'],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  rank: {
    type: Number,
    min: 1
  },
  problemsSolved: {
    type: Number,
    min: 0,
    default: 0
  },
  totalProblems: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed'],
    default: 'scheduled'
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
ContestSchema.index({ userId: 1 });
ContestSchema.index({ userId: 1, date: -1 });
ContestSchema.index({ userId: 1, platform: 1 });
ContestSchema.index({ userId: 1, createdAt: -1 });

// Prevent re-compilation during development
const Contest = mongoose.models.Contest || mongoose.model<IContest>('Contest', ContestSchema);

export default Contest;
