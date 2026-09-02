const payments = require('./payment.service');

async function create(req, res) {
  const idempotencyKey = req.headers['x-idempotency-key'] || req.body.idempotencyKey || null;
  const payment = await payments.create({ ...req.body, idempotencyKey }, req.user.userId);
  res.status(201).json({ success: true, data: payment });
}

async function list(req, res) {
  const items = await payments.list({
    customerId: req.query.customerId,
    bookingId: req.query.bookingId,
    organizationId: req.query.organizationId,
    status: req.query.status,
    limit: parseInt(req.query.limit, 10) || 50,
  });
  res.json({ success: true, items });
}

async function getById(req, res) {
  const payment = await payments.getById(req.params.id);
  res.json({ success: true, data: payment });
}

async function capture(req, res) {
  const payment = await payments.capture(req.params.id, req.user.userId);
  res.json({ success: true, data: payment });
}

async function refund(req, res) {
  const payment = await payments.refund(req.params.id, req.body.amountMinor, req.user.userId);
  res.json({ success: true, data: payment });
}

module.exports = { create, list, getById, capture, refund };
