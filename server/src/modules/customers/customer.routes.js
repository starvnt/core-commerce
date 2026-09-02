const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired, authOptional } = require('../../middleware/auth');
const controller = require('./customer.controller');

const router = express.Router();

router.post('/', authOptional, asyncHandler(controller.create));
router.get('/', authRequired, asyncHandler(controller.list));
router.get('/by-user/:userId', authRequired, asyncHandler(controller.getByUser));
router.get('/:id', authRequired, asyncHandler(controller.getById));
router.put('/:id', authRequired, asyncHandler(controller.update));
router.delete('/:id', authRequired, asyncHandler(controller.remove));

module.exports = router;
