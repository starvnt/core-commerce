const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired, authOptional } = require('../../middleware/auth');
const controller = require('./messages.controller');

const router = express.Router();

// Auth-optional for send (customers may not be logged in for first contact)
router.post('/', authOptional, asyncHandler(controller.send));

router.get('/thread/:threadId', authRequired, asyncHandler(controller.listThread));
router.post('/thread/:threadId/read', authRequired, asyncHandler(controller.markRead));
router.get('/customer/:customerId', authRequired, asyncHandler(controller.listForCustomer));

module.exports = router;
