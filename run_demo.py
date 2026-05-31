from hydrocompute.agents.risk_scoring import FacilityScenario, score_summary
from hydrocompute.agents.telemetry_scoring import (
    TelemetryReadingQuality,
    TelemetrySystemQuality,
    qc_confidence_score,
    field_telemetry_integrity_score,
)


def main() -> None:
    scenario = FacilityScenario(
        facility_mw=400,
        cooling_type="evaporative",
        season="summer",
        infrastructure_redundancy=31,
    )
    scores = score_summary(scenario)

    qc = qc_confidence_score(TelemetryReadingQuality(
        sensor_health=85,
        calibration_freshness=90,
        sensor_agreement=85,
        communication_integrity=65,
        environmental_plausibility=80,
        power_health=95,
    ))

    fti = field_telemetry_integrity_score(TelemetrySystemQuality(
        sensor_health=87,
        calibration_freshness=86,
        communication_reliability=96,
        power_stability=84,
        environmental_hardening=78,
        redundancy_coverage=72,
    ))

    print("HydroCompute: Sentinel Demo")
    print("=" * 40)
    print("Infrastructure score:", scores)
    print("QC confidence:", qc)
    print("Telemetry integrity:", fti)
    print("\nQwen role: run generate_qwen_analysis(...) after setting QWEN_API_KEY.")


if __name__ == "__main__":
    main()
