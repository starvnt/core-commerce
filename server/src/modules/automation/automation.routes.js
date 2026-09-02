const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired, requireRole } = require('../../middleware/auth');
const controller = require('./automation.controller');

const router = express.Router();

router.get('/rules', authRequired, asyncHandler(controller.listRules));
router.get('/logs', authRequired, requireRole('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.listLogs));
router.get('/stats', authRequired, requireRole('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.stats));

module.exports = router;
