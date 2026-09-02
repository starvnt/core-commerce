const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    organizationId: { type: String, default: null, index: true },
    name: { type: String, required: true },
    eventType: { type: String, default: '' }, // Wedding, Corporate, Birthday, etc.
    eventDate: { type: Date, default: null },
    venue: { type: String, default: '' },
    city: { type: String, default: '' },
    guestCount: { type: Number, default: 0 },
    status: { type: String, enum: ['PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'PLANNING' },
    coverImageUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    budgetMinor: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

eventSchema.index({ customerId: 1, eventDate: 1 });

module.exports = mongoose.model('Event', eventSchema);
