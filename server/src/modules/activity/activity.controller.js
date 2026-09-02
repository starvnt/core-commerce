const activity = require('./activity.service');

async function timeline(req, res) {
  const { entityType, entityId } = req.params;
  const limit = parseInt(req.query.limit, 10) || 50;
  const items = await activity.getTimeline(entityType, entityId, { limit });
  res.json({ success: true, items });
}

async function recent(req, res) {
  const limit = parseInt(req.query.limit, 10) || 50;
  const items = await activity.getRecentForOrg(req.user.organizationId, { limit });
  res.json({ success: true, items });
}

module.exports = { timeline, recent };
