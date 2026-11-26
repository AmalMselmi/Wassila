import mongoose from 'mongoose';
import { MAX_LOCATION_SHARE_HOURS } from '../config/mobility.constants.js';
import { locationSchema } from '../utils/locationSchema.js';
import { toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const HOUR_MS = 60 * 60 * 1000;
const CLEANUP_SECONDS = 60 * 60; // documents are removed 1 hour after expiry

const locationShareSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },

    // Only these trusted contacts may view the location, through the tokenised link.
    sharedWith: {
      type: [{ type: Schema.Types.ObjectId, ref: 'TrustedContact' }],
      default: [],
      validate: {
        validator: (list) => list.length >= 1 && list.length <= 3,
        message: 'Share with between 1 and 3 trusted contacts',
      },
    },

    // Hash of the random token in the viewer link. The raw token is shown to the user once.
    viewerTokenHash: { type: String, select: false },

    startedAt: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      required: true,
      validate: {
        validator: function withinLimit(value) {
          if (!this.isNew) return true;
          const now = Date.now();
          return value.getTime() > now && value.getTime() <= now + MAX_LOCATION_SHARE_HOURS * HOUR_MS;
        },
        message: `expiresAt must be in the future and at most ${MAX_LOCATION_SHARE_HOURS} hours away`,
      },
    },
    revokedAt: { type: Date },

    // Latest reading only. No location history is kept.
    lastLocation: { type: locationSchema },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

locationShareSchema.index({ user: 1, trip: 1, createdAt: -1 });
// Automatic deletion shortly after the share expires.
locationShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: CLEANUP_SECONDS });

export default mongoose.model('LocationShare', locationShareSchema);