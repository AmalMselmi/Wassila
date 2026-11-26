import mongoose from 'mongoose';
import { NOTIFICATION_TYPES } from '../config/constants.js';

const { Schema } = mongoose;

const RETENTION_SECONDS = 60 * 60 * 24 * 180; // 180 days

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },

    // Parameters for the localised message (e.g. { orderCode: "ORD-..." }). Written by the server only.
    data: { type: Schema.Types.Mixed, default: {} },

    // Internal app path only, e.g. "/orders/123".
    link: {
      type: String,
      trim: true,
      maxlength: 200,
      match: [/^\/[A-Za-z0-9/_\-?=&.]*$/, 'link must be an internal path'],
    },

    readAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// A user's inbox: unread first, newest first.
notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });
// Notification history is deleted automatically after 180 days.
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: RETENTION_SECONDS });

export default mongoose.model('Notification', notificationSchema);