const customerService = require('./customer.service');

async function create(req, res) {
  const customer = await customerService.createCustomer(req.body);
  res.status(201).json({ success: true, data: customer });
}

async function list(req, res) {
  const { page, limit } = req.query;
  const result = await customerService.listCustomers({ page, limit });
  res.json({ success: true, ...result });
}

async function getById(req, res) {
  const customer = await customerService.getCustomerById(req.params.id);
  res.json({ success: true, data: customer });
}

async function update(req, res) {
  const customer = await customerService.updateCustomer(req.params.id, req.body);
  res.json({ success: true, data: customer });
}

async function remove(req, res) {
  const result = await customerService.deleteCustomer(req.params.id);
  res.json({ success: true, data: result });
}

module.exports = { create, list, getById, update, remove };
