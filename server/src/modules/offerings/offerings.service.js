const { v4: uuidv4 } = require('uuid');
const Offering = require('./offering.model');
const { HttpError } = require('../../middleware/errorHandler');
const audit = require('../audit/audit.service');

function newId() {
  return `OFR-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

async function create(data, actorId = null) {
  const offering = await Offering.create({
    offeringId: newId(),
    organizationId: data.organizationId,
    title: data.title,
    slug: (data.slug || data.title).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: data.description || '',
    category: data.category,
    subcategory: data.subcategory || '',
    pricingModel: data.pricingModel || 'STARTING_FROM',
    priceMinor: data.priceMinor || null,
    currency: data.currency || 'INR',
    priceUnit: data.priceUnit || '',
    fulfillmentModel: data.fulfillmentModel || 'ON_DEMAND',
    capacity: data.capacity || null,
    durationMinutes: data.durationMinutes || null,
    includes: data.includes || [],
    images: data.images || [],
    tags: data.tags || [],
    featured: data.featured || false,
  });
  await audit.record({
    entityType: 'OFFERING',
    entityId: offering.offeringId,
    action: 'CREATE',
    newValue: { title: offering.title, category: offering.category, priceMinor: offering.priceMinor },
    changedBy: actorId,
    organizationId: offering.organizationId,
  });
  return offering;
}

async function list({ category = null, organizationId = null, search = null, minPrice = null, maxPrice = null, featured = null, active = true, limit = 50 } = {}) {
  const query = { active };
  if (category) query.category = category;
  if (organizationId) query.organizationId = organizationId;
  if (featured !== null && featured !== undefined) query.featured = featured;
  if (search) {
    query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { tags: new RegExp(search, 'i') },
    ];
  }
  if (minPrice !== null) query.priceMinor = { ...query.priceMinor, $gte: minPrice };
  if (maxPrice !== null) query.priceMinor = { ...query.priceMinor, $lte: maxPrice };
  return Offering.find(query).sort({ featured: -1, rating: -1, createdAt: -1 }).limit(Math.min(limit, 200));
}

async function getById(id) {
  let offering;
  if (/^[0-9a-fA-F]{24}$/.test(id)) offering = await Offering.findById(id);
  if (!offering) offering = await Offering.findOne({ offeringId: id });
  if (!offering) {
    offering = await Offering.findOne({ slug: id });
  }
  if (!offering) throw new HttpError(404, 'Offering not found');
  return offering;
}

async function update(id, updates, actorId = null) {
  const offering = await getById(id);
  const allowed = [
    'title', 'description', 'category', 'subcategory', 'pricingModel', 'priceMinor',
    'currency', 'priceUnit', 'fulfillmentModel', 'capacity', 'durationMinutes',
    'includes', 'images', 'tags', 'active', 'featured',
  ];
  for (const key of allowed) {
    if (updates[key] !== undefined) offering[key] = updates[key];
  }
  await offering.save();
  await audit.record({
    entityType: 'OFFERING',
    entityId: offering.offeringId,
    action: 'UPDATE',
    changedBy: actorId,
    organizationId: offering.organizationId,
  });
  return offering;
}

async function remove(id, actorId = null) {
  const offering = await getById(id);
  offering.active = false;
  await offering.save();
  await audit.record({
    entityType: 'OFFERING',
    entityId: offering.offeringId,
    action: 'DEACTIVATE',
    changedBy: actorId,
    organizationId: offering.organizationId,
  });
}

module.exports = { create, list, getById, update, remove };
