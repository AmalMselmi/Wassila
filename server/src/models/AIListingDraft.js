import mongoose from 'mongoose';
import { GOVERNORATES } from '../config/constants.js';
import { UNITS, PRODUCT_CATEGORIES } from '../config/market.constants.js';
import {
  AI_LISTING_DRAFT_STATUS,
  AI_LISTING_DRAFT_STATUS_VALUES,
  AI_LISTING_DRAFT_TTL_HOURS,
} from '../config/ai.constants.js';
import { integerValidator, toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const HOUR_MS = 60 * 60 * 1000;

// All extracted fields are optional: the model leaves unknown values empty instead of guessing.
// Values come from untrusted LLM output and are re-validated before anything is published.
const aiListingDraftSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    conversation: { type: Schema.Types.ObjectId, ref: 'AIConversation' },

    productName: { type: String, trim: true, maxlength: 100 },
    category: { type: String, enum: PRODUCT_CATEGORIES },
    quantity: {
      amount: { type: Number, min: 0.001 },
      unit: { type: String, enum: UNITS },
    },
    governorate: { type: String, enum: GOVERNORATES },
    description: { type: String, trim: true, maxlength: 2000 },
    // Set only if the user stated a price. The AI must not invent one.
    priceMillimes: { type: Number, min: 0, validate: integerValidator },

    // Fields the assistant could not extract and the user must complete.
    missingFields: {
      type: [{ type: String, trim: true, maxlength: 30 }],
      default: [],
    },
    // True if the user changed any extracted value before approving.
    editedByUser: { type: Boolean, default: false },

    status: {
      type: String,
      enum: AI_LISTING_DRAFT_STATUS_VALUES,
      default: AI_LISTING_DRAFT_STATUS.DRAFT,
    },
    approvedAt: { type: Date },
    // Set after approval, when the normal marketplace service creates the real product.
    product: { type: Schema.Types.ObjectId, ref: 'Product' },

    // Drafts that are never approved disappear automatically.
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + AI_LISTING_DRAFT_TTL_HOURS * HOUR_MS),
    },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

aiListingDraftSchema.index({ user: 1, status: 1, createdAt: -1 });
aiListingDraftSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('AIListingDraft', aiListingDraftSchema);