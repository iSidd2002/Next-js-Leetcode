import mongoose, { Document, Schema } from 'mongoose';

export interface IDevLink extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  url: string;
  title: string;
  description?: string;
  category: 'dsa' | 'system-design' | 'frontend' | 'backend' | 'tools' | 'interview' | 'other';
  tags: string[];
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

const DevLinkSchema = new Schema<IDevLink>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2048,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  category: {
    type: String,
    enum: ['dsa', 'system-design', 'frontend', 'backend', 'tools', 'interview', 'other'],
    default: 'other',
  },
  tags: {
    type: [String],
    default: [],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
  updatedAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
}, {
  timestamps: false,
});

DevLinkSchema.index({ userId: 1, createdAt: -1 });
DevLinkSchema.index({ userId: 1, category: 1 });
DevLinkSchema.index({ userId: 1, isRead: 1 });

DevLinkSchema.pre('save', function (next) {
  this.updatedAt = new Date().toISOString();
  next();
});

const DevLink = mongoose.models.DevLink || mongoose.model<IDevLink>('DevLink', DevLinkSchema);
export default DevLink;
