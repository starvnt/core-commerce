const budget = require('./budget.service');

async function getForCustomer(req, res) {
  const data = await budget.getForCustomer(req.params.customerId);
  res.json({ success: true, data });
}

async function updateBudget(req, res) {
  const data = await budget.updateBudget(req.params.customerId, req.body, req.user.userId);
  res.json({ success: true, data });
}

async function upsertAllocation(req, res) {
  const data = await budget.upsertAllocation(req.params.customerId, req.body, req.user.userId);
  res.json({ success: true, data });
}

async function removeAllocation(req, res) {
  const data = await budget.removeAllocation(req.params.customerId, req.params.categoryId, req.user.userId);
  res.json({ success: true, data });
}

module.exports = { getForCustomer, updateBudget, upsertAllocation, removeAllocation };
