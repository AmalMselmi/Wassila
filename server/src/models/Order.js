import mongoose from 'mongoose';
import { GOVERNORATES } from '../config/constants.js';
import {
  UNITS,
  ORDER_STATUS,
  ORDER_STATUS_VALUES,
  ORDER_DELIVERY_METHODS,
} from '../config/market.constants.js';
import { ORDER_CODE_REGEX, generateOrderCode } from '../utils/codes.js';
import { integerValidator, toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const statusHistorySchema = new Schema(
  {
    status: { type: String, enum: ORDER_STATUS_VALUES, required: true },
    at: { type: Date, default: Date.now },
    by: { type: Schema.Types.ObjectId, ref: 'User' },
    note: { type: String, trim: true, maxlength: 300 },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      default: generateOrderCode,
      match: ORDER_CODE_REGEX,
    },

    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },

    // Copy of the listing at order time, so later edits never rewrite history.
    productSnapshot: {
      title: { type: String, required: true, trim: true, maxlength: 100 },
      unit: { type: String, enum: UNITS, required: true },
      batchCode: { type: String, trim: true, maxlength: 12 },
    },

    quantity: { type: Number, required: true, min: 0.001 },
    unitPriceMillimes: { type: Number, required: true, min: 0, validate: integerValidator },
    // Computed from quantity x unit price before validation.
    totalMillimes: { type: Number, min: 0 },

    status: { type: String, enum: ORDER_STATUS_VALUES, default: ORDER_STATUS.PENDING },
    statusHistory: { type: [statusHistorySchema], default: [] },

    // Proposed by the seller while the order is "counter_offered".
    counterOffer: {
      quantity: { type: Number, min: 0.001 },
      unitPriceMillimes: { type: Number, min: 0, validate: integerValidator },
      message: { type: String, trim: true, maxlength: 300 },
      at: { type: Date },
    },

    delivery: {
      method: { type: String, enum: ORDER_DELIVERY_METHODS, default: 'pickup' },
      governorate: { type: String, enum: GOVERNORATES },
      note: { type: String, trim: true, maxlength: 300 },
    },
    // Optional link to a transport trip (model added in Part 2.3).
    transportTrip: { type: Schema.Types.ObjectId, ref: 'Trip' },

    buyerNote: { type: String, trim: true, maxlength: 500 },
    rejectedReason: { type: String, trim: true, maxlength: 300 },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancelReason: { type: String, trim: true, maxlength: 300 },

    // Hash of the single-use token embedded in the delivery QR (created at dispatch).
    // Delivery is confirmed by the authenticated buyer presenting this token.
    deliveryTokenHash: { type: String, select: false },
    deliveryTokenExpiresAt: { type: Date, select: false },
    deliveredAt: { type: Date },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

orderSchema.pre('validate', function computeTotals() {
  if (this.buyer && this.seller && String(this.buyer) === String(this.seller)) {
    this.invalidate('seller', 'Buyer and seller must be different users');
  }
  if (this.quantity != null && this.unitPriceMillimes != null) {
    this.totalMillimes = Math.round(this.quantity * this.unitPriceMillimes);
  }
});

orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, status: 1, createdAt: -1 });
orderSchema.index({ product: 1 });
// Admin overview.
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);