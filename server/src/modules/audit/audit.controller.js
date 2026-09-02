const audit = require('./audit.service');

async function forEntity(req, res) {
  const { entityType, entityId } = req.params;
  const items = await audit.getForEntity(entityType, entityId, { limit: req.query.limit });
  res.json({ success: true, items });
}

async function recent(req, res) {
  const items = await audit.getRecent({ limit: req.query.limit, organizationId: req.user.organizationId });
  res.json({ success: true, items });
}

async function query(req, res) {
  // Convenience: support GET /audit?entityType=...&entityId=...&organizationId=...
  const { entityType, entityId, organizationId, limit } = req.query;
  if (entityType && entityId) {
    const items = await audit.getForEntity(entityType, entityId, { limit });
    return res.json({ success: true, items });
  }
  const items = await audit.getRecent({
    limit,
    organizationId: organizationId || req.user.organizationId,
  });
  res.json({ success: true, items });
}

module.exports = { forEntity, recent, query };
