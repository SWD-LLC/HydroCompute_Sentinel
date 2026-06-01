const express = require('express');
const { qcTracking, volatilityPoints } = require('../data/hydrocomputeData');

const router = express.Router();

router.get('/qc-tracking', (req, res) => {
  res.json({
    ...qcTracking,
    volatilityPoints: volatilityPoints.filter((point) =>
      ['Device drift', 'Biofouling', 'Signal interference', 'Telemetry loss', 'Manual inspection requirement'].includes(
        point.subsystem
      )
    ),
  });
});

module.exports = router;
