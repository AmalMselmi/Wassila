import mongoose from 'mongoose';
import {
  IDENTITY_METHODS,
  VERIFICATION_REQUEST_STATUS,
  VERIFICATION_REQUEST_STATUS_VALUES,
  VERIFICATION_FILE_KINDS,
  VERIFICATION_FILE_MIME_TYPES,
  MAX_VERIFICATION_FILE_BYTES,
} from '../config/constants.js';

const { Schema } = mongoose;

const fileSchema = new Schema(
  {
    kind: { type: String, enum: VERIFICATION_FILE_KINDS, required: true },
    // Random server-generated name, never the client's filename.
    storageKey: { type: String, required: true, trim: true, maxlength: 120 },
    mimeType: { type: String, enum: VERIFICATION_FILE_MIME_TYPES, required: true },
    sizeBytes: { type: Number, required: true, min: 1, max: MAX_VERIFICATION_FILE_BYTES },
    // AES-256-GCM parameters (not secret; the key lives in the environment).
    iv: { type: String, required: true },
    authTag: { type: String, required: true },
  },
  { _id: false }
);

const verificationRequestSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    method: { type: String, enum: IDENTITY_METHODS, required: true },
    status: {
      type: String,
      enum: VERIFICATION_REQUEST_STATUS_VALUES,
      default: VERIFICATION_REQUEST_STATUS.PENDING,
      required: true,
    },

    files: {
      type: [fileSchema],
      default: [],
      validate: {
        validator: (list) => list.length <= 5,
        message: 'At most 5 files per request',
      },
    },
    // Set when the files are deleted from storage (on approval or rejection).
    filesPurgedAt: { type: Date },

    // Only for the cooperative method. To be aligned with the prototype in Phase 5.
    cooperativeName: { type: String, trim: true, maxlength: 120 },
    sponsor: { type: Schema.Types.ObjectId, ref: 'User' },

    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: {
      type: String,
      trim: true,
      minlength: 5,
      maxlength: 500,
      required: function requiredWhenRejected() {
        return this.status === VERIFICATION_REQUEST_STATUS.REJECTED;
      },
    },
  },
  { timestamps: true }
);

// Admin queue: oldest pending first.
verificationRequestSchema.index({ status: 1, createdAt: 1 });
// A user's own history.
verificationRequestSchema.index({ user: 1, createdAt: -1 });
// At most one pending request per user.
verificationRequestSchema.index(
  { user: 1 },
  { unique: true, partialFilterExpression: { status: VERIFICATION_REQUEST_STATUS.PENDING } }
);

export default mongoose.model('VerificationRequest', verificationRequestSchema);