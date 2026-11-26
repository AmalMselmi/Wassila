import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

export function getLiveness() {
  return {
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}

export async function getReadiness() {
  // readyState 1 = connected
  if (mongoose.connection.readyState !== 1) {
    throw new AppError(503, 'SERVICE_UNAVAILABLE', 'Database is not connected');
  }
  try {
    await mongoose.connection.db.admin().ping();
  } catch {
    throw new AppError(503, 'SERVICE_UNAVAILABLE', 'Database did not respond');
  }
  return { status: 'ready', database: 'up', timestamp: new Date().toISOString() };
}