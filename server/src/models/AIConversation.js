import mongoose from 'mongoose';
import {
  AI_FEATURES,
  AI_LANGUAGES,
  AI_CONVERSATION_STATUS,
  AI_CONVERSATION_STATUS_VALUES,
  AI_RETENTION_DAYS,
} from '../config/ai.constants.js';
import { toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const RETENTION_SECONDS = AI_RETENTION_DAYS * 24 * 60 * 60;

const aiConversationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, trim: true, maxlength: 100 },
    feature: { type: String, enum: AI_FEATURES, default: 'qa' },
    language: { type: String, enum: AI_LANGUAGES, default: 'fr' },
    status: {
      type: String,
      enum: AI_CONVERSATION_STATUS_VALUES,
      default: AI_CONVERSATION_STATUS.ACTIVE,
    },

    // Opt-in: only minimal, non-identifying account fields (e.g. region, crop) may be used.
    useAccountContext: { type: Boolean, default: false },

    // Rolling summary of older turns, to keep prompts short and token usage under control.
    summary: { type: String, trim: true, maxlength: 2000 },

    messageCount: { type: Number, default: 0, min: 0 },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

// A user's conversation list. Every query must include the user (prevents IDOR).
aiConversationSchema.index({ user: 1, status: 1, lastMessageAt: -1 });
// Conversations are deleted automatically after the retention period of inactivity.
aiConversationSchema.index({ lastMessageAt: 1 }, { expireAfterSeconds: RETENTION_SECONDS });

export default mongoose.model('AIConversation', aiConversationSchema);