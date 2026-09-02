const { v4: uuidv4 } = require('uuid');
const Quote = require('./quote.model');
const { HttpError } = require('../../middleware/errorHandler');
const outbox = require('../outbox/outbox.service');
const activity = require('../activity/activity.service');
const audit = require('../audit/audit.service');

const TRANSITIONS = {
  DRAFT: ['SENT', 'CANCELLED'],
  SENT: ['VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
  VIEWED: ['ACCEPTED', 'REJECTED', 'EXPIRED'],
  ACCEPTED: [],
  REJECTED: [],
  EXPIRED: [],
};

function newId() {
  return `QTE-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

function computeTotals(quote) {
  const subtotal = (quote.lineItems || []).reduce(
    (sum, li) => sum + (li.totalMinor || (li.quantity || 1) * (li.unitPriceMinor || 0)),
    0,
  );
  quote.subtotalMinor = subtotal;
  quote.totalMinor = Math.max(0, subtotal - (quote.discountMinor || 0) + (quote.taxMinor || 0));
}

async function create(data, actorId = null) {
  if (!data.title) throw new HttpError(400, 'Title is required', 'VALIDATION_ERROR');
  if (!data.customerId) throw new HttpError(400, 'customerId is required', 'VALIDATION_ERROR');
  if (!data.organizationId) throw new HttpError(400, 'organizationId is required', 'VALIDATION_ERROR');
  const quote = new Quote({
    quoteId: newId(),
    inquiryId: data.inquiryId || null,
    customerId: data.customerId,
    organizationId: data.organizationId,
    offeringId: data.offeringId || null,
    title: data.title,
    description: data.description || '',
    lineItems: data.lineItems || [],
    discountMinor: data.discountMinor || 0,
    taxMinor: data.taxMinor || 0,
    currency: data.currency || 'INR',
    validUntil: data.validUntil || null,
    terms: data.terms || '',
  });
  computeTotals(quote);
  await quote.save();
  await activity.log({
    entityType: 'QUOTE',
    entityId: quote.quoteId,
    actionType: 'QUOTE_CREATED',
    message: `Quote created: ${quote.title}`,
    source: 'USER',
    organizationId: quote.organizationId,
    createdBy: actorId,
    metadata: { totalMinor: quote.totalMinor, customerId: quote.customerId },
  });
  await audit.record({
    entityType: 'QUOTE',
    entityId: quote.quoteId,
    action: 'CREATE',
    changedBy: actorId,
    organizationId: quote.organizationId,
  });
  return quote;
}

async function list({ customerId = null, organizationId = null, status = null, limit = 50 } = {}) {
  const query = {};
  if (customerId) query.customerId = customerId;
  if (organizationId) query.organizationId = organizationId;
  if (status) query.status = status;
  return Quote.find(query).sort({ createdAt: -1 }).limit(Math.min(limit, 200));
}

async function getById(id) {
  const quote = await Quote.findOne({ quoteId: id });
  if (!quote) throw new HttpError(404, 'Quote not found');
  return quote;
}

async function update(id, updates, actorId = null) {
  const quote = await getById(id);
  if (quote.status !== 'DRAFT') {
    throw new HttpError(400, 'Only DRAFT quotes can be edited', 'INVALID_STATE');
  }
  const allowed = ['title', 'description', 'lineItems', 'discountMinor', 'taxMinor', 'validUntil', 'terms'];
  for (const key of allowed) {
    if (updates[key] !== undefined) quote[key] = updates[key];
  }
  computeTotals(quote);
  await quote.save();
  await audit.record({
    entityType: 'QUOTE',
    entityId: id,
    action: 'UPDATE',
    changedBy: actorId,
    organizationId: quote.organizationId,
  });
  return quote;
}

async function send(id, actorId = null) {
  const quote = await getById(id);
  if (quote.status !== 'DRAFT') {
    throw new HttpError(400, 'Only DRAFT quotes can be sent', 'INVALID_STATE');
  }
  quote.status = 'SENT';
  quote.sentAt = new Date();
  await quote.save();
  await activity.log({
    entityType: 'QUOTE',
    entityId: id,
    actionType: 'QUOTE_SENT',
    message: 'Quote sent to customer',
    source: 'USER',
    organizationId: quote.organizationId,
    createdBy: actorId,
  });
  await audit.record({
    entityType: 'QUOTE',
    entityId: id,
    action: 'STATUS_CHANGE',
    field: 'status',
    previousValue: { status: 'DRAFT' },
    newValue: { status: 'SENT' },
    changedBy: actorId,
    organizationId: quote.organizationId,
  });
  await outbox.emit({
    eventName: 'quote.sent',
    eventType: 'QUOTE',
    entityType: 'QUOTE',
    entityId: id,
    organizationId: quote.organizationId,
    payload: { customerId: quote.customerId, totalMinor: quote.totalMinor, title: quote.title },
  });
  return quote;
}

async function accept(id, idempotencyKey, actorId = null) {
  if (idempotencyKey) {
    const existing = await Quote.findOne({ idempotencyKey, status: 'ACCEPTED' });
    if (existing) {
      const existingBooking = await require('../bookings/booking.model').findOne({ idempotencyKey });
      return { quote: existing, booking: existingBooking };
    }
  }
  const quote = await getById(id);
  if (!['SENT', 'VIEWED'].includes(quote.status)) {
    throw new HttpError(400, 'Only SENT or VIEWED quotes can be accepted', 'INVALID_STATE');
  }
  const from = quote.status;
  quote.status = 'ACCEPTED';
  quote.acceptedAt = new Date();
  if (idempotencyKey) quote.idempotencyKey = idempotencyKey;
  await quote.save();
  await activity.log({
    entityType: 'QUOTE',
    entityId: id,
    actionType: 'QUOTE_ACCEPTED',
    message: 'Quote accepted',
    source: 'USER',
    organizationId: quote.organizationId,
    createdBy: actorId,
  });
  await audit.record({
    entityType: 'QUOTE',
    entityId: id,
    action: 'STATUS_CHANGE',
    field: 'status',
    previousValue: { status: from },
    newValue: { status: 'ACCEPTED' },
    changedBy: actorId,
    organizationId: quote.organizationId,
  });
  await outbox.emit({
    eventName: 'quote.accepted',
    eventType: 'QUOTE',
    entityType: 'QUOTE',
    entityId: id,
    organizationId: quote.organizationId,
    payload: { customerId: quote.customerId, totalMinor: quote.totalMinor, offeringId: quote.offeringId, title: quote.title },
  });

  // Auto-create booking from accepted quote (chained state machine)
  const bookings = require('../bookings/booking.service');
  let booking = null;
  try {
    booking = await bookings.createFromQuote({
      quoteId: quote.quoteId,
      idempotencyKey,
      actorId,
    });
  } catch (err) {
    console.error('[quotes.accept] Failed to create booking:', err.message);
  }

  return { quote, booking };
}

async function reject(id, reason, actorId = null) {
  const quote = await getById(id);
  if (!['SENT', 'VIEWED'].includes(quote.status)) {
    throw new HttpError(400, 'Only SENT or VIEWED quotes can be rejected', 'INVALID_STATE');
  }
  const from = quote.status;
  quote.status = 'REJECTED';
  quote.rejectedAt = new Date();
  await quote.save();
  await activity.log({
    entityType: 'QUOTE',
    entityId: id,
    actionType: 'QUOTE_REJECTED',
    message: `Quote rejected${reason ? `: ${reason}` : ''}`,
    source: 'USER',
    organizationId: quote.organizationId,
    createdBy: actorId,
  });
  await audit.record({
    entityType: 'QUOTE',
    entityId: id,
    action: 'STATUS_CHANGE',
    field: 'status',
    previousValue: { status: from },
    newValue: { status: 'REJECTED' },
    changedBy: actorId,
    organizationId: quote.organizationId,
  });
  return quote;
}

module.exports = { create, list, getById, update, send, accept, reject, TRANSITIONS };
