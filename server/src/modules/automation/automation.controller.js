const { getRecentLogs, getStats } = require('./automation.engine');
const outbox = require('../outbox/outbox.service');
const { getRules } = require('./automation.rules');

async function listRules(_req, res) {
  res.json({ success: true, data: getRules() });
}

async function listLogs(req, res) {
  const limit = parseInt(req.query.limit, 10) || 50;
  const items = await getRecentLogs({ limit });
  res.json({ success: true, data: items });
}

async function stats(_req, res) {
  const [logs, outboxStats] = await Promise.all([getStats(), outbox.getStats()]);
  res.json({ success: true, data: { logs, outbox: outboxStats } });
}

module.exports = { listRules, listLogs, stats };
