const { v4: uuidv4 } = require('uuid');
const Review = require('./review.model');
const { HttpError } = require('../../middleware/errorHandler');

function newReviewId() {
  return `REV-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

async function create({ organizationId, customerId, bookingId = null, rating, title = '', body = '', authorName = '' }) {
  if (!organizationId) throw new HttpError(400, 'organizationId required', 'VALIDATION_ERROR');
  if (!customerId) throw new HttpError(400, 'customerId required', 'VALIDATION_ERROR');
  if (!rating || rating < 1 || rating > 5) throw new HttpError(400, 'rating 1-5 required', 'VALIDATION_ERROR');
  const rev = await Review.create({
    reviewId: newReviewId(),
    organizationId, customerId, bookingId,
    rating, title, body, authorName,
    status: 'PUBLISHED',
  });
  return rev;
}

async function list({ organizationId, limit = 50, minRating = null } = {}) {
  const q = { status: 'PUBLISHED' };
  if (organizationId) q.organizationId = organizationId;
  if (minRating) q.rating = { $gte: minRating };
  return Review.find(q).sort({ createdAt: -1 }).limit(limit);
}

async function summary(organizationId) {
  const all = await Review.find({ organizationId, status: 'PUBLISHED' });
  if (!all.length) return { count: 0, average: 0, breakdown: {} };
  const sum = all.reduce((s, r) => s + r.rating, 0);
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of all) breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
  return {
    count: all.length,
    average: Math.round((sum / all.length) * 10) / 10,
    breakdown,
  };
}

module.exports = { create, list, summary };
