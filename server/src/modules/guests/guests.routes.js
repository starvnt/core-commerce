const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired } = require('../../middleware/auth');
const controller = require('./guests.controller');

const router = express.Router();

router.post('/', authRequired, asyncHandler(controller.create));
router.post('/bulk', authRequired, asyncHandler(controller.bulk));
router.get('/', authRequired, asyncHandler(controller.list));
router.get('/customer/:customerId/summary', authRequired, asyncHandler(controller.summary));
router.get('/:id', authRequired, asyncHandler(controller.get));
router.put('/:id', authRequired, asyncHandler(controller.update));
router.patch('/:id/rsvp', authRequired, asyncHandler(controller.setRsvp));
router.delete('/:id', authRequired, asyncHandler(controller.remove));

module.exports = router;
