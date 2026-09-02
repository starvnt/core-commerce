const { v4: uuidv4 } = require('uuid');
const { Visitor, Session, AnalyticsEvent, IntentScore } = require('./analytics.model');
const Customer = require('../customers/customer.model');

// Intent signal weights (configurable later)
const SIGNAL_WEIGHTS = {
  page_view: 1,
  service_view: 3,
  package_view: 5,
  portfolio_view: 3,
  cta_click: 5,
  lead_form_started: 10,
  lead_form_submitted: 20,
  quote_requested: 25,
  vendor_match_viewed: 10,
  booking_started: 30,
  payment_started: 40,
  booking_completed: 50,
};

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

function classify(score) {
  if (score >= 70) return 'HOT_LEAD';
  if (score >= 40) return 'HIGH_INTENT';
  if (score >= 20) return 'INTERESTED';
  return 'LOW_INTENT';
}

async function startSession({ visitorId, landingPage, referrer, utm = {}, device = 'desktop', country = '', city = '' }) {
  const session = await Session.create({
    sessionId: newId('SES'),
    visitorId,
    landingPage,
    referrer,
    utmSource: utm.source || null,
    utmMedium: utm.medium || null,
    utmCampaign: utm.campaign || null,
    device,
    country,
    city,
  });
  // First-touch attribution
  let visitor = await Visitor.findOne({ visitorId });
  if (!visitor) {
    visitor = await Visitor.create({
      visitorId,
      firstTouchSource: utm.source || (referrer ? 'referral' : 'direct'),
      firstTouchMedium: utm.medium || (referrer ? 'referral' : 'none'),
      firstTouchCampaign: utm.campaign || null,
      firstTouchReferral: utm.referral || null,
      firstTouchTimestamp: new Date(),
      lastTouchSource: utm.source || (referrer ? 'referral' : 'direct'),
      lastTouchTimestamp: new Date(),
    });
  } else {
    visitor.lastTouchSource = utm.source || visitor.lastTouchSource;
    visitor.lastTouchTimestamp = new Date();
    await visitor.save();
  }
  return { session, visitor };
}

async function trackEvent({ eventName, visitorId = null, sessionId = null, customerId = null, leadId = null, pagePath = null, referrer = null, utm = {}, referralId = null, serviceId = null, metadata = {} }) {
  return AnalyticsEvent.create({
    eventId: newId('EVT'),
    eventName,
    visitorId,
    sessionId,
    customerId,
    leadId,
    pagePath,
    referrer,
    utmSource: utm.source || null,
    utmMedium: utm.medium || null,
    utmCampaign: utm.campaign || null,
    utmContent: utm.content || null,
    utmTerm: utm.term || null,
    referralId,
    serviceId,
    metadata,
  });
}

async function recomputeIntentScore(customerId) {
  const events = await AnalyticsEvent.find({ customerId }).sort({ createdAt: -1 }).limit(200);
  let score = 0;
  const counts = {};
  for (const e of events) {
    const w = SIGNAL_WEIGHTS[e.eventName] || 0;
    score += w;
    counts[e.eventName] = (counts[e.eventName] || 0) + 1;
  }
  score = Math.min(100, score);
  const classification = classify(score);
  const existing = await IntentScore.findOne({ customerId });
  if (existing) {
    existing.score = score;
    existing.classification = classification;
    existing.signals = counts;
    await existing.save();
  } else {
    await IntentScore.create({
      scoreId: newId('INT'),
      customerId,
      score,
      classification,
      signals: counts,
    });
  }
  // Also persist on the customer for convenience
  await Customer.findOneAndUpdate({ customerId }, { $set: { intentScore: score } });
  return { score, classification, signals: counts };
}

async function getCustomerJourney(customerId) {
  const [events, sessions, score, customer] = await Promise.all([
    AnalyticsEvent.find({ customerId }).sort({ createdAt: -1 }).limit(50),
    Session.find({}).sort({ startTime: -1 }).limit(50),
    IntentScore.findOne({ customerId }),
    Customer.findOne({ customerId }),
  ]);
  return { events, sessions, score, customer };
}

async function getFunnel() {
  const totalCustomers = await Customer.countDocuments();
  const activeCount = await Customer.countDocuments({ status: 'active' });
  const scoreData = await IntentScore.aggregate([
    { $group: { _id: '$classification', count: { $sum: 1 } } },
  ]);
  return {
    totalCustomers,
    active: activeCount,
    byIntent: scoreData,
  };
}

module.exports = { startSession, trackEvent, recomputeIntentScore, getCustomerJourney, getFunnel, SIGNAL_WEIGHTS };
