const svc = require('./events.service');

async function create(req, res) {
  const ev = await svc.create({
    ...req.body,
    organizationId: req.body.organizationId || (req.user ? req.user.organizationId : null),
    actorId: req.user ? req.user.userId : null,
  });
  res.status(201).json({ success: true, data: ev });
}

async function list(req, res) {
  const items = await svc.list({
    customerId: req.query.customerId,
    status: req.query.status,
    publicOnly: req.query.public === 'true',
  });
  res.json({ success: true, data: items });
}

async function get(req, res) {
  const ev = await svc.get(req.params.id);
  res.json({ success: true, data: ev });
}

async function update(req, res) {
  const ev = await svc.update(req.params.id, req.body, req.user ? req.user.userId : null);
  res.json({ success: true, data: ev });
}

async function setStatus(req, res) {
  const ev = await svc.setStatus(req.params.id, req.body.status, req.user ? req.user.userId : null);
  res.json({ success: true, data: ev });
}

async function remove(req, res) {
  const r = await svc.remove(req.params.id, req.user ? req.user.userId : null);
  res.json({ success: true, data: r });
}

module.exports = { create, list, get, update, setStatus, remove };
