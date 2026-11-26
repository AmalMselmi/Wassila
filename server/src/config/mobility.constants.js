const freeze = Object.freeze;

// ---- Trips ----
export const TRIP_STATUS = freeze({
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});
export const TRIP_STATUS_VALUES = freeze(Object.values(TRIP_STATUS));

// Allowed next statuses and who may perform each change. Enforced by the trip service (Phase 5).
export const TRIP_TRANSITIONS = freeze({
  scheduled: freeze({
    in_progress: freeze(['transporter']),
    cancelled: freeze(['transporter', 'admin']),
  }),
  in_progress: freeze({
    completed: freeze(['transporter']),
    cancelled: freeze(['transporter', 'admin']),
  }),
  completed: freeze({}),
  cancelled: freeze({}),
});

// ---- Requests ----
export const TRIP_REQUEST_KINDS = freeze(['passenger', 'cargo']);
export const MAX_SEATS_PER_REQUEST = 8;

export const TRIP_REQUEST_STATUS = freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REFUSED: 'refused',
  CANCELLED: 'cancelled',
});
export const TRIP_REQUEST_STATUS_VALUES = freeze(Object.values(TRIP_REQUEST_STATUS));

// ---- Confirmation ----
export const CONFIRMATION_STATUS = freeze({
  AWAITING: 'awaiting',
  PASSENGER_CONFIRMED: 'passenger_confirmed',
  TRANSPORTER_CONFIRMED: 'transporter_confirmed',
  CONFIRMED: 'confirmed',
  EXPIRED: 'expired',
});
export const CONFIRMATION_STATUS_VALUES = freeze(Object.values(CONFIRMATION_STATUS));

// ---- Safety ----
export const MAX_TRUSTED_CONTACTS = 3;
export const MAX_LOCATION_SHARE_HOURS = 12;
export const TRUSTED_CONTACT_RELATIONSHIPS = freeze(['family', 'friend', 'neighbor', 'other']);

export const SOS_STATUS = freeze({
  ACTIVE: 'active',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled',
});
export const SOS_STATUS_VALUES = freeze(Object.values(SOS_STATUS));

// "not_configured" is recorded when no SMS provider is set up, so nothing is ever claimed as sent.
export const SOS_DELIVERY_STATUS = freeze(['queued', 'sent', 'failed', 'not_configured']);

// ---- Reports ----
export const REPORT_CATEGORIES = freeze([
  'safety',
  'harassment',
  'no_show',
  'fraud',
  'vehicle',
  'other',
]);
export const TRIP_REPORT_STATUS = freeze({
  OPEN: 'open',
  REVIEWING: 'reviewing',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
});
export const TRIP_REPORT_STATUS_VALUES = freeze(Object.values(TRIP_REPORT_STATUS));

// Same international format as User.phone, e.g. +21620123456.
export const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;