const mongoose = require('mongoose');
const { Schema } = mongoose;

const offeringSchema = new Schema(
  {
    offeringId: { type: String, required: true, unique: true, index: true },
    organizationId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, index: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true }, // Photography, Catering, Venue, etc.
    subcategory: { type: String, default: '' },
    // Pricing model
    pricingModel: {
      type: String,
      enum: ['FIXED', 'STARTING_FROM', 'QUOTE_BASED', 'PER_UNIT', 'PER_PERSON', 'HOURLY', 'DAILY', 'PACKAGE'],
      default: 'STARTING_FROM',
    },
    priceMinor: { type: Number, default: null },
    currency: { type: String, default: 'INR' },
    priceUnit: { type: String, default: '' }, // e.g. "per event", "per plate"
    // Fulfillment model
    fulfillmentModel: {
      type: String,
      enum: ['ON_DEMAND', 'TIME_SLOT', 'DATE_BASED', 'CAPACITY_BASED'],
      default: 'ON_DEMAND',
    },
    capacity: { type: Number, default: null },
    durationMinutes: { type: Number, default: null },
    includes: { type: [String], default: [] },
    images: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    bookingCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

offeringSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Offering', offeringSchema);
