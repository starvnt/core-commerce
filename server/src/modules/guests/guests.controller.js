const svc = require('./guests.service');

async function create(req, res) {
  const g = await svc.create({
    ...req.body,
    organizationId: req.body.organizationId || (req.user ? req.user.organizationId : null),
  });
  res.status(201).json({ success: true, data: g });
}

async function bulk(req, res) {
  const inserted = await svc.bulkCreate({
    customerId: req.body.customerId,
    bookingId: req.body.bookingId,
    organizationId: req.body.organizationId,
    guests: req.body.guests || [],
  });
  res.status(201).json({ success: true, data: inserted });
}

async function list(req, res) {
  const items = await svc.list({
    customerId: req.query.customerId,
    bookingId: req.query.bookingId,
    rsvpStatus: req.query.rsvpStatus,
  });
  res.json({ success: true, data: items });
}

async function get(req, res) {
  const g = await svc.get(req.params.id);
  res.json({ success: true, data: g });
}

async function update(req, res) {
  const g = await svc.update(req.params.id, req.body);
  res.json({ success: true, data: g });
}

async function setRsvp(req, res) {
  const g = await svc.setRsvp(req.params.id, req.body.rsvpStatus);
  res.json({ success: true, data: g });
}

async function remove(req, res) {
  const result = await svc.remove(req.params.id);
  res.json({ success: true, data: result });
}

async function summary(req, res) {
  const s = await svc.summary(req.params.customerId);
  res.json({ success: true, data: s });
}

module.exports = { create, bulk, list, get, update, setRsvp, remove, summary };
