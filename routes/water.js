const express = require('express');
const { waterEnvironment, volatilityPoints } = require('../data/hydrocomputeData');

const router = express.Router();

router.get('/water-volatility', (req, res) => {
  res.json({
    ...waterEnvironment,
    volatilityPoints: volatilityPoints.filter((point) =>
      ['High-capacity water environment', 'River turbidity', 'Flood surge', 'Sediment occlusion', 'Biofouling'].includes(
        point.subsystem
      )
    ),
  });
});

router.get('/volatility-points', (req, res) => {
  res.json({
    total: volatilityPoints.length,
    volatilityPoints,
  });
});

module.exports = router;
