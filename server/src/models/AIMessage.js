import mongoose from 'mongoose';
import {
  AI_MESSAGE_ROLES,
  AI_GROUNDING,
  AI_FINISH_REASONS,
  AI_SAFETY_FLAGS,
  AI_MAX_ASSISTANT_MESSAGE_CHARS,
  AI_MAX_USER_MESSAGE_CHARS,
  AI_MAX_FOLLOW_UPS,
  AI_RETENTION_DAYS,
} from '../config/ai.constants.js';
import { toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const RETENTION_SECONDS = AI_RETENTION_DAYS * 24 * 60 * 60;

// A source that was really retrieved and given to the model (never invented).
const sourceSchema = new Schema(
  {
    document: { type: Schema.Types.ObjectId, ref: 'AgriculturalKnowledgeDocument', required: true },
    chunk: { type: Schema.Types.ObjectId, ref: 'KnowledgeChunk' },
    title: { type: String, required: true, trim: true, maxlength: 200 }, // snapshot at answer time
    page: { type: Number, min: 1 },
    score: { type: Number, min: 0 },
  },
  { _id: false }
);

const aiMessageSchema = new Schema(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'AIConversation', required: true },
    // Owner, copied here so every query can be scoped by user without a join (IDOR protection).
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    role: { type: String, enum: AI_MESSAGE_ROLES, required: true },
    // Private. Never written to application logs.
    content: { type: String, required: true, trim: true, maxlength: AI_MAX_ASSISTANT_MESSAGE_CHARS },

    // ---- Assistant messages only ----
    grounding: { type: String, enum: AI_GROUNDING },
    sources: { type: [sourceSchema], default: undefined },
    suggestedFollowUps: {
      type: [{ type: String, trim: true, maxlength: 150 }],
      default: undefined,
      validate: {
        validator: (list) => !list || list.length <= AI_MAX_FOLLOW_UPS,
        message: `At most ${AI_MAX_FOLLOW_UPS} follow-up suggestions`,
      },
    },
    safetyFlags: { type: [{ type: String, enum: AI_SAFETY_FLAGS }], default: undefined },
    listingDraft: { type: Schema.Types.ObjectId, ref: 'AIListingDraft' },

    // Provider metadata, no content.
    provider: { type: String, trim: true, maxlength: 30 },
    model: { type: String, trim: true, maxlength: 80 },
    finishReason: { type: String, enum: AI_FINISH_REASONS },
    tokens: {
      input: { type: Number, min: 0 },
      output: { type: Number, min: 0 },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false }, toJSON: toJSONOptions }
);

aiMessageSchema.pre('validate', function checkRoleSpecificFields() {
  if (this.role === 'user') {
    if (this.content && this.content.length > AI_MAX_USER_MESSAGE_CHARS) {
      this.invalidate('content', `User messages are limited to ${AI_MAX_USER_MESSAGE_CHARS} characters`);
    }
    if (this.grounding || (this.sources && this.sources.length) || this.listingDraft) {
      this.invalidate('role', 'Only assistant messages can carry sources, grounding or drafts');
    }
  }
});

aiMessageSchema.index({ conversation: 1, createdAt: 1 });
aiMessageSchema.index({ user: 1, createdAt: -1 });
// Messages are deleted automatically after the retention period.
aiMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: RETENTION_SECONDS });

export default mongoose.model('AIMessage', aiMessageSchema);