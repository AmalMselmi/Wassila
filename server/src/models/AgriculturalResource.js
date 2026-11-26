import mongoose from 'mongoose';
import {
  RESOURCE_CATEGORIES,
  RESOURCE_LANGUAGES,
  RESOURCE_STATUS,
  RESOURCE_STATUS_VALUES,
  RESOURCE_FILE_MIME_TYPES,
  MAX_RESOURCE_FILE_BYTES,
  SCAN_STATUS,
} from '../config/community.constants.js';
import { toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const fileSchema = new Schema(
  {
    // Random server-generated name inside private storage. Never the client's filename.
    storageKey: { type: String, required: true, trim: true, maxlength: 120 },
    // Sanitised name shown to users only. Never used to build a path.
    originalName: { type: String, trim: true, maxlength: 120 },
    // Verified server-side from the file's real content (magic bytes), not from the client.
    mimeType: { type: String, enum: RESOURCE_FILE_MIME_TYPES, required: true },
    sizeBytes: { type: Number, required: true, min: 1, max: MAX_RESOURCE_FILE_BYTES },
    sha256: { type: String, match: /^[a-f0-9]{64}$/ },

    // "not_scanned" until a malware scanner is connected. Never claimed as clean without a scan.
    scanStatus: { type: String, enum: SCAN_STATUS, default: 'not_scanned' },
    scannedAt: { type: Date },
  },
  { _id: false }
);

const agriculturalResourceSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 150 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    category: { type: String, enum: RESOURCE_CATEGORIES, required: true },
    language: { type: String, enum: RESOURCE_LANGUAGES, default: 'fr' },
    tags: {
      type: [{ type: String, trim: true, lowercase: true, maxlength: 30 }],
      default: [],
      validate: { validator: (list) => list.length <= 5, message: 'At most 5 tags' },
    },

    file: { type: fileSchema },

    status: {
      type: String,
      enum: RESOURCE_STATUS_VALUES,
      default: RESOURCE_STATUS.PENDING,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: {
      type: String,
      trim: true,
      minlength: 5,
      maxlength: 500,
      required: function requiredWhenRejected() {
        return this.status === RESOURCE_STATUS.REJECTED;
      },
    },

    downloadCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

// Public library: approved resources by category.
agriculturalResourceSchema.index({ status: 1, category: 1, createdAt: -1 });
// Admin moderation queue: oldest pending first.
agriculturalResourceSchema.index({ status: 1, createdAt: 1 });
// "My resources".
agriculturalResourceSchema.index({ author: 1, createdAt: -1 });
agriculturalResourceSchema.index(
  { title: 'text', description: 'text' },
  { default_language: 'none', name: 'resource_text_search' }
);

export default mongoose.model('AgriculturalResource', agriculturalResourceSchema);