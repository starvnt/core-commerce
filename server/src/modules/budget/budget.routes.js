const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired } = require('../../middleware/auth');
const controller = require('./budget.controller');

const router = express.Router();

router.get('/customer/:customerId', authRequired, asyncHandler(controller.getForCustomer));
router.post('/customer/:customerId/allocate', authRequired, asyncHandler(controller.upsertAllocation));
router.put('/customer/:customerId', authRequired, asyncHandler(controller.updateBudget));
router.delete('/customer/:customerId/allocate/:categoryId', authRequired, asyncHandler(controller.removeAllocation));

module.exports = router;
