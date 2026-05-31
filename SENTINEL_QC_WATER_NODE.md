# Sentinel QC Water Node Simulator

**Simulated telemetry integrity layer for HydroCompute: Sentinel.**

The Sentinel QC Water Node Simulator demonstrates how field water-quality and device-health telemetry could support HydroCompute's infrastructure readiness workflow.

It is a simulation for hackathon demonstration, not a real hardware specification.

## Mission

Bridge the gap between theoretical risk scoring and physical field validation.

## Telemetry Channels

- Water temperature
- Discharge temperature
- Dissolved oxygen
- pH
- Conductivity
- Turbidity
- Water level / flow proxy
- Battery health
- Gateway status
- Calibration age
- Enclosure humidity
- Communication reliability
- Biofouling risk
- Maintenance status

## Volatility Points

- Hydraulic stress
- Debris and sediment
- Biofouling and corrosion
- Sensor drift
- Communication loss
- Power volatility
- Data corruption
- False alarms

## QC Confidence Score

```text
QC Confidence =
(Sensor Health × 0.25)
+ (Calibration Freshness × 0.20)
+ (Sensor Agreement × 0.20)
+ (Communication Integrity × 0.15)
+ (Environmental Plausibility × 0.15)
+ (Power Health × 0.05)
```

## Field Telemetry Integrity Score

```text
FTI Score =
(Sensor Health × 0.25)
+ (Calibration Freshness × 0.20)
+ (Communication Reliability × 0.15)
+ (Power Stability × 0.15)
+ (Environmental Hardening × 0.15)
+ (Redundancy Coverage × 0.10)
```

## Dashboard Workflow

```text
Sensor Node → QC Confidence → HydroCompute Score → Qwen Explanation → Human Approval
```

## Human Approval

Telemetry data enhances human judgment. It does not replace hydrologists, environmental engineers, utility specialists, permitting staff, or public review.
