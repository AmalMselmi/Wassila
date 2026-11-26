import mongoose from 'mongoose';
import { GOVERNORATES } from '../config/constants.js';
import {
  UNITS,
  PRODUCT_CATEGORIES,
  DEMAND_STATUS,
  DEMAND_STATUS_VALUES,
} from '../config/market.constants.js';
import { integerValidator, toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const demandSchema = new Schema(
  {
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 1000 },
    productName: { type: String, required: true, trim: true, maxlength: 80 },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true },

    quantityNeeded: {
      amount: { type: Number, required: true, min: 0.001 },
      unit: { type: String, enum: UNITS, required: true },
    },
    maxUnitPriceMillimes: { type: Number, min: 0, validate: integerValidator },

    governorate: { type: String, enum: GOVERNORATES, required: true },
    neededBy: { type: Date, required: true },

    status: { type: String, enum: DEMAND_STATUS_VALUES, default: DEMAND_STATUS.OPEN },
    // Updated together with contributions inside a transaction (Phase 5).
    quantityCommitted: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

demandSchema.index({ status: 1, neededBy: 1 });
demandSchema.index({ buyer: 1, createdAt: -1 });
demandSchema.index({ governorate: 1, category: 1, status: 1 });

export default mongoose.model('Demand', demandSchema);