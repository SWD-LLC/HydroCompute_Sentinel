import os
from typing import Any, Dict, List, Optional

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None  # type: ignore

DEFAULT_QWEN_BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
DEFAULT_QWEN_MODEL = "qwen-plus"

SYSTEM_PROMPT = """
You are HydroCompute: Sentinel, an AI infrastructure readiness agent.

Evaluate proposed AI/data-center infrastructure near major water systems using a Water–Energy–Food–Compute framework. Separate known facts from assumptions. Identify missing data. Detect contradictions. Explain risk drivers clearly. Generate draft decision-support language for regulators, developers, and communities.

Do not make final legal, regulatory, engineering, environmental, financial, or permitting determinations. All outputs require human review.

When deterministic risk scores are provided, treat them as authoritative. Do not override or recalculate numeric scores.
""".strip()


class QwenClientError(RuntimeError):
    pass


class QwenClient:
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
    ) -> None:
        self.api_key = api_key or os.getenv("QWEN_API_KEY")
        self.base_url = base_url or os.getenv("QWEN_BASE_URL", DEFAULT_QWEN_BASE_URL)
        self.model = model or os.getenv("QWEN_MODEL", DEFAULT_QWEN_MODEL)

        if OpenAI is None:
            raise QwenClientError("Install dependencies with: pip install -r requirements.txt")
        if not self.api_key:
            raise QwenClientError("QWEN_API_KEY is not set. Use .env or environment variables.")

        self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)

    def chat(self, messages: List[Dict[str, str]], temperature: float = 0.15, max_tokens: int = 1100) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content or ""


def build_analysis_prompt(scenario: Dict[str, Any], score_summary: Dict[str, Any], telemetry_summary: Optional[Dict[str, Any]] = None) -> str:
    return f"""
Analyze this proposed AI/data-center infrastructure scenario using HydroCompute: Sentinel.

Scenario:
{scenario}

Deterministic scoring output:
{score_summary}

Telemetry integrity summary, if available:
{telemetry_summary or 'No telemetry summary provided.'}

Return exactly these sections:

## Executive Risk Summary
Explain the project, classification, and top risk drivers in 3–5 sentences.

## Known Facts
List only facts directly provided in the scenario.

## Assumptions and Missing Data
List assumptions and missing data. Do not invent external facts.

## Contradiction and Claim-Risk Analysis
Identify weak or conflicting claims around facility scale, cooling type, water dependency, grid burden, sustainability claims, and permitting readiness.

## Regulator Readiness Notes
Give draft review notes. Do not claim legal noncompliance unless a provided rule proves it.

## Public Civic Impact Brief
Translate findings into plain language for residents and community stakeholders.

## Developer Mitigation Plan
Recommend practical next steps to reduce risk.

## Human Approval Checklist
List what qualified human reviewers must validate before final export.

Rules:
- Use only provided facts.
- Do not invent agencies, laws, datasets, species, surveys, permits, or regulatory findings.
- Use cautious language such as “may,” “requires review,” and “should be validated.”
- Do not say “violation,” “illegal,” “must not proceed,” or “will harm” unless directly supported by provided data.
- Keep the output concise and professional.
""".strip()


def generate_qwen_analysis(scenario: Dict[str, Any], score_summary: Dict[str, Any], telemetry_summary: Optional[Dict[str, Any]] = None) -> str:
    client = QwenClient()
    prompt = build_analysis_prompt(scenario, score_summary, telemetry_summary)
    return client.chat([
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt},
    ])
