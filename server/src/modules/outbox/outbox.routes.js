const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired, requireRole } = require('../../middleware/auth');
const controller = require('./outbox.controller');

const router = express.Router();

// Admin-only operations
router.get('/', authRequired, requireRole('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.listPending));
router.get('/stats', authRequired, requireRole('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.stats));
router.get('/:eventId', authRequired, requireRole('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.get));
router.post('/:eventId/retry', authRequired, requireRole('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.retry));

module.exports = router;
