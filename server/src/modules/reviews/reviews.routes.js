const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired, authOptional } = require('../../middleware/auth');
const controller = require('./reviews.controller');

const router = express.Router();

router.post('/', authRequired, asyncHandler(controller.create));
router.get('/', authOptional, asyncHandler(controller.list));
router.get('/summary/:organizationId', authOptional, asyncHandler(controller.summary));

module.exports = router;
