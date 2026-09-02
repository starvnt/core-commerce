const identity = require('./identity.service');

async function register(req, res) {
  const result = await identity.register(req.body);
  res.status(201).json({ success: true, data: result });
}

async function login(req, res) {
  const result = await identity.login(req.body);
  res.json({ success: true, data: result });
}

async function me(req, res) {
  const user = await identity.me(req.user.userId);
  res.json({ success: true, data: user });
}

async function listUsers(req, res) {
  const items = await identity.listUsers({
    organizationId: req.query.organizationId,
    role: req.query.role,
    limit: parseInt(req.query.limit, 10) || 50,
  });
  res.json({ success: true, items });
}

async function createOrganization(req, res) {
  const org = await identity.createOrganization(req.body, req.user.userId);
  res.status(201).json({ success: true, data: org });
}

async function listOrganizations(req, res) {
  const items = await identity.listOrganizations({
    city: req.query.city,
    capability: req.query.capability,
    category: req.query.category,
    verified: req.query.verified === '1' ? true : req.query.verified === '0' ? false : null,
    search: req.query.search,
    limit: parseInt(req.query.limit, 10) || 50,
  });
  res.json({ success: true, items });
}

async function getOrganization(req, res) {
  const org = await identity.getOrganizationById(req.params.id);
  res.json({ success: true, data: org });
}

async function updateOrganization(req, res) {
  const org = await identity.updateOrganization(req.params.id, req.body);
  res.json({ success: true, data: org });
}

module.exports = {
  register, login, me, listUsers,
  createOrganization, listOrganizations, getOrganization, updateOrganization,
};
