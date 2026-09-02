const mongoose = require('mongoose');
const { Schema } = mongoose;

const timelineItemSchema = new Schema(
  {
    timelineId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    bookingId: { type: String, default: null, index: true },
    organizationId: { type: String, default: null, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    location: { type: String, default: '' },
    category: { type: String, enum: ['CEREMONY', 'RECEPTION', 'PHOTO', 'FOOD', 'MUSIC', 'TRAVEL', 'OTHER'], default: 'OTHER' },
    responsible: { type: String, default: '' }, // person / vendor name
    status: { type: String, enum: ['PLANNED', 'IN_PROGRESS', 'DONE', 'SKIPPED'], default: 'PLANNED' },
    order: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true, versionKey: false },
);

timelineItemSchema.index({ customerId: 1, startTime: 1 });

module.exports = mongoose.model('TimelineItem', timelineItemSchema);
