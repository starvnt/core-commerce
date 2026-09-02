const mongoose = require('mongoose');
const { Schema } = mongoose;

const allocationSchema = new Schema(
  {
    allocationId: { type: String, required: true },
    category: { type: String, required: true }, // Photography, Catering, Venue, Decor, etc.
    plannedMinor: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { _id: false },
);

const budgetSchema = new Schema(
  {
    budgetId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, unique: true, index: true },
    organizationId: { type: String, default: null, index: true },
    totalMinor: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    allocations: { type: [allocationSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('Budget', budgetSchema);
