const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    messageId: { type: String, required: true, unique: true, index: true },
    threadId: { type: String, required: true, index: true }, // customerId or bookingId
    threadType: { type: String, enum: ['CUSTOMER', 'BOOKING', 'INQUIRY', 'QUOTE'], default: 'CUSTOMER' },
    organizationId: { type: String, default: null, index: true },
    senderType: { type: String, enum: ['CUSTOMER', 'STAFF', 'SYSTEM', 'AUTOMATION'], required: true },
    senderId: { type: String, default: null },
    body: { type: String, required: true },
    attachments: { type: [String], default: [] },
    readBy: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false },
);

messageSchema.index({ threadId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
