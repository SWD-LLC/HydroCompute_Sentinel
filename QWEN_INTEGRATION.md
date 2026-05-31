# Qwen Cloud Integration

HydroCompute uses Qwen Cloud as the agentic reasoning layer.

The deterministic Python engine calculates auditable infrastructure and telemetry scores. Qwen interprets ambiguous proposals, detects contradictions, generates stakeholder-specific reports, translates technical findings into public language, and supports the human-review workflow.

## Environment Variables

```bash
QWEN_API_KEY=replace_with_your_qwen_cloud_api_key
QWEN_MODEL=qwen-plus
QWEN_REASONING_MODEL=qwen-max
QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
```

## Qwen Responsibilities

- Contradiction and claim-risk analysis
- Missing-data explanation
- Regulator readiness notes
- Public civic impact brief
- Developer mitigation language
- Human approval checklist
- Telemetry trust notes

## Deterministic System Responsibilities

- Composite risk score
- Risk classification
- MSHDI
- QC Confidence Score
- Field Telemetry Integrity Score
- Calibration age
- Communication reliability metrics
- Human-review triggers

## Safety Boundary

Qwen must not:

- Recalculate or override deterministic scores
- Validate raw sensor physics
- Claim legal compliance or noncompliance
- Approve or deny a project
- Invent external laws, agencies, species, datasets, surveys, or permits
