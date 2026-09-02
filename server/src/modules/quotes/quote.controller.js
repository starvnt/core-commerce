const quotes = require('./quote.service');

async function create(req, res) {
  const quote = await quotes.create(
    { ...req.body, organizationId: req.body.organizationId || req.user.organizationId },
    req.user.userId,
  );
  res.status(201).json({ success: true, data: quote });
}

async function list(req, res) {
  const items = await quotes.list({
    customerId: req.query.customerId,
    organizationId: req.query.organizationId,
    status: req.query.status,
    limit: parseInt(req.query.limit, 10) || 50,
  });
  res.json({ success: true, items });
}

async function getById(req, res) {
  const quote = await quotes.getById(req.params.id);
  res.json({ success: true, data: quote });
}

async function update(req, res) {
  const quote = await quotes.update(req.params.id, req.body, req.user.userId);
  res.json({ success: true, data: quote });
}

async function send(req, res) {
  const quote = await quotes.send(req.params.id, req.user.userId);
  res.json({ success: true, data: quote });
}

async function accept(req, res) {
  const idempotencyKey = req.headers['x-idempotency-key'] || req.body.idempotencyKey || null;
  const quote = await quotes.accept(req.params.id, idempotencyKey, req.user.userId);
  res.json({ success: true, data: quote });
}

async function reject(req, res) {
  const quote = await quotes.reject(req.params.id, req.body.reason, req.user.userId);
  res.json({ success: true, data: quote });
}

async function setStatus(req, res) {
  // Generic PATCH /quotes/:id/status — map status to the appropriate action.
  const target = req.body.status;
  if (target === 'SENT') return send(req, res);
  if (target === 'ACCEPTED') return accept(req, res);
  if (target === 'REJECTED') {
    req.body = { reason: req.body.reason || 'No reason provided' };
    return reject(req, res);
  }
  const { HttpError } = require('../../middleware/errorHandler');
  throw new HttpError(400, `Cannot set quote status to ${target}`, 'INVALID_STATE');
}

module.exports = { create, list, getById, update, send, accept, reject, setStatus };
