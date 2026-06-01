const express = require('express');
const { systemStatus } = require('../data/hydrocomputeData');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'HydroCompute Intelligence API',
    timestamp: new Date().toISOString(),
  });
});

router.get('/system-status', (req, res) => {
  res.json({
    ...systemStatus,
    generatedAt: new Date().toISOString(),
  });
});

module.exports = router;
