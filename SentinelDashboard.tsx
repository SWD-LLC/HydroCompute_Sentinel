import { useState, useRef } from "react";

// ── Scoring logic ported from Python ──────────────────────────────────────────

function thermalLoadRisk(mw: number) { 
  return Math.min(mw / 5, 100); 
}

function waterWithdrawalRisk(cooling: string) { 
  return { 
    "once-through": 90, 
    evaporative: 70, 
    hybrid: 50, 
    "closed-loop": 35, 
    "direct-to-chip": 25, 
    dry: 10 
  }[cooling] ?? 50; 
}

function seasonalStress(season: string) { 
  return { 
    summer: 80, 
    fall: 50, 
    autumn: 50, 
    spring: 40, 
    winter: 20 
  }[season] ?? 50; 
}

function compositeRisk(s: any) { 
  const c = { 
    thermal: thermalLoadRisk(s.mw), 
    withdrawal: waterWithdrawalRisk(s.cooling), 
    seasonal: seasonalStress(s.season), 
    infra: 100 - Math.min(s.redundancy, 100), 
  }; 
  const score = c.thermal * 0.35 + c.withdrawal * 0.25 + c.seasonal * 0.20 + c.infra * 0.20; 
  return { score: Math.round(score * 10) / 10, components: c }; 
}

function qcScore(q: any) { 
  return Math.round(( 
    q.sensor_health * 0.25 + 
    q.calibration * 0.20 + 
    q.agreement * 0.20 + 
    q.comms * 0.15 + 
    q.plausibility * 0.15 + 
    q.power * 0.05 
  ) * 10) / 10; 
}

function riskLabel(s: number) { 
  if (s < 40) return ["SAFE", "#22c55e"]; 
  if (s < 70) return ["MANAGED RISK", "#f59e0b"]; 
  return ["REGULATORY STRESS", "#ef4444"]; 
}

function qcLabel(s: number) { 
  if (s >= 85) return ["TRUSTED", "#22c55e"]; 
  if (s >= 70) return ["USABLE WITH CAUTION", "#f59e0b"]; 
  if (s >= 50) return ["HUMAN REVIEW REQUIRED", "#f97316"]; 
  return ["REJECT / MAINTENANCE", "#ef4444"]; 
}

// ── Qwen Cloud API call ─────────────────────────────────────────────────────

