const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Organization — represents a partner business (vendor, venue, artist, agency).
 * One organization can declare multiple capabilities.
 */
const organizationSchema = new Schema(
  {
    organizationId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, default: '' },
    // Business capability / category (separate from authorization role).
    capabilities: {
      type: [String],
      enum: ['VENDOR', 'VENUE', 'ARTIST', 'ORGANIZER', 'AGENCY'],
      default: ['VENDOR'],
    },
    // Service categories they offer (Photography, Catering, etc.)
    categories: { type: [String], default: [] },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    address: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    serviceRadiusKm: { type: Number, default: 50 },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    website: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    verified: { type: Boolean, default: false, index: true },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('Organization', organizationSchema);
