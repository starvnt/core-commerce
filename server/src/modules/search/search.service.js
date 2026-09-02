const Offering = require('../offerings/offering.model');
const Organization = require('../identity/organization.model');

async function searchVendors({ q = '', city = '', category = '', minPrice = null, maxPrice = null, limit = 30 } = {}) {
  const orgQ = { status: 'ACTIVE' };
  if (city) orgQ['address.city'] = new RegExp(city, 'i');
  if (q) {
    orgQ.$or = [
      { name: new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') },
      { capabilities: new RegExp(q, 'i') },
    ];
  }
  if (category) orgQ.capabilities = category;
  const orgs = await Organization.find(orgQ).limit(limit);
  // For each org, fetch their public offerings
  const orgIds = orgs.map((o) => o.organizationId);
  const offerings = await Offering.find({ organizationId: { $in: orgIds }, isActive: true });
  const offeringsByOrg = offerings.reduce((acc, o) => {
    if (!acc[o.organizationId]) acc[o.organizationId] = [];
    acc[o.organizationId].push(o);
    return acc;
  }, {});
  let results = orgs.map((o) => ({
    organizationId: o.organizationId,
    name: o.name,
    slug: o.slug,
    capabilities: o.capabilities,
    city: o.address && o.address.city,
    description: o.description,
    logoUrl: o.logoUrl,
    coverImageUrl: o.coverImageUrl,
    offerings: offeringsByOrg[o.organizationId] || [],
  }));
  // Price filter applied across offerings
  if (minPrice !== null || maxPrice !== null) {
    results = results
      .map((r) => ({
        ...r,
        offerings: r.offerings.filter((off) => {
          const p = off.startingPriceMinor || 0;
          if (minPrice !== null && p < minPrice) return false;
          if (maxPrice !== null && p > maxPrice) return false;
          return true;
        }),
      }))
      .filter((r) => r.offerings.length > 0);
  }
  return results;
}

async function listFeatured({ limit = 6 } = {}) {
  const orgs = await Organization.find({ status: 'ACTIVE', isFeatured: true }).limit(limit);
  return orgs;
}

async function listCategories() {
  const orgs = await Organization.aggregate([
    { $match: { status: 'ACTIVE' } },
    { $unwind: '$capabilities' },
    { $group: { _id: '$capabilities', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return orgs.map((c) => ({ category: c._id, count: c.count }));
}

module.exports = { searchVendors, listFeatured, listCategories };
