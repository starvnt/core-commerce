const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired } = require('../../middleware/auth');
const controller = require('./quote.controller');

const router = express.Router();

router.post('/', authRequired, asyncHandler(controller.create));
router.get('/', authRequired, asyncHandler(controller.list));
router.get('/customer/:customerId', authRequired, asyncHandler((req, res) => controller.list({ ...req, query: { ...req.query, customerId: req.params.customerId } }, res)));
router.get('/inquiry/:inquiryId', authRequired, asyncHandler((req, res) => controller.list({ ...req, query: { ...req.query, inquiryId: req.params.inquiryId } }, res)));
router.get('/:id', authRequired, asyncHandler(controller.getById));
router.put('/:id', authRequired, asyncHandler(controller.update));
router.patch('/:id/status', authRequired, asyncHandler(controller.setStatus));
router.post('/:id/send', authRequired, asyncHandler(controller.send));
router.post('/:id/accept', authRequired, asyncHandler(controller.accept));
router.post('/:id/reject', authRequired, asyncHandler(controller.reject));

module.exports = router;
