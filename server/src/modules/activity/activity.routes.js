const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired } = require('../../middleware/auth');
const controller = require('./activity.controller');

const router = express.Router();

router.get('/timeline/:entityType/:entityId', authRequired, asyncHandler(controller.timeline));
router.get('/recent', authRequired, asyncHandler(controller.recent));
// Convenience routes: short-form patterns the frontend uses
router.get('/customer/:customerId', authRequired, asyncHandler((req, res) => controller.timeline({ ...req, params: { entityType: 'CUSTOMER', entityId: req.params.customerId } }, res)));
router.get('/inquiry/:inquiryId', authRequired, asyncHandler((req, res) => controller.timeline({ ...req, params: { entityType: 'INQUIRY', entityId: req.params.inquiryId } }, res)));
router.get('/quote/:quoteId', authRequired, asyncHandler((req, res) => controller.timeline({ ...req, params: { entityType: 'QUOTE', entityId: req.params.quoteId } }, res)));
router.get('/booking/:bookingId', authRequired, asyncHandler((req, res) => controller.timeline({ ...req, params: { entityType: 'BOOKING', entityId: req.params.bookingId } }, res)));

module.exports = router;
