const express = require('express');

const customers = require('../modules/customers');
const identity = require('../modules/identity');
const offerings = require('../modules/offerings');
const inquiries = require('../modules/inquiries');
const quotes = require('../modules/quotes');
const bookings = require('../modules/bookings');
const payments = require('../modules/payments');
const analytics = require('../modules/analytics');
const tasks = require('../modules/tasks');
const notes = require('../modules/notes');
const budget = require('../modules/budget');
const messages = require('../modules/messages');
const documents = require('../modules/documents');
const guests = require('../modules/guests');
const timeline = require('../modules/timeline');
const events = require('../modules/events');
const search = require('../modules/search');
const reviews = require('../modules/reviews');
const notifications = require('../modules/notifications');
const activity = require('../modules/activity');
const audit = require('../modules/audit');
const outbox = require('../modules/outbox');
const automation = require('../modules/automation');
const followups = require('../modules/followups');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.use('/customers', customers.router);
router.use('/identity', identity.router);
router.use('/offerings', offerings.router);
router.use('/inquiries', inquiries.router);
router.use('/quotes', quotes.router);
router.use('/bookings', bookings.router);
router.use('/payments', payments.router);
router.use('/analytics', analytics.router);
router.use('/tasks', tasks.router);
router.use('/notes', notes.router);
router.use('/budget', budget.router);
router.use('/messages', messages.router);
router.use('/documents', documents.router);
router.use('/guests', guests.router);
router.use('/timeline', timeline.router);
router.use('/events', events.router);
router.use('/search', search.router);
router.use('/reviews', reviews.router);
router.use('/notifications', notifications.router);
router.use('/activity', activity.router);
router.use('/audit', audit.router);
router.use('/outbox', outbox.router);
router.use('/automation', automation.router);
router.use('/followups', followups.router);

module.exports = router;
