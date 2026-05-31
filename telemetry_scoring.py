from dataclasses import dataclass
from typing import Dict


@dataclass
class TelemetryReadingQuality:
    sensor_health: float
    calibration_freshness: float
    sensor_agreement: float
    communication_integrity: float
    environmental_plausibility: float
    power_health: float


def _clamp(value: float) -> float:
    return max(0.0, min(float(value), 100.0))


def qc_confidence_score(q: TelemetryReadingQuality) -> Dict[str, object]:
    components = {
        "sensor_health": _clamp(q.sensor_health),
        "calibration_freshness": _clamp(q.calibration_freshness),
        "sensor_agreement": _clamp(q.sensor_agreement),
        "communication_integrity": _clamp(q.communication_integrity),
        "environmental_plausibility": _clamp(q.environmental_plausibility),
        "power_health": _clamp(q.power_health),
    }
    score = (
        components["sensor_health"] * 0.25
        + components["calibration_freshness"] * 0.20
        + components["sensor_agreement"] * 0.20
        + components["communication_integrity"] * 0.15
        + components["environmental_plausibility"] * 0.15
        + components["power_health"] * 0.05
    )
    return {
        "score": round(score, 2),
        "classification": classify_qc(score),
        "components": components,
        "human_review_required": score < 85,
    }


def classify_qc(score: float) -> str:
    if score >= 85:
        return "Trusted"
    if score >= 70:
        return "Usable with caution"
    if score >= 50:
        return "Human review required"
    return "Reject / maintenance required"


@dataclass
class TelemetrySystemQuality:
    sensor_health: float
    calibration_freshness: float
    communication_reliability: float
    power_stability: float
    environmental_hardening: float
    redundancy_coverage: float


def field_telemetry_integrity_score(q: TelemetrySystemQuality) -> Dict[str, object]:
    components = {
        "sensor_health": _clamp(q.sensor_health),
        "calibration_freshness": _clamp(q.calibration_freshness),
        "communication_reliability": _clamp(q.communication_reliability),
        "power_stability": _clamp(q.power_stability),
        "environmental_hardening": _clamp(q.environmental_hardening),
        "redundancy_coverage": _clamp(q.redundancy_coverage),
    }
    score = (
        components["sensor_health"] * 0.25
        + components["calibration_freshness"] * 0.20
        + components["communication_reliability"] * 0.15
        + components["power_stability"] * 0.15
        + components["environmental_hardening"] * 0.15
        + components["redundancy_coverage"] * 0.10
    )
    return {
        "score": round(score, 2),
        "classification": classify_fti(score),
        "components": components,
        "human_review_required": score < 85,
    }


def classify_fti(score: float) -> str:
    if score >= 85:
        return "Field Ready"
    if score >= 70:
        return "Deployable with monitoring"
    if score >= 50:
        return "Pilot only"
    return "Not reliable for decision support"
