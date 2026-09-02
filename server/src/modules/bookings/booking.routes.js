const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired } = require('../../middleware/auth');
const controller = require('./booking.controller');

const router = express.Router();

router.post('/', authRequired, asyncHandler(controller.create));
router.get('/', authRequired, asyncHandler(controller.list));
router.get('/customer/:customerId', authRequired, asyncHandler((req, res) => controller.list({ ...req, query: { ...req.query, customerId: req.params.customerId } }, res)));
router.get('/:id', authRequired, asyncHandler(controller.getById));
router.patch('/:id/status', authRequired, asyncHandler(controller.transition));
router.post('/:id/transition', authRequired, asyncHandler(controller.transition));

module.exports = router;
