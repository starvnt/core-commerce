const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Activity — reusable, customer-facing operational history.
 * entityType can be CUSTOMER, INQUIRY, QUOTE, BOOKING, etc.
 */
const activitySchema = new Schema(
  {
    activityId: { type: String, required: true, unique: true, index: true },
    organizationId: { type: String, default: null, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, required: true, index: true },
    actionType: { type: String, required: true },
    message: { type: String, required: true },
    source: {
      type: String,
      enum: ['USER', 'SYSTEM', 'AUTOMATION', 'ADMIN'],
      default: 'USER',
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdBy: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('Activity', activitySchema);
