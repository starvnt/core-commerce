const { v4: uuidv4 } = require('uuid');
const OutboxEvent = require('./outbox.model');

/**
 * Emit a domain event. Writes a persistent outbox record that the worker
 * will pick up. Always pass a deterministic eventId for idempotency when
 * the same operation may be retried.
 */
async function emit({ eventName, entityType, entityId, organizationId = null, payload = {}, metadata = {}, eventId = null }) {
  const id = eventId || `${eventName}:${entityId}:${Date.now()}:${uuidv4().slice(0, 8)}`;
  try {
    const event = await OutboxEvent.create({
      eventId: id,
      eventName,
      entityType,
      entityId,
      organizationId,
      payload,
      metadata,
    });
    return event;
  } catch (err) {
    // Duplicate eventId is fine — already persisted.
    if (err.code === 11000) return null;
    throw err;
  }
}

async function listPending(limit = 25) {
  return OutboxEvent.find({
    status: { $in: ['PENDING', 'FAILED'] },
    availableAt: { $lte: new Date() },
  })
    .sort({ createdAt: 1 })
    .limit(limit);
}

async function markProcessing(eventId) {
  return OutboxEvent.findOneAndUpdate(
    { eventId, status: 'PENDING' },
    { $set: { status: 'PROCESSING' }, $inc: { attempts: 1 } },
    { new: true },
  );
}

async function markProcessed(eventId) {
  return OutboxEvent.findOneAndUpdate(
    { eventId },
    { $set: { status: 'PROCESSED', processedAt: new Date(), lastError: null } },
    { new: true },
  );
}

async function markFailed(eventId, error) {
  const evt = await OutboxEvent.findOne({ eventId });
  if (!evt) return null;
  const failed = evt.attempts >= evt.maxAttempts;
  return OutboxEvent.findOneAndUpdate(
    { eventId },
    {
      $set: {
        status: failed ? 'FAILED' : 'PENDING',
        lastError: String(error?.message || error),
        // exponential backoff: 30s, 2m, 8m
        availableAt: failed ? evt.availableAt : new Date(Date.now() + Math.pow(4, evt.attempts) * 30 * 1000),
      },
    },
    { new: true },
  );
}

async function getStats() {
  const [pending, processing, processed, failed] = await Promise.all([
    OutboxEvent.countDocuments({ status: 'PENDING' }),
    OutboxEvent.countDocuments({ status: 'PROCESSING' }),
    OutboxEvent.countDocuments({ status: 'PROCESSED' }),
    OutboxEvent.countDocuments({ status: 'FAILED' }),
  ]);
  return { pending, processing, processed, failed };
}

module.exports = { emit, listPending, markProcessing, markProcessed, markFailed, getStats };
