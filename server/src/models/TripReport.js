import mongoose from 'mongoose';
import {
  REPORT_CATEGORIES,
  TRIP_REPORT_STATUS,
  TRIP_REPORT_STATUS_VALUES,
} from '../config/mobility.constants.js';
import { toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const tripReportSchema = new Schema(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
    reportedUser: { type: Schema.Types.ObjectId, ref: 'User' },

    category: { type: String, enum: REPORT_CATEGORIES, required: true },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },

    status: {
      type: String,
      enum: TRIP_REPORT_STATUS_VALUES,
      default: TRIP_REPORT_STATUS.OPEN,
    },
    handledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    handledAt: { type: Date },
    resolutionNote: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

tripReportSchema.pre('validate', function checkReportedUser() {
  if (this.reportedUser && String(this.reportedUser) === String(this.reporter)) {
    this.invalidate('reportedUser', 'You cannot report yourself');
  }
});

// Admin queue.
tripReportSchema.index({ status: 1, createdAt: 1 });
tripReportSchema.index({ trip: 1 });
tripReportSchema.index({ reporter: 1, createdAt: -1 });
tripReportSchema.index({ reportedUser: 1, createdAt: -1 });

export default mongoose.model('TripReport', tripReportSchema);