const svc = require('./notifications.service');

async function list(req, res) {
  const items = await svc.list({
    userId: req.user.userId,
    unreadOnly: req.query.unread === 'true',
    limit: req.query.limit ? Number(req.query.limit) : 50,
  });
  res.json({ success: true, data: items });
}

async function markRead(req, res) {
  const n = await svc.markRead(req.params.id, req.user.userId);
  res.json({ success: true, data: n });
}

async function markAll(req, res) {
  const r = await svc.markAllRead(req.user.userId);
  res.json({ success: true, data: { modified: r.modifiedCount } });
}

async function unread(req, res) {
  const count = await svc.unreadCount(req.user.userId);
  res.json({ success: true, data: { count } });
}

module.exports = { list, markRead, markAll, unread };
