import mongoose from 'mongoose';
import { REFRESH_REVOCATION_REASONS } from '../config/constants.js';

const { Schema } = mongoose;

const refreshTokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // SHA-256 hex of the random token. The raw token is only ever in the cookie.
    tokenHash: { type: String, required: true, unique: true },

    // All tokens from one login share a family. Reuse of a rotated token revokes the family.
    family: { type: String, required: true },

    expiresAt: { type: Date, required: true }, // idle expiry
    absoluteExpiresAt: { type: Date, required: true }, // hard limit for the whole family

    revokedAt: { type: Date },
    revokedReason: { type: String, enum: REFRESH_REVOCATION_REASONS },
    replacedBy: { type: Schema.Types.ObjectId, ref: 'RefreshToken' },

    // Shown in "my sessions" so a user can recognise and revoke a device.
    userAgent: { type: String, trim: true, maxlength: 300 },
    lastUsedAt: { type: Date },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ user: 1, revokedAt: 1 });
refreshTokenSchema.index({ family: 1 });
// MongoDB deletes the document automatically once expiresAt has passed.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('RefreshToken', refreshTokenSchema);