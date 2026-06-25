import os
import json
import subprocess
from typing import Any, Dict, List, Optional

# Skill path for qwencloud-text
QWEN_TEXT_SKILL_PATH = "/home/ubuntu/.agents/skills/qwencloud-text/scripts/text.py"
DEFAULT_QWEN_MODEL = "qwen3.6-plus"

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
        model: Optional[str] = None,
    ) -> None:
        # Use DASHSCOPE_API_KEY as preferred by the skill, fallback to QWEN_API_KEY
        self.api_key = api_key or os.getenv("DASHSCOPE_API_KEY") or os.getenv("QWEN_API_KEY")
        self.model = model or os.getenv("QWEN_MODEL", DEFAULT_QWEN_MODEL)

        if not self.api_key:
            raise QwenClientError("API Key not found. Please set DASHSCOPE_API_KEY or QWEN_API_KEY.")

    def chat(self, messages: List[Dict[str, str]], temperature: float = 0.15, max_tokens: int = 1500) -> str:
        request_body = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "enable_thinking": True # Enable deep reasoning for infrastructure analysis
        }
        
        # Execute using the qwencloud-text skill script
        cmd = [
            "python3", QWEN_TEXT_SKILL_PATH,
            "--request", json.dumps(request_body),
            "--print-response"
        ]
        
        # Ensure the API key is in the environment for the subprocess
        env = os.environ.copy()
        env["DASHSCOPE_API_KEY"] = self.api_key
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True, env=env)
            # The script outputs the full JSON response, we need to extract the content
            response_json = json.loads(result.stdout)
            
            # The skill script returns a simplified JSON if --print-response is used
            # but let's be robust and handle both standard OpenAI and simplified formats
            if "choices" in response_json:
                return response_json["choices"][0]["message"]["content"]
            elif "text" in response_json:
                return response_json["text"]
            else:
                return str(response_json)
                
        except subprocess.CalledProcessError as e:
            raise QwenClientError(f"Skill execution failed: {e.stderr}")
        except Exception as e:
            raise QwenClientError(f"Error during Qwen analysis: {e}")

def build_analysis_prompt(scenario: Dict[str, Any], score_summary: Dict[str, Any], telemetry_summary: Optional[Dict[str, Any]] = None) -> str:
    return f"""
Analyze this proposed AI/data-center infrastructure scenario using HydroCompute: Sentinel.

Scenario:
{json.dumps(scenario, indent=2)}

Deterministic scoring output:
{json.dumps(score_summary, indent=2)}

Telemetry integrity summary (SENTINEL QC NODE):
{json.dumps(telemetry_summary, indent=2) if telemetry_summary else 'No telemetry summary provided.'}

Return exactly these sections:

## Executive Risk Summary
Explain the project, classification, and top risk drivers in 3–5 sentences.

## Field Telemetry Validation
Analyze the Sentinel QC Node data. Is the telemetry trusted? Are there environmental challenges (e.g. biofouling, sensor drift) that explain the risk?

## Known Facts
List only facts directly provided in the scenario.

## Assumptions and Missing Data
List assumptions and missing data. Do not invent external facts.

## Contradiction and Claim-Risk Analysis
Identify weak or conflicting claims around facility scale, cooling type, water dependency, grid burden, and permitting readiness.

## Regulator Readiness Notes
Give draft review notes. Focus on Thermal Load Risk and Environmental Compliance.

## Public Civic Impact Brief
Translate findings into plain language for residents and community stakeholders.

## Developer Mitigation Plan
Recommend practical next steps to reduce risk, including sensor maintenance if needed.

## Human Approval Checklist
List what qualified human reviewers must validate before final export.

Rules:
- Use only provided facts.
- Treat the Sentinel QC scores as authoritative ground truth for field conditions.
- Keep the output concise and professional.
""".strip()

def generate_qwen_analysis(scenario: Dict[str, Any], score_summary: Dict[str, Any], telemetry_summary: Optional[Dict[str, Any]] = None) -> str:
    client = QwenClient()
    prompt = build_analysis_prompt(scenario, score_summary, telemetry_summary)
    return client.chat([
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt},
    ])
