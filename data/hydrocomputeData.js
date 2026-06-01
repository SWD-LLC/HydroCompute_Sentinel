const { normalizeRiskItem, sortByRiskScoreDesc } = require('../utils/riskScoring');

const systemStatus = {
  platform: 'HydroCompute Intelligence',
  environment: 'mock-infrastructure-preview',
  status: 'operational',
  generatedAt: new Date().toISOString(),
  monitoringScope: [
    'High-capacity water environment',
    'Compute load',
    'QC tracking devices',
    'Volatility points',
    'Risk conditions',
    'Failsafe response layers',
  ],
  activeSites: 3,
  telemetryIntegrity: 0.86,
  apiVersion: '1.0.0',
};

const waterEnvironment = {
  status: 'watch',
  capacityUtilization: 0.71,
  thermalHeadroom: 0.38,
  intakeFlowStability: 0.82,
  dischargeComplianceConfidence: 0.79,
  categories: [
    {
      name: 'High-capacity water environment',
      status: 'watch',
      measurement: 'Regional cooling withdrawal operating at 71% modeled carrying capacity.',
    },
    {
      name: 'River turbidity',
      status: 'elevated',
      measurement: 'Turbidity trending above seasonal baseline after upstream rainfall.',
    },
    {
      name: 'Flood surge',
      status: 'watch',
      measurement: 'Hydrologic forecast shows moderate surge potential in 36-48 hours.',
    },
    {
      name: 'Sediment occlusion',
      status: 'elevated',
      measurement: 'Intake filter differential pressure indicates partial sediment occlusion.',
    },
    {
      name: 'Biofouling',
      status: 'watch',
      measurement: 'Biofilm growth indicator increasing at remote sensor cluster B.',
    },
  ],
};

const qcTracking = {
  status: 'degraded-watch',
  deviceCount: 42,
  healthyDevices: 35,
  reviewDevices: 5,
  offlineDevices: 2,
  categories: [
    {
      name: 'Device drift',
      status: 'watch',
      detail: 'Three pH probes exceed calibration-age guidance by more than 10 days.',
    },
    {
      name: 'Signal interference',
      status: 'elevated',
      detail: 'Gateway packet jitter observed near pump-control cabinet.',
    },
    {
      name: 'Telemetry loss',
      status: 'elevated',
      detail: 'Two telemetry nodes missed the last three reporting windows.',
    },
    {
      name: 'Manual inspection requirement',
      status: 'required',
      detail: 'Field inspection recommended for intake rack and turbidity sensor cluster.',
    },
  ],
};

const computeLoad = {
  status: 'managed-risk',
  currentMw: 312,
  plannedMw: 400,
  utilization: 0.78,
  coolingDemandIndex: 0.74,
  categories: [
    {
      name: 'Compute load spike',
      status: 'elevated',
      detail: 'Training workload burst projected to add 52 MW during peak thermal window.',
    },
    {
      name: 'Cooling dependency',
      status: 'watch',
      detail: 'Evaporative cooling dependency remains high during seasonal low-flow period.',
    },
    {
      name: 'Power degradation',
      status: 'watch',
      detail: 'Substation redundancy margin narrows if cooling pumps shift to backup circuit.',
    },
  ],
};

const failsafePlan = {
  status: 'armed',
  categories: [
    {
      name: 'Failsafe shutdown trigger',
      status: 'armed',
      trigger: 'Initiate staged compute shedding if river intake stability drops below 0.62 for 15 minutes.',
    },
  ],
  responseLayers: [
    {
      layer: 1,
      name: 'Telemetry validation',
      action: 'Cross-check turbidity, intake pressure, and gateway heartbeat before automated mitigation.',
    },
    {
      layer: 2,
      name: 'Cooling demand reduction',
      action: 'Throttle non-critical compute queues and increase dry-cooling share where available.',
    },
    {
      layer: 3,
      name: 'Human approval checkpoint',
      action: 'Notify operations lead, water compliance officer, and site reliability manager.',
    },
    {
      layer: 4,
      name: 'Staged shutdown',
      action: 'Suspend flexible workloads before protected infrastructure and emergency services workloads.',
    },
  ],
};

const rawVolatilityPoints = [
  {
    id: 'HCWE-001',
    subsystem: 'High-capacity water environment',
    status: 'watch',
    likelihood: 0.66,
    impact: 0.82,
    detectability: 0.42,
    mitigationLeverage: 0.34,
    detectionSignal: 'Thermal headroom and withdrawal capacity trend below modeled safe operating envelope.',
    mitigation: 'Reduce peak cooling load, rebalance withdrawal timing, and validate discharge temperature compliance.',
    escalationPath: 'Water operations lead -> environmental compliance officer -> incident commander',
  },
  {
    id: 'WTR-002',
    subsystem: 'River turbidity',
    status: 'elevated',
    likelihood: 0.74,
    impact: 0.61,
    detectability: 0.35,
    mitigationLeverage: 0.4,
    detectionSignal: 'Nephelometric turbidity units exceed rolling seasonal baseline at intake sensor B.',
    mitigation: 'Increase filtration checks and temporarily reduce intake velocity during high-sediment periods.',
    escalationPath: 'Field technician -> water quality lead -> operations manager',
  },
  {
    id: 'WTR-003',
    subsystem: 'Flood surge',
    status: 'watch',
    likelihood: 0.58,
    impact: 0.76,
    detectability: 0.52,
    mitigationLeverage: 0.45,
    detectionSignal: 'Upstream gauge forecast indicates elevated flow and debris-loading probability.',
    mitigation: 'Pre-stage debris screens, verify pump-room flood barriers, and shift flexible workloads off peak.',
    escalationPath: 'Hydrology analyst -> site reliability manager -> emergency response lead',
  },
  {
    id: 'WTR-004',
    subsystem: 'Sediment occlusion',
    status: 'elevated',
    likelihood: 0.71,
    impact: 0.68,
    detectability: 0.31,
    mitigationLeverage: 0.36,
    detectionSignal: 'Filter differential pressure and pump amperage show occlusion signature.',
    mitigation: 'Dispatch intake cleaning crew and switch to redundant intake path during inspection.',
    escalationPath: 'Mechanical supervisor -> water operations lead -> site operations director',
  },
  {
    id: 'QC-005',
    subsystem: 'Device drift',
    status: 'watch',
    likelihood: 0.57,
    impact: 0.5,
    detectability: 0.4,
    mitigationLeverage: 0.62,
    detectionSignal: 'Calibration age and reference sample deltas suggest sensor drift.',
    mitigation: 'Recalibrate affected probes and temporarily lower confidence weighting for stale readings.',
    escalationPath: 'QC technician -> telemetry integrity lead',
  },
  {
    id: 'QC-006',
    subsystem: 'Biofouling',
    status: 'watch',
    likelihood: 0.63,
    impact: 0.56,
    detectability: 0.45,
    mitigationLeverage: 0.5,
    detectionSignal: 'Conductivity and dissolved oxygen residuals indicate biofilm accumulation near probe housing.',
    mitigation: 'Schedule probe cleaning and compare against manual grab samples.',
    escalationPath: 'Field technician -> water quality lead',
  },
  {
    id: 'QC-007',
    subsystem: 'Signal interference',
    status: 'elevated',
    likelihood: 0.69,
    impact: 0.59,
    detectability: 0.38,
    mitigationLeverage: 0.47,
    detectionSignal: 'Packet jitter and RSSI instability correlate with pump-control cabinet cycles.',
    mitigation: 'Move gateway antenna, shield cables, and add redundant telemetry handoff.',
    escalationPath: 'Network engineer -> telemetry integrity lead -> operations manager',
  },
  {
    id: 'QC-008',
    subsystem: 'Telemetry loss',
    status: 'elevated',
    likelihood: 0.94,
    impact: 0.94,
    detectability: 0.12,
    mitigationLeverage: 0.17,
    detectionSignal: 'Two sensor nodes missed three consecutive reporting windows.',
    mitigation: 'Fail over to secondary gateway and dispatch field validation for missing telemetry segment.',
    escalationPath: 'Telemetry integrity lead -> site reliability manager -> compliance officer',
  },
  {
    id: 'CMP-009',
    subsystem: 'Compute load spike',
    status: 'elevated',
    likelihood: 0.88,
    impact: 0.87,
    detectability: 0.24,
    mitigationLeverage: 0.22,
    detectionSignal: 'Scheduled training jobs exceed modeled cooling budget during warm-water interval.',
    mitigation: 'Throttle opportunistic workloads and defer non-critical training to lower thermal stress windows.',
    escalationPath: 'SRE lead -> compute operations director -> executive duty officer',
  },
  {
    id: 'CMP-010',
    subsystem: 'Cooling dependency',
    status: 'watch',
    likelihood: 0.78,
    impact: 0.83,
    detectability: 0.26,
    mitigationLeverage: 0.28,
    detectionSignal: 'Evaporative cooling share remains high while river thermal headroom tightens.',
    mitigation: 'Increase dry-cooling contribution and activate workload-aware cooling demand forecast.',
    escalationPath: 'Cooling systems lead -> SRE lead -> site operations director',
  },
  {
    id: 'PWR-011',
    subsystem: 'Power degradation',
    status: 'watch',
    likelihood: 0.52,
    impact: 0.81,
    detectability: 0.5,
    mitigationLeverage: 0.38,
    detectionSignal: 'Backup circuit margin narrows under pump failover scenario.',
    mitigation: 'Verify generator readiness, defer maintenance on redundant feeders, and lower non-critical load.',
    escalationPath: 'Electrical lead -> site reliability manager -> utility liaison',
  },
  {
    id: 'OPS-012',
    subsystem: 'Manual inspection requirement',
    status: 'required',
    likelihood: 0.62,
    impact: 0.63,
    detectability: 0.33,
    mitigationLeverage: 0.58,
    detectionSignal: 'Model confidence drops due to combined intake pressure and stale calibration flags.',
    mitigation: 'Send field team for physical intake, filter, and sensor inspection.',
    escalationPath: 'Operations dispatcher -> field inspection lead -> compliance officer',
  },
  {
    id: 'FLS-013',
    subsystem: 'Failsafe shutdown trigger',
    status: 'armed',
    likelihood: 0.49,
    impact: 0.9,
    detectability: 0.46,
    mitigationLeverage: 0.27,
    detectionSignal: 'Compound risk threshold approaches staged compute-shedding trigger.',
    mitigation: 'Confirm automated runbook, notify human approvers, and pre-stage workload migration.',
    escalationPath: 'Incident commander -> executive duty officer -> public agency liaison',
  },
];

const volatilityPoints = sortByRiskScoreDesc(rawVolatilityPoints.map(normalizeRiskItem));

function getRiskDashboard() {
  const counts = volatilityPoints.reduce(
    (summary, item) => {
      summary[item.priority] += 1;
      return summary;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );

  const highestPriorityRisk = volatilityPoints[0] || null;
  const overallStatus = counts.critical > 0 ? 'critical' : counts.high > 0 ? 'high-watch' : 'stable-watch';

  return {
    overallStatus,
    highestPriorityRisk,
    totalRisks: volatilityPoints.length,
    criticalCount: counts.critical,
    highCount: counts.high,
    mediumCount: counts.medium,
    lowCount: counts.low,
    recommendedNextActions: [
      'Dispatch field inspection for telemetry-loss and sediment-occlusion signals.',
      'Throttle flexible compute workloads during high thermal and turbidity windows.',
      'Validate failsafe runbook owners and human approval contacts before the next peak load interval.',
      'Recalibrate drift-prone QC devices and compare automated readings against manual samples.',
    ],
    volatilityPoints,
  };
}

module.exports = {
  systemStatus,
  waterEnvironment,
  qcTracking,
  computeLoad,
  failsafePlan,
  volatilityPoints,
  getRiskDashboard,
};
