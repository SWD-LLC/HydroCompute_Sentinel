# HydroCompute Architecture

```mermaid
flowchart TD
    A[Scenario Builder] --> B[Deterministic Risk Scoring Engine]
    B --> C[Composite Risk + MSHDI]
    C --> D[Qwen Cloud Reasoning Layer]
    D --> E[Regulator Readiness Packet]
    D --> F[Civic Impact Brief]
    D --> G[Developer Mitigation Plan]
    E --> H[Human Approval Gate]
    F --> H
    G --> H

    I[Sentinel QC Water Node Simulator] --> J[QC Confidence Score]
    J --> K[Field Telemetry Integrity Score]
    K --> D
```

## Core Flow

```text
Scenario → Score → Qwen Analysis → Stakeholder Outputs → Human Approval
```

## Expanded Flow

```text
Scenario → Telemetry Simulation → QC Confidence → HydroCompute Score → Qwen Explanation → Human Approval
```

## Design Principle

HydroCompute separates deterministic calculation from language-model reasoning. Numeric scores remain auditable. Qwen handles interpretation, contradiction detection, stakeholder-specific outputs, and human-review summaries.
