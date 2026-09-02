const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authRequired } = require('../../middleware/auth');
const controller = require('./identity.controller');

const router = express.Router();

router.post('/auth/register', asyncHandler(controller.register));
router.post('/auth/login', asyncHandler(controller.login));
router.get('/auth/me', authRequired, asyncHandler(controller.me));
router.get('/users', authRequired, asyncHandler(controller.listUsers));

router.post('/organizations', authRequired, asyncHandler(controller.createOrganization));
router.get('/organizations', asyncHandler(controller.listOrganizations));
router.get('/organizations/:id', asyncHandler(controller.getOrganization));
router.put('/organizations/:id', authRequired, asyncHandler(controller.updateOrganization));

module.exports = router;
