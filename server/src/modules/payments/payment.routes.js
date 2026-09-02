const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired } = require('../../middleware/auth');
const controller = require('./payment.controller');

const router = express.Router();

router.post('/', authRequired, asyncHandler(controller.create));
router.get('/', authRequired, asyncHandler(controller.list));
router.get('/:id', authRequired, asyncHandler(controller.getById));
router.post('/:id/capture', authRequired, asyncHandler(controller.capture));
router.post('/:id/refund', authRequired, asyncHandler(controller.refund));

module.exports = router;
