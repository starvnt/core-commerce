const analytics = require('./analytics.service');

async function track(req, res) {
  const event = await analytics.trackEvent(req.body);
  if (req.body.customerId) {
    try { await analytics.recomputeIntentScore(req.body.customerId); } catch (e) { /* non-blocking */ }
  }
  res.status(201).json({ success: true, data: event });
}

async function session(req, res) {
  const result = await analytics.startSession(req.body);
  res.status(201).json({ success: true, data: result });
}

async function journey(req, res) {
  const data = await analytics.getCustomerJourney(req.params.customerId);
  res.json({ success: true, data });
}

async function intent(req, res) {
  const result = await analytics.recomputeIntentScore(req.params.customerId);
  res.json({ success: true, data: result });
}

async function funnel(_req, res) {
  const data = await analytics.getFunnel();
  res.json({ success: true, data });
}

async function overview(_req, res) {
  const [visitors, sessions, customers, leads] = await Promise.all([
    require('./analytics.model').Visitor.countDocuments(),
    require('./analytics.model').Session.countDocuments(),
    require('../customers/customer.model').countDocuments(),
    require('../inquiries/inquiry.model').countDocuments(),
  ]);
  res.json({
    success: true,
    data: { visitors, sessions, leads, customers },
  });
}

async function intentDistribution(_req, res) {
  const data = await require('./analytics.model').IntentScore.aggregate([
    { $group: { _id: '$classification', count: { $sum: 1 } } },
  ]);
  const out = {};
  for (const d of data) out[d._id] = d.count;
  res.json({ success: true, data: out });
}

module.exports = { track, session, journey, intent, funnel, overview, intentDistribution };
