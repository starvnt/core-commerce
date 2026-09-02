const svc = require('./search.service');

async function search(req, res) {
  const results = await svc.searchVendors({
    q: req.query.q || '',
    city: req.query.city || '',
    category: req.query.category || '',
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : null,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : null,
    limit: req.query.limit ? Number(req.query.limit) : 30,
  });
  res.json({ success: true, data: results });
}

async function featured(req, res) {
  const items = await svc.listFeatured({ limit: req.query.limit ? Number(req.query.limit) : 6 });
  res.json({ success: true, data: items });
}

async function categories(req, res) {
  const items = await svc.listCategories();
  res.json({ success: true, data: items });
}

module.exports = { search, featured, categories };
