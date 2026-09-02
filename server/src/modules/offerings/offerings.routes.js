const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired, authOptional } = require('../../middleware/auth');
const controller = require('./offerings.controller');

const router = express.Router();

router.post('/', authRequired, asyncHandler(controller.create));
router.get('/', authOptional, asyncHandler(controller.list));
router.get('/:id', authOptional, asyncHandler(controller.getById));
router.put('/:id', authRequired, asyncHandler(controller.update));
router.delete('/:id', authRequired, asyncHandler(controller.remove));

module.exports = router;
