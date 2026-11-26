import mongoose from 'mongoose';
import {
  ROLES,
  ROLE_VALUES,
  ACCOUNT_STATUS,
  ACCOUNT_STATUS_VALUES,
  IDENTITY_STATUS,
  IDENTITY_STATUS_VALUES,
  IDENTITY_METHODS,
  LANGUAGES,
  GENDERS,
  GOVERNORATES,
  VEHICLE_TYPES,
} from '../config/constants.js';

const { Schema } = mongoose;

// Required unless the account has been anonymised after deletion.
function requiredUnlessDeleted() {
  return this.accountStatus !== ACCOUNT_STATUS.DELETED;
}

// Expertise is a profile attribute, never a permission.
const expertProfileSchema = new Schema(
  {
    isExpert: { type: Boolean, default: false },
    specializations: {
      type: [{ type: String, trim: true, maxlength: 60 }],
      default: [],
      validate: {
        validator: (list) => list.length <= 10,
        message: 'At most 10 specializations',
      },
    },
    yearsOfExperience: { type: Number, min: 0, max: 60 },
    qualification: { type: String, trim: true, maxlength: 200 },
    services: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const transporterProfileSchema = new Schema(
  {
    vehicleType: { type: String, enum: VEHICLE_TYPES },
    vehicleModel: { type: String, trim: true, maxlength: 80 },
    plateNumber: { type: String, trim: true, maxlength: 20 },
    seats: { type: Number, min: 1, max: 60 },
    cargoCapacityKg: { type: Number, min: 0, max: 40000 },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-z0-9._-]+$/, 'Username may contain only a-z, 0-9, dot, underscore and hyphen'],
    },
    displayName: { type: String, trim: true, maxlength: 60 },

    // E.164 format, e.g. +21620123456. Private: never returned unless explicitly selected.
    phone: {
      type: String,
      required: requiredUnlessDeleted,
      unique: true,
      sparse: true, // anonymised accounts have no phone
      select: false,
      set: (value) => (typeof value === 'string' ? value.replace(/[\s-]/g, '') : value),
      match: [/^\+[1-9]\d{7,14}$/, 'Phone must be in international format, e.g. +21620123456'],
    },

    // bcrypt hash only. Never the password.
    passwordHash: { type: String, required: requiredUnlessDeleted, select: false },

    role: { type: String, enum: ROLE_VALUES, default: ROLES.MEMBER, required: true },
    governorate: { type: String, enum: GOVERNORATES, required: requiredUnlessDeleted },

    // Used only to enable women-only rides. Never shown publicly.
    gender: { type: String, enum: GENDERS, select: false },
    language: { type: String, enum: LANGUAGES, default: 'fr' },
    bio: { type: String, trim: true, maxlength: 500 },
    avatarFile: { type: String, trim: true, maxlength: 120 }, // stored filename, never a URL from the client

    expertProfile: { type: expertProfileSchema, default: () => ({}) },
    transporterProfile: { type: transporterProfileSchema },

    // ---- Account state ----
    accountStatus: {
      type: String,
      enum: ACCOUNT_STATUS_VALUES,
      default: ACCOUNT_STATUS.ACTIVE,
      required: true,
    },
    suspension: {
      reason: { type: String, trim: true, maxlength: 500 },
      at: { type: Date },
      by: { type: Schema.Types.ObjectId, ref: 'User' },
    },

    // ---- Verification ----
    verification: {
      phoneVerified: { type: Boolean, default: false },
      phoneVerifiedAt: { type: Date },
      identityStatus: {
        type: String,
        enum: IDENTITY_STATUS_VALUES,
        default: IDENTITY_STATUS.UNVERIFIED,
      },
      identityMethod: { type: String, enum: IDENTITY_METHODS },
      identityVerifiedAt: { type: Date },
      identityVerifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },

    consent: {
      acceptedAt: { type: Date, required: requiredUnlessDeleted },
      termsVersion: { type: String, trim: true, maxlength: 20 },
    },

    // ---- Security bookkeeping (never exposed) ----
    passwordChangedAt: { type: Date },
    failedLoginCount: { type: Number, default: 0, min: 0, select: false },
    lockUntil: { type: Date, select: false },
    lastLoginAt: { type: Date },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(doc, ret) {
        // Safety net. Public output must still go through a serializer in the service layer.
        delete ret._id;
        delete ret.passwordHash;
        delete ret.failedLoginCount;
        delete ret.lockUntil;
        return ret;
      },
    },
  }
);

// Admin user list: filter by role / status, newest first.
userSchema.index({ role: 1, accountStatus: 1, createdAt: -1 });
// Admin verification queue.
userSchema.index({ 'verification.identityStatus': 1, createdAt: -1 });
// Browse producers and transporters by region.
userSchema.index({ governorate: 1, role: 1 });

export default mongoose.model('User', userSchema);