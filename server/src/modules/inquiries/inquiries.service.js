const { v4: uuidv4 } = require('uuid');
const Inquiry = require('./inquiry.model');
const { HttpError } = require('../../middleware/errorHandler');
const outbox = require('../outbox/outbox.service');
const activity = require('../activity/activity.service');
const audit = require('../audit/audit.service');

const TRANSITIONS = {
  OPEN: ['RESPONDED', 'CLOSED', 'CANCELLED'],
  RESPONDED: ['CLOSED', 'CANCELLED'],
  CLOSED: [],
  CANCELLED: [],
};

function newId() {
  return `INQ-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

async function create(data, actorId = null) {
  if (!data.title) throw new HttpError(400, 'Title is required', 'VALIDATION_ERROR');
  if (!data.customerId) throw new HttpError(400, 'customerId is required', 'VALIDATION_ERROR');
  const inquiry = await Inquiry.create({
    inquiryId: newId(),
    customerId: data.customerId,
    organizationId: data.organizationId || null,
    offeringId: data.offeringId || null,
    title: data.title,
    message: data.message || '',
    eventType: data.eventType || '',
    eventDate: data.eventDate || null,
    guestCount: data.guestCount || null,
    city: data.city || '',
    budgetMinor: data.budgetMinor || null,
    currency: data.currency || 'INR',
  });
  await activity.log({
    entityType: 'INQUIRY',
    entityId: inquiry.inquiryId,
    actionType: 'INQUIRY_CREATED',
    message: `Inquiry: ${inquiry.title}`,
    source: 'USER',
    organizationId: inquiry.organizationId,
    createdBy: actorId,
    metadata: { customerId: inquiry.customerId, offeringId: inquiry.offeringId },
  });
  await audit.record({
    entityType: 'INQUIRY',
    entityId: inquiry.inquiryId,
    action: 'CREATE',
    changedBy: actorId,
    organizationId: inquiry.organizationId,
  });
  await outbox.emit({
    eventName: 'INQUIRY_CREATED',
    entityType: 'INQUIRY',
    entityId: inquiry.inquiryId,
    organizationId: inquiry.organizationId,
    payload: { title: inquiry.title, customerId: inquiry.customerId, offeringId: inquiry.offeringId },
  });
  return inquiry;
}

async function list({ customerId = null, status = null, organizationId = null, limit = 50 } = {}) {
  const query = {};
  if (customerId) query.customerId = customerId;
  if (status) query.status = status;
  if (organizationId) query.organizationId = organizationId;
  return Inquiry.find(query).sort({ createdAt: -1 }).limit(Math.min(limit, 200));
}

async function getById(id) {
  const inquiry = await Inquiry.findOne({ inquiryId: id });
  if (!inquiry) throw new HttpError(404, 'Inquiry not found');
  return inquiry;
}

async function update(id, updates, actorId = null) {
  const inquiry = await getById(id);
  const allowed = ['title', 'message', 'eventType', 'eventDate', 'guestCount', 'city', 'budgetMinor'];
  for (const key of allowed) {
    if (updates[key] !== undefined) inquiry[key] = updates[key];
  }
  await inquiry.save();
  await audit.record({
    entityType: 'INQUIRY',
    entityId: id,
    action: 'UPDATE',
    changedBy: actorId,
    organizationId: inquiry.organizationId,
  });
  return inquiry;
}

async function respond(id, response, actorId = null) {
  const inquiry = await getById(id);
  if (!['OPEN', 'RESPONDED'].includes(inquiry.status)) {
    throw new HttpError(400, 'Inquiry cannot be responded to in current state', 'INVALID_STATE');
  }
  const from = inquiry.status;
  inquiry.status = 'RESPONDED';
  inquiry.response = response;
  inquiry.respondedAt = new Date();
  await inquiry.save();
  await activity.log({
    entityType: 'INQUIRY',
    entityId: id,
    actionType: 'INQUIRY_RESPONDED',
    message: 'Inquiry responded to',
    source: 'USER',
    organizationId: inquiry.organizationId,
    createdBy: actorId,
  });
  await audit.record({
    entityType: 'INQUIRY',
    entityId: id,
    action: 'STATUS_CHANGE',
    field: 'status',
    previousValue: { status: from },
    newValue: { status: 'RESPONDED' },
    changedBy: actorId,
    organizationId: inquiry.organizationId,
  });
  return inquiry;
}

async function transition(id, newStatus, actorId = null) {
  const inquiry = await getById(id);
  const allowed = TRANSITIONS[inquiry.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new HttpError(400, `Invalid transition from ${inquiry.status} to ${newStatus}`, 'INVALID_STATE');
  }
  const from = inquiry.status;
  inquiry.status = newStatus;
  if (newStatus === 'CLOSED' || newStatus === 'CANCELLED') inquiry.closedAt = new Date();
  await inquiry.save();
  await audit.record({
    entityType: 'INQUIRY',
    entityId: id,
    action: 'STATUS_CHANGE',
    field: 'status',
    previousValue: { status: from },
    newValue: { status: newStatus },
    changedBy: actorId,
    organizationId: inquiry.organizationId,
  });
  return inquiry;
}

module.exports = { create, list, getById, update, respond, transition, TRANSITIONS };
