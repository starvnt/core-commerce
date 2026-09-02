const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired } = require('../../middleware/auth');
const controller = require('./documents.controller');

const router = express.Router();

router.post('/', authRequired, asyncHandler(controller.create));
router.get('/', authRequired, asyncHandler(controller.list));
router.get('/customer/:customerId', authRequired, asyncHandler(controller.listForCustomer));
router.get('/:id', authRequired, asyncHandler(controller.get));
router.patch('/:id/status', authRequired, asyncHandler(controller.updateStatus));
router.delete('/:id', authRequired, asyncHandler(controller.remove));

module.exports = router;
