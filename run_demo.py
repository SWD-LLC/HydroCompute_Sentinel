import os
from risk_scoring import FacilityScenario, score_summary
from telemetry_scoring import (
    TelemetryReadingQuality,
    TelemetrySystemQuality,
    qc_confidence_score,
    field_telemetry_integrity_score,
)
from qwen_client import generate_qwen_analysis

def main() -> None:
    # 1. Define the Scenario (Hyperscale AI Data Center)
    scenario = FacilityScenario(
        facility_mw=400,
        cooling_type="evaporative",
        season="summer",
        infrastructure_redundancy=85.0, # Based on "Industrial Grade" specs
    )
    
    # 2. Simulate Blueprint Telemetry State
    # Values derived from the Sentinel QC 1L Node Simulator blueprint
    telemetry_data = {
        "water_temperature": 32.0,
        "discharge_temperature": 32.0,
        "ph_orp": 0.30,
        "dissolved_oxygen": 0.03,
        "conductivity": 0.33,
        "turbidity": 1.1,
        "environmental_challenges": 25
    }

    # 3. Calculate Deterministic Scores
    scores = score_summary(scenario)

    # Simulate QC Confidence (Reading Quality)
    qc = qc_confidence_score(TelemetryReadingQuality(
        sensor_health=92,            # High due to self-cleaning ultrasonic plate
        calibration_freshness=88,    # Within maintenance window
        sensor_agreement=95,         # Probes are in sync
        communication_integrity=98,  # M12 industrial connectors
        environmental_plausibility=90,
        power_health=96,             # Stable power supply
    ))

    # Simulate Field Telemetry Integrity (System Quality)
    fti = field_telemetry_integrity_score(TelemetrySystemQuality(
        sensor_health=92,
        calibration_freshness=88,
        communication_reliability=98,
        power_stability=96,
        environmental_hardening=95,  # Marine-grade titanium enclosure
        redundancy_coverage=85,      # Modular probe bay
    ))

    print("HydroCompute: Sentinel - Autopilot Agent Demo")
    print("=" * 50)
    print(f"Project Scale: {scenario.facility_mw}MW")
    print(f"Cooling Type: {scenario.cooling_type}")
    print(f"Season: {scenario.season}")
    print("-" * 50)
    print(f"Infrastructure Risk Score: {scores['composite_risk_score']} ({scores['classification']})")
    print(f"QC Confidence Score: {qc['score']} ({qc['classification']})")
    print(f"Field Telemetry Integrity: {fti['score']} ({fti['classification']})")
    print("-" * 50)
    
    # 4. Call Qwen for Autonomous Reasoning
    print("\n[SENTINEL AI REASONING IN PROGRESS...]")
    
    # Check for API Key
    if not os.getenv("QWEN_API_KEY"):
        print("\n!!! WARNING: QWEN_API_KEY not found in environment.")
        print("Please set your API key to see the full AI-powered explanation.")
        return

    try:
        analysis = generate_qwen_analysis(
            scenario=scenario.__dict__,
            score_summary=scores,
            telemetry_summary={
                "qc": qc,
                "fti": fti,
                "raw_telemetry": telemetry_data
            }
        )
        print("\n" + analysis)
    except Exception as e:
        print(f"\nError generating Qwen analysis: {e}")

if __name__ == "__main__":
    main()
