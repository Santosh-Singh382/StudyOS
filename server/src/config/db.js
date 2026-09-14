import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  if (!env.mongoUri) {
    console.warn('MONGO_URI is not set. Database connection skipped.');
    return;
  }

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err.message}`);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  try {
    await mongoose.connect(env.mongoUri);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
  }
}