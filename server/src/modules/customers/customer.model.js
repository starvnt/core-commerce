const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Customer model — Day 1 foundation.
 *
 * Fields are intentionally minimal so we can layer Notes, Follow-ups,
 * Activity Timeline, and Status Tracking on later without rewrites.
 */
const customerSchema = new Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
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
    // Reserved for future sub-resources; intentionally not enforced yet.
    notes: { type: Array, default: [] },
    followUps: { type: Array, default: [] },
    activityTimeline: { type: Array, default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  },
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
