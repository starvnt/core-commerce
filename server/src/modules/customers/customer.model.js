const mongoose = require('mongoose');
const { Schema } = mongoose;

const customerSchema = new Schema(
  {
    customerId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: null, index: true },
    organizationId: { type: String, default: null, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, index: true },
    phone: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['new', 'active', 'inactive', 'archived'],
      default: 'new',
      index: true,
    },
    source: {
      type: String,
      enum: ['website', 'referral', 'walk_in', 'social', 'other'],
      default: 'website',
    },
    // Customer journey / event context
    eventType: { type: String, default: '' }, // Wedding, Corporate, etc.
    eventDate: { type: Date, default: null },
    venue: { type: String, default: '' },
    city: { type: String, default: '' },
    guestCount: { type: Number, default: null },
    budgetMinor: { type: Number, default: null }, // amount in paise/cents
    currency: { type: String, default: 'INR' },
    // First-touch / last-touch attribution
    firstTouch: { type: Schema.Types.Mixed, default: null },
    lastTouch: { type: Schema.Types.Mixed, default: null },
    // Intent score 0-100 (computed by analytics layer)
    intentScore: { type: Number, default: 0, min: 0, max: 100 },
    notes: { type: String, default: '' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false },
);

customerSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Customer', customerSchema);
