const express = require('express');
const path = require('path');
const fs = require('fs');

const systemRoutes = require('./routes/system');
const waterRoutes = require('./routes/water');
const qcTrackingRoutes = require('./routes/qcTracking');
const computeRoutes = require('./routes/compute');
const failsafeRoutes = require('./routes/failsafe');
const riskRoutes = require('./routes/risk');
const telemetryRoutes = require('./routes/telemetry');
const requestLogger = require('./middleware/requestLogger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(requestLogger);

if (process.env.ENABLE_CORS === 'true' || process.env.STACKBLITZ === 'true' || process.env.WEB_CONTAINER === 'true') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    return next();
  });
}

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/', (req, res) => {
  res.json({
    service: 'HydroCompute Intelligence API',
    status: 'operational',
    docs: '/api/health',
    dashboard: '/dashboard',
    routes: [
      'GET /',
      'GET /dashboard',
      'GET /api/health',
      'GET /api/system-status',
      'GET /api/water-volatility',
      'GET /api/qc-tracking',
      'GET /api/compute-load',
      'GET /api/failsafe-plan',
      'GET /api/risk-dashboard',
      'GET /api/volatility-points',
      'GET /api/telemetry-analysis',
    ],
  });
});

app.use('/api', systemRoutes);
app.use('/api', waterRoutes);
app.use('/api', qcTrackingRoutes);
app.use('/api', computeRoutes);
app.use('/api', failsafeRoutes);
app.use('/api', riskRoutes);
app.use('/api', telemetryRoutes);

// Compatibility aliases for likely frontend/API service naming variants.
app.use('/api/system', systemRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/qc', qcTrackingRoutes);
app.use('/api/compute', computeRoutes);
app.use('/api/failsafe', failsafeRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/telemetry', telemetryRoutes);

const staticCandidates = ['dist', 'build', 'public'];
for (const directory of staticCandidates) {
  const staticPath = path.join(__dirname, directory);
  if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));
  }
}

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`HydroCompute Intelligence API listening on port ${PORT}`);
});

module.exports = app;
