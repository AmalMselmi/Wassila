const freeze = Object.freeze;

// ---- Assistant features ----
export const AI_FEATURES = freeze([
  'qa',
  'listing_extraction',
  'harvest_assist',
  'description_improvement',
  'terminology',
  'troubleshooting',
  'resource_recommendation',
]);

// The system prompt is never stored, only these two roles.
export const AI_MESSAGE_ROLES = freeze(['user', 'assistant']);

export const AI_CONVERSATION_STATUS = freeze({ ACTIVE: 'active', ARCHIVED: 'archived' });
export const AI_CONVERSATION_STATUS_VALUES = freeze(Object.values(AI_CONVERSATION_STATUS));

export const AI_LANGUAGES = freeze(['fr', 'ar', 'other']);

// Whether an answer relied on retrieved sources, on the model's general knowledge, or neither.
export const AI_GROUNDING = freeze(['sources', 'general', 'none']);
export const AI_FINISH_REASONS = freeze(['stop', 'length', 'safety', 'error', 'fallback']);

// Short codes recorded for monitoring. They never contain message content.
export const AI_SAFETY_FLAGS = freeze([
  'pesticide_dose_declined',
  'high_risk_referral',
  'injection_attempt_detected',
  'off_topic',
  'private_data_blocked',
  'provider_fallback',
]);

export const AI_MAX_USER_MESSAGE_CHARS = 2000;
export const AI_MAX_ASSISTANT_MESSAGE_CHARS = 8000;
export const AI_MAX_FOLLOW_UPS = 3;

// Retention defaults (adjustable).
export const AI_RETENTION_DAYS = 180;
export const AI_USAGE_RETENTION_DAYS = 120;

// ---- Listing drafts ----
export const AI_LISTING_DRAFT_STATUS = freeze({
  DRAFT: 'draft',
  APPROVED: 'approved',
  DISCARDED: 'discarded',
});
export const AI_LISTING_DRAFT_STATUS_VALUES = freeze(Object.values(AI_LISTING_DRAFT_STATUS));
export const AI_LISTING_DRAFT_TTL_HOURS = 24;

// ---- Knowledge base ----
export const KNOWLEDGE_SOURCE_TYPES = freeze([
  'guide',
  'research',
  'government',
  'extension_service',
  'internal_faq',
  'other',
]);

// Only "trusted" and "reviewed" documents may be used to answer users.
export const KNOWLEDGE_TRUST_TIERS = freeze(['trusted', 'reviewed', 'unreviewed']);
export const KNOWLEDGE_LANGUAGES = freeze(['fr', 'ar', 'en']);

export const KNOWLEDGE_DOC_STATUS = freeze({
  PENDING: 'pending', // uploaded, not yet embedded
  INDEXED: 'indexed',
  FAILED: 'failed',
  DISABLED: 'disabled', // excluded from retrieval
});
export const KNOWLEDGE_DOC_STATUS_VALUES = freeze(Object.values(KNOWLEDGE_DOC_STATUS));

export const KNOWLEDGE_FILE_MIME_TYPES = freeze([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
]);
export const MAX_KNOWLEDGE_FILE_BYTES = 25 * 1024 * 1024; // 25 MB

// Embedding size depends on the model chosen in Phase 6. These are sanity bounds only.
export const EMBEDDING_MIN_DIMENSIONS = 64;
export const EMBEDDING_MAX_DIMENSIONS = 4096;