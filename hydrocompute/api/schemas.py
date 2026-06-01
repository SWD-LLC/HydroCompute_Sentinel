"""Request and response schemas for the HydroCompute FastAPI backend."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ScenarioInput(BaseModel):
    """Infrastructure scenario inputs accepted by the analysis endpoint."""

    facility_mw: float = Field(..., ge=0, description="Proposed facility capacity in megawatts.")
    cooling_type: str = Field(..., description="Cooling approach, such as evaporative, dry, hybrid, or closed-loop.")
    season: str = Field(..., description="Season or operating condition used for seasonal stress scoring.")
    infrastructure_redundancy: float = Field(
        50.0,
        ge=0,
        le=100,
        description="Infrastructure redundancy percentage from 0 to 100.",
    )
    location_context: Optional[str] = Field(
        default=None,
        description="Optional plain-language water, grid, or civic context for Qwen review.",
    )
    claims: List[str] = Field(
        default_factory=list,
        description="Optional project claims to inspect for contradictions or missing support.",
    )


class AnalysisRequest(BaseModel):
    """POST /analyze request payload."""

    scenario: ScenarioInput
    telemetry_summary: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional precomputed telemetry or QC summary to include in the review packet.",
    )
    use_qwen: bool = Field(
        default=True,
        description="When true, attempt Qwen analysis if Qwen credentials and dependencies are available.",
    )


class ScoreSummary(BaseModel):
    """Deterministic score output returned by the backend."""

    composite_risk_score: float
    classification: str
    mshdi: float
    components: Dict[str, float]
    human_review_required: bool


class QwenAnalysis(BaseModel):
    """Qwen result metadata and content."""

    status: str
    used_qwen: bool
    model: Optional[str] = None
    content: str
    fallback_reason: Optional[str] = None


class AnalysisResponse(BaseModel):
    """POST /analyze response payload."""

    service: str
    score_summary: ScoreSummary
    qwen_analysis: QwenAnalysis
    human_review_disclaimer: str
