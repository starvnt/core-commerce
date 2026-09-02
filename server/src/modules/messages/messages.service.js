const { v4: uuidv4 } = require('uuid');
const Message = require('./message.model');
const { HttpError } = require('../../middleware/errorHandler');
const outbox = require('../outbox/outbox.service');

function newMessageId() {
  return `MSG-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

async function send({ threadId, threadType = 'CUSTOMER', senderType, senderId = null, body, organizationId = null, attachments = [] }) {
  if (!threadId) throw new HttpError(400, 'threadId required', 'VALIDATION_ERROR');
  if (!body || !body.trim()) throw new HttpError(400, 'body required', 'VALIDATION_ERROR');
  if (!senderType) throw new HttpError(400, 'senderType required', 'VALIDATION_ERROR');
  const msg = await Message.create({
    messageId: newMessageId(),
    threadId,
    threadType,
    senderType,
    senderId,
    body: body.trim(),
    attachments,
    organizationId,
  });
  // Emit domain event
  await outbox.emit({
    eventName: 'message.sent',
    eventType: 'MESSAGE',
    entityType: 'MESSAGE',
    entityId: msg.messageId,
    organizationId,
    payload: { threadId, threadType, senderType, body: msg.body },
  });
  return msg;
}

async function listThread(threadId, { limit = 50, before = null } = {}) {
  const q = { threadId };
  if (before) q.createdAt = { $lt: new Date(before) };
  const items = await Message.find(q).sort({ createdAt: -1 }).limit(limit);
  return items.reverse();
}

async function markRead(threadId, readerId) {
  if (!readerId) throw new HttpError(400, 'readerId required', 'VALIDATION_ERROR');
  await Message.updateMany(
    { threadId, readBy: { $ne: readerId } },
    { $addToSet: { readBy: readerId } },
  );
  return { ok: true };
}

async function listThreadsForCustomer(customerId, { limit = 20 } = {}) {
  // Group distinct threadIds where customer was involved
  const items = await Message.aggregate([
    { $match: { $or: [{ threadId: customerId }, { threadType: 'CUSTOMER', threadId: customerId }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$threadId',
        lastMessage: { $first: '$$ROOT' },
      },
    },
    { $limit: limit },
  ]);
  return items.map((t) => ({
    threadId: t._id,
    lastMessage: t.lastMessage,
  }));
}

module.exports = { send, listThread, markRead, listThreadsForCustomer };
