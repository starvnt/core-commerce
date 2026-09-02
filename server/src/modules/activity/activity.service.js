const { v4: uuidv4 } = require('uuid');
const Activity = require('./activity.model');

async function log({
  entityType,
  entityId,
  actionType,
  message,
  source = 'USER',
  organizationId = null,
  metadata = {},
  createdBy = null,
  activityId = null,
}) {
  const id = activityId || `ACT-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
  try {
    return await Activity.create({
      activityId: id,
      entityType,
      entityId,
      actionType,
      message,
      source,
      organizationId,
      metadata,
      createdBy,
    });
  } catch (err) {
    if (err.code === 11000) return null; // duplicate, skip
    throw err;
  }
}

async function getTimeline(entityType, entityId, { limit = 50 } = {}) {
  return Activity.find({ entityType, entityId })
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 200));
}

async function getRecentForOrg(organizationId, { limit = 50 } = {}) {
  return Activity.find({ organizationId })
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 200));
}

module.exports = { log, getTimeline, getRecentForOrg };
