const Customer = require('./customer.model');
const { HttpError } = require('../../middleware/errorHandler');

function generateCustomerId() {
  // Short, sortable, human-friendly. Prefix + base36 timestamp + 3 random chars.
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `CUST-${ts}-${rand}`;
}

async function createCustomer(payload) {
  const customer = await Customer.create({
    customerId: payload.customerId || generateCustomerId(),
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    status: payload.status,
    source: payload.source,
  });
  return customer;
}

async function listCustomers({ page = 1, limit = 50 } = {}) {
  const safeLimit = Math.min(parseInt(limit, 10) || 50, 200);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Customer.find().sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    Customer.countDocuments(),
  ]);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit),
    },
  };
}

async function getCustomerById(id) {
  // Accept either Mongo ObjectId or our business customerId.
  let customer;
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    customer = await Customer.findById(id);
  }
  if (!customer) {
    customer = await Customer.findOne({ customerId: id });
  }
  if (!customer) {
    throw new HttpError(404, `Customer not found: ${id}`);
  }
  return customer;
}

async function updateCustomer(id, updates) {
  const allowed = ['name', 'email', 'phone', 'status', 'source'];
  const sanitized = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) sanitized[key] = updates[key];
  }

  const customer = await getCustomerById(id);
  Object.assign(customer, sanitized);
  await customer.save();
  return customer;
}

async function deleteCustomer(id) {
  const customer = await getCustomerById(id);
  await customer.deleteOne();
  return { id: customer.customerId };
}

module.exports = {
  createCustomer,
  listCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
