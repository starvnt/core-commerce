const mongoose = require('mongoose');
const { Schema } = mongoose;

const followupSchema = new Schema(
  {
    followupId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    organizationId: { type: String, default: null, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    scheduledAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'OVERDUE', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    assignedTo: { type: String, default: null },
    completedAt: { type: Date, default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('FollowUp', followupSchema);
