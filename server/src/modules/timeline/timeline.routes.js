const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired } = require('../../middleware/auth');
const controller = require('./timeline.controller');

const router = express.Router();

router.post('/', authRequired, asyncHandler(controller.create));
router.get('/', authRequired, asyncHandler(controller.list));
router.get('/:id', authRequired, asyncHandler(controller.get));
router.put('/:id', authRequired, asyncHandler(controller.update));
router.patch('/:id/status', authRequired, asyncHandler(controller.setStatus));
router.delete('/:id', authRequired, asyncHandler(controller.remove));

module.exports = router;
