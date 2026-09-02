const followups = require('./followups.service');

async function create(req, res) {
  const followup = await followups.create({
    ...req.body,
    organizationId: req.user.organizationId,
    actorId: req.user.userId,
  });
  res.status(201).json({ success: true, data: followup });
}

async function list(req, res) {
  const items = await followups.list({
    customerId: req.query.customerId,
    status: req.query.status,
    organizationId: req.user.organizationId,
    limit: parseInt(req.query.limit, 10) || 50,
  });
  res.json({ success: true, items });
}

async function getById(req, res) {
  const followup = await followups.getById(req.params.id);
  res.json({ success: true, data: followup });
}

async function update(req, res) {
  const followup = await followups.update(req.params.id, req.body, req.user.userId);
  res.json({ success: true, data: followup });
}

async function remove(req, res) {
  await followups.remove(req.params.id, req.user.userId);
  res.json({ success: true });
}

module.exports = { create, list, getById, update, remove };
