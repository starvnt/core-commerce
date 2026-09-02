/**
 * StarVnt Core — seed users (admin + customer + partner).
 *
 * Usage:
 *   npm run seed
 *
 * Idempotent: upserts by email. Prints credentials on success.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/modules/identity/user.model');
const Customer = require('../src/modules/customers/customer.model');
const Organization = require('../src/modules/identity/organization.model');

const SALT_ROUNDS = 10;

const SEEDS = [
  {
    key: 'admin',
    user: {
      email: 'admin@starvnt.test',
      password: 'Admin@2026',
      name: 'StarVnt Admin',
      phone: '+91-9000000001',
      role: 'SUPER_ADMIN',
    },
  },
  {
    key: 'customer',
    user: {
      email: 'customer@starvnt.test',
      password: 'Customer@2026',
      name: 'Priya Sharma',
      phone: '+91-9000000002',
      role: 'CUSTOMER',
    },
    customer: {
      eventType: 'Wedding',
      eventDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      venue: 'The Leela Palace',
      city: 'Bengaluru',
      guestCount: 250,
      budgetMinor: 250000000,
      currency: 'INR',
    },
  },
  {
    key: 'partner',
    user: {
      email: 'partner@starvnt.test',
      password: 'Partner@2026',
      name: 'Studio Aurora',
      phone: '+91-9000000003',
      role: 'PARTNER_OWNER',
    },
    organization: {
      name: 'Studio Aurora',
      description: 'Premium wedding photography and cinematography studio.',
      capabilities: ['ARTIST', 'VENDOR'],
      categories: ['Photography', 'Cinematography'],
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      verified: true,
      featured: true,
    },
  },
];

const newUserId = () => `USR-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
const newCustomerId = () => `CUS-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
const newOrgId = () => `ORG-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;

async function upsertUser(email, body, password) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`  ↻ user exists: ${email} (${existing.role}) — leaving unchanged`);
    return existing;
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const created = await User.create({
    userId: newUserId(),
    email: email.toLowerCase(),
    passwordHash,
    name: body.name,
    phone: body.phone,
    role: body.role,
    status: 'active',
  });
  console.log(`  ✔ created user: ${email} → ${created.role}`);
  return created;
}

async function ensureCustomer(user, c) {
  if (!c) return;
  const existing = await Customer.findOne({ userId: user.userId });
  if (existing) {
    console.log(`  ↻ customer profile exists for ${user.email}`);
    return existing;
  }
  const customerId = newCustomerId();
  await Customer.create({
    customerId,
    userId: user.userId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    eventType: c.eventType,
    eventDate: c.eventDate,
    venue: c.venue,
    city: c.city,
    guestCount: c.guestCount,
    budgetMinor: c.budgetMinor,
    currency: c.currency,
    status: 'active',
  });
  await User.updateOne({ userId: user.userId }, { $set: { customerId } });
  console.log(`  ✔ created customer profile ${customerId}`);
}

async function ensureOrganization(user, org) {
  if (!org) return;
  const existing = await Organization.findOne({ name: org.name });
  if (existing) {
    await User.updateOne({ userId: user.userId }, { $set: { organizationId: existing.organizationId } });
    console.log(`  ↻ organization exists: ${org.name}`);
    return existing;
  }
  const slug = org.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const organizationId = newOrgId();
  await Organization.create({
    organizationId,
    name: org.name,
    slug,
    description: org.description,
    capabilities: org.capabilities,
    categories: org.categories,
    city: org.city,
    state: org.state,
    country: org.country,
    verified: org.verified,
    featured: org.featured,
  });
  await User.updateOne({ userId: user.userId }, { $set: { organizationId } });
  console.log(`  ✔ created organization ${organizationId} (${org.name})`);
}

(async () => {
  try {
    await connectDB();
    console.log('\n— Seeding StarVnt Core users —\n');
    for (const seed of SEEDS) {
      console.log(`\n[${seed.key}]`);
      const user = await upsertUser(seed.user.email, seed.user, seed.user.password);
      await ensureCustomer(user, seed.customer);
      await ensureOrganization(user, seed.organization);
    }

    console.log('\n────────────────────────────────────────────────────────────');
    console.log('  Login credentials');
    console.log('────────────────────────────────────────────────────────────');
    console.log('  ADMIN    → admin@starvnt.test    / Admin@2026');
    console.log('  CUSTOMER → customer@starvnt.test / Customer@2026');
    console.log('  PARTNER  → partner@starvnt.test  / Partner@2026');
    console.log('────────────────────────────────────────────────────────────\n');
  } catch (err) {
    console.error('\n[seed] FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
    process.exit(process.exitCode || 0);
  }
})();
