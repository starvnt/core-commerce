const Customer = require('./customer.model');
const { HttpError } = require('../../middleware/errorHandler');
const outbox = require('../outbox/outbox.service');
const activity = require('../activity/activity.service');
const audit = require('../audit/audit.service');

const STATUS_TRANSITIONS = {
  new: ['active', 'inactive', 'archived'],
  active: ['inactive', 'archived'],
  inactive: ['active', 'archived'],
  archived: ['active'],
};

function generateCustomerId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `CUST-${ts}-${rand}`;
}

function sanitize(payload) {
  const allowed = [
    'name', 'email', 'phone', 'status', 'source', 'eventType', 'eventDate',
    'venue', 'city', 'guestCount', 'budgetMinor', 'currency', 'firstTouch',
    'lastTouch', 'notes', 'tags', 'userId', 'organizationId',
  ];
  const out = {};
  for (const k of allowed) {
    if (payload[k] !== undefined) out[k] = payload[k];
  }
  return out;
}

async function createCustomer(payload, actorId = null) {
  const data = sanitize(payload);
  if (!data.name) throw new HttpError(400, 'Name is required', 'VALIDATION_ERROR');
  if (!data.email) throw new HttpError(400, 'Email is required', 'VALIDATION_ERROR');
  const customer = await Customer.create({
    customerId: payload.customerId || generateCustomerId(),
    ...data,
  });
  await activity.log({
    entityType: 'CUSTOMER',
    entityId: customer.customerId,
    actionType: 'CUSTOMER_CREATED',
    message: `Customer created: ${customer.name}`,
    source: actorId ? 'USER' : 'SYSTEM',
    organizationId: customer.organizationId,
    createdBy: actorId,
    metadata: { email: customer.email, source: customer.source },
  });
  await audit.record({
    entityType: 'CUSTOMER',
    entityId: customer.customerId,
    action: 'CREATE',
    newValue: { name: customer.name, email: customer.email, status: customer.status },
    changedBy: actorId,
    organizationId: customer.organizationId,
  });
  await outbox.emit({
    eventName: 'CUSTOMER_CREATED',
    entityType: 'CUSTOMER',
    entityId: customer.customerId,
    organizationId: customer.organizationId,
    payload: { name: customer.name, email: customer.email, source: customer.source },
  });
  return customer;
}

async function listCustomers({ page = 1, limit = 50, status = null, search = null, organizationId = null } = {}) {
  const safeLimit = Math.min(parseInt(limit, 10) || 50, 200);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (safePage - 1) * safeLimit;
  const query = {};
  if (status) query.status = status;
  if (organizationId) query.organizationId = organizationId;
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
    ];
  }
  const [items, total] = await Promise.all([
    Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    Customer.countDocuments(query),
  ]);
  return {
    items,
    pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) },
  };
}

async function getCustomerById(id) {
  let customer;
  if (/^[0-9a-fA-F]{24}$/.test(id)) customer = await Customer.findById(id);
  if (!customer) customer = await Customer.findOne({ customerId: id });
  if (!customer) throw new HttpError(404, `Customer not found: ${id}`);
  return customer;
}

async function updateCustomer(id, updates, actorId = null) {
  const customer = await getCustomerById(id);
  const data = sanitize(updates);
  // Validate status transition
  if (data.status && data.status !== customer.status) {
    const allowed = STATUS_TRANSITIONS[customer.status] || [];
    if (!allowed.includes(data.status)) {
      throw new HttpError(
        400,
        `Invalid status transition from ${customer.status} to ${data.status}`,
        'INVALID_STATE',
      );
    }
  }
  const previous = { status: customer.status, name: customer.name };
  Object.assign(customer, data);
  await customer.save();
  await activity.log({
    entityType: 'CUSTOMER',
    entityId: customer.customerId,
    actionType: 'CUSTOMER_UPDATED',
    message: `Customer updated: ${customer.name}`,
    source: 'USER',
    organizationId: customer.organizationId,
    createdBy: actorId,
    metadata: { changes: Object.keys(data) },
  });
  await audit.record({
    entityType: 'CUSTOMER',
    entityId: customer.customerId,
    action: 'UPDATE',
    field: data.status ? 'status' : null,
    previousValue: previous,
    newValue: { status: customer.status, name: customer.name },
    changedBy: actorId,
    organizationId: customer.organizationId,
  });
  if (data.status && data.status !== previous.status) {
    await outbox.emit({
      eventName: 'CUSTOMER_STATUS_CHANGED',
      entityType: 'CUSTOMER',
      entityId: customer.customerId,
      organizationId: customer.organizationId,
      payload: { from: previous.status, to: data.status, name: customer.name },
    });
  }
  return customer;
}

async function deleteCustomer(id, actorId = null) {
  const customer = await getCustomerById(id);
  const customerId = customer.customerId;
  await customer.deleteOne();
  await audit.record({
    entityType: 'CUSTOMER',
    entityId: customerId,
    action: 'DELETE',
    changedBy: actorId,
    organizationId: customer.organizationId,
  });
  return { id: customerId };
}

module.exports = {
  createCustomer, listCustomers, getCustomerById, updateCustomer, deleteCustomer,
  STATUS_TRANSITIONS,
};
