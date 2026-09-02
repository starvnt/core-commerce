const bookings = require('./booking.service');

async function create(req, res) {
  const idempotencyKey = req.headers['x-idempotency-key'] || req.body.idempotencyKey || null;
  const booking = await bookings.createFromQuote({
    ...req.body,
    idempotencyKey,
    actorId: req.user.userId,
  });
  res.status(201).json({ success: true, data: booking });
}

async function list(req, res) {
  const items = await bookings.list({
    customerId: req.query.customerId,
    organizationId: req.query.organizationId,
    status: req.query.status,
    limit: parseInt(req.query.limit, 10) || 50,
  });
  res.json({ success: true, items });
}

async function getById(req, res) {
  const booking = await bookings.getById(req.params.id);
  res.json({ success: true, data: booking });
}

async function transition(req, res) {
  const booking = await bookings.transition(req.params.id, req.body.status, req.user.userId);
  res.json({ success: true, data: booking });
}

module.exports = { create, list, getById, transition };
