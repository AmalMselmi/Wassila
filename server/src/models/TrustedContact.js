import mongoose from 'mongoose';
import {
  E164_PHONE_REGEX,
  TRUSTED_CONTACT_RELATIONSHIPS,
} from '../config/mobility.constants.js';
import { toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const trustedContactSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    phone: {
      type: String,
      required: true,
      select: false,
      set: (value) => (typeof value === 'string' ? value.replace(/[\s-]/g, '') : value),
      match: [E164_PHONE_REGEX, 'Phone must be in international format, e.g. +21620123456'],
    },
    relationship: { type: String, enum: TRUSTED_CONTACT_RELATIONSHIPS },

    // Set if the contact confirmed they agree to be a contact (optional step, Phase 5).
    verifiedAt: { type: Date },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

trustedContactSchema.index({ owner: 1, createdAt: 1 });
trustedContactSchema.index({ owner: 1, phone: 1 }, { unique: true });

export default mongoose.model('TrustedContact', trustedContactSchema);