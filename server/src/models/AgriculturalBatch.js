import mongoose from 'mongoose';
import { GOVERNORATES } from '../config/constants.js';
import {
  UNITS,
  PRODUCT_CATEGORIES,
  BATCH_STATUS,
  BATCH_STATUS_VALUES,
  BATCH_PRODUCTION_METHODS,
} from '../config/market.constants.js';
import { BATCH_CODE_REGEX, generateBatchCode } from '../utils/codes.js';
import { toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const DAY_MS = 24 * 60 * 60 * 1000;

const batchSchema = new Schema(
  {
    // Random public code, encoded in the QR. Not sequential, so it cannot be enumerated.
    code: {
      type: String,
      required: true,
      unique: true,
      default: generateBatchCode,
      match: BATCH_CODE_REGEX,
    },
    producer: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    productName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true },

    origin: {
      governorate: { type: String, enum: GOVERNORATES, required: true },
      locality: { type: String, trim: true, maxlength: 100 },
    },

    harvestDate: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value.getTime() <= Date.now() + DAY_MS,
        message: 'harvestDate cannot be in the future',
      },
    },

    quantity: {
      amount: { type: Number, required: true, min: 0.001 },
      unit: { type: String, enum: UNITS, required: true },
    },

    // Everything below is declared by the producer and is not verified by the platform.
    production: {
      method: { type: String, enum: BATCH_PRODUCTION_METHODS, default: 'unspecified' },
      practices: { type: String, trim: true, maxlength: 1000 },
    },

    photos: {
      type: [{ type: String, trim: true, maxlength: 120 }],
      default: [],
      validate: {
        validator: (list) => list.length <= 5,
        message: 'At most 5 photos',
      },
    },

    status: { type: String, enum: BATCH_STATUS_VALUES, default: BATCH_STATUS.ACTIVE },
    // Incremented on each edit. Each edit also appends a TraceabilityEvent.
    revision: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

batchSchema.index({ producer: 1, createdAt: -1 });
batchSchema.index({ producer: 1, status: 1 });

export default mongoose.model('AgriculturalBatch', batchSchema);