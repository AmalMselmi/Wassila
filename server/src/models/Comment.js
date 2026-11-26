import mongoose from 'mongoose';
import { CONTENT_STATUS, CONTENT_STATUS_VALUES } from '../config/community.constants.js';
import { toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'ForumPost', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // Plain text only.
    body: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },

    likeCount: { type: Number, default: 0, min: 0 },

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

// Comments of a post in chronological order.
commentSchema.index({ post: 1, status: 1, createdAt: 1 });
commentSchema.index({ author: 1, createdAt: -1 });

export default mongoose.model('Comment', commentSchema);