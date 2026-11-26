import mongoose from 'mongoose';
import { GOVERNORATES } from '../config/constants.js';
import {
  KNOWLEDGE_TRUST_TIERS,
  KNOWLEDGE_LANGUAGES,
  EMBEDDING_MIN_DIMENSIONS,
  EMBEDDING_MAX_DIMENSIONS,
} from '../config/ai.constants.js';

const { Schema } = mongoose;

const tagList = {
  type: [{ type: String, trim: true, lowercase: true, maxlength: 40 }],
  default: [],
};

const knowledgeChunkSchema = new Schema(
  {
    document: {
      type: Schema.Types.ObjectId,
      ref: 'AgriculturalKnowledgeDocument',
      required: true,
    },
    ordinal: { type: Number, required: true, min: 0 }, // position of the chunk within the document

    // Untrusted data: the prompt builder treats this text as quoted material, never as instructions.
    text: { type: String, required: true, trim: true, minlength: 1, maxlength: 4000 },
    tokenCount: { type: Number, min: 0 },
    page: { type: Number, min: 1 },
    heading: { type: String, trim: true, maxlength: 200 },

    // ---- Copied from the document, for pre-filtering at search time ----
    language: { type: String, enum: KNOWLEDGE_LANGUAGES, required: true },
    trustTier: { type: String, enum: KNOWLEDGE_TRUST_TIERS, required: true },
    crops: tagList,
    topics: tagList,
    regions: { type: [{ type: String, enum: GOVERNORATES }], default: [] },
    // False while the document is disabled, so the chunk is never retrieved.
    enabled: { type: Boolean, default: true },

    // Hidden by default: large and never needed in API responses.
    embedding: {
      type: [Number],
      select: false,
      validate: {
        validator: (vector) =>
          !vector ||
          (vector.length >= EMBEDDING_MIN_DIMENSIONS &&
            vector.length <= EMBEDDING_MAX_DIMENSIONS &&
            vector.every(Number.isFinite)),
        message: 'embedding must be a finite vector of a sensible size',
      },
    },
    embeddingModel: { type: String, trim: true, maxlength: 80 },
  },
  { timestamps: true }
);

knowledgeChunkSchema.index({ document: 1, ordinal: 1 }, { unique: true });
knowledgeChunkSchema.index({ enabled: 1, trustTier: 1, language: 1 });

// NOTE: the vector index and the text index used for retrieval are mongot search indexes.
// They are created in Phase 6, once the embedding model and its dimension are chosen.

export default mongoose.model('KnowledgeChunk', knowledgeChunkSchema);