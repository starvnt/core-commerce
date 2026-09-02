const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authOptional } = require('../../middleware/auth');
const controller = require('./search.controller');

const router = express.Router();

// Public endpoints
router.get('/vendors', authOptional, asyncHandler(controller.search));
router.get('/featured', authOptional, asyncHandler(controller.featured));
router.get('/categories', authOptional, asyncHandler(controller.categories));

module.exports = router;
