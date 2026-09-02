const mongoose = require('mongoose');
const { Schema } = mongoose;

const noteSchema = new Schema(
  {
    noteId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    organizationId: { type: String, default: null, index: true },
    body: { type: String, required: true },
    pinned: { type: Boolean, default: false },
    createdBy: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('Note', noteSchema);
