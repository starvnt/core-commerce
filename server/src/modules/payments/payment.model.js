const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    bookingId: { type: String, default: null, index: true },
    customerId: { type: String, required: true, index: true },
    organizationId: { type: String, required: true, index: true },
    amountMinor: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['PENDING', 'CAPTURED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    provider: { type: String, default: 'mock' },
    providerReference: { type: String, default: null },
    method: { type: String, default: 'CARD' },
    type: { type: String, enum: ['FULL', 'PARTIAL', 'DEPOSIT', 'REFUND'], default: 'FULL' },
    description: { type: String, default: '' },
    idempotencyKey: { type: String, default: null, index: true },
    capturedAt: { type: Date, default: null },
    refundedAmountMinor: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('Payment', paymentSchema);
