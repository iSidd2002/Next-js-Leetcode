import mongoose, { Document, Schema } from 'mongoose';

export interface IPatternPath extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  name: string;
  topic: string;
  description: string;
  problems: {
    id: string;
    title: string;
    url: string;
    difficulty: string;
    notes: string;
    completed: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

const PatternPathSchema = new Schema<IPatternPath>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: { type: String, required: true, trim: true, maxlength: 200 },
  topic: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, default: '', maxlength: 1000 },
  problems: [{
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    url: { type: String, default: '', trim: true },
    difficulty: { type: String, default: '' },
    notes: { type: String, default: '' },
    completed: { type: Boolean, default: false },
  }],
}, {
  timestamps: true,
});

PatternPathSchema.index({ userId: 1, createdAt: -1 });

const PatternPath = mongoose.models.PatternPath || mongoose.model<IPatternPath>('PatternPath', PatternPathSchema);

export default PatternPath;