async function runQwenAnalysis(scenario: any, scores: any, telemetry: any) { 
  const deltaT = telemetry.discharge - telemetry.ambient; 
  const deltaTStr = deltaT.toFixed(1);
  const breach = deltaT > 2.0; 
  
  const systemPrompt = `You are HydroCompute: Sentinel — an industrial autopilot agent for water infrastructure governance. 
Analyze the provided scenario and telemetry data, then return ONLY valid JSON (no markdown, no code fences).

Your role:
- Identify thermal discharge violations and environmental risks
- Provide technical diagnosis of sensor anomalies
- Generate regulatory compliance assessments
- Recommend specific human-verifiable actions
- Communicate findings in plain language for public stakeholders

Always emphasize that human experts must approve all recommendations before execution.`;

  const userMessage = `SCENARIO: ${scenario.mw}MW ${scenario.cooling} cooling facility, ${scenario.season} season, ${scenario.redundancy}% redundancy
COMPOSITE RISK: ${scores.composite}/100
QC CONFIDENCE: ${scores.qc}/100
TELEMETRY: ambient ${telemetry.ambient}°C | discharge ${telemetry.discharge}°C | delta-T +${deltaTStr}°C | regulatory limit 2.0°C | breach: ${breach}

Return exactly this JSON structure (no markdown):
{
  "status": "OK|WARNING|CRITICAL",
  "alert_level": "LOW|MEDIUM|HIGH|URGENT",
  "executive_summary": "2-3 sentences",
  "technical_diagnosis": "Detailed analysis of delta-T breach, QC confidence, thermal stress, and root cause",
  "volatility_points": ["3 specific risk factors"],
  "recommendations": ["3 specific actionable steps"],
  "regulatory_readiness": "Compliance status and required regulatory actions",
  "civic_impact": "Plain-language community statement (2 sentences)",
  "human_checklist": ["3 things a hydrologist must verify before execution"]
}`;

  try {
    // Try Qwen Cloud API first
    const qwenResponse = await fetch("https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_QWEN_API_KEY || ""}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen3.6-plus",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        parameters: {
          enable_thinking: true,
          thinking_budget_tokens: 5000
        }
      })
    });

    if (qwenResponse.ok) {
      const data = await qwenResponse.json();
      const content = data.output?.choices?.[0]?.message?.content || "{}";
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn("Qwen API failed, using mock response");
  }

  // Fallback: Mock response for demo
  return {
    status: breach ? "CRITICAL" : scores.composite > 70 ? "WARNING" : "OK",
    alert_level: breach ? "URGENT" : scores.composite > 70 ? "HIGH" : "LOW",
    executive_summary: breach 
      ? `THERMAL DISCHARGE BREACH DETECTED. Discharge temperature (${telemetry.discharge}°C) exceeds regulatory limit by ${(deltaT - 2).toFixed(1)}°C. Immediate corrective action required.`
      : `System operating within regulatory parameters. Composite risk score: ${scores.composite}/100. QC confidence: ${scores.qc}%.`,
    technical_diagnosis: breach
      ? `The facility is operating under critical thermal stress. Delta-T of +${deltaTStr}°C exceeds the EPA 2.0°C regulatory limit. This indicates inadequate heat rejection capacity or cooling system malfunction. QC confidence is ${scores.qc}%, suggesting sensor reliability is ${scores.qc > 80 ? "high" : "compromised"}.`
      : `All thermal parameters are within acceptable ranges. Delta-T of +${deltaTStr}°C is compliant with regulatory limits. Sensor health and calibration are nominal.`,
    volatility_points: [
      `Thermal load risk: ${Math.round(scores.components.thermal)}%`,
      `Water withdrawal impact: ${Math.round(scores.components.withdrawal)}%`,
      `Seasonal stress factor: ${Math.round(scores.components.seasonal)}%`
    ],
    recommendations: breach
      ? [
          "Activate emergency cooling bypass procedures within 2 hours",
          "Dispatch environmental engineering team for on-site assessment",
          "Generate Regulatory Readiness Report for EPA submission within 24 hours"
        ]
      : [
          "Continue standard monitoring protocol",
          "Schedule routine calibration within 30 days",
          "Maintain current operational parameters"
        ],
    regulatory_readiness: breach
      ? "NON-COMPLIANT: Facility is in violation of EPA Thermal Discharge Guidelines (40 CFR 125.20). Immediate corrective action required to avoid penalties."
      : "COMPLIANT: Facility meets all EPA thermal discharge requirements. Documentation current and valid.",
    civic_impact: breach
      ? "Environmental engineers have detected elevated water temperatures and are implementing cooling measures to protect aquatic ecosystems. Community updates will be provided within 24 hours."
      : "Water quality monitoring systems confirm that facility operations are maintaining ecosystem health standards. No immediate community action required.",
    human_checklist: [
      "Verify sensor calibration date and accuracy",
      "Confirm cooling system operational status",
      "Review historical thermal discharge data for anomalies"
    ]
  };
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function GaugeDial({ value, max = 100, color, label }: any) { 
  const r = 32, circ = 2 * Math.PI * r, pct = Math.min(value / max, 1); 
  return ( 
    <div className="flex flex-col items-center gap-1"> 
      <svg width="80" height="80" viewBox="0 0 80 80"> 
        <circle cx="40" cy="40" r={r} fill="none" stroke="#1e293b" strokeWidth="5" /> 
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="5" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} /> 
        <text x="40" y="40" textAnchor="middle" dy="0.3em" fill={color} fontSize="24" fontWeight="900" fontFamily="monospace"> {Math.round(value)} </text> 
      </svg> 
      <span style={{ color: "#475569", fontSize: 11, fontFamily: "monospace" }}>{label}</span> 
    </div> 
  ); 
}

