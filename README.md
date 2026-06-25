# HydroCompute Intelligence Backend API

HydroCompute Intelligence now includes a modular Node.js/Express backend API layer for monitoring high-capacity water environments, compute load, QC tracking devices, volatility points, risk conditions, and failsafe response layers. The API currently serves mock infrastructure intelligence data as JSON so the existing frontend can connect without being rebuilt, redesigned, replaced, deleted, or restyled.

The repository's frontend assets, if present in a StackBlitz/Bolt workspace, are preserved. This backend only adds API routes and static serving compatibility for existing `dist`, `build`, or `public` output directories. Qwen or Zed IDE companion extensions should be used outside StackBlitz/Bolt; this workspace explicitly avoids recommending Qwen IDE companion extensions.

## Backend Run Command

```bash
npm install
npm start
```

The server defaults to `http://localhost:3000` unless `PORT` is set.

## API Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/` | API service overview and route list |
| GET | `/api/health` | Health check for the backend service |
| GET | `/api/system-status` | Overall HydroCompute system status |
| GET | `/api/water-volatility` | Water environment telemetry and water-related volatility points |
| GET | `/api/qc-tracking` | QC device status, telemetry quality, and inspection signals |
| GET | `/api/compute-load` | Compute utilization, cooling demand, and power-risk signals |
| GET | `/api/failsafe-plan` | Failsafe response layers and shutdown trigger data |
| GET | `/api/risk-dashboard` | Aggregated risk counts, highest-priority risk, next actions, and sorted volatility points |
| GET | `/api/volatility-points` | All normalized volatility/risk items sorted by risk score |

## Endpoint Testing

After starting the server, test the JSON endpoints with curl:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/system-status
curl http://localhost:3000/api/water-volatility
curl http://localhost:3000/api/qc-tracking
curl http://localhost:3000/api/compute-load
curl http://localhost:3000/api/failsafe-plan
curl http://localhost:3000/api/risk-dashboard
curl http://localhost:3000/api/volatility-points
```

Risk and volatility items include `id`, `subsystem`, `status`, normalized scoring inputs, `riskScore`, `priority`, `detectionSignal`, `mitigation`, and `escalationPath`. Risk scores use `likelihood * impact * (1 - detectability) * (1 - mitigationLeverage)`, with priorities assigned as critical, high, medium, or low.

---

# HydroCompute: Sentinel

**Water–Energy–Food–Compute intelligence for sustainable AI infrastructure siting.**

HydroCompute: Sentinel is an AI infrastructure readiness system for evaluating whether hyperscale compute can grow near major rivers, lakes, reservoirs, estuaries, aquifers, and regional water systems without destabilizing water security, energy reliability, agricultural resilience, ecological health, regulatory readiness, or public trust.

The project is designed for the **Global AI Hackathon Series with Qwen Cloud** under **Track 4: Autopilot Agent**.

---

## Core Thesis

AI infrastructure siting is usually framed around land, power, tax incentives, and fiber. HydroCompute reframes the problem as a **carrying-capacity decision**.

The central constraint is not only volumetric water availability. The deeper constraint is whether a water system can absorb additional compute load through heat rejection capacity, seasonal thermal stress, cooling architecture, infrastructure throughput, cumulative watershed risk, agricultural exposure, ecological sensitivity, regulatory readiness, and public trust.

HydroCompute answers one operational question:

> Can this water-energy-food-compute system safely absorb the next unit of AI compute?

---

## What It Does

HydroCompute evaluates proposed AI/data-center infrastructure scenarios and produces:

- Composite infrastructure risk score
- Maximum Sustainable Hyperscale Density Index (MSHDI)
- Safe / Managed Risk / Regulatory Stress / Overload classification
- Qwen-powered contradiction and claim-risk analysis
- Regulator-facing readiness packet
- Public-facing civic impact brief
- Developer mitigation plan
- Human approval checklist
- Optional simulated telemetry integrity layer through Sentinel QC Water Node Simulator

---

## Qwen Cloud Role

HydroCompute uses Qwen Cloud as the **agentic reasoning layer**.

The deterministic Python scoring engine calculates auditable numeric risk scores. Qwen interprets ambiguous proposals, detects contradictions, explains risk drivers, generates stakeholder-specific reports, translates technical findings into public language, and supports the human-review workflow.

Qwen does **not** override the deterministic scores and does **not** issue final regulatory, engineering, environmental, financial, or permitting determinations.

---

## Scoring Model

```text
Composite Risk Score =
(Thermal Load × 0.35)
+ (Water Withdrawal × 0.25)
+ (Seasonal Stress × 0.20)
+ (Infrastructure Risk × 0.20)
```

| Score | Classification | Meaning |
|---:|---|---|
| 0–40 | Safe | Strong buildout candidate |
| 40–70 | Managed Risk | Buildout possible with mitigation |
| 70–100 | Regulatory Stress | Elevated review/permitting burden |
| 100+ | Overload | Redesign, relocate, or defer |

---

## Sentinel QC Water Node Simulator

HydroCompute includes a simulated telemetry integrity layer called **Sentinel QC Water Node Simulator**.

This module demonstrates how future field data from water-quality and device-health sensors could support infrastructure readiness analysis. It tracks simulated water temperature, discharge temperature, dissolved oxygen, pH, conductivity, turbidity, gateway status, battery health, calibration age, communication reliability, and biofouling risk.

The simulator introduces two decision-support scores:

- **QC Confidence Score** — evaluates whether a specific sensor reading should be trusted, reviewed, or rejected.
- **Field Telemetry Integrity Score** — evaluates whether the monitoring system itself is reliable enough for decision-support use.

Workflow:

```text
Sensor Node → QC Confidence → HydroCompute Score → Qwen Explanation → Human Approval
```

---

## Repository Structure

```text
hydrocompute-sentinel/
  README.md
  LICENSE
  requirements.txt
  .env.example
  hydrocompute/
    agents/
      risk_scoring.py
      telemetry_scoring.py
      qwen_client.py
    scripts/
      run_demo.py
    data/
      demo_scenarios.json
      river_segments.csv
  docs/
    ARCHITECTURE.md
    QWEN_INTEGRATION.md
    SENTINEL_QC_WATER_NODE.md
    ALIBABA_DEPLOYMENT_PROOF.md
    DISCLAIMER.md
  devpost/
    PROJECT_STORY.md
    BUILT_WITH.md
