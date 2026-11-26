import mongoose from 'mongoose';
import { GOVERNORATES } from '../config/constants.js';
import {
  UNITS,
  PRODUCT_CATEGORIES,
  PRODUCT_STATUS,
  PRODUCT_STATUS_VALUES,
} from '../config/market.constants.js';
import { integerValidator, toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 2000 },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true },

    // 1 TND = 1000 millimes. Integers avoid floating-point rounding errors.
    priceMillimes: { type: Number, required: true, min: 0, validate: integerValidator },
    unit: { type: String, enum: UNITS, required: true },

    // Decremented atomically when an order is accepted (Phase 5).
    quantityAvailable: { type: Number, required: true, min: 0, default: 0 },
    minOrderQuantity: { type: Number, min: 0.001, default: 1 },

    governorate: { type: String, enum: GOVERNORATES, required: true },

    // Stored filenames (never client-supplied URLs).
    images: {
      type: [{ type: String, trim: true, maxlength: 120 }],
      default: [],
      validate: {
        validator: (list) => list.length <= 5,
        message: 'At most 5 images',
      },
    },

    // Optional link to a traceability batch.
    batch: { type: Schema.Types.ObjectId, ref: 'AgriculturalBatch' },

    status: { type: String, enum: PRODUCT_STATUS_VALUES, default: PRODUCT_STATUS.ACTIVE },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

// Browse active listings by category, newest first.
productSchema.index({ status: 1, category: 1, createdAt: -1 });
// "My products".
productSchema.index({ seller: 1, status: 1, createdAt: -1 });
// Browse by region.
productSchema.index({ governorate: 1, category: 1, status: 1 });
// Language-neutral text search (works for French and Arabic words).
productSchema.index(
  { title: 'text', description: 'text' },
  { default_language: 'none', name: 'product_text_search' }
);

export default mongoose.model('Product', productSchema);