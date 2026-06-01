const express = require('express');
const { computeLoad, volatilityPoints } = require('../data/hydrocomputeData');

const router = express.Router();

router.get('/compute-load', (req, res) => {
  res.json({
    ...computeLoad,
    volatilityPoints: volatilityPoints.filter((point) =>
      ['Compute load spike', 'Cooling dependency', 'Power degradation'].includes(point.subsystem)
    ),
  });
});

module.exports = router;
