import mongoose from 'mongoose';
import { GOVERNORATES } from '../config/constants.js';
import { UNITS, HARVEST_STATUS, HARVEST_STATUS_VALUES } from '../config/market.constants.js';
import { toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const MAX_PARTICIPANTS = 200;

const participantSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const harvestSchema = new Schema(
  {
    organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 1000 },
    crop: { type: String, required: true, trim: true, maxlength: 80 },

    startsAt: { type: Date, required: true },
    governorate: { type: String, enum: GOVERNORATES, required: true },
    locality: { type: String, trim: true, maxlength: 100 },

    expectedQuantity: {
      amount: { type: Number, min: 0.001 },
      unit: { type: String, enum: UNITS },
    },

    helpersNeeded: { type: Number, default: 0, min: 0, max: MAX_PARTICIPANTS },
    transportNeeded: { type: Boolean, default: false },

    // Bounded and always read together with the harvest, so it is embedded.
    participants: {
      type: [participantSchema],
      default: [],
      validate: {
        validator: (list) => list.length <= MAX_PARTICIPANTS,
        message: `At most ${MAX_PARTICIPANTS} participants`,
      },
    },

    status: { type: String, enum: HARVEST_STATUS_VALUES, default: HARVEST_STATUS.OPEN },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

harvestSchema.index({ status: 1, startsAt: 1 });
harvestSchema.index({ organizer: 1, startsAt: -1 });
harvestSchema.index({ governorate: 1, startsAt: 1 });
// "Harvests I joined" (multikey).
harvestSchema.index({ 'participants.user': 1 });
// Transporters browsing harvests that need transport.
harvestSchema.index({ transportNeeded: 1, status: 1, startsAt: 1 });

export default mongoose.model('Harvest', harvestSchema);