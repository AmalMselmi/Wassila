import mongoose from 'mongoose';
import { GOVERNORATES } from '../config/constants.js';
import {
  KNOWLEDGE_SOURCE_TYPES,
  KNOWLEDGE_TRUST_TIERS,
  KNOWLEDGE_LANGUAGES,
  KNOWLEDGE_DOC_STATUS,
  KNOWLEDGE_DOC_STATUS_VALUES,
  KNOWLEDGE_FILE_MIME_TYPES,
  MAX_KNOWLEDGE_FILE_BYTES,
} from '../config/ai.constants.js';
import { toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const tagList = {
  type: [{ type: String, trim: true, lowercase: true, maxlength: 40 }],
  default: [],
  validate: { validator: (list) => list.length <= 20, message: 'At most 20 entries' },
};

const knowledgeDocumentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
    sourceType: { type: String, enum: KNOWLEDGE_SOURCE_TYPES, required: true },
    // Only "trusted" and "reviewed" documents are used to answer users.
    trustTier: { type: String, enum: KNOWLEDGE_TRUST_TIERS, default: 'unreviewed' },
    language: { type: String, enum: KNOWLEDGE_LANGUAGES, required: true },

    // Real provenance. Required so that nothing is cited without a known origin.
    publisher: { type: String, required: true, trim: true, maxlength: 150 },
    publishedYear: { type: Number, min: 1900, max: 2100 },
    url: { type: String, trim: true, maxlength: 300, match: /^https:\/\/\S+$/ },
    // Records the right to use the document (license, permission or "own work").
    licenseNote: { type: String, required: true, trim: true, minlength: 3, maxlength: 300 },

    // Metadata used to filter retrieval.
    crops: tagList,
    topics: tagList,
    regions: {
      type: [{ type: String, enum: GOVERNORATES }],
      default: [],
    },

    // Original file in private storage (random key, never the client's filename).
    file: {
      storageKey: { type: String, trim: true, maxlength: 120 },
      mimeType: { type: String, enum: KNOWLEDGE_FILE_MIME_TYPES },
      sizeBytes: { type: Number, min: 1, max: MAX_KNOWLEDGE_FILE_BYTES },
    },
    // Prevents ingesting the same file twice.
    sha256: { type: String, match: /^[a-f0-9]{64}$/, unique: true, sparse: true },

    status: {
      type: String,
      enum: KNOWLEDGE_DOC_STATUS_VALUES,
      default: KNOWLEDGE_DOC_STATUS.PENDING,
    },
    chunkCount: { type: Number, default: 0, min: 0 },
    embeddingModel: { type: String, trim: true, maxlength: 80 },
    embeddingDimensions: { type: Number, min: 1 },
    ingestedAt: { type: Date },
    ingestError: { type: String, trim: true, maxlength: 300 },

    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

knowledgeDocumentSchema.index({ status: 1, trustTier: 1 });
knowledgeDocumentSchema.index({ language: 1, status: 1 });
knowledgeDocumentSchema.index({ addedBy: 1, createdAt: -1 });

export default mongoose.model('AgriculturalKnowledgeDocument', knowledgeDocumentSchema);