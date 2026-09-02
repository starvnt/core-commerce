const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Audit — accountability record. Who changed what, when, why.
 * Different from Activity (which is customer-facing) and Domain Event
 * (which is for integration/reaction).
 */
const auditSchema = new Schema(
  {
    auditId: { type: String, required: true, unique: true, index: true },
    organizationId: { type: String, default: null, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    field: { type: String, default: null },
    previousValue: { type: Schema.Types.Mixed, default: null },
    newValue: { type: Schema.Types.Mixed, default: null },
    changedBy: { type: String, default: null },
    source: { type: String, enum: ['USER', 'SYSTEM', 'AUTOMATION', 'ADMIN'], default: 'USER' },
    reason: { type: String, default: null },
    correlationId: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('Audit', auditSchema);
