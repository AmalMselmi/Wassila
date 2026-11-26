import mongoose from 'mongoose';
import {
  REPORT_TARGET_TYPES,
  FORUM_REPORT_REASONS,
  FORUM_REPORT_STATUS,
  FORUM_REPORT_STATUS_VALUES,
  FORUM_REPORT_ACTIONS,
} from '../config/community.constants.js';
import { toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const forumReportSchema = new Schema(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    targetType: { type: String, enum: REPORT_TARGET_TYPES, required: true },
    target: { type: Schema.Types.ObjectId, required: true },
    // For a comment report: the parent post, so admins see the context.
    post: { type: Schema.Types.ObjectId, ref: 'ForumPost' },
    // The content's author at report time (a reference, not a copy of the content).
    reportedUser: { type: Schema.Types.ObjectId, ref: 'User' },

    reason: { type: String, enum: FORUM_REPORT_REASONS, required: true },
    details: { type: String, trim: true, maxlength: 500 },

    status: {
      type: String,
      enum: FORUM_REPORT_STATUS_VALUES,
      default: FORUM_REPORT_STATUS.OPEN,
    },
    handledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    handledAt: { type: Date },
    actionTaken: { type: String, enum: FORUM_REPORT_ACTIONS, default: 'none' },
    resolutionNote: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

// A user reports the same item only once.
forumReportSchema.index({ reporter: 1, targetType: 1, target: 1 }, { unique: true });
// Admin queue: oldest open reports first.
forumReportSchema.index({ status: 1, createdAt: 1 });
// All reports about one item.
forumReportSchema.index({ targetType: 1, target: 1 });
forumReportSchema.index({ reportedUser: 1, createdAt: -1 });

export default mongoose.model('ForumReport', forumReportSchema);