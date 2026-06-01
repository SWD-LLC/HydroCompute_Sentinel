const PRIORITY_THRESHOLDS = {
  critical: 0.6,
  high: 0.35,
  medium: 0.18,
};

function clampScore(value) {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return 0;
  }

  return Math.min(1, Math.max(0, numberValue));
}

function calculateRiskScore({ likelihood, impact, detectability, mitigationLeverage }) {
  const normalizedLikelihood = clampScore(likelihood);
  const normalizedImpact = clampScore(impact);
  const normalizedDetectability = clampScore(detectability);
  const normalizedMitigationLeverage = clampScore(mitigationLeverage);

  const score =
    normalizedLikelihood *
    normalizedImpact *
    (1 - normalizedDetectability) *
    (1 - normalizedMitigationLeverage);

  return Number(score.toFixed(4));
}

function getPriority(riskScore) {
  if (riskScore >= PRIORITY_THRESHOLDS.critical) {
    return 'critical';
  }

  if (riskScore >= PRIORITY_THRESHOLDS.high) {
    return 'high';
  }

  if (riskScore >= PRIORITY_THRESHOLDS.medium) {
    return 'medium';
  }

  return 'low';
}

function normalizeRiskItem(item) {
  const likelihood = clampScore(item.likelihood);
  const impact = clampScore(item.impact);
  const detectability = clampScore(item.detectability);
  const mitigationLeverage = clampScore(item.mitigationLeverage);
  const riskScore = calculateRiskScore({
    likelihood,
    impact,
    detectability,
    mitigationLeverage,
  });

  return {
    ...item,
    likelihood,
    impact,
    detectability,
    mitigationLeverage,
    riskScore,
    priority: getPriority(riskScore),
  };
}

function sortByRiskScoreDesc(items) {
  return [...items].sort((a, b) => b.riskScore - a.riskScore);
}

module.exports = {
  calculateRiskScore,
  getPriority,
  normalizeRiskItem,
  sortByRiskScoreDesc,
};
