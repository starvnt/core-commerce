const express = require('express');
const customers = require('../modules/customers');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', uptime: process.uptime() });
});

router.use('/customers', customers.router);

module.exports = router;
