import mongoose from 'mongoose';
import {
  CONFIRMATION_STATUS,
  CONFIRMATION_STATUS_VALUES,
} from '../config/mobility.constants.js';
import { toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const tripConfirmationSchema = new Schema(
  {
    tripRequest: { type: Schema.Types.ObjectId, ref: 'TripRequest', required: true, unique: true },
    trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
    passenger: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    transporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // Hash of the random token carried by the QR. Possessing the QR alone is never enough:
    // the authenticated passenger of this request must also present it.
    qrTokenHash: { type: String, select: false },
    qrTokenExpiresAt: { type: Date, select: false },
    qrTokenUsedAt: { type: Date, select: false },

    passengerConfirmedAt: { type: Date },
    transporterConfirmedAt: { type: Date },

    status: {
      type: String,
      enum: CONFIRMATION_STATUS_VALUES,
      default: CONFIRMATION_STATUS.AWAITING,
    },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

tripConfirmationSchema.pre('validate', function deriveStatus() {
  if (this.status === CONFIRMATION_STATUS.EXPIRED) return;
  if (this.passengerConfirmedAt && this.transporterConfirmedAt) {
    this.status = CONFIRMATION_STATUS.CONFIRMED;
  } else if (this.passengerConfirmedAt) {
    this.status = CONFIRMATION_STATUS.PASSENGER_CONFIRMED;
  } else if (this.transporterConfirmedAt) {
    this.status = CONFIRMATION_STATUS.TRANSPORTER_CONFIRMED;
  } else {
    this.status = CONFIRMATION_STATUS.AWAITING;
  }
});

tripConfirmationSchema.index({ trip: 1, status: 1 });
tripConfirmationSchema.index({ passenger: 1, createdAt: -1 });
tripConfirmationSchema.index({ transporter: 1, createdAt: -1 });

export default mongoose.model('TripConfirmation', tripConfirmationSchema);