const svc = require('./timeline.service');

async function create(req, res) {
  const t = await svc.create({
    ...req.body,
    organizationId: req.body.organizationId || (req.user ? req.user.organizationId : null),
  });
  res.status(201).json({ success: true, data: t });
}

async function list(req, res) {
  const items = await svc.list({
    customerId: req.query.customerId,
    bookingId: req.query.bookingId,
  });
  res.json({ success: true, data: items });
}

async function get(req, res) {
  const t = await svc.get(req.params.id);
  res.json({ success: true, data: t });
}

async function update(req, res) {
  const t = await svc.update(req.params.id, req.body);
  res.json({ success: true, data: t });
}

async function setStatus(req, res) {
  const t = await svc.setStatus(req.params.id, req.body.status);
  res.json({ success: true, data: t });
}

async function remove(req, res) {
  const r = await svc.remove(req.params.id);
  res.json({ success: true, data: r });
}

module.exports = { create, list, get, update, setStatus, remove };
