const svc = require('./documents.service');

async function create(req, res) {
  const doc = await svc.create({
    ...req.body,
    uploadedBy: req.user ? req.user.userId : null,
    organizationId: req.body.organizationId || (req.user ? req.user.organizationId : null),
  });
  res.status(201).json({ success: true, data: doc });
}

async function list(req, res) {
  const items = await svc.list({
    ...(req.query.customerId ? { customerId: req.query.customerId } : {}),
    ...(req.query.bookingId ? { bookingId: req.query.bookingId } : {}),
    ...(req.query.type ? { type: req.query.type } : {}),
  }, { limit: Number(req.query.limit) || 50 });
  res.json({ success: true, data: items });
}

async function listForCustomer(req, res) {
  const items = await svc.listForCustomer(req.params.customerId, {
    limit: Number(req.query.limit) || 50,
  });
  res.json({ success: true, data: items });
}

async function get(req, res) {
  const doc = await svc.get(req.params.id);
  res.json({ success: true, data: doc });
}

async function updateStatus(req, res) {
  const doc = await svc.updateStatus(req.params.id, req.body.status, req.user ? req.user.userId : null);
  res.json({ success: true, data: doc });
}

async function remove(req, res) {
  const result = await svc.remove(req.params.id, req.user ? req.user.userId : null);
  res.json({ success: true, data: result });
}

module.exports = { create, list, listForCustomer, get, updateStatus, remove };
