const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired } = require('../../middleware/auth');
const controller = require('./tasks.controller');

const router = express.Router();

router.post('/', authRequired, asyncHandler(controller.create));
router.get('/', authRequired, asyncHandler(controller.list));
router.get('/customer/:customerId', authRequired, asyncHandler((req, res) => controller.list({ ...req, query: { ...req.query, customerId: req.params.customerId } }, res)));
router.get('/:id', authRequired, asyncHandler(controller.getById));
router.patch('/:id/status', authRequired, asyncHandler((req, res) => controller.update({ ...req, params: { id: req.params.id }, body: { status: req.body.status } }, res)));
router.put('/:id', authRequired, asyncHandler(controller.update));
router.delete('/:id', authRequired, asyncHandler(controller.remove));

module.exports = router;
