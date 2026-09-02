const { v4: uuidv4 } = require('uuid');
const TimelineItem = require('./timeline.model');
const { HttpError } = require('../../middleware/errorHandler');

const STATUS_TRANSITIONS = {
  PLANNED: ['IN_PROGRESS', 'SKIPPED'],
  IN_PROGRESS: ['DONE', 'SKIPPED'],
  DONE: [],
  SKIPPED: ['PLANNED'],
};

function newTimelineId() {
  return `TLM-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

async function create({ customerId, bookingId = null, organizationId = null, title, description = '', startTime, endTime = null, location = '', category = 'OTHER', responsible = '', order = 0, notes = '' }) {
  if (!customerId) throw new HttpError(400, 'customerId required', 'VALIDATION_ERROR');
  if (!title) throw new HttpError(400, 'title required', 'VALIDATION_ERROR');
  if (!startTime) throw new HttpError(400, 'startTime required', 'VALIDATION_ERROR');
  const item = await TimelineItem.create({
    timelineId: newTimelineId(),
    customerId, bookingId, organizationId,
    title, description, startTime, endTime, location, category, responsible, order, notes,
  });
  return item;
}

async function list({ customerId, bookingId = null }) {
  const q = {};
  if (customerId) q.customerId = customerId;
  if (bookingId) q.bookingId = bookingId;
  return TimelineItem.find(q).sort({ startTime: 1, order: 1 });
}

async function get(id) {
  const t = await TimelineItem.findOne({ timelineId: id });
  if (!t) throw new HttpError(404, 'Timeline item not found');
  return t;
}

async function update(id, updates) {
  const t = await get(id);
  const allowed = ['title', 'description', 'startTime', 'endTime', 'location', 'category', 'responsible', 'order', 'notes'];
  for (const k of allowed) if (updates[k] !== undefined) t[k] = updates[k];
  await t.save();
  return t;
}

async function setStatus(id, status) {
  const t = await get(id);
  const allowed = STATUS_TRANSITIONS[t.status] || [];
  if (!allowed.includes(status)) {
    throw new HttpError(400, `Cannot transition from ${t.status} to ${status}`, 'INVALID_TRANSITION');
  }
  t.status = status;
  await t.save();
  return t;
}

async function remove(id) {
  await get(id);
  await TimelineItem.deleteOne({ timelineId: id });
  return { ok: true };
}

module.exports = {
  create, list, get, update, setStatus, remove,
  STATUS_TRANSITIONS,
};
