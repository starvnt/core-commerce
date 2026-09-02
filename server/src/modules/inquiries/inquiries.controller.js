const inquiries = require('./inquiries.service');

async function create(req, res) {
  const data = { ...req.body, organizationId: req.body.organizationId || req.user.organizationId };
  const inquiry = await inquiries.create(data, req.user.userId);
  res.status(201).json({ success: true, data: inquiry });
}

async function list(req, res) {
  const items = await inquiries.list({
    customerId: req.query.customerId,
    status: req.query.status,
    organizationId: req.query.organizationId,
    limit: parseInt(req.query.limit, 10) || 50,
  });
  res.json({ success: true, items });
}

async function getById(req, res) {
  const inquiry = await inquiries.getById(req.params.id);
  res.json({ success: true, data: inquiry });
}

async function update(req, res) {
  const inquiry = await inquiries.update(req.params.id, req.body, req.user.userId);
  res.json({ success: true, data: inquiry });
}

async function respond(req, res) {
  const inquiry = await inquiries.respond(req.params.id, req.body.response, req.user.userId);
  res.json({ success: true, data: inquiry });
}

async function transition(req, res) {
  const inquiry = await inquiries.transition(req.params.id, req.body.status, req.user.userId);
  res.json({ success: true, data: inquiry });
}

module.exports = { create, list, getById, update, respond, transition };
