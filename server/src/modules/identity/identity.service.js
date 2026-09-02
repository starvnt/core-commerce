const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('./user.model');
const Organization = require('./organization.model');
const { HttpError } = require('../../middleware/errorHandler');
const { signToken } = require('../../middleware/auth');
const outbox = require('../outbox/outbox.service');
const activity = require('../activity/activity.service');
const audit = require('../audit/audit.service');

const SALT_ROUNDS = 10;

function newUserId() {
  return `USR-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

function newOrgId() {
  return `ORG-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function register({ email, password, name, phone = '', role = 'CUSTOMER', organizationId = null, customerId = null }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new HttpError(409, 'Email already registered', 'DUPLICATE_RESOURCE');
  const passwordHash = await hashPassword(password);
  const user = await User.create({
    userId: newUserId(),
    email: email.toLowerCase(),
    passwordHash,
    name,
    phone,
    role,
    organizationId,
    customerId,
  });
  await audit.record({
    entityType: 'USER',
    entityId: user.userId,
    action: 'REGISTER',
    newValue: { email, role },
    source: 'USER',
  });
  const token = signToken(user);
  return { user: sanitize(user), token };
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new HttpError(401, 'Invalid email or password', 'UNAUTHORIZED');
  if (user.status !== 'active') throw new HttpError(403, 'Account is not active', 'FORBIDDEN');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'Invalid email or password', 'UNAUTHORIZED');
  user.lastLoginAt = new Date();
  await user.save();
  const token = signToken(user);
  return { user: sanitize(user), token };
}

function sanitize(user) {
  return {
    userId: user.userId,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    organizationId: user.organizationId,
    customerId: user.customerId,
    lastLoginAt: user.lastLoginAt,
  };
}

async function me(userId) {
  const user = await User.findOne({ userId });
  if (!user) throw new HttpError(404, 'User not found');
  return sanitize(user);
}

async function listUsers({ organizationId = null, role = null, limit = 50 } = {}) {
  const query = {};
  if (organizationId) query.organizationId = organizationId;
  if (role) query.role = role;
  const users = await User.find(query).limit(Math.min(limit, 200));
  return users.map(sanitize);
}

async function createOrganization(data, ownerUserId = null) {
  const slug = (data.slug || data.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const org = await Organization.create({
    organizationId: newOrgId(),
    name: data.name,
    slug,
    description: data.description || '',
    capabilities: data.capabilities || ['VENDOR'],
    categories: data.categories || [],
    city: data.city || '',
    state: data.state || '',
    country: data.country || 'India',
    address: data.address || '',
    postalCode: data.postalCode || '',
    phone: data.phone || '',
    email: data.email || '',
    website: data.website || '',
    logoUrl: data.logoUrl || '',
    coverUrl: data.coverUrl || '',
    verified: data.verified || false,
    featured: data.featured || false,
  });
  if (ownerUserId) {
    await User.updateOne({ userId: ownerUserId }, { $set: { organizationId: org.organizationId, role: 'PARTNER_OWNER' } });
  }
  await audit.record({
    entityType: 'ORGANIZATION',
    entityId: org.organizationId,
    action: 'CREATE',
    newValue: { name: org.name, capabilities: org.capabilities },
    changedBy: ownerUserId,
  });
  return org;
}

async function listOrganizations({ city = null, capability = null, category = null, verified = null, search = null, limit = 50 } = {}) {
  const query = { status: 'active' };
  if (city) query.city = new RegExp(city, 'i');
  if (capability) query.capabilities = capability;
  if (category) query.categories = category;
  if (verified !== null && verified !== undefined) query.verified = verified;
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ];
  }
  return Organization.find(query).sort({ featured: -1, rating: -1, createdAt: -1 }).limit(Math.min(limit, 200));
}

async function getOrganizationById(id) {
  let org;
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    org = await Organization.findById(id);
  }
  if (!org) {
    org = await Organization.findOne({
      $or: [{ organizationId: id }, { slug: id }],
    });
  }
  if (!org) throw new HttpError(404, 'Organization not found');
  return org;
}

async function updateOrganization(id, updates) {
  const org = await getOrganizationById(id);
  const allowed = [
    'name', 'description', 'capabilities', 'categories', 'city', 'state', 'country',
    'address', 'postalCode', 'phone', 'email', 'website', 'logoUrl', 'coverUrl',
    'verified', 'featured', 'status', 'latitude', 'longitude', 'serviceRadiusKm',
  ];
  for (const key of allowed) {
    if (updates[key] !== undefined) org[key] = updates[key];
  }
  await org.save();
  return org;
}

module.exports = {
  register, login, me, listUsers, sanitize,
  createOrganization, listOrganizations, getOrganizationById, updateOrganization,
};
