import mongoose from 'mongoose';

const { Schema } = mongoose;

export const locationSchema = new Schema(
  {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    accuracyM: { type: Number, min: 0, max: 100000 },
    recordedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);