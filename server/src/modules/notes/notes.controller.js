const notes = require('./notes.service');

async function create(req, res) {
  const note = await notes.create({ ...req.body, organizationId: req.body.organizationId || req.user.organizationId, actorId: req.user.userId });
  res.status(201).json({ success: true, data: note });
}

async function list(req, res) {
  const items = await notes.list({ customerId: req.query.customerId, limit: parseInt(req.query.limit, 10) || 50 });
  res.json({ success: true, items });
}

async function update(req, res) {
  const note = await notes.update(req.params.id, req.body, req.user.userId);
  res.json({ success: true, data: note });
}

async function remove(req, res) {
  await notes.remove(req.params.id, req.user.userId);
  res.json({ success: true });
}

module.exports = { create, list, update, remove };
