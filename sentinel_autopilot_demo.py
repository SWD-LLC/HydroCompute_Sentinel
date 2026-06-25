import os
import json
import time
from risk_scoring import FacilityScenario, score_summary
from telemetry_scoring import (
    TelemetryReadingQuality,
    TelemetrySystemQuality,
    qc_confidence_score,
    field_telemetry_integrity_score,
)
from qwen_client import generate_qwen_analysis

def print_header(text):
    print("\n" + "=" * 60)
    print(f" {text} ".center(60, "="))
    print("=" * 60)

def print_step(step, text):
    print(f"\n[STEP {step}] {text}...")
    time.sleep(1)

def main():
    print_header("HYDROCOMPUTE: SENTINEL - AUTOPILOT DEMO")
    
    # --- SCENARIO SETUP ---
    print_step(1, "Configuring Infrastructure Scenario")
    scenario = FacilityScenario(
        facility_mw=400,
        cooling_type="evaporative",
        season="summer",
        infrastructure_redundancy=85.0
    )
    print(f" > Target: 400MW Hyperscale Data Center")
    print(f" > Cooling: {scenario.cooling_type}")
    print(f" > Environment: {scenario.season} (High Thermal Stress)")

    # --- SENSOR TELEMETRY SIMULATION ---
    print_step(2, "Simulating Field Telemetry (Sentinel QC 1L Node)")
    # Simulating a "Thermal Breach" event
    telemetry_data = {
        "water_temperature": 32.0,
        "discharge_temperature": 34.5, # Elevated discharge detected
        "ph_orp": 0.30,
        "dissolved_oxygen": 0.03,
        "conductivity": 0.33,
        "turbidity": 1.1,
        "environmental_challenges": ["High River Temperature", "Potential Biofouling"]
    }
    print(f" > Discharge Temp: {telemetry_data['discharge_temperature']}°C (Delta T: +2.5°C)")
    print(f" > Sensor Status: Self-Cleaning Active (Ultrasonic)")

    # --- DETERMINISTIC SCORING ---
    print_step(3, "Calculating Deterministic Risk & Integrity Scores")
    scores = score_summary(scenario)
    
    qc = qc_confidence_score(TelemetryReadingQuality(
        sensor_health=92,
        calibration_freshness=88,
        sensor_agreement=95,
        communication_integrity=98,
        environmental_plausibility=90,
        power_health=96,
    ))

    fti = field_telemetry_integrity_score(TelemetrySystemQuality(
        sensor_health=92,
        calibration_freshness=88,
        communication_reliability=98,
        power_stability=96,
        environmental_hardening=95,
        redundancy_coverage=85,
    ))

    print(f" > Infrastructure Risk: {scores['composite_risk_score']} ({scores['classification']})")
    print(f" > QC Confidence: {qc['score']} ({qc['classification']})")
    print(f" > Field Integrity: {fti['score']} ({fti['classification']})")

    # --- QWEN AUTOPILOT REASONING ---
    print_step(4, "Invoking Qwen Cloud Autopilot Engine")
    
    if not os.getenv("DASHSCOPE_API_KEY") and not os.getenv("QWEN_API_KEY"):
        print("\n[!] API KEY MISSING")
        print("Please set DASHSCOPE_API_KEY to see the AI reasoning.")
        print("\n--- PREVIEW OF QWEN PROMPT ---")
        print(f"Qwen would now analyze the +2.5°C Thermal Breach and the {qc['score']} Trusted Telemetry status...")
        return

    print(" > Analyzing volatility points and regulatory readiness...")
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
        
        print_header("SENTINEL AI AUTOPILOT REPORT")
        print(analysis)
        
        print_header("DEMO COMPLETE")
        print("Workflow: Sensor -> Score -> Qwen -> Human Approval [PENDING]")
        
    except Exception as e:
        print(f"\n[!] Error during Qwen analysis: {e}")

if __name__ == "__main__":
    main()
