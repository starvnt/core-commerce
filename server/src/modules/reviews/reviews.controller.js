const svc = require('./reviews.service');

async function create(req, res) {
  const r = await svc.create({ ...req.body });
  res.status(201).json({ success: true, data: r });
}

async function list(req, res) {
  const items = await svc.list({
    organizationId: req.query.organizationId,
    limit: req.query.limit ? Number(req.query.limit) : 50,
    minRating: req.query.minRating ? Number(req.query.minRating) : null,
  });
  res.json({ success: true, data: items });
}

async function summary(req, res) {
  const s = await svc.summary(req.params.organizationId);
  res.json({ success: true, data: s });
}

module.exports = { create, list, summary };
