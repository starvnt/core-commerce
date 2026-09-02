const tasks = require('./tasks.service');

async function create(req, res) {
  const task = await tasks.create({ ...req.body, organizationId: req.body.organizationId || req.user.organizationId }, req.user.userId);
  res.status(201).json({ success: true, data: task });
}

async function list(req, res) {
  const items = await tasks.list({
    customerId: req.query.customerId,
    status: req.query.status,
    organizationId: req.query.organizationId,
    limit: parseInt(req.query.limit, 10) || 50,
  });
  res.json({ success: true, items });
}

async function getById(req, res) {
  const task = await tasks.getById(req.params.id);
  res.json({ success: true, data: task });
}

async function update(req, res) {
  const task = await tasks.update(req.params.id, req.body, req.user.userId);
  res.json({ success: true, data: task });
}

async function remove(req, res) {
  await tasks.remove(req.params.id, req.user.userId);
  res.json({ success: true });
}

module.exports = { create, list, getById, update, remove };
