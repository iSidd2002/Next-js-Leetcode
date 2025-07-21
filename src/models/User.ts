import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  username: string;
  password: string;
  settings?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    emailUpdates?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    emailUpdates: {
      type: Boolean,
      default: false
    }
  },
}, {
  timestamps: true,
});

// Note: Indexes are automatically created by unique: true in schema definition
// No need for manual index creation to avoid duplicate index warnings

// Prevent re-compilation during development
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
