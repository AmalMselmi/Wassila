import mongoose from 'mongoose';
import {
  FORUM_CATEGORIES,
  CONTENT_STATUS,
  CONTENT_STATUS_VALUES,
} from '../config/community.constants.js';
import { toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const forumPostSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // Plain text only. The client must never render this as HTML.
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 150 },
    body: { type: String, required: true, trim: true, minlength: 1, maxlength: 5000 },
    category: { type: String, enum: FORUM_CATEGORIES, default: 'general' },

    tags: {
      type: [{ type: String, trim: true, lowercase: true, maxlength: 30 }],
      default: [],
      validate: { validator: (list) => list.length <= 5, message: 'At most 5 tags' },
    },
    // Stored filenames (never client-supplied URLs).
    images: {
      type: [{ type: String, trim: true, maxlength: 120 }],
      default: [],
      validate: { validator: (list) => list.length <= 3, message: 'At most 3 images' },
    },

    // Counters maintained with atomic $inc by the service layer.
    likeCount: { type: Number, default: 0, min: 0 },
    commentCount: { type: Number, default: 0, min: 0 },

    status: { type: String, enum: CONTENT_STATUS_VALUES, default: CONTENT_STATUS.PUBLISHED },
    editedAt: { type: Date },
    deletedAt: { type: Date },

    moderation: {
      hiddenBy: { type: Schema.Types.ObjectId, ref: 'User' },
      hiddenAt: { type: Date },
      reason: { type: String, trim: true, maxlength: 300 },
    },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

// Public feed, newest first (cursor or page based).
forumPostSchema.index({ status: 1, createdAt: -1 });
forumPostSchema.index({ status: 1, category: 1, createdAt: -1 });
// "My posts".
forumPostSchema.index({ author: 1, createdAt: -1 });
// Language-neutral text search (French and Arabic words).
forumPostSchema.index(
  { title: 'text', body: 'text' },
  { default_language: 'none', name: 'forum_post_text_search' }
);

export default mongoose.model('ForumPost', forumPostSchema);