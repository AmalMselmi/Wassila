import mongoose from 'mongoose';
import {
  SOS_STATUS,
  SOS_STATUS_VALUES,
  SOS_DELIVERY_STATUS,
} from '../config/mobility.constants.js';
import { locationSchema } from '../utils/locationSchema.js';
import { toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const RETENTION_SECONDS = 60 * 60 * 24 * 180; // 180 days (default, adjustable)

const deliverySchema = new Schema(
  {
    contact: { type: Schema.Types.ObjectId, ref: 'TrustedContact', required: true },
    channel: { type: String, enum: ['sms'], default: 'sms' },
    status: { type: String, enum: SOS_DELIVERY_STATUS, required: true },
    attemptedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const sosAlertSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    trip: { type: Schema.Types.ObjectId, ref: 'Trip' },

    message: { type: String, trim: true, maxlength: 200 },
    // Present only if the user had opted in to share their location.
    lastKnownLocation: { type: locationSchema },

    deliveries: { type: [deliverySchema], default: [] },

    status: { type: String, enum: SOS_STATUS_VALUES, default: SOS_STATUS.ACTIVE },
    acknowledgedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    acknowledgedAt: { type: Date },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    resolutionNote: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

// Admin view of alerts that need attention.
sosAlertSchema.index({ status: 1, createdAt: -1 });
sosAlertSchema.index({ user: 1, createdAt: -1 });
sosAlertSchema.index({ trip: 1 });
sosAlertSchema.index({ createdAt: 1 }, { expireAfterSeconds: RETENTION_SECONDS });

export default mongoose.model('SOSAlert', sosAlertSchema);