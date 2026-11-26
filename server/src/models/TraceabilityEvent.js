import mongoose from 'mongoose';
import { GOVERNORATES } from '../config/constants.js';
import { TRACE_EVENT_TYPES, TRACE_EVENT_SOURCES } from '../config/market.constants.js';
import { appendOnly, toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const traceabilityEventSchema = new Schema(
  {
    batch: { type: Schema.Types.ObjectId, ref: 'AgriculturalBatch', required: true },
    type: { type: String, enum: TRACE_EVENT_TYPES, required: true },

    // Who recorded it. All events are reports, not independent verification.
    source: { type: String, enum: TRACE_EVENT_SOURCES, default: 'producer' },
    actor: { type: Schema.Types.ObjectId, ref: 'User' },

    // When it happened, as declared by the producer (cannot be in the future).
    occurredAt: {
      type: Date,
      default: Date.now,
      validate: {
        validator: (value) => value.getTime() <= Date.now() + 60 * 1000,
        message: 'occurredAt cannot be in the future',
      },
    },

    description: { type: String, trim: true, maxlength: 500 },
    location: {
      governorate: { type: String, enum: GOVERNORATES },
      locality: { type: String, trim: true, maxlength: 100 },
    },

    // For "batch_edited": names of the fields that changed (not their values).
    changedFields: {
      type: [{ type: String, trim: true, maxlength: 40 }],
      default: undefined,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false }, toJSON: toJSONOptions }
);

appendOnly(traceabilityEventSchema, 'TraceabilityEvent');

traceabilityEventSchema.index({ batch: 1, occurredAt: 1 });

export default mongoose.model('TraceabilityEvent', traceabilityEventSchema);