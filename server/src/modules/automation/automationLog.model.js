const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * AutomationLog — execution trace for the automation engine.
 * Distinct from AuditLog (accountability) and Activity (customer-facing history).
 */
const automationLogSchema = new Schema(
  {
    automationLogId: { type: String, required: true, unique: true, index: true },
    eventId: { type: String, default: null, index: true },
    ruleId: { type: String, required: true, index: true },
    ruleName: { type: String, default: null },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    actionType: { type: String, required: true },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'SKIPPED'],
      default: 'SUCCESS',
      index: true,
    },
    attempt: { type: Number, default: 1 },
    idempotencyKey: { type: String, required: true, index: true },
    error: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
    startedAt: { type: Date, default: () => new Date() },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('AutomationLog', automationLogSchema);
