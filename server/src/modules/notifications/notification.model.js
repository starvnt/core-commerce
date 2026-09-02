const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    notificationId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    organizationId: { type: String, default: null, index: true },
    type: { type: String, default: 'INFO' }, // INFO / WARNING / CRITICAL / SUCCESS
    title: { type: String, required: true },
    body: { type: String, default: '' },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true, versionKey: false },
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
