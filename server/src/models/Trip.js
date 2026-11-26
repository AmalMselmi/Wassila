import mongoose from 'mongoose';
import { GOVERNORATES, VEHICLE_TYPES } from '../config/constants.js';
import { TRIP_STATUS, TRIP_STATUS_VALUES } from '../config/mobility.constants.js';
import { integerValidator, toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const placeSchema = new Schema(
  {
    governorate: { type: String, enum: GOVERNORATES, required: true },
    locality: { type: String, trim: true, maxlength: 100 },
  },
  { _id: false }
);

const tripSchema = new Schema(
  {
    transporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    origin: { type: placeSchema, required: true },
    destination: { type: placeSchema, required: true },

    departureAt: {
      type: Date,
      required: true,
      validate: {
        // A new trip must depart in the future. Later edits are not blocked by this rule.
        validator: function departureInFuture(value) {
          return !this.isNew || value.getTime() > Date.now();
        },
        message: 'departureAt must be in the future',
      },
    },

    // Passengers
    seatsTotal: { type: Number, default: 0, min: 0, max: 60, validate: integerValidator },
    seatsAvailable: { type: Number, min: 0, validate: integerValidator },
    pricePerSeatMillimes: { type: Number, min: 0, validate: integerValidator },

    // Cargo
    cargoCapacityKg: { type: Number, default: 0, min: 0, max: 40000 },
    cargoAvailableKg: { type: Number, min: 0 },
    cargoPricePerKgMillimes: { type: Number, min: 0, validate: integerValidator },

    womenOnly: { type: Boolean, default: false },

    // Snapshot of the vehicle type. The plate stays private until a request is accepted.
    vehicleType: { type: String, enum: VEHICLE_TYPES },
    vehicleModel: { type: String, trim: true, maxlength: 80 },

    // Optional link to a harvest announcement that needs transport.
    harvest: { type: Schema.Types.ObjectId, ref: 'Harvest' },

    notes: { type: String, trim: true, maxlength: 500 },

    status: { type: String, enum: TRIP_STATUS_VALUES, default: TRIP_STATUS.SCHEDULED },
    startedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancelReason: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

tripSchema.pre('validate', function normalizeCapacity() {
  if (this.isNew) {
    if (this.seatsAvailable == null) this.seatsAvailable = this.seatsTotal;
    if (this.cargoAvailableKg == null) this.cargoAvailableKg = this.cargoCapacityKg;
  }
  if (this.seatsAvailable > this.seatsTotal) {
    this.invalidate('seatsAvailable', 'seatsAvailable cannot exceed seatsTotal');
  }
  if (this.cargoAvailableKg > this.cargoCapacityKg) {
    this.invalidate('cargoAvailableKg', 'cargoAvailableKg cannot exceed cargoCapacityKg');
  }
  if (!(this.seatsTotal > 0) && !(this.cargoCapacityKg > 0)) {
    this.invalidate('seatsTotal', 'A trip needs seats or cargo capacity');
  }
});

// Trip discovery.
tripSchema.index({ status: 1, departureAt: 1 });
tripSchema.index({
  'origin.governorate': 1,
  'destination.governorate': 1,
  status: 1,
  departureAt: 1,
});
// "My trips".
tripSchema.index({ transporter: 1, departureAt: -1 });
// Trips attached to a harvest.
tripSchema.index({ harvest: 1 });

export default mongoose.model('Trip', tripSchema);