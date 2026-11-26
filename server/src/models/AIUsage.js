import mongoose from 'mongoose';
import { AI_USAGE_RETENTION_DAYS } from '../config/ai.constants.js';

const { Schema } = mongoose;

const RETENTION_SECONDS = AI_USAGE_RETENTION_DAYS * 24 * 60 * 60;

const aiUsageSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // Midnight UTC of the day these counters belong to.
    day: { type: Date, required: true },

    // Incremented with $inc by the AI service. Counters never contain content.
    requests: { type: Number, default: 0, min: 0 },
    inputTokens: { type: Number, default: 0, min: 0 },
    outputTokens: { type: Number, default: 0, min: 0 },
    errors: { type: Number, default: 0, min: 0 },
    blocked: { type: Number, default: 0, min: 0 }, // rejected by validation or safety rules
    rateLimited: { type: Number, default: 0, min: 0 },
    fallbacks: { type: Number, default: 0, min: 0 }, // provider unavailable, fallback answer used

    // Requests per feature, e.g. { qa: 4, listing_extraction: 1 }.
    byFeature: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

// One document per user per day.
aiUsageSchema.index({ user: 1, day: 1 }, { unique: true });
// Admin cost overview by day.
aiUsageSchema.index({ day: 1 });
aiUsageSchema.index({ day: 1 }, { expireAfterSeconds: RETENTION_SECONDS, name: 'day_ttl' });

export default mongoose.model('AIUsage', aiUsageSchema);