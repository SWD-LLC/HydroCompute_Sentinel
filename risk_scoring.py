from dataclasses import dataclass
from typing import Dict, Tuple


@dataclass
class FacilityScenario:
    facility_mw: float
    cooling_type: str
    season: str
    infrastructure_redundancy: float = 50.0

    def thermal_load_risk(self) -> float:
        return max(0.0, min(self.facility_mw / 5.0, 100.0))

    def water_withdrawal_risk(self) -> float:
        mapping = {
            "once-through": 90.0,
            "evaporative": 70.0,
            "hybrid": 50.0,
            "dry": 10.0,
            "closed-loop": 35.0,
            "direct-to-chip": 25.0,
        }
        return mapping.get(self.cooling_type.lower(), 50.0)

    def seasonal_stress(self) -> float:
        mapping = {
            "summer": 80.0,
            "spring": 40.0,
            "fall": 50.0,
            "autumn": 50.0,
            "winter": 20.0,
        }
        return mapping.get(self.season.lower(), 50.0)

    def infrastructure_risk(self) -> float:
        return 100.0 - max(0.0, min(self.infrastructure_redundancy, 100.0))


def composite_risk_score(scenario: FacilityScenario) -> Tuple[float, Dict[str, float]]:
    components = {
        "thermal_load": scenario.thermal_load_risk(),
        "water_withdrawal": scenario.water_withdrawal_risk(),
        "seasonal_stress": scenario.seasonal_stress(),
        "infrastructure_risk": scenario.infrastructure_risk(),
    }
    score = (
        components["thermal_load"] * 0.35
        + components["water_withdrawal"] * 0.25
        + components["seasonal_stress"] * 0.20
        + components["infrastructure_risk"] * 0.20
    )
    return round(score, 2), components


def classify_score(score: float) -> str:
    if score < 40:
        return "Safe"
    if score < 70:
        return "Managed Risk"
    if score <= 100:
        return "Regulatory Stress"
    return "Overload"


def compute_mshdi(scenario: FacilityScenario) -> float:
    base = min(scenario.facility_mw / 5.0, 100.0)
    modifier = scenario.seasonal_stress() / 2.0
    return round(base + modifier, 2)


def score_summary(scenario: FacilityScenario) -> Dict[str, object]:
    score, components = composite_risk_score(scenario)
    return {
        "composite_risk_score": score,
        "classification": classify_score(score),
        "mshdi": compute_mshdi(scenario),
        "components": components,
        "human_review_required": True,
    }
