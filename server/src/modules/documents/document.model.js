const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentSchema = new Schema(
  {
    documentId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, default: null, index: true },
    bookingId: { type: String, default: null, index: true },
    inquiryId: { type: String, default: null, index: true },
    quoteId: { type: String, default: null, index: true },
    organizationId: { type: String, default: null, index: true },
    type: {
      type: String,
      enum: ['PROPOSAL', 'AGREEMENT', 'INVOICE', 'RECEIPT', 'CONTRACT', 'OTHER'],
      default: 'OTHER',
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    mimeType: { type: String, default: 'application/pdf' },
    fileSizeBytes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['DRAFT', 'SENT', 'VIEWED', 'SIGNED', 'REJECTED', 'ARCHIVED'],
      default: 'DRAFT',
    },
    uploadedBy: { type: String, default: null },
    signedAt: { type: Date, default: null },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true, versionKey: false },
);

documentSchema.index({ customerId: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
