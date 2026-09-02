const outbox = require('./outbox.service');

async function listPending(req, res) {
  const items = await outbox.listPending({ limit: Number(req.query.limit) || 50 });
  res.json({ success: true, data: items });
}

async function get(req, res) {
  const Outbox = require('./outbox.model');
  const item = await Outbox.findOne({ eventId: req.params.eventId });
  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
  res.json({ success: true, data: item });
}

async function retry(req, res) {
  const Outbox = require('./outbox.model');
  const item = await Outbox.findOneAndUpdate(
    { eventId: req.params.eventId },
    { $set: { status: 'PENDING', availableAt: new Date() } },
    { new: true },
  );
  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
  res.json({ success: true, data: item });
}

async function stats(req, res) {
  const Outbox = require('./outbox.model');
  const byStatus = await Outbox.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const counts = byStatus.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {});
  res.json({ success: true, data: counts });
}

module.exports = { listPending, get, retry, stats };