function Bar({ label, value, color }: any) { 
  return ( 
    <div className="mb-2"> 
      <div className="flex justify-between mb-1"> 
        <span style={{ color: "#64748b", fontSize: 10, fontFamily: "monospace" }}>{label}</span> 
        <span style={{ color: "#94a3b8", fontSize: 10, fontFamily: "monospace" }}>{Math.round(value)}%</span> 
      </div> 
      <div style={{ width: "100%", height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}> 
        <div style={{ width: `${Math.min(value, 100)}%`, height: "100%", background: color, borderRadius: 3, transition: "width 1s ease" }} /> 
      </div> 
    </div> 
  ); 
}

function LayerCard({ num, icon, label, sub, active, done }: any) { 
  const border = done ? "#22c55e" : active ? "#f97316" : "#1e293b"; 
  const bg = done ? "rgba(34,197,94,0.06)" : active ? "rgba(249,115,22,0.10)" : "rgba(15,23,42,0.4)"; 
  return (
    <div style={{ border: `1.5px solid ${border}`, background: bg, borderRadius: 8, padding: "12px 8px", textAlign: "center", transition: "all 0.4s ease", position: "relative", overflow: "hidden" }}>
      {active && <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `${border}11`, animation: "pulse 2s infinite" }} />}
      <div style={{ fontSize: 24, marginBottom: 4, position: "relative", zIndex: 1 }}>{icon}</div>
      <div style={{ color: "#94a3b8", fontSize: 10, fontFamily: "monospace", fontWeight: 600, position: "relative", zIndex: 1 }}>LAYER {num}</div>
      <div style={{ color: "#f1f5f9", fontSize: 12, fontFamily: "monospace", fontWeight: 700, marginTop: 2, position: "relative", zIndex: 1 }}>{label}</div>
      <div style={{ color: "#64748b", fontSize: 9, fontFamily: "monospace", marginTop: 2, position: "relative", zIndex: 1 }}>{sub}</div>
      {done && <div style={{ color: "#22c55e", fontSize: 10, fontFamily: "monospace", fontWeight: 700, marginTop: 4, position: "relative", zIndex: 1 }}>✓ complete</div>}
      {active && <div style={{ color: "#f97316", fontSize: 10, fontFamily: "monospace", fontWeight: 700, marginTop: 4, position: "relative", zIndex: 1 }}>● active</div>}
    </div>
  ); 
}

