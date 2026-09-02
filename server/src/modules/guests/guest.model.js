const mongoose = require('mongoose');
const { Schema } = mongoose;

const guestSchema = new Schema(
  {
    guestId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    bookingId: { type: String, default: null, index: true },
    organizationId: { type: String, default: null, index: true },
    name: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    side: { type: String, enum: ['BRIDE', 'GROOM', 'FAMILY', 'FRIEND', 'COLLEAGUE', 'OTHER'], default: 'OTHER' },
    group: { type: String, default: '' }, // optional grouping: "College Friends", "Office"
    rsvpStatus: { type: String, enum: ['PENDING', 'INVITED', 'ACCEPTED', 'DECLINED', 'TENTATIVE'], default: 'PENDING' },
    plusOnes: { type: Number, default: 0 },
    mealPreference: { type: String, default: '' }, // Veg / Non-Veg / Vegan / Jain
    notes: { type: String, default: '' },
    invitedAt: { type: Date, default: null },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

guestSchema.index({ customerId: 1, rsvpStatus: 1 });

module.exports = mongoose.model('Guest', guestSchema);
