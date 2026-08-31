const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const controller = require('./customer.controller');

const router = express.Router();

router.post('/', asyncHandler(controller.create));
router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

module.exports = router;
