const mongoose = require('mongoose');
const { Schema } = mongoose;

const visitorSchema = new Schema(
  {
    visitorId: { type: String, required: true, unique: true, index: true },
    firstTouchSource: { type: String, default: 'direct' },
    firstTouchMedium: { type: String, default: 'none' },
    firstTouchCampaign: { type: String, default: null },
    firstTouchReferral: { type: String, default: null },
    firstTouchTimestamp: { type: Date, default: () => new Date() },
    lastTouchSource: { type: String, default: 'direct' },
    lastTouchTimestamp: { type: Date, default: () => new Date() },
    leadId: { type: String, default: null, index: true },
    customerId: { type: String, default: null, index: true },
  },
  { timestamps: true, versionKey: false },
);

const sessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    visitorId: { type: String, required: true, index: true },
    startTime: { type: Date, default: () => new Date() },
    endTime: { type: Date, default: null },
    landingPage: { type: String, default: '' },
    referrer: { type: String, default: '' },
    utmSource: { type: String, default: null },
    utmMedium: { type: String, default: null },
    utmCampaign: { type: String, default: null },
    device: { type: String, default: 'desktop' },
    country: { type: String, default: '' },
    city: { type: String, default: '' },
    pageViews: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

const eventSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    eventName: { type: String, required: true, index: true },
    eventVersion: { type: String, default: '1.0' },
    visitorId: { type: String, default: null, index: true },
    sessionId: { type: String, default: null, index: true },
    customerId: { type: String, default: null, index: true },
    leadId: { type: String, default: null, index: true },
    pagePath: { type: String, default: null },
    referrer: { type: String, default: null },
    utmSource: { type: String, default: null },
    utmMedium: { type: String, default: null },
    utmCampaign: { type: String, default: null },
    utmContent: { type: String, default: null },
    utmTerm: { type: String, default: null },
    referralId: { type: String, default: null },
    serviceId: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false },
);

const intentScoreSchema = new Schema(
  {
    scoreId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    score: { type: Number, default: 0, min: 0, max: 100 },
    classification: {
      type: String,
      enum: ['LOW_INTENT', 'INTERESTED', 'HIGH_INTENT', 'HOT_LEAD'],
      default: 'LOW_INTENT',
      index: true,
    },
    signals: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false },
);

const Visitor = mongoose.model('Visitor', visitorSchema);
const Session = mongoose.model('Session', sessionSchema);
const AnalyticsEvent = mongoose.model('AnalyticsEvent', eventSchema);
const IntentScore = mongoose.model('IntentScore', intentScoreSchema);

module.exports = { Visitor, Session, AnalyticsEvent, IntentScore };
