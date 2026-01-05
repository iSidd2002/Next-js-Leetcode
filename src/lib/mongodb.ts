import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Lazy initialization to avoid build-time errors
function getMongoDBUri(): string {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error('Please define the DATABASE_URL environment variable');
  }
  return uri;
}

// In development, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).
let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    const uri = getMongoDBUri();
    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log('Connected to MongoDB');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