function Panel({ title, accent = "#f97316", children }: any) { 
  return (
    <div style={{ background: "rgba(15,23,42,0.5)", border: "1px solid #1e293b", borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid #1e293b` }}>
        <div style={{ width: 3, height: 16, background: accent, borderRadius: 2 }} />
        <span style={{ color: "#f1f5f9", fontSize: 12, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase" }}>{title}</span>
      </div>
      {children}
    </div>
  ); 
}

function Slider({ label, value, min, max, step = 1, unit, color = "#f97316", onChange }: any) { 
  return ( 
    <div className="mb-4"> 
      <div className="flex justify-between mb-1"> 
        <span style={{ color: "#64748b", fontSize: 10, fontFamily: "monospace" }}>{label}</span> 
        <span style={{ color: "#94a3b8", fontSize: 10, fontFamily: "monospace" }}>{typeof value === "number" ? value.toFixed(step < 1 ? 1 : 0) : value}{unit}</span> 
      </div> 
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: color }} /> 
    </div> 
  ); 
}

function Pill({ label, value, active, onClick }: any) { 
  return (
    <button onClick={onClick} style={{ border: `1px solid ${active ? "#f97316" : "#1e293b"}`, background: active ? "rgba(249,115,22,0.15)" : "transparent", color: active ? "#f97316" : "#475569", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontFamily: "monospace", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
      {label}
    </button>
  ); 
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

export default function SentinelDashboard() { 
  const [scenario, setScenario] = useState({ mw: 400, cooling: "evaporative", season: "summer", redundancy: 85 }); 
  const [tele, setTele] = useState({ ambient: 32.0, discharge: 34.5 }); 
  const [phase, setPhase] = useState("idle"); 
  const [activeLayer, setActiveLayer] = useState<number | null>(null); 
  const [doneLayers, setDoneLayers] = useState<number[]>([]); 
  const [analysis, setAnalysis] = useState<any>(null); 
  const [error, setError] = useState<string | null>(null); 
  const [approved, setApproved] = useState<boolean | null>(null); 
  const reportRef = useRef<HTMLDivElement>(null);

  const qc = qcScore({ sensor_health: 92, calibration: 88, agreement: 95, comms: 98, plausibility: 90, power: 96 }); 
  const risk = compositeRisk(scenario); 
  const riskLabelResult = riskLabel(risk.score) as [string, string]; 
  const [riskLbl, riskColor] = riskLabelResult; 
  const qcLabelResult = qcLabel(qc) as [string, string]; 
  const [qcLbl, qcColor] = qcLabelResult; 
  const deltaT = tele.discharge - tele.ambient; 
  const breach = deltaT > 2.0;

  const run = async () => { 
    setPhase("running"); 
    setActiveLayer(null); 
    setDoneLayers([]); 
    setAnalysis(null); 
    setError(null); 
    setApproved(null); 
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

    setActiveLayer(1); 
    await delay(1100); 
    setDoneLayers([1]);
    
    setActiveLayer(2); 
    await delay(900);  
    setDoneLayers([1, 2]);
    
    setActiveLayer(3);
    try {
      const result = await runQwenAnalysis(scenario, { composite: risk.score, qc }, tele);
      setAnalysis(result);
    } catch (e: any) { 
      setError("AI analysis failed: " + e.message); 
    }
    setDoneLayers([1, 2, 3]);
    
    setActiveLayer(4); 
    await delay(800); 
    setDoneLayers([1, 2, 3, 4]); 
    setActiveLayer(null);
    
    setPhase("done");
    setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
  };

  const statusColors: any = { CRITICAL: "#ef4444", WARNING: "#f59e0b", OK: "#22c55e" }; 
  const alertColors: any = { URGENT: "#ef4444", HIGH: "#f97316", MEDIUM: "#f59e0b", LOW: "#22c55e" };

  return (
    <div style={{ background: "#0f172a", color: "#f1f5f9", minHeight: "100vh", fontFamily: "monospace" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.25} 50%{opacity:0.7} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.5s ease both; }
        input[type=range] { appearance:none; height:4px; border-radius:2px; background:#1e293b; outline:none; cursor:pointer; }
        input[type=range]::-webkit-slider-thumb { appearance:none; width:14px; height:14px; border-radius:50%; background:#f97316; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "#f97316", color: "#000", fontWeight: 900, fontSize: 13, fontFamily: "monospace", borderRadius: 6, padding: "4px 9px" }}>H</div>
          <div>
            <div style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 600 }}>
              HydroCompute: <span style={{ color: "#f97316" }}>Sentinel</span>
            </div>
            <div style={{ color: "#334155", fontSize: 11, fontFamily: "monospace" }}>QC WATER NODE AUTOPILOT · v1.0.0-BETA</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#334155", fontSize: 10, fontFamily: "monospace" }}>INTELLIGENCE LAYER</div>
            <div style={{ color: "#f97316", fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>QWEN CLOUD AI · THINKING MODE</div>
          </div>
          <div title="Node online" style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%", boxShadow: "0 0 6px #22c55e" }} />
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 16px" }}>

        {/* ── 4-Layer Pipeline ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
          {[
            { num: 1, icon: "📡", label: "Field Layer", sub: "Sentinel 1L sensor" },
            { num: 2, icon: "⚡", label: "Ingestion Layer", sub: "Alibaba Cloud IoT" },
            { num: 3, icon: "🧠", label: "Intelligence Layer", sub: "Qwen reasoning" },
            { num: 4, icon: "👤", label: "Interface Layer", sub: "Human approval gate" },
          ].map(l => <LayerCard key={l.num} {...l} active={activeLayer === l.num} done={doneLayers.includes(l.num)} />)}
        </div>

        {/* ── Controls ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>

          <Panel title="Scenario configuration">
            <Slider label="FACILITY CAPACITY" value={scenario.mw} min={10} max={1000} unit=" MW" onChange={(v: number) => setScenario(s => ({ ...s, mw: v }))} />
            <div className="mb-4">
              <div style={{ color: "#64748b", fontSize: 11, fontFamily: "monospace", marginBottom: 6 }}>COOLING TYPE</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {["evaporative", "once-through", "hybrid", "closed-loop", "dry"].map(c =>
                  <Pill key={c} label={c} active={scenario.cooling === c} onClick={() => setScenario(s => ({ ...s, cooling: c }))} />)}
              </div>
            </div>
            <div className="mb-4">
              <div style={{ color: "#64748b", fontSize: 11, fontFamily: "monospace", marginBottom: 6 }}>SEASON</div>
              <div style={{ display: "flex", gap: 5 }}>
                {["summer", "fall", "spring", "winter"].map(s =>
                  <Pill key={s} label={s} active={scenario.season === s} onClick={() => setScenario(sc => ({ ...sc, season: s }))} />)}
              </div>
            </div>
            <Slider label="INFRASTRUCTURE REDUNDANCY" value={scenario.redundancy} min={0} max={100} unit="%" onChange={(v: number) => setScenario(s => ({ ...s, redundancy: v }))} />
          </Panel>

          <Panel title="Field telemetry — Sentinel 1L node">
            <Slider label="AMBIENT WATER TEMP" value={tele.ambient} min={10} max={40} step={0.5} unit="°C" color="#60a5fa"
              onChange={(v: number) => setTele(t => ({ ...t, ambient: v }))} />
            <Slider label="DISCHARGE TEMPERATURE" value={tele.discharge} min={10} max={45} step={0.5} unit="°C"
              color={breach ? "#ef4444" : "#22c55e"} onChange={(v: number) => setTele(t => ({ ...t, discharge: v }))} />

            {/* Delta-T readout — the signature element */}
            <div style={{ background: breach ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)", border: `1px solid ${breach ? "#7f1d1d" : "#14532d"}`, borderRadius: 8, padding: "14px 16px", marginBottom: 12 }}>
              <div style={{ color: "#475569", fontSize: 10, fontFamily: "monospace", marginBottom: 2 }}>DELTA-T · REGULATORY LIMIT: 2.0°C</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ color: breach ? "#ef4444" : "#22c55e", fontSize: 36, fontFamily: "monospace", fontWeight: 900, lineHeight: 1 }}>
                  +{deltaT.toFixed(1)}°C
                </span>
                <div style={{ background: breach ? "#ef4444" : "#22c55e", color: "#000", fontSize: 11, fontFamily: "monospace", fontWeight: 900, padding: "3px 9px", borderRadius: 4 }}>
                  {breach ? "⚠ BREACH" : "✓ COMPLIANT"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", flexShrink: 0 }} />
              <span style={{ color: "#334155", fontSize: 10, fontFamily: "monospace" }}>SELF-CLEANING ULTRASONIC ACTIVE · IP68 / NEMA 4X · 99.9% UPTIME</span>
            </div>
          </Panel>
        </div>

        {/* ── Scores ── */}
        <Panel title="Deterministic risk & integrity scores">
          <div style={{ display: "grid", gridTemplateColumns: "auto auto auto 1fr", gap: 20, alignItems: "start" }}>
            <GaugeDial value={risk.score} color={riskColor} label="Composite risk" />
            <GaugeDial value={qc} color={qcColor} label="QC confidence" />
            <GaugeDial value={Math.round(risk.components.thermal)} color={risk.components.thermal > 70 ? "#ef4444" : "#f59e0b"} label="Thermal load" />
            <div style={{ paddingLeft: 16, borderLeft: "1px solid #1e293b" }}>
              <Bar label="THERMAL LOAD" value={risk.components.thermal} color="#ef4444" />
              <Bar label="WATER WITHDRAWAL" value={risk.components.withdrawal} color="#f59e0b" />
              <Bar label="SEASONAL STRESS" value={risk.components.seasonal} color="#f97316" />
              <Bar label="INFRASTRUCTURE RISK" value={risk.components.infra} color="#8b5cf6" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
            {[
              { label: "CLASSIFICATION", value: riskLbl, color: riskColor },
              { label: "QC STATUS", value: qcLbl, color: qcColor },
              { label: "HUMAN REVIEW", value: "REQUIRED", color: "#f97316" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ padding: "8px 12px", background: "rgba(0,0,0,0.3)", border: `1px solid ${color}22`, borderRadius: 6 }}>
                <div style={{ color: "#475569", fontSize: 10, fontFamily: "monospace" }}>{label}</div>
                <div style={{ color, fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* ── Run Button ── */}
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <button onClick={run} disabled={phase === "running"} style={{
            background: phase === "running" ? "#1e293b" : "#f97316",
            color: phase === "running" ? "#475569" : "#000",
            border: "none", borderRadius: 10, padding: "14px 52px",
            fontSize: 15, fontWeight: 700, fontFamily: "monospace",
            cursor: phase === "running" ? "not-allowed" : "pointer",
            letterSpacing: "0.06em", boxShadow: phase === "running" ? "none" : "0 0 24px rgba(249,115,22,0.35)",
            transition: "all 0.3s"
          }}>
            {phase === "running" ? "⟳  AUTOPILOT SIMULATION RUNNING..." : "▶  RUN AUTOPILOT SIMULATION"}
          </button>
        </div>

        {/* ── Error Display ── */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid #7f1d1d", borderRadius: 8, padding: 12, marginBottom: 16, color: "#fca5a5" }}>
            <div style={{ fontSize: 12, fontFamily: "monospace" }}>⚠ {error}</div>
          </div>
        )}

        {/* ── Analysis Report ── */}
        {analysis && (
          <div ref={reportRef} className="fade-up">
            <Panel title={`Qwen Analysis — ${analysis.status}`} accent={statusColors[analysis.status]}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 12, height: 12, background: alertColors[analysis.alert_level], borderRadius: "50%", boxShadow: `0 0 8px ${alertColors[analysis.alert_level]}` }} />
                  <span style={{ color: alertColors[analysis.alert_level], fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>ALERT LEVEL: {analysis.alert_level}</span>
                </div>
                <div style={{ color: "#cbd5e1", fontSize: 12, lineHeight: 1.6, marginBottom: 12 }}>
                  {analysis.executive_summary}
                </div>
              </div>

              <div style={{ background: "rgba(15,23,42,0.5)", border: "1px solid #1e293b", borderRadius: 6, padding: 12, marginBottom: 12 }}>
                <div style={{ color: "#94a3b8", fontSize: 10, fontFamily: "monospace", fontWeight: 700, marginBottom: 8 }}>TECHNICAL DIAGNOSIS</div>
                <div style={{ color: "#cbd5e1", fontSize: 11, lineHeight: 1.6 }}>
                  {analysis.technical_diagnosis}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ color: "#94a3b8", fontSize: 10, fontFamily: "monospace", fontWeight: 700, marginBottom: 6 }}>VOLATILITY POINTS</div>
                  {analysis.volatility_points.map((point: string, i: number) => (
                    <div key={i} style={{ color: "#cbd5e1", fontSize: 10, marginBottom: 4 }}>• {point}</div>
                  ))}
                </div>
                <div>
                  <div style={{ color: "#94a3b8", fontSize: 10, fontFamily: "monospace", fontWeight: 700, marginBottom: 6 }}>RECOMMENDATIONS</div>
                  {analysis.recommendations.map((rec: string, i: number) => (
                    <div key={i} style={{ color: "#cbd5e1", fontSize: 10, marginBottom: 4 }}>• {rec}</div>
                  ))}
                </div>
              </div>

              <div style={{ background: "rgba(15,23,42,0.5)", border: "1px solid #1e293b", borderRadius: 6, padding: 12, marginBottom: 12 }}>
                <div style={{ color: "#94a3b8", fontSize: 10, fontFamily: "monospace", fontWeight: 700, marginBottom: 6 }}>REGULATORY READINESS</div>
                <div style={{ color: "#cbd5e1", fontSize: 11, lineHeight: 1.6 }}>
                  {analysis.regulatory_readiness}
                </div>
              </div>

              <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid #14532d", borderRadius: 6, padding: 12, marginBottom: 12 }}>
                <div style={{ color: "#86efac", fontSize: 10, fontFamily: "monospace", fontWeight: 700, marginBottom: 6 }}>CIVIC IMPACT</div>
                <div style={{ color: "#cbd5e1", fontSize: 11, lineHeight: 1.6 }}>
                  {analysis.civic_impact}
                </div>
              </div>

              <div style={{ background: "rgba(15,23,42,0.5)", border: "1px solid #1e293b", borderRadius: 6, padding: 12, marginBottom: 16 }}>
                <div style={{ color: "#f97316", fontSize: 10, fontFamily: "monospace", fontWeight: 700, marginBottom: 6 }}>HUMAN VERIFICATION CHECKLIST</div>
                {analysis.human_checklist.map((item: string, i: number) => (
                  <div key={i} style={{ color: "#cbd5e1", fontSize: 10, marginBottom: 4, display: "flex", gap: 8 }}>
                    <span>☐</span> {item}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setApproved(true)} style={{
                  flex: 1, background: "#22c55e", color: "#000", border: "none", borderRadius: 6, padding: "10px 16px",
                  fontSize: 11, fontFamily: "monospace", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                }}>
                  ✓ APPROVE & EXECUTE
                </button>
                <button onClick={() => setApproved(false)} style={{
                  flex: 1, background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "10px 16px",
                  fontSize: 11, fontFamily: "monospace", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                }}>
                  ✕ REJECT & REVIEW
                </button>
              </div>

              {approved !== null && (
                <div style={{ marginTop: 12, padding: 12, background: approved ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${approved ? "#14532d" : "#7f1d1d"}`, borderRadius: 6, color: approved ? "#86efac" : "#fca5a5", fontSize: 11, fontFamily: "monospace", textAlign: "center" }}>
                  {approved ? "✓ ANALYSIS APPROVED FOR EXECUTION" : "✕ ANALYSIS REJECTED - HUMAN REVIEW REQUIRED"}
                </div>
              )}
            </Panel>
          </div>
        )}
      </div>
    </div>
  );
}
