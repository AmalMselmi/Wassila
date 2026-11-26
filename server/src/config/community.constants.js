const freeze = Object.freeze;

// ---- Forum ----
// Categories to be aligned with the prototype in Phase 5.
export const FORUM_CATEGORIES = freeze([
  'general',
  'olive',
  'dates',
  'fruit-trees',
  'vegetables',
  'irrigation-soil',
  'pests-diseases',
  'marketing',
  'handicrafts',
  'transport',
  'questions',
]);

export const CONTENT_STATUS = freeze({
  PUBLISHED: 'published',
  HIDDEN: 'hidden', // hidden by an administrator (moderation)
  DELETED: 'deleted', // deleted by its author (soft delete)
});
export const CONTENT_STATUS_VALUES = freeze(Object.values(CONTENT_STATUS));

export const REPORT_TARGET_TYPES = freeze(['post', 'comment']);
export const FORUM_REPORT_REASONS = freeze([
  'spam',
  'harassment',
  'misinformation',
  'inappropriate',
  'dangerous',
  'other',
]);
export const FORUM_REPORT_STATUS = freeze({
  OPEN: 'open',
  REVIEWING: 'reviewing',
  UPHELD: 'upheld', // the report was justified and action was taken
  DISMISSED: 'dismissed',
});
export const FORUM_REPORT_STATUS_VALUES = freeze(Object.values(FORUM_REPORT_STATUS));
export const FORUM_REPORT_ACTIONS = freeze(['none', 'content_hidden', 'user_suspended']);

// ---- Agricultural resources ----
export const RESOURCE_CATEGORIES = freeze([
  'cultivation',
  'irrigation',
  'soil-fertilization',
  'pests-diseases',
  'harvest-post-harvest',
  'marketing',
  'regulations-support',
  'sustainability',
  'handicrafts',
  'other',
]);
export const RESOURCE_LANGUAGES = freeze(['fr', 'ar', 'en']);

export const RESOURCE_STATUS = freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ARCHIVED: 'archived',
});
export const RESOURCE_STATUS_VALUES = freeze(Object.values(RESOURCE_STATUS));

export const RESOURCE_FILE_MIME_TYPES = freeze([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]);
export const MAX_RESOURCE_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

// "not_scanned" until a malware scanner is connected (extension point, Phase 5/7).
export const SCAN_STATUS = freeze(['not_scanned', 'clean', 'infected', 'error']);