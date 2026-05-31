# Alignment Notes

## Product Identity

Use **HydroCompute: Sentinel** as the submission name.

Use **Water–Energy–Food–Compute infrastructure readiness** as the core framing.

Do not frame the product as only an Ohio River tool. Use the Ohio River only as a demo scenario.

## Core Alignment

HydroCompute is aligned around this workflow:

```text
Scenario Builder → Deterministic Risk Scoring → Qwen Reasoning → Stakeholder Reports → Human Approval Gate
```

Expanded telemetry workflow:

```text
Sensor Node Simulator → QC Confidence → HydroCompute Score → Qwen Explanation → Human Approval
```

## Numerical Consistency Warning

If using the weighted formula:

```text
Composite Risk = Thermal × 0.35 + Water × 0.25 + Seasonal × 0.20 + Infrastructure × 0.20
```

then component values must mathematically match the displayed composite score.

Example:

```text
Thermal 85, Water 76, Seasonal 82, Infrastructure 69
= 78.95 ≈ 79/100
```

Do not display this as exactly `78/100` unless the formula or component scores are adjusted.

## Qwen Boundary

Qwen should:

- detect contradictions
- explain risk drivers
- generate regulator/public/developer language
- summarize missing data
- prepare human-review checklists

Qwen should not:

- override deterministic scores
- invent facts
- approve/deny infrastructure projects
- issue legal, regulatory, engineering, environmental, or financial determinations

## Devpost Alignment

Required visible items:

- public repo
- MIT license
- Qwen integration
- Alibaba Cloud deployment proof
- architecture diagram
- demo video
- project story
- built-with list
