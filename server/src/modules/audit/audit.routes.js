const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired } = require('../../middleware/auth');
const controller = require('./audit.controller');

const router = express.Router();

router.get('/entity/:entityType/:entityId', authRequired, asyncHandler(controller.forEntity));
router.get('/recent', authRequired, asyncHandler(controller.recent));
router.get('/', authRequired, asyncHandler(controller.query));

module.exports = router;
