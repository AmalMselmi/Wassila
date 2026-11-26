import mongoose from 'mongoose';
import { REPORT_TARGET_TYPES } from '../config/community.constants.js';
import { toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const forumLikeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: REPORT_TARGET_TYPES, required: true },
    target: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, toJSON: toJSONOptions }
);

forumLikeSchema.index({ targetType: 1, target: 1, user: 1 }, { unique: true });
forumLikeSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('ForumLike', forumLikeSchema);