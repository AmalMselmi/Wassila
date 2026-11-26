import mongoose from 'mongoose';
import {
  TRIP_REQUEST_KINDS,
  TRIP_REQUEST_STATUS,
  TRIP_REQUEST_STATUS_VALUES,
  MAX_SEATS_PER_REQUEST,
} from '../config/mobility.constants.js';
import { toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const ACTIVE_STATUSES = [TRIP_REQUEST_STATUS.PENDING, TRIP_REQUEST_STATUS.ACCEPTED];

const tripRequestSchema = new Schema(
  {
    trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // Denormalised from the trip for fast "requests I received" queries.
    transporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    kind: { type: String, enum: TRIP_REQUEST_KINDS, required: true },
    seats: { type: Number, min: 1, max: MAX_SEATS_PER_REQUEST },
    cargoKg: { type: Number, min: 0.1, max: 40000 },
    cargoDescription: { type: String, trim: true, maxlength: 300 },

    // Optional: the request is linked to a harvest announcement.
    harvest: { type: Schema.Types.ObjectId, ref: 'Harvest' },

    pickupLocality: { type: String, trim: true, maxlength: 100 },
    message: { type: String, trim: true, maxlength: 500 },

    status: {
      type: String,
      enum: TRIP_REQUEST_STATUS_VALUES,
      default: TRIP_REQUEST_STATUS.PENDING,
    },
    respondedAt: { type: Date },
    refusalReason: { type: String, trim: true, maxlength: 300 },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: { type: Date },

    // Set when the passenger's phone was revealed to the transporter (after acceptance only).
    contactSharedAt: { type: Date },

    // Maintained automatically on save(). Used by the partial unique index below.
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

tripRequestSchema.pre('validate', function checkKindAndActivity() {
  if (this.kind === 'passenger' && !this.seats) {
    this.invalidate('seats', 'seats is required for a passenger request');
  }
  if (this.kind === 'cargo' && !this.cargoKg) {
    this.invalidate('cargoKg', 'cargoKg is required for a cargo request');
  }
  if (this.requester && this.transporter && String(this.requester) === String(this.transporter)) {
    this.invalidate('requester', 'You cannot request your own trip');
  }
  this.isActive = ACTIVE_STATUSES.includes(this.status);
});

// One active request per person, per trip, per kind.
tripRequestSchema.index(
  { trip: 1, requester: 1, kind: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);
tripRequestSchema.index({ trip: 1, status: 1 });
tripRequestSchema.index({ requester: 1, createdAt: -1 });
tripRequestSchema.index({ transporter: 1, status: 1, createdAt: -1 });
tripRequestSchema.index({ harvest: 1 });

export default mongoose.model('TripRequest', tripRequestSchema);