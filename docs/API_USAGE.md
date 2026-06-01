# HydroCompute Sentinel API Usage

HydroCompute Sentinel exposes a small FastAPI backend for deterministic infrastructure scoring and optional Qwen-assisted analysis.

## Run the API

```bash
uvicorn hydrocompute.api.main:app --reload
```

The local development server defaults to `http://127.0.0.1:8000`.

## `GET /health`

Health check endpoint for API availability.

### Example

```bash
curl http://127.0.0.1:8000/health
```

### Sample response

```json
{
  "status": "ok",
  "service": "hydrocompute-sentinel-api"
}
```

## `POST /analyze`

Runs deterministic HydroCompute scoring for a proposed AI/data-center infrastructure scenario and optionally asks Qwen for interpretive decision-support text.

### Sample request

```bash
curl -X POST http://127.0.0.1:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": {
      "facility_mw": 400,
      "cooling_type": "evaporative",
      "season": "summer",
      "infrastructure_redundancy": 31,
      "location_context": "River-adjacent industrial corridor with seasonal thermal stress.",
      "claims": [
        "The facility will have minimal watershed impact.",
        "Existing grid infrastructure can absorb the full compute load."
      ]
    },
    "telemetry_summary": {
      "qc_confidence": "Usable with caution",
      "field_telemetry_integrity": "Deployable with monitoring"
    },
    "use_qwen": true
  }'
```

### Sample response shape

```json
{
  "service": "hydrocompute-sentinel-api",
  "score_summary": {
    "composite_risk_score": 78.8,
    "classification": "Regulatory Stress",
    "mshdi": 120.0,
    "components": {
      "thermal_load": 80.0,
      "water_withdrawal": 70.0,
      "seasonal_stress": 80.0,
      "infrastructure_risk": 69.0
    },
    "human_review_required": true
  },
  "qwen_analysis": {
    "status": "completed or fallback",
    "used_qwen": true,
    "model": "qwen-plus",
    "content": "Narrative decision-support analysis or deterministic fallback text.",
    "fallback_reason": null
  },
  "human_review_disclaimer": "HydroCompute outputs are decision-support materials only..."
}
```

## Qwen fallback behavior

The API always returns deterministic scoring when the request is valid. Qwen interpretive analysis falls back to deterministic narrative text when:

- `use_qwen` is set to `false`.
- `QWEN_API_KEY` is not configured.
- Qwen dependencies or credentials are unavailable.
- The Qwen client raises a handled configuration error.

Fallback responses set `qwen_analysis.used_qwen` to `false`, `qwen_analysis.status` to `fallback`, and include `qwen_analysis.fallback_reason`.

## Human review disclaimer

HydroCompute Sentinel is a decision-support prototype. It does not issue final legal, regulatory, engineering, environmental, financial, or permitting determinations. Qualified human reviewers must validate assumptions, data sources, model outputs, and operational decisions before use.
