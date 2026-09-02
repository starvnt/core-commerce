const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    quoteId: { type: String, default: null, index: true },
    customerId: { type: String, required: true, index: true },
    organizationId: { type: String, required: true, index: true },
    offeringId: { type: String, default: null, index: true },
    title: { type: String, required: true },
    eventDate: { type: Date, default: null },
    startTime: { type: String, default: '' },
    endTime: { type: String, default: '' },
    venue: { type: String, default: '' },
    city: { type: String, default: '' },
    guestCount: { type: Number, default: null },
    totalMinor: { type: Number, default: 0 },
    paidMinor: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    idempotencyKey: { type: String, default: null, index: true },
    notes: { type: String, default: '' },
    confirmedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('Booking', bookingSchema);
