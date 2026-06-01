"""FastAPI backend for HydroCompute Sentinel analysis."""

import os
from typing import Any, Dict

from fastapi import FastAPI

from qwen_client import QwenClientError, build_analysis_prompt, generate_qwen_analysis
from risk_scoring import FacilityScenario, score_summary

from .schemas import AnalysisRequest, AnalysisResponse

HUMAN_REVIEW_DISCLAIMER = (
    "HydroCompute outputs are decision-support materials only. They do not constitute final legal, "
    "regulatory, engineering, environmental, financial, or permitting determinations and require "
    "qualified human review before operational use."
)

app = FastAPI(
    title="HydroCompute Sentinel API",
    version="0.1.0",
    description="Backend API for deterministic HydroCompute scoring with optional Qwen reasoning support.",
)


def _scenario_payload(request: AnalysisRequest) -> Dict[str, Any]:
    """Return a serializable scenario payload for deterministic scoring and Qwen context."""

    return request.scenario.model_dump()


def _fallback_analysis(
    scenario: Dict[str, Any],
    deterministic_score: Dict[str, Any],
    reason: str,
) -> Dict[str, Any]:
    """Build a deterministic fallback response when Qwen is unavailable or disabled."""

    content = (
        "Qwen analysis was not used for this response. The deterministic HydroCompute scoring engine "
        f"classified the scenario as {deterministic_score['classification']} with a composite risk "
        f"score of {deterministic_score['composite_risk_score']}. Review the component scores, validate "
        "all scenario assumptions, confirm water-system and grid constraints with qualified experts, and "
        "complete human review before relying on this output."
    )
    return {
        "status": "fallback",
        "used_qwen": False,
        "model": None,
        "content": content,
        "fallback_reason": reason,
        "prompt_preview": build_analysis_prompt(scenario, deterministic_score)[:500],
    }


@app.get("/health")
def health() -> Dict[str, str]:
    """Return API health information."""

    return {"status": "ok", "service": "hydrocompute-sentinel-api"}


@app.post("/analyze", response_model=AnalysisResponse)
def analyze(request: AnalysisRequest) -> Dict[str, Any]:
    """Analyze a water-energy-food-compute infrastructure scenario."""

    scenario_payload = _scenario_payload(request)
    scenario = FacilityScenario(
        facility_mw=request.scenario.facility_mw,
        cooling_type=request.scenario.cooling_type,
        season=request.scenario.season,
        infrastructure_redundancy=request.scenario.infrastructure_redundancy,
    )
    deterministic_score = score_summary(scenario)

    if not request.use_qwen:
        qwen_analysis = _fallback_analysis(scenario_payload, deterministic_score, "Qwen analysis disabled by request.")
    elif not os.getenv("QWEN_API_KEY"):
        qwen_analysis = _fallback_analysis(scenario_payload, deterministic_score, "QWEN_API_KEY is not configured.")
    else:
        try:
            qwen_content = generate_qwen_analysis(
                scenario_payload,
                deterministic_score,
                request.telemetry_summary,
            )
            qwen_analysis = {
                "status": "completed",
                "used_qwen": True,
                "model": os.getenv("QWEN_MODEL", "qwen-plus"),
                "content": qwen_content,
                "fallback_reason": None,
            }
        except QwenClientError as exc:
            qwen_analysis = _fallback_analysis(scenario_payload, deterministic_score, str(exc))

    return {
        "service": "hydrocompute-sentinel-api",
        "score_summary": deterministic_score,
        "qwen_analysis": qwen_analysis,
        "human_review_disclaimer": HUMAN_REVIEW_DISCLAIMER,
    }
