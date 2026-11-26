const freeze = Object.freeze;

// ---- Roles ----
export const ROLES = freeze({
  MEMBER: 'member',
  TRANSPORTER: 'transporter',
  ADMIN: 'admin',
});
export const ROLE_VALUES = freeze(Object.values(ROLES));

// ---- Account ----
export const ACCOUNT_STATUS = freeze({
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
});
export const ACCOUNT_STATUS_VALUES = freeze(Object.values(ACCOUNT_STATUS));

export const LANGUAGES = freeze(['fr', 'ar']);
export const GENDERS = freeze(['female', 'male']);

// ---- Identity verification ----
export const IDENTITY_STATUS = freeze({
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
});
export const IDENTITY_STATUS_VALUES = freeze(Object.values(IDENTITY_STATUS));

export const IDENTITY_METHODS = freeze([
  'selfie_id',
  'cooperative',
  'driver_documents',
  'manual',
]);

export const VERIFICATION_REQUEST_STATUS = freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});
export const VERIFICATION_REQUEST_STATUS_VALUES = freeze(
  Object.values(VERIFICATION_REQUEST_STATUS)
);

export const VERIFICATION_FILE_KINDS = freeze([
  'selfie',
  'id_front',
  'id_back',
  'driver_license',
  'vehicle_document',
]);
export const VERIFICATION_FILE_MIME_TYPES = freeze([
  'image/jpeg',
  'image/png',
  'application/pdf',
]);
export const MAX_VERIFICATION_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

// ---- Transporter ----
export const VEHICLE_TYPES = freeze(['car', 'van', 'pickup', 'truck', 'minibus', 'other']);

// ---- Auth ----
export const OTP_PURPOSES = freeze(['phone_verification', 'password_reset']);

export const REFRESH_REVOCATION_REASONS = freeze([
  'rotated',
  'logout',
  'logout_all',
  'reuse_detected',
  'password_change',
  'account_suspended',
  'account_deleted',
]);

// ---- Audit ----
export const AUDIT_OUTCOMES = freeze(['success', 'failure', 'denied']);

// ---- Notifications ----
export const NOTIFICATION_TYPES = freeze([
  'account_verified',
  'identity_approved',
  'identity_rejected',
  'account_suspended',
  'order_requested',
  'order_updated',
  'demand_contribution',
  'harvest_joined',
  'trip_request',
  'trip_accepted',
  'trip_refused',
  'trip_confirmed',
  'trip_cancelled',
  'sos_alert',
  'resource_approved',
  'resource_rejected',
  'report_received',
  'admin_action',
]);

// ---- Geography ----
// The 24 governorates of Tunisia (slugs; French and Arabic labels live in the client locales).
export const GOVERNORATES = freeze([
  'ariana',
  'beja',
  'ben-arous',
  'bizerte',
  'gabes',
  'gafsa',
  'jendouba',
  'kairouan',
  'kasserine',
  'kebili',
  'kef',
  'mahdia',
  'manouba',
  'medenine',
  'monastir',
  'nabeul',
  'sfax',
  'sidi-bouzid',
  'siliana',
  'sousse',
  'tataouine',
  'tozeur',
  'tunis',
  'zaghouan',
]);