const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired } = require('../../middleware/auth');
const controller = require('./followups.controller');

const router = express.Router();

router.post('/', authRequired, asyncHandler(controller.create));
router.get('/', authRequired, asyncHandler(controller.list));
router.get('/:id', authRequired, asyncHandler(controller.getById));
router.put('/:id', authRequired, asyncHandler(controller.update));
router.delete('/:id', authRequired, asyncHandler(controller.remove));

module.exports = router;
