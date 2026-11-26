import mongoose from 'mongoose';
import { OTP_PURPOSES } from '../config/constants.js';

const { Schema } = mongoose;

const otpCodeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    purpose: { type: String, enum: OTP_PURPOSES, required: true },

    // HMAC-SHA256(code, server secret). A plain hash of a 6-digit code could be brute-forced offline.
    codeHash: { type: String, required: true },

    attempts: { type: Number, default: 0, min: 0 },
    maxAttempts: { type: Number, default: 5, min: 1, max: 10 },

    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

otpCodeSchema.index({ user: 1, purpose: 1, createdAt: -1 });
otpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('OtpCode', otpCodeSchema);