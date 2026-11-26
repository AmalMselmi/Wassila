import mongoose from 'mongoose';
import {
  CONTRIBUTION_STATUS,
  CONTRIBUTION_STATUS_VALUES,
} from '../config/market.constants.js';
import { integerValidator, toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const demandContributionSchema = new Schema(
  {
    demand: { type: Schema.Types.ObjectId, ref: 'Demand', required: true },
    producer: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    quantity: { type: Number, required: true, min: 0.001 },
    unitPriceMillimes: { type: Number, required: true, min: 0, validate: integerValidator },

    // Optional: what the producer will supply from.
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    batch: { type: Schema.Types.ObjectId, ref: 'AgriculturalBatch' },

    note: { type: String, trim: true, maxlength: 300 },
    status: {
      type: String,
      enum: CONTRIBUTION_STATUS_VALUES,
      default: CONTRIBUTION_STATUS.OFFERED,
    },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

// One contribution per producer per demand. A producer who changes their mind updates it.
demandContributionSchema.index({ demand: 1, producer: 1 }, { unique: true });
demandContributionSchema.index({ producer: 1, createdAt: -1 });

export default mongoose.model('DemandContribution', demandContributionSchema);