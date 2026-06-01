const express = require('express');
const { failsafePlan, volatilityPoints } = require('../data/hydrocomputeData');

const router = express.Router();

router.get('/failsafe-plan', (req, res) => {
  res.json({
    ...failsafePlan,
    volatilityPoints: volatilityPoints.filter((point) => point.subsystem === 'Failsafe shutdown trigger'),
  });
});

module.exports = router;
