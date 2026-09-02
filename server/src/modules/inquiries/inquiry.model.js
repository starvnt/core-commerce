const mongoose = require('mongoose');
const { Schema } = mongoose;

const inquirySchema = new Schema(
  {
    inquiryId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    organizationId: { type: String, default: null, index: true },
    offeringId: { type: String, default: null, index: true },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    eventType: { type: String, default: '' },
    eventDate: { type: Date, default: null },
    guestCount: { type: Number, default: null },
    city: { type: String, default: '' },
    budgetMinor: { type: Number, default: null },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['OPEN', 'RESPONDED', 'CLOSED', 'CANCELLED'],
      default: 'OPEN',
      index: true,
    },
    response: { type: String, default: null },
    respondedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('Inquiry', inquirySchema);
