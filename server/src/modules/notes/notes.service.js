const { v4: uuidv4 } = require('uuid');
const Note = require('./note.model');
const { HttpError } = require('../../middleware/errorHandler');
const activity = require('../activity/activity.service');
const audit = require('../audit/audit.service');

function newId() {
  return `NOTE-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

async function create({ customerId, body, pinned = false, organizationId = null, actorId = null }) {
  if (!customerId) throw new HttpError(400, 'customerId required', 'VALIDATION_ERROR');
  if (!body) throw new HttpError(400, 'body required', 'VALIDATION_ERROR');
  const note = await Note.create({
    noteId: newId(),
    customerId,
    body,
    pinned,
    organizationId,
    createdBy: actorId,
  });
  await activity.log({
    entityType: 'NOTE',
    entityId: note.noteId,
    actionType: 'NOTE_CREATED',
    message: 'Note added',
    source: 'USER',
    organizationId,
    createdBy: actorId,
    metadata: { customerId, pinned },
  });
  return note;
}

async function list({ customerId, limit = 50 }) {
  return Note.find({ customerId }).sort({ pinned: -1, createdAt: -1 }).limit(Math.min(limit, 200));
}

async function update(id, updates, actorId = null) {
  const note = await Note.findOne({ noteId: id });
  if (!note) throw new HttpError(404, 'Note not found');
  if (updates.body !== undefined) note.body = updates.body;
  if (updates.pinned !== undefined) note.pinned = updates.pinned;
  await note.save();
  await audit.record({
    entityType: 'NOTE', entityId: id, action: 'UPDATE', changedBy: actorId, organizationId: note.organizationId,
  });
  return note;
}

async function remove(id, actorId = null) {
  const note = await Note.findOne({ noteId: id });
  if (!note) throw new HttpError(404, 'Note not found');
  await note.deleteOne();
  await audit.record({
    entityType: 'NOTE', entityId: id, action: 'DELETE', changedBy: actorId, organizationId: note.organizationId,
  });
}

module.exports = { create, list, update, remove };
