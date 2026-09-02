const mongoose = require('mongoose');
const { Schema } = mongoose;

const quoteLineItemSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    unitPriceMinor: { type: Number, default: 0 },
    totalMinor: { type: Number, default: 0 },
  },
  { _id: false },
);

const quoteSchema = new Schema(
  {
    quoteId: { type: String, required: true, unique: true, index: true },
    inquiryId: { type: String, default: null, index: true },
    customerId: { type: String, required: true, index: true },
    organizationId: { type: String, required: true, index: true },
    offeringId: { type: String, default: null, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    lineItems: { type: [quoteLineItemSchema], default: [] },
    subtotalMinor: { type: Number, default: 0 },
    discountMinor: { type: Number, default: 0 },
    taxMinor: { type: Number, default: 0 },
    totalMinor: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    validUntil: { type: Date, default: null },
    status: {
      type: String,
      enum: ['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
      default: 'DRAFT',
      index: true,
    },
    terms: { type: String, default: '' },
    sentAt: { type: Date, default: null },
    viewedAt: { type: Date, default: null },
    acceptedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    idempotencyKey: { type: String, default: null, index: true },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('Quote', quoteSchema);
