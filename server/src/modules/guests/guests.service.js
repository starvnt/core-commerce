const { v4: uuidv4 } = require('uuid');
const Guest = require('./guest.model');
const { HttpError } = require('../../middleware/errorHandler');

const VALID_TRANSITIONS = {
  PENDING: ['INVITED'],
  INVITED: ['ACCEPTED', 'DECLINED', 'TENTATIVE'],
  ACCEPTED: ['DECLINED', 'TENTATIVE'],
  DECLINED: ['INVITED', 'ACCEPTED'],
  TENTATIVE: ['ACCEPTED', 'DECLINED'],
};

function newGuestId() {
  return `GST-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

async function create({ customerId, bookingId = null, organizationId = null, name, email = '', phone = '', side = 'OTHER', group = '', plusOnes = 0, mealPreference = '', notes = '' }) {
  if (!customerId) throw new HttpError(400, 'customerId required', 'VALIDATION_ERROR');
  if (!name) throw new HttpError(400, 'name required', 'VALIDATION_ERROR');
  const g = await Guest.create({
    guestId: newGuestId(),
    customerId, bookingId, organizationId,
    name, email, phone, side, group, plusOnes, mealPreference, notes,
  });
  return g;
}

async function bulkCreate({ customerId, bookingId = null, organizationId = null, guests }) {
  if (!Array.isArray(guests) || !guests.length) {
    throw new HttpError(400, 'guests array required', 'VALIDATION_ERROR');
  }
  const docs = guests.map((g) => ({
    guestId: newGuestId(),
    customerId,
    bookingId,
    organizationId,
    name: g.name,
    email: g.email || '',
    phone: g.phone || '',
    side: g.side || 'OTHER',
    group: g.group || '',
    plusOnes: g.plusOnes || 0,
    mealPreference: g.mealPreference || '',
    notes: g.notes || '',
  }));
  const inserted = await Guest.insertMany(docs);
  return inserted;
}

async function list({ customerId, bookingId = null, rsvpStatus = null } = {}) {
  const q = {};
  if (customerId) q.customerId = customerId;
  if (bookingId) q.bookingId = bookingId;
  if (rsvpStatus) q.rsvpStatus = rsvpStatus;
  return Guest.find(q).sort({ createdAt: 1 });
}

async function get(id) {
  const g = await Guest.findOne({ guestId: id });
  if (!g) throw new HttpError(404, 'Guest not found');
  return g;
}

async function update(id, updates) {
  const g = await get(id);
  const allowed = ['name', 'email', 'phone', 'side', 'group', 'plusOnes', 'mealPreference', 'notes'];
  for (const k of allowed) {
    if (updates[k] !== undefined) g[k] = updates[k];
  }
  await g.save();
  return g;
}

async function setRsvp(id, rsvpStatus) {
  const g = await get(id);
  const allowed = VALID_TRANSITIONS[g.rsvpStatus] || [];
  if (!allowed.includes(rsvpStatus)) {
    throw new HttpError(400, `Cannot transition RSVP from ${g.rsvpStatus} to ${rsvpStatus}`, 'INVALID_TRANSITION');
  }
  g.rsvpStatus = rsvpStatus;
  g.respondedAt = new Date();
  if (rsvpStatus === 'INVITED') g.invitedAt = new Date();
  await g.save();
  return g;
}

async function remove(id) {
  await get(id);
  await Guest.deleteOne({ guestId: id });
  return { ok: true };
}

async function summary(customerId) {
  const all = await Guest.find({ customerId });
  const total = all.length;
  const counts = { PENDING: 0, INVITED: 0, ACCEPTED: 0, DECLINED: 0, TENTATIVE: 0 };
  let plusOnes = 0;
  for (const g of all) {
    counts[g.rsvpStatus] = (counts[g.rsvpStatus] || 0) + 1;
    if (g.rsvpStatus === 'ACCEPTED' || g.rsvpStatus === 'TENTATIVE') {
      plusOnes += (g.plusOnes || 0);
    }
  }
  const confirmedHeads = (counts.ACCEPTED || 0) + plusOnes;
  return { total, counts, plusOnes, confirmedHeads };
}

module.exports = {
  create, bulkCreate, list, get, update, setRsvp, remove, summary,
  VALID_TRANSITIONS,
};
