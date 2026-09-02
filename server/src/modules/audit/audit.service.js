const { v4: uuidv4 } = require('uuid');
const Audit = require('./audit.model');

async function record({
  entityType,
  entityId,
  action,
  field = null,
  previousValue = null,
  newValue = null,
  changedBy = null,
  source = 'USER',
  reason = null,
  organizationId = null,
  correlationId = null,
}) {
  return Audit.create({
    auditId: `AUD-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`,
    organizationId,
    entityType,
    entityId,
    action,
    field,
    previousValue,
    newValue,
    changedBy,
    source,
    reason,
    correlationId,
  });
}

async function getForEntity(entityType, entityId, { limit = 50 } = {}) {
  return Audit.find({ entityType, entityId }).sort({ createdAt: -1 }).limit(Math.min(limit, 200));
}

async function getRecent({ limit = 50, organizationId = null } = {}) {
  const query = organizationId ? { organizationId } : {};
  return Audit.find(query).sort({ createdAt: -1 }).limit(Math.min(limit, 200));
}

module.exports = { record, getForEntity, getRecent };
