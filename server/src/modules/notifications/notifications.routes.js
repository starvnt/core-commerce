const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired } = require('../../middleware/auth');
const controller = require('./notifications.controller');

const router = express.Router();

router.get('/', authRequired, asyncHandler(controller.list));
router.get('/unread-count', authRequired, asyncHandler(controller.unread));
router.post('/mark-all-read', authRequired, asyncHandler(controller.markAll));
router.patch('/:id/read', authRequired, asyncHandler(controller.markRead));

module.exports = router;