```

---

## Run Locally

```bash
git clone https://github.com/YOUR-USERNAME/hydrocompute-sentinel.git
cd hydrocompute-sentinel
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python hydrocompute/scripts/run_demo.py
```

To enable live Qwen calls, copy `.env.example` to `.env` and add your Qwen Cloud API key.

```bash
cp .env.example .env
```

No API key should ever be committed to GitHub.

---

## Demo Scenario

The default demo evaluates a proposed 400 MW AI compute campus near a major river-adjacent industrial corridor using evaporative cooling and modeled daily water use. The scenario is illustrative and not a real permitting assessment.

The demo shows:

1. Deterministic infrastructure scoring
2. Risk classification
3. Qwen-powered contradiction analysis
4. Regulator, public, and developer outputs
5. Simulated telemetry confidence
6. Human approval checkpoint

---

## Built With

- Python
- Qwen Cloud
- OpenAI-compatible Qwen API pattern
- FastAPI-ready backend architecture
- Deterministic risk scoring
- Modular agent design
- CSV/JSON data templates
- Markdown report generation
- Water–Energy–Food–Compute framework
- Sentinel QC Water Node Simulator
- GitHub
- Devpost

---

## Status

Current status: **Hackathon MVP / prototype in progress**

Completed:

- Risk scoring model
- Qwen integration pattern
- Devpost story
- Sentinel QC Water Node Simulator spec
- GitHub-ready repo structure
- MIT license
- Documentation package

In progress:

- Web dashboard
- Alibaba Cloud deployment proof
- Public demo video
- Live Qwen demo call

---

## License

This project is licensed under the MIT License. See `LICENSE` for details.

---

## Disclaimer

HydroCompute: Sentinel is a prototype decision-support tool. It does not provide legal, engineering, environmental, financial, or regulatory advice. Outputs are draft planning artifacts and require review by qualified professionals and public authorities.

---

## Author

Built by **Sierra Warren / Sierra Warren Developments** for the Global AI Hackathon Series with Qwen Cloud.
