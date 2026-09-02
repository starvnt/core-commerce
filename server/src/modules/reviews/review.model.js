const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    reviewId: { type: String, required: true, unique: true, index: true },
    organizationId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    bookingId: { type: String, default: null, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '' },
    body: { type: String, default: '' },
    authorName: { type: String, default: '' },
    status: { type: String, enum: ['PUBLISHED', 'HIDDEN', 'FLAGGED'], default: 'PUBLISHED' },
  },
  { timestamps: true, versionKey: false },
);

reviewSchema.index({ organizationId: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
