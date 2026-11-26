import mongoose from 'mongoose';
import { toJSONOptions } from '../utils/schemaHelpers.js';

const { Schema } = mongoose;

const ratingSchema = new Schema(
  {
    rater: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ratee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
    tripRequest: { type: Schema.Types.ObjectId, ref: 'TripRequest', required: true },

    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: { validator: Number.isInteger, message: 'score must be a whole number from 1 to 5' },
    },
    comment: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true, toJSON: toJSONOptions }
);

ratingSchema.pre('validate', function checkParties() {
  if (this.rater && this.ratee && String(this.rater) === String(this.ratee)) {
    this.invalidate('ratee', 'You cannot rate yourself');
  }
});

// Each party rates the other once per request.
ratingSchema.index({ tripRequest: 1, rater: 1 }, { unique: true });
// A user's received ratings (for the average).
ratingSchema.index({ ratee: 1, createdAt: -1 });

export default mongoose.model('Rating', ratingSchema);