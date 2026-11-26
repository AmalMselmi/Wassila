const freeze = Object.freeze;

// ---- Quantities ----
export const UNITS = freeze(['kg', 'l', 'piece', 'dozen', 'box']);

// ---- Products ----
// To be aligned with the prototype's categories in Phase 5.
export const PRODUCT_CATEGORIES = freeze([
  'olive-products',
  'dates',
  'fruits',
  'vegetables',
  'cereals-legumes',
  'herbs-spices',
  'dairy-eggs',
  'honey',
  'preserves',
  'handicrafts',
  'textiles',
  'pottery',
  'other',
]);

export const PRODUCT_STATUS = freeze({
  ACTIVE: 'active',
  PAUSED: 'paused',
  SOLD_OUT: 'sold_out',
  REMOVED: 'removed',
});
export const PRODUCT_STATUS_VALUES = freeze(Object.values(PRODUCT_STATUS));

// ---- Batches and traceability ----
export const BATCH_STATUS = freeze({ ACTIVE: 'active', ARCHIVED: 'archived' });
export const BATCH_STATUS_VALUES = freeze(Object.values(BATCH_STATUS));

// "organic_claimed" is the producer's own claim. It is NOT a certification.
export const BATCH_PRODUCTION_METHODS = freeze([
  'traditional',
  'conventional',
  'organic_claimed',
  'unspecified',
]);

export const TRACE_EVENT_TYPES = freeze([
  'batch_created',
  'batch_edited',
  'storage',
  'processing',
  'packaging',
  'self_declared_check',
  'transport_handover',
  'listed_for_sale',
  'note',
]);
export const TRACE_EVENT_SOURCES = freeze(['producer', 'admin', 'system']);

// ---- Orders ----
export const ORDER_STATUS = freeze({
  PENDING: 'pending',
  COUNTER_OFFERED: 'counter_offered',
  ACCEPTED: 'accepted',
  PREPARING: 'preparing',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
});
export const ORDER_STATUS_VALUES = freeze(Object.values(ORDER_STATUS));

export const ORDER_DELIVERY_METHODS = freeze(['pickup', 'seller_delivery', 'transport']);

// For each current status: the allowed next statuses and which party may perform the change.
// The order service (Phase 5) enforces this table; tests will check every forbidden transition.
export const ORDER_TRANSITIONS = freeze({
  pending: freeze({
    accepted: freeze(['seller']),
    rejected: freeze(['seller']),
    counter_offered: freeze(['seller']),
    cancelled: freeze(['buyer']),
  }),
  counter_offered: freeze({
    accepted: freeze(['buyer']),
    cancelled: freeze(['buyer']),
  }),
  accepted: freeze({
    preparing: freeze(['seller']),
    cancelled: freeze(['buyer', 'seller']),
  }),
  preparing: freeze({
    dispatched: freeze(['seller']),
    cancelled: freeze(['seller']),
  }),
  dispatched: freeze({
    delivered: freeze(['buyer']),
  }),
  delivered: freeze({}),
  rejected: freeze({}),
  cancelled: freeze({}),
});

// ---- Group sales ----
export const DEMAND_STATUS = freeze({
  OPEN: 'open',
  FULFILLED: 'fulfilled',
  CLOSED: 'closed',
  EXPIRED: 'expired',
});
export const DEMAND_STATUS_VALUES = freeze(Object.values(DEMAND_STATUS));

export const CONTRIBUTION_STATUS = freeze({
  OFFERED: 'offered',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
});
export const CONTRIBUTION_STATUS_VALUES = freeze(Object.values(CONTRIBUTION_STATUS));

// ---- Harvests ----
export const HARVEST_STATUS = freeze({
  OPEN: 'open',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
});
export const HARVEST_STATUS_VALUES = freeze(Object.values(HARVEST_STATUS));