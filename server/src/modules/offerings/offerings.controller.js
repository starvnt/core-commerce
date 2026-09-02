const offerings = require('./offerings.service');

async function create(req, res) {
  const data = { ...req.body, organizationId: req.body.organizationId || req.user.organizationId };
  const offering = await offerings.create(data, req.user.userId);
  res.status(201).json({ success: true, data: offering });
}

async function list(req, res) {
  const items = await offerings.list({
    category: req.query.category,
    organizationId: req.query.organizationId,
    search: req.query.search,
    featured: req.query.featured === '1' ? true : req.query.featured === '0' ? false : null,
    minPrice: req.query.minPrice ? parseInt(req.query.minPrice, 10) : null,
    maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice, 10) : null,
    limit: parseInt(req.query.limit, 10) || 50,
  });
  res.json({ success: true, items });
}

async function getById(req, res) {
  const offering = await offerings.getById(req.params.id);
  res.json({ success: true, data: offering });
}

async function update(req, res) {
  const offering = await offerings.update(req.params.id, req.body, req.user.userId);
  res.json({ success: true, data: offering });
}

async function remove(req, res) {
  await offerings.remove(req.params.id, req.user.userId);
  res.json({ success: true });
}

module.exports = { create, list, getById, update, remove };
