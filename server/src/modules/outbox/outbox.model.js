const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Outbox event — written transactionally with the business operation.
 * The worker picks it up and dispatches to the automation engine.
 */
const outboxSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    eventName: { type: String, required: true, index: true },
    eventVersion: { type: String, default: '1.0' },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true, index: true },
    organizationId: { type: String, default: null, index: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    metadata: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'PROCESSED', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    availableAt: { type: Date, default: () => new Date(), index: true },
    processedAt: { type: Date, default: null },
    lastError: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('OutboxEvent', outboxSchema);
