const mongoose = require('mongoose');
const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    taskId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    organizationId: { type: String, default: null, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'GENERAL' }, // VENDOR, BUDGET, PAYMENT, TIMELINE, GENERAL
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'PENDING', index: true },
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    linkedEntityType: { type: String, default: null },
    linkedEntityId: { type: String, default: null },
    assignedTo: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('Task', taskSchema);
