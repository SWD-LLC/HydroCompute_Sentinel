const express = require('express');
const { getRiskDashboard } = require('../data/hydrocomputeData');

const router = express.Router();

router.get('/risk-dashboard', (req, res) => {
  res.json(getRiskDashboard());
});

module.exports = router;
