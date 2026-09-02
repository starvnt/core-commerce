const { v4: uuidv4 } = require('uuid');
const FollowUp = require('./followup.model');
const { HttpError } = require('../../middleware/errorHandler');
const outbox = require('../outbox/outbox.service');
const activity = require('../activity/activity.service');
const audit = require('../audit/audit.service');

function newId() {
  return `FU-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

async function create({
  customerId,
  title,
  description = '',
  scheduledAt,
  priority = 'MEDIUM',
  assignedTo = null,
  organizationId = null,
  actorId = null,
}) {
  const followup = await FollowUp.create({
    followupId: newId(),
    customerId,
    organizationId,
    title,
    description,
    scheduledAt,
    priority,
    assignedTo,
  });
  await activity.log({
    entityType: 'FOLLOW_UP',
    entityId: followup.followupId,
    actionType: 'FOLLOW_UP_CREATED',
    message: `Follow-up scheduled: ${title}`,
    source: actorId ? 'USER' : 'SYSTEM',
    organizationId,
    createdBy: actorId,
    metadata: { customerId, scheduledAt },
  });
  await audit.record({
    entityType: 'FOLLOW_UP',
    entityId: followup.followupId,
    action: 'CREATE',
    newValue: { title, scheduledAt, status: 'PENDING' },
    changedBy: actorId,
    organizationId,
  });
  await outbox.emit({
    eventName: 'FOLLOW_UP_CREATED',
    entityType: 'FOLLOW_UP',
    entityId: followup.followupId,
    organizationId,
    payload: { customerId, title, scheduledAt },
  });
  return followup;
}

async function list({ customerId = null, status = null, organizationId = null, limit = 50 } = {}) {
  const query = {};
  if (customerId) query.customerId = customerId;
  if (status) query.status = status;
  if (organizationId) query.organizationId = organizationId;
  return FollowUp.find(query).sort({ scheduledAt: 1 }).limit(Math.min(limit, 200));
}

async function getById(id) {
  const fu = await FollowUp.findOne({ followupId: id });
  if (!fu) throw new HttpError(404, 'Follow-up not found');
  return fu;
}

async function update(id, updates, actorId = null) {
  const fu = await getById(id);
  const previous = { status: fu.status, scheduledAt: fu.scheduledAt };
  const allowed = ['title', 'description', 'scheduledAt', 'priority', 'assignedTo', 'notes'];
  for (const key of allowed) {
    if (updates[key] !== undefined) fu[key] = updates[key];
  }
  if (updates.status) fu.status = updates.status;
  if (updates.status === 'COMPLETED') fu.completedAt = new Date();
  await fu.save();
  await audit.record({
    entityType: 'FOLLOW_UP',
    entityId: id,
    action: 'UPDATE',
    field: updates.status ? 'status' : null,
    previousValue: previous,
    newValue: { status: fu.status, scheduledAt: fu.scheduledAt },
    changedBy: actorId,
    organizationId: fu.organizationId,
  });
  return fu;
}

async function markOverdue(id) {
  const fu = await getById(id);
  if (fu.status !== 'PENDING') return fu;
  fu.status = 'OVERDUE';
  await fu.save();
  await activity.log({
    entityType: 'FOLLOW_UP',
    entityId: id,
    actionType: 'FOLLOW_UP_OVERDUE',
    message: 'Follow-up marked overdue',
    source: 'AUTOMATION',
    organizationId: fu.organizationId,
    metadata: { customerId: fu.customerId, title: fu.title },
  });
  return fu;
}

async function remove(id, actorId = null) {
  const fu = await getById(id);
  await fu.deleteOne();
  await audit.record({
    entityType: 'FOLLOW_UP',
    entityId: id,
    action: 'DELETE',
    changedBy: actorId,
    organizationId: fu.organizationId,
  });
}

module.exports = { create, list, getById, update, markOverdue, remove };
