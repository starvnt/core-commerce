const { v4: uuidv4 } = require('uuid');
const Budget = require('./budget.model');
const { HttpError } = require('../../middleware/errorHandler');
const Customer = require('../customers/customer.model');
const Booking = require('../bookings/booking.model');
const audit = require('../audit/audit.service');

function newBudgetId() {
  return `BUD-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

function newAllocationId() {
  return `ALC-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 3).toUpperCase()}`;
}

async function getForCustomer(customerId) {
  let budget = await Budget.findOne({ customerId });
  if (!budget) {
    const customer = await Customer.findOne({ customerId });
    if (!customer) throw new HttpError(404, 'Customer not found');
    budget = await Budget.create({
      budgetId: newBudgetId(),
      customerId,
      organizationId: customer.organizationId,
      totalMinor: customer.budgetMinor || 0,
      currency: customer.currency || 'INR',
      allocations: [],
    });
  }
  // Compute committed = sum of all booking totals for this customer
  const bookings = await Booking.find({ customerId });
  const committedMinor = bookings.reduce((s, b) => s + (b.totalMinor || 0), 0);
  const paidMinor = bookings.reduce((s, b) => s + (b.paidMinor || 0), 0);
  const totalAllocated = (budget.allocations || []).reduce((s, a) => s + (a.plannedMinor || 0), 0);
  return {
    ...budget.toObject(),
    summary: {
      committedMinor,
      paidMinor,
      pendingMinor: Math.max(0, committedMinor - paidMinor),
      remainingMinor: Math.max(0, (budget.totalMinor || 0) - committedMinor),
      totalAllocatedMinor: totalAllocated,
      health: budget.totalMinor > 0 && committedMinor > budget.totalMinor ? 'OVER_BUDGET' : 'OK',
    },
  };
}

async function updateBudget(customerId, updates, actorId = null) {
  const existing = await getForCustomer(customerId);
  const budget = await Budget.findOne({ customerId });
  if (updates.totalMinor !== undefined) budget.totalMinor = updates.totalMinor;
  if (updates.currency) budget.currency = updates.currency;
  await budget.save();
  // Sync to customer record
  if (updates.totalMinor !== undefined) {
    await Customer.findOneAndUpdate({ customerId }, { $set: { budgetMinor: updates.totalMinor } });
  }
  await audit.record({
    entityType: 'BUDGET', entityId: budget.budgetId, action: 'UPDATE',
    changedBy: actorId, organizationId: budget.organizationId,
  });
  return getForCustomer(customerId);
}

async function upsertAllocation(customerId, { category, plannedMinor, notes }, actorId = null) {
  if (!category) throw new HttpError(400, 'category required', 'VALIDATION_ERROR');
  const budget = await Budget.findOne({ customerId });
  if (!budget) throw new HttpError(404, 'Budget not found');
  const idx = budget.allocations.findIndex((a) => a.category === category);
  if (idx >= 0) {
    budget.allocations[idx].plannedMinor = plannedMinor;
    if (notes !== undefined) budget.allocations[idx].notes = notes;
  } else {
    budget.allocations.push({ allocationId: newAllocationId(), category, plannedMinor: plannedMinor || 0, notes: notes || '' });
  }
  await budget.save();
  await audit.record({
    entityType: 'BUDGET', entityId: budget.budgetId, action: 'ALLOCATION_UPSERT',
    changedBy: actorId, organizationId: budget.organizationId,
  });
  return getForCustomer(customerId);
}

async function removeAllocation(customerId, category, actorId = null) {
  const budget = await Budget.findOne({ customerId });
  if (!budget) throw new HttpError(404, 'Budget not found');
  budget.allocations = budget.allocations.filter((a) => a.category !== category);
  await budget.save();
  await audit.record({
    entityType: 'BUDGET', entityId: budget.budgetId, action: 'ALLOCATION_REMOVE',
    changedBy: actorId, organizationId: budget.organizationId,
  });
  return getForCustomer(customerId);
}

module.exports = { getForCustomer, updateBudget, upsertAllocation, removeAllocation };
