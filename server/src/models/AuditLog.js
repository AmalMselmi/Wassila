import mongoose from 'mongoose';
import { AUDIT_OUTCOMES } from '../config/constants.js';

const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    // Null for system actions or failed logins where the actor is unknown.
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    actorRole: { type: String, trim: true, maxlength: 20 },

    // Dot notation, e.g. "user.suspend", "resource.reject".
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      match: [/^[a-z_]+(\.[a-z_]+)+$/, 'Action must look like "entity.verb"'],
    },
    targetType: { type: String, trim: true, maxlength: 40 },
    targetId: { type: Schema.Types.ObjectId },

    outcome: { type: String, enum: AUDIT_OUTCOMES, required: true },
    requestId: { type: String, trim: true, maxlength: 60 }, // links to application logs
    // Small, non-sensitive context only (e.g. a rejection reason code).
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// ---- Append-only enforcement (application level) ----
const BLOCKED_QUERY_OPERATIONS = [
  'updateOne',
  'updateMany',
  'findOneAndUpdate',
  'findOneAndReplace',
  'replaceOne',
  'deleteOne',
  'deleteMany',
  'findOneAndDelete',
];

auditLogSchema.pre(BLOCKED_QUERY_OPERATIONS, function blockMutation() {
  throw new Error('AuditLog is append-only');
});

auditLogSchema.pre('save', function blockResave() {
  if (!this.isNew) {
    throw new Error('AuditLog is append-only');
  }
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);