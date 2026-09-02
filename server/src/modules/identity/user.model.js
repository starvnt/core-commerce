const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    role: {
      type: String,
      enum: ['CUSTOMER', 'PARTNER_OWNER', 'PARTNER_STAFF', 'ADMIN', 'SUPER_ADMIN'],
      default: 'CUSTOMER',
      index: true,
    },
    organizationId: { type: String, default: null, index: true },
    // For CUSTOMER role, optionally link to a customer profile.
    customerId: { type: String, default: null, index: true },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('User', userSchema);
