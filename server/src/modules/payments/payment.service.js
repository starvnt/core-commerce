const { v4: uuidv4 } = require('uuid');
const Payment = require('./payment.model');
const Booking = require('../bookings/booking.model');
const { HttpError } = require('../../middleware/errorHandler');
const outbox = require('../outbox/outbox.service');
const activity = require('../activity/activity.service');
const audit = require('../audit/audit.service');

function newId() {
  return `PAY-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

/**
 * Create a payment intent. Idempotent: same idempotencyKey returns existing.
 */
async function create({ bookingId, customerId, amountMinor, currency = 'INR', type = 'FULL', description = '', idempotencyKey = null, method = 'CARD', actorId = null }) {
  if (idempotencyKey) {
    const existing = await Payment.findOne({ idempotencyKey });
    if (existing) return existing;
  }
  if (!customerId) throw new HttpError(400, 'customerId required', 'VALIDATION_ERROR');
  if (!amountMinor || amountMinor <= 0) throw new HttpError(400, 'amountMinor must be > 0', 'VALIDATION_ERROR');

  // Lookup booking if provided
  let organizationId = null;
  if (bookingId) {
    const booking = await Booking.findOne({ bookingId });
    if (!booking) throw new HttpError(404, 'Booking not found');
    organizationId = booking.organizationId;
  }

  const payment = await Payment.create({
    paymentId: newId(),
    bookingId: bookingId || null,
    customerId,
    organizationId,
    amountMinor,
    currency,
    type,
    method,
    description,
    idempotencyKey,
    status: 'PENDING',
    provider: 'mock',
    providerReference: `mock_${uuidv4().slice(0, 8)}`,
  });
  await activity.log({
    entityType: 'PAYMENT',
    entityId: payment.paymentId,
    actionType: 'PAYMENT_INITIATED',
    message: `Payment initiated: ${amountMinor} ${currency}`,
    source: 'USER',
    organizationId,
    createdBy: actorId,
    metadata: { bookingId, amountMinor, type },
  });
  await outbox.emit({
    eventName: 'PAYMENT_INITIATED',
    entityType: 'PAYMENT',
    entityId: payment.paymentId,
    organizationId,
    payload: { bookingId, amountMinor, type },
  });
  return payment;
}

async function capture(id, actorId = null) {
  const payment = await Payment.findOne({ paymentId: id });
  if (!payment) throw new HttpError(404, 'Payment not found');
  if (payment.status !== 'PENDING') {
    throw new HttpError(400, 'Only PENDING payments can be captured', 'INVALID_STATE');
  }
  payment.status = 'CAPTURED';
  payment.capturedAt = new Date();
  await payment.save();
  if (payment.bookingId) {
    const booking = await Booking.findOne({ bookingId: payment.bookingId });
    if (booking) {
      booking.paidMinor = (booking.paidMinor || 0) + payment.amountMinor;
      await booking.save();
    }
  }
  await activity.log({
    entityType: 'PAYMENT',
    entityId: id,
    actionType: 'PAYMENT_CAPTURED',
    message: 'Payment captured',
    source: 'SYSTEM',
    organizationId: payment.organizationId,
    createdBy: actorId,
  });
  await audit.record({
    entityType: 'PAYMENT',
    entityId: id,
    action: 'STATUS_CHANGE',
    field: 'status',
    previousValue: { status: 'PENDING' },
    newValue: { status: 'CAPTURED' },
    changedBy: actorId,
    organizationId: payment.organizationId,
  });
  await outbox.emit({
    eventName: 'PAYMENT_CAPTURED',
    entityType: 'PAYMENT',
    entityId: id,
    organizationId: payment.organizationId,
    payload: { bookingId: payment.bookingId, amountMinor: payment.amountMinor },
  });
  return payment;
}

async function refund(id, amountMinor = null, actorId = null) {
  const payment = await Payment.findOne({ paymentId: id });
  if (!payment) throw new HttpError(404, 'Payment not found');
  if (payment.status !== 'CAPTURED') {
    throw new HttpError(400, 'Only CAPTURED payments can be refunded', 'INVALID_STATE');
  }
  const refundAmount = amountMinor || payment.amountMinor;
  payment.refundedAmountMinor = (payment.refundedAmountMinor || 0) + refundAmount;
  if (payment.refundedAmountMinor >= payment.amountMinor) {
    payment.status = 'REFUNDED';
  } else {
    payment.status = 'PARTIALLY_REFUNDED';
  }
  await payment.save();
  if (payment.bookingId) {
    const booking = await Booking.findOne({ bookingId: payment.bookingId });
    if (booking) {
      booking.paidMinor = Math.max(0, (booking.paidMinor || 0) - refundAmount);
      await booking.save();
    }
  }
  await activity.log({
    entityType: 'PAYMENT',
    entityId: id,
    actionType: 'PAYMENT_REFUNDED',
    message: `Refunded ${refundAmount} ${payment.currency}`,
    source: 'USER',
    organizationId: payment.organizationId,
    createdBy: actorId,
  });
  await audit.record({
    entityType: 'PAYMENT',
    entityId: id,
    action: 'REFUND',
    changedBy: actorId,
    organizationId: payment.organizationId,
  });
  await outbox.emit({
    eventName: 'PAYMENT_REFUNDED',
    entityType: 'PAYMENT',
    entityId: id,
    organizationId: payment.organizationId,
    payload: { amountMinor: refundAmount },
  });
  return payment;
}

async function list({ customerId = null, bookingId = null, organizationId = null, status = null, limit = 50 } = {}) {
  const query = {};
  if (customerId) query.customerId = customerId;
  if (bookingId) query.bookingId = bookingId;
  if (organizationId) query.organizationId = organizationId;
  if (status) query.status = status;
  return Payment.find(query).sort({ createdAt: -1 }).limit(Math.min(limit, 200));
}

async function getById(id) {
  const payment = await Payment.findOne({ paymentId: id });
  if (!payment) throw new HttpError(404, 'Payment not found');
  return payment;
}

module.exports = { create, capture, refund, list, getById };
