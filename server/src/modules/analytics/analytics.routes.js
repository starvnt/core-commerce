const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired, authOptional } = require('../../middleware/auth');
const controller = require('./analytics.controller');

const router = express.Router();

router.post('/events', authOptional, asyncHandler(controller.track));
router.post('/sessions', authOptional, asyncHandler(controller.session));
router.get('/journey/:customerId', authRequired, asyncHandler(controller.journey));
router.post('/intent/:customerId', authRequired, asyncHandler(controller.intent));
router.get('/funnel', authRequired, asyncHandler(controller.funnel));
router.get('/overview', authRequired, asyncHandler(controller.overview));
router.get('/intent-distribution', authRequired, asyncHandler(controller.intentDistribution));

module.exports = router;
