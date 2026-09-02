const { v4: uuidv4 } = require('uuid');
const Booking = require('./booking.model');
const Quote = require('../quotes/quote.model');
const { HttpError } = require('../../middleware/errorHandler');
const outbox = require('../outbox/outbox.service');
const activity = require('../activity/activity.service');
const audit = require('../audit/audit.service');

const TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED', 'FAILED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  FAILED: ['CANCELLED'],
};

function newId() {
  return `BKG-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

/**
 * Create a booking from an accepted quote (or directly).
 * Idempotent: same idempotencyKey returns the same booking.
 */
async function createFromQuote({ quoteId, eventDate, startTime, endTime, venue, city, guestCount, notes, idempotencyKey = null, actorId = null }) {
  if (idempotencyKey) {
    const existing = await Booking.findOne({ idempotencyKey });
    if (existing) return existing;
  }
  const quote = await Quote.findOne({ quoteId });
  if (!quote) throw new HttpError(404, 'Quote not found');
  if (quote.status !== 'ACCEPTED') {
    throw new HttpError(400, 'Quote must be ACCEPTED to create a booking', 'INVALID_STATE');
  }
  const booking = await Booking.create({
    bookingId: newId(),
    quoteId: quote.quoteId,
    customerId: quote.customerId,
    organizationId: quote.organizationId,
    offeringId: quote.offeringId,
    title: quote.title,
    eventDate: eventDate || null,
    startTime: startTime || '',
    endTime: endTime || '',
    venue: venue || '',
    city: city || '',
    guestCount: guestCount || null,
    totalMinor: quote.totalMinor,
    paidMinor: 0,
    currency: quote.currency,
    notes: notes || '',
    idempotencyKey,
  });
  await activity.log({
    entityType: 'BOOKING',
    entityId: booking.bookingId,
    actionType: 'BOOKING_CREATED',
    message: `Booking created: ${booking.title}`,
    source: 'USER',
    organizationId: booking.organizationId,
    createdBy: actorId,
    metadata: { totalMinor: booking.totalMinor, customerId: booking.customerId, quoteId: quote.quoteId },
  });
  await audit.record({
    entityType: 'BOOKING',
    entityId: booking.bookingId,
    action: 'CREATE',
    changedBy: actorId,
    organizationId: booking.organizationId,
  });
  await outbox.emit({
    eventName: 'booking.created',
    eventType: 'BOOKING',
    entityType: 'BOOKING',
    entityId: booking.bookingId,
    organizationId: booking.organizationId,
    payload: { customerId: booking.customerId, totalMinor: booking.totalMinor, title: booking.title },
  });
  return booking;
}

async function list({ customerId = null, organizationId = null, status = null, limit = 50 } = {}) {
  const query = {};
  if (customerId) query.customerId = customerId;
  if (organizationId) query.organizationId = organizationId;
  if (status) query.status = status;
  return Booking.find(query).sort({ eventDate: 1, createdAt: -1 }).limit(Math.min(limit, 200));
}

async function getById(id) {
  const booking = await Booking.findOne({ bookingId: id });
  if (!booking) throw new HttpError(404, 'Booking not found');
  return booking;
}

async function transition(id, newStatus, actorId = null) {
  const booking = await getById(id);
  const allowed = TRANSITIONS[booking.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new HttpError(400, `Invalid booking transition from ${booking.status} to ${newStatus}`, 'INVALID_STATE');
  }
  const from = booking.status;
  booking.status = newStatus;
  if (newStatus === 'CONFIRMED') booking.confirmedAt = new Date();
  if (newStatus === 'IN_PROGRESS') booking.startedAt = new Date();
  if (newStatus === 'COMPLETED') booking.completedAt = new Date();
  if (newStatus === 'CANCELLED') booking.cancelledAt = new Date();
  await booking.save();
  await activity.log({
    entityType: 'BOOKING',
    entityId: id,
    actionType: `BOOKING_${newStatus}`,
    message: `Booking ${newStatus.toLowerCase()}`,
    source: 'USER',
    organizationId: booking.organizationId,
    createdBy: actorId,
  });
  await audit.record({
    entityType: 'BOOKING',
    entityId: id,
    action: 'STATUS_CHANGE',
    field: 'status',
    previousValue: { status: from },
    newValue: { status: newStatus },
    changedBy: actorId,
    organizationId: booking.organizationId,
  });
  await outbox.emit({
    eventName: `booking.${newStatus.toLowerCase()}`,
    eventType: 'BOOKING',
    entityType: 'BOOKING',
    entityId: id,
    organizationId: booking.organizationId,
    payload: { from, to: newStatus, customerId: booking.customerId, totalMinor: booking.totalMinor },
  });
  return booking;
}

async function recordPayment(bookingId, amountMinor) {
  const booking = await getById(bookingId);
  booking.paidMinor = (booking.paidMinor || 0) + amountMinor;
  await booking.save();
  return booking;
}

module.exports = { createFromQuote, list, getById, transition, recordPayment, TRANSITIONS };
