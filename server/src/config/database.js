import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
// Registers all models so their indexes are built on connection (development only).
import '../models/index.js';

mongoose.set('strictQuery', true);

let listenersAttached = false;

function attachListeners() {
  if (listenersAttached) return;
  listenersAttached = true;
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));
  mongoose.connection.on('error', (err) => logger.error({ err }, 'MongoDB connection error'));
}

export async function connectDatabase() {
  attachListeners();
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    // Build indexes automatically in development only; production builds them deliberately.
    autoIndex: env.NODE_ENV !== 'production',
  });
  logger.info({ db: mongoose.connection.name }, 'MongoDB connected');
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected cleanly');
}