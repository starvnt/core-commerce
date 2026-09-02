const customerService = require('./customer.service');
const Customer = require('./customer.model');
const { HttpError } = require('../../middleware/errorHandler');

async function create(req, res) {
  const customer = await customerService.createCustomer(
    { ...req.body, organizationId: req.body.organizationId || req.user?.organizationId },
    req.user?.userId,
  );
  res.status(201).json({ success: true, data: customer });
}

async function list(req, res) {
  const result = await customerService.listCustomers({
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
    search: req.query.search,
    organizationId: req.query.organizationId,
  });
  res.json({ success: true, ...result });
}

async function getById(req, res) {
  const customer = await customerService.getCustomerById(req.params.id);
  res.json({ success: true, data: customer });
}

async function getByUser(req, res) {
  const customer = await Customer.findOne({ userId: req.params.userId });
  if (!customer) throw new HttpError(404, 'Customer not found for user');
  res.json({ success: true, data: customer });
}

async function update(req, res) {
  const customer = await customerService.updateCustomer(req.params.id, req.body, req.user?.userId);
  res.json({ success: true, data: customer });
}

async function remove(req, res) {
  const result = await customerService.deleteCustomer(req.params.id, req.user?.userId);
  res.json({ success: true, data: result });
}

module.exports = { create, list, getById, getByUser, update, remove };
