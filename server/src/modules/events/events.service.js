const { v4: uuidv4 } = require('uuid');
const Event = require('./events.model');
const { HttpError } = require('../../middleware/errorHandler');
const audit = require('../audit/audit.service');
const outbox = require('../outbox/outbox.service');

const VALID_TRANSITIONS = {
  PLANNING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

function newEventId() {
  return `EVT-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

async function create({ customerId, organizationId = null, name, eventType = '', eventDate = null, venue = '', city = '', guestCount = 0, status = 'PLANNING', coverImageUrl = '', description = '', budgetMinor = 0, currency = 'INR', isPublic = false, actorId = null }) {
  if (!customerId) throw new HttpError(400, 'customerId required', 'VALIDATION_ERROR');
  if (!name) throw new HttpError(400, 'name required', 'VALIDATION_ERROR');
  const ev = await Event.create({
    eventId: newEventId(),
    customerId, organizationId,
    name, eventType, eventDate, venue, city, guestCount, status,
    coverImageUrl, description, budgetMinor, currency, isPublic,
  });
  await outbox.emit({
    eventName: 'event.created',
    eventType: 'EVENT',
    entityType: 'EVENT',
    entityId: ev.eventId,
    organizationId,
    payload: { customerId, name, eventType, eventDate },
  });
  await audit.record({
    entityType: 'EVENT', entityId: ev.eventId, action: 'CREATE',
    changedBy: actorId, organizationId,
  });
  return ev;
}

async function list({ customerId = null, status = null, publicOnly = false } = {}) {
  const q = {};
  if (customerId) q.customerId = customerId;
  if (status) q.status = status;
  if (publicOnly) q.isPublic = true;
  return Event.find(q).sort({ eventDate: 1 });
}

async function get(id) {
  const ev = await Event.findOne({ eventId: id });
  if (!ev) throw new HttpError(404, 'Event not found');
  return ev;
}

async function update(id, updates, actorId = null) {
  const ev = await get(id);
  const allowed = ['name', 'eventType', 'eventDate', 'venue', 'city', 'guestCount', 'coverImageUrl', 'description', 'budgetMinor', 'currency', 'isPublic'];
  for (const k of allowed) if (updates[k] !== undefined) ev[k] = updates[k];
  await ev.save();
  await audit.record({
    entityType: 'EVENT', entityId: id, action: 'UPDATE',
    changedBy: actorId, organizationId: ev.organizationId,
  });
  return ev;
}

async function setStatus(id, status, actorId = null) {
  const ev = await get(id);
  const allowed = VALID_TRANSITIONS[ev.status] || [];
  if (!allowed.includes(status)) {
    throw new HttpError(400, `Cannot transition event from ${ev.status} to ${status}`, 'INVALID_TRANSITION');
  }
  const prev = ev.status;
  ev.status = status;
  await ev.save();
  await outbox.emit({
    eventName: 'event.status_changed',
    eventType: 'EVENT',
    entityType: 'EVENT',
    entityId: ev.eventId,
    organizationId: ev.organizationId,
    payload: { from: prev, to: status, customerId: ev.customerId },
  });
  await audit.record({
    entityType: 'EVENT', entityId: id, action: 'STATUS_CHANGE',
    changedBy: actorId, organizationId: ev.organizationId,
    previousValue: prev, newValue: status,
  });
  return ev;
}

async function remove(id, actorId = null) {
  const ev = await get(id);
  await Event.deleteOne({ eventId: id });
  await audit.record({
    entityType: 'EVENT', entityId: id, action: 'DELETE',
    changedBy: actorId, organizationId: ev.organizationId,
  });
  return { ok: true };
}

module.exports = {
  create, list, get, update, setStatus, remove,
  VALID_TRANSITIONS,
};
