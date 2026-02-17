import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis
} from "recharts";

const COLORS = {
  danger: "#ef4444",
  warning: "#f97316",
  success: "#22c55e",
  accent: "#06b6d4",
  muted: "#64748b",
  bg: "#0a0f1e",
  card: "#0f1629",
  border: "#1e2d4a",
  text: "#e2e8f0",
  dim: "#94a3b8",
};

const churnBySegment = [
  { segment: "Enterprise", churnRate: 4.2, retained: 95.8, customers: 1240 },
  { segment: "Mid-Market", churnRate: 11.7, retained: 88.3, customers: 3420 },
  { segment: "SMB", churnRate: 23.4, retained: 76.6, customers: 8910 },
  { segment: "Freemium", churnRate: 38.1, retained: 61.9, customers: 14200 },
];

const cohortData = [
  { month: "Jan", m0: 100, m1: 88, m2: 79, m3: 72, m4: 68, m5: 65 },
  { month: "Feb", m0: 100, m1: 91, m2: 83, m3: 76, m4: 72, m5: 69 },
  { month: "Mar", m0: 100, m1: 89, m2: 81, m3: 77, m4: 74, m5: 71 },
  { month: "Apr", m0: 100, m1: 93, m2: 86, m3: 80, m4: 77 },
  { month: "May", m0: 100, m1: 90, m2: 84, m3: 79 },
  { month: "Jun", m0: 100, m1: 92, m2: 87 },
];

const retentionTrend = [
  { month: "Jul", rate: 74.2, predicted: 74.2 },
  { month: "Aug", rate: 75.8, predicted: 75.5 },
  { month: "Sep", rate: 74.1, predicted: 76.1 },
  { month: "Oct", rate: 77.3, predicted: 77.0 },
  { month: "Nov", rate: 79.4, predicted: 78.8 },
  { month: "Dec", rate: 81.6, predicted: 80.9 },
  { month: "Jan", rate: 82.9, predicted: 82.4 },
  { month: "Feb", rate: null, predicted: 83.8 },
  { month: "Mar", rate: null, predicted: 85.1 },
];

const atRiskCustomers = [
  { id: "C-4821", name: "TechFlow Inc", score: 91, days: 14, revenue: "$8,400", action: "Immediate Call" },
  { id: "C-3904", name: "Nexus Digital", score: 87, days: 21, revenue: "$5,200", action: "Discount Offer" },
  { id: "C-5512", name: "Bluewave Co", score: 82, days: 8, revenue: "$12,100", action: "Success Check-in" },
  { id: "C-2287", name: "Orbit Labs", score: 79, days: 30, revenue: "$3,800", action: "Re-engagement" },
  { id: "C-6643", name: "Surge Media", score: 74, days: 45, revenue: "$6,900", action: "Feature Demo" },
];

const featureImportance = [
  { feature: "Days Since Login", importance: 0.31 },
  { feature: "Support Tickets", importance: 0.24 },
  { feature: "Feature Adoption", importance: 0.19 },
  { feature: "Contract Age", importance: 0.13 },
  { feature: "NPS Score", importance: 0.08 },
  { feature: "Payment Delays", importance: 0.05 },
];

const scatterData = Array.from({ length: 80 }, (_, i) => ({
  engagement: Math.random() * 100,
  tenure: Math.random() * 36,
  churnProb: Math.random(),
  size: Math.random() * 400 + 100,
}));

const StatCard = ({ label, value, sub, color, trend }) => (
  <div style={{
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderLeft: `3px solid ${color}`,
    borderRadius: 8,
    padding: "20px 24px",
    position: "relative",
    overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", top: 0, right: 0, width: 80, height: 80,
      background: `radial-gradient(circle at top right, ${color}18, transparent 70%)`,
    }} />
    <div style={{ fontSize: 12, color: COLORS.dim, fontFamily: "'DM Mono', monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 36, fontWeight: 800, color: COLORS.text, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 13, color: color, marginTop: 6, fontFamily: "'DM Mono', monospace" }}>{sub}</div>}
  </div>
);

const RiskBadge = ({ score }) => {
  const color = score >= 85 ? COLORS.danger : score >= 75 ? COLORS.warning : COLORS.accent;
  const label = score >= 85 ? "CRITICAL" : score >= 75 ? "HIGH" : "MEDIUM";
  return (
    <span style={{
      background: `${color}22`, color, border: `1px solid ${color}55`,
      borderRadius: 4, padding: "2px 8px", fontSize: 11,
      fontFamily: "'DM Mono', monospace", letterSpacing: 1,
    }}>{label}</span>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f1629", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px" }}>
      <div style={{ color: COLORS.dim, fontSize: 12, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
          {p.name?.toLowerCase().includes("rate") || p.name?.toLowerCase().includes("retention") ? "%" : ""}
        </div>
      ))}
    </div>
  );
};

export default function ChurnDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimIn(true), 100);
  }, []);

  const tabs = ["overview", "at-risk", "model", "cohorts"];

  return (
    <div style={{
      minHeight: "100vh",
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: "'DM Sans', sans-serif",
      opacity: animIn ? 1 : 0,
      transition: "opacity 0.6s ease",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0f1e; }
        ::-webkit-scrollbar-thumb { background: #1e2d4a; border-radius: 2px; }
        .tab-btn { transition: all 0.2s ease; cursor: pointer; }
        .tab-btn:hover { color: #e2e8f0 !important; }
        .row-hover { transition: background 0.15s; cursor: default; }
        .row-hover:hover { background: #1e2d4a44 !important; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${COLORS.border}`,
        padding: "20px 36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: `linear-gradient(90deg, ${COLORS.card}, ${COLORS.bg})`,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.success, boxShadow: `0 0 8px ${COLORS.success}` }} />
            <span style={{ fontSize: 11, color: COLORS.dim, fontFamily: "'DM Mono', monospace", letterSpacing: 2, textTransform: "uppercase" }}>Model Active · 85% Accuracy</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Syne', sans-serif", margin: 0, letterSpacing: -0.5 }}>
            Churn Prediction & Retention
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: COLORS.dim, fontFamily: "'DM Mono', monospace" }}>RETENTION IMPROVEMENT</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.success, fontFamily: "'Syne', sans-serif" }}>+12%</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "0 36px", display: "flex", gap: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab}
            className="tab-btn"
            onClick={() => setActiveTab(tab)}
            style={{
              background: "none", border: "none", padding: "14px 20px",
              fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: 1,
              textTransform: "uppercase", cursor: "pointer",
              color: activeTab === tab ? COLORS.accent : COLORS.muted,
              borderBottom: activeTab === tab ? `2px solid ${COLORS.accent}` : "2px solid transparent",
              marginBottom: -1,
            }}
          >{tab.replace("-", " ")}</button>
        ))}
      </div>

      <div style={{ padding: "28px 36px" }}>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div>
            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              <StatCard label="Total Customers" value="27,770" sub="↑ 4.2% MoM" color={COLORS.accent} />
              <StatCard label="Churn Rate" value="18.3%" sub="↓ 3.1% vs last quarter" color={COLORS.warning} />
              <StatCard label="At-Risk Accounts" value="1,842" sub="→ 412 critical" color={COLORS.danger} />
              <StatCard label="Retention Rate" value="81.7%" sub="↑ 12% since intervention" color={COLORS.success} />
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginBottom: 20 }}>
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: COLORS.dim, fontFamily: "'DM Mono', monospace", letterSpacing: 1, textTransform: "uppercase" }}>Retention Rate Trend</div>
                  <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Actual vs Logistic Regression prediction</div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={retentionTrend}>
                    <defs>
                      <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
                    <XAxis dataKey="month" stroke={COLORS.muted} tick={{ fontSize: 11, fontFamily: "'DM Mono', monospace" }} />
                    <YAxis stroke={COLORS.muted} tick={{ fontSize: 11, fontFamily: "'DM Mono', monospace" }} domain={[70, 90]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="rate" stroke={COLORS.success} fill="url(#retGrad)" strokeWidth={2} name="Actual Rate" dot={{ fill: COLORS.success, r: 3 }} connectNulls={false} />
                    <Area type="monotone" dataKey="predicted" stroke={COLORS.accent} fill="url(#predGrad)" strokeWidth={2} strokeDasharray="5 3" name="Predicted" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: COLORS.dim, fontFamily: "'DM Mono', monospace", letterSpacing: 1, textTransform: "uppercase" }}>Churn by Segment</div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={churnBySegment} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" horizontal={false} />
                    <XAxis type="number" stroke={COLORS.muted} tick={{ fontSize: 11, fontFamily: "'DM Mono', monospace" }} unit="%" />
                    <YAxis dataKey="segment" type="category" stroke={COLORS.muted} tick={{ fontSize: 11, fontFamily: "'DM Mono', monospace" }} width={72} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="churnRate" radius={[0, 4, 4, 0]} name="Churn Rate">
                      {churnBySegment.map((entry, index) => (
                        <Cell key={index} fill={entry.churnRate > 30 ? COLORS.danger : entry.churnRate > 15 ? COLORS.warning : COLORS.success} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scatter */}
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: COLORS.dim, fontFamily: "'DM Mono', monospace", letterSpacing: 1, textTransform: "uppercase" }}>Engagement vs Tenure · Churn Probability Map</div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Bubble size = revenue · Color = churn risk</div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
                  <XAxis dataKey="engagement" name="Engagement Score" stroke={COLORS.muted} tick={{ fontSize: 11, fontFamily: "'DM Mono', monospace" }} label={{ value: "Engagement Score", position: "insideBottom", offset: -5, fill: COLORS.muted, fontSize: 11 }} />
                  <YAxis dataKey="tenure" name="Tenure (months)" stroke={COLORS.muted} tick={{ fontSize: 11, fontFamily: "'DM Mono', monospace" }} />
                  <ZAxis dataKey="size" range={[30, 300]} />
                  <Tooltip cursor={{ strokeDasharray: "3 3", stroke: COLORS.border }} content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                        <div style={{ color: COLORS.dim }}>Engagement: {d?.engagement?.toFixed(1)}</div>
                        <div style={{ color: COLORS.dim }}>Tenure: {d?.tenure?.toFixed(0)}mo</div>
                        <div style={{ color: d?.churnProb > 0.6 ? COLORS.danger : d?.churnProb > 0.3 ? COLORS.warning : COLORS.success }}>
                          Churn Prob: {(d?.churnProb * 100)?.toFixed(0)}%
                        </div>
                      </div>
                    );
                  }} />
                  <Scatter data={scatterData} fill={COLORS.accent} shape={(props) => {
                    const { cx, cy, payload } = props;
                    const r = Math.sqrt(payload.size) / 3;
                    const color = payload.churnProb > 0.6 ? COLORS.danger : payload.churnProb > 0.3 ? COLORS.warning : COLORS.success;
                    return <circle cx={cx} cy={cy} r={r} fill={`${color}88`} stroke={color} strokeWidth={1} />;
                  }} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* AT-RISK TAB */}
        {activeTab === "at-risk" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
              <StatCard label="Critical Risk" value="412" sub="Score ≥ 85 · Action required" color={COLORS.danger} />
              <StatCard label="High Risk" value="930" sub="Score 70–84 · Monitor closely" color={COLORS.warning} />
              <StatCard label="Revenue at Risk" value="$2.1M" sub="If no intervention" color={COLORS.danger} />
            </div>

            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 24 }}>
              <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, color: COLORS.dim, fontFamily: "'DM Mono', monospace", letterSpacing: 1, textTransform: "uppercase" }}>At-Risk Customer Queue</div>
                  <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Sorted by churn probability · AI-recommended actions</div>
                </div>
                <div style={{ fontSize: 11, color: COLORS.accent, fontFamily: "'DM Mono', monospace", border: `1px solid ${COLORS.accent}44`, borderRadius: 4, padding: "4px 10px" }}>
                  LIVE · 1,842 total
                </div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    {["Customer ID", "Company", "Churn Score", "Days Inactive", "ARR", "Risk Level", "AI Action"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, color: COLORS.muted, fontFamily: "'DM Mono', monospace", letterSpacing: 1, textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {atRiskCustomers.map((c, i) => (
                    <tr key={i} className="row-hover" style={{ borderBottom: `1px solid ${COLORS.border}44` }}>
                      <td style={{ padding: "14px", fontSize: 12, color: COLORS.muted, fontFamily: "'DM Mono', monospace" }}>{c.id}</td>
                      <td style={{ padding: "14px", fontSize: 14, fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 48, height: 6, borderRadius: 3, background: COLORS.border, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${c.score}%`, background: c.score >= 85 ? COLORS.danger : COLORS.warning, borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: c.score >= 85 ? COLORS.danger : COLORS.warning, fontWeight: 700 }}>{c.score}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px", fontSize: 13, color: COLORS.dim, fontFamily: "'DM Mono', monospace" }}>{c.days}d</td>
                      <td style={{ padding: "14px", fontSize: 13, fontFamily: "'DM Mono', monospace", color: COLORS.text }}>{c.revenue}</td>
                      <td style={{ padding: "14px" }}><RiskBadge score={c.score} /></td>
                      <td style={{ padding: "14px" }}>
                        <span style={{ fontSize: 12, color: COLORS.accent, fontFamily: "'DM Mono', monospace", background: `${COLORS.accent}11`, borderRadius: 4, padding: "3px 8px" }}>
                          ✦ {c.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODEL TAB */}
        {activeTab === "model" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              <StatCard label="Model Accuracy" value="85%" sub="Logistic Regression" color={COLORS.success} />
              <StatCard label="Precision" value="82%" sub="True positive rate" color={COLORS.accent} />
              <StatCard label="Recall" value="79%" sub="Sensitivity" color={COLORS.accent} />
              <StatCard label="F1 Score" value="0.804" sub="Harmonic mean" color={COLORS.success} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 24 }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, color: COLORS.dim, fontFamily: "'DM Mono', monospace", letterSpacing: 1, textTransform: "uppercase" }}>Feature Importance</div>
                  <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Top predictors of churn in Logistic Regression</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {featureImportance.map((f, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: COLORS.text }}>{f.feature}</span>
                        <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: COLORS.accent }}>{(f.importance * 100).toFixed(0)}%</span>
                      </div>
                      <div style={{ height: 6, background: COLORS.border, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${f.importance * 100}%`,
                          background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.success})`,
                          borderRadius: 3, transition: "width 0.8s ease",
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 24 }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, color: COLORS.dim, fontFamily: "'DM Mono', monospace", letterSpacing: 1, textTransform: "uppercase" }}>Confusion Matrix</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      { label: "True Positive", value: 3842, color: COLORS.success },
                      { label: "False Positive", value: 412, color: COLORS.danger },
                    ].map((cell) => (
                      <div key={cell.label} style={{ background: `${cell.color}18`, border: `1px solid ${cell.color}44`, borderRadius: 8, padding: "24px 32px", textAlign: "center", minWidth: 140 }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: cell.color, fontFamily: "'Syne', sans-serif" }}>{cell.value.toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Mono', monospace", marginTop: 4 }}>{cell.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      { label: "False Negative", value: 289, color: COLORS.warning },
                      { label: "True Negative", value: 1204, color: COLORS.success },
                    ].map((cell) => (
                      <div key={cell.label} style={{ background: `${cell.color}18`, border: `1px solid ${cell.color}44`, borderRadius: 8, padding: "24px 32px", textAlign: "center", minWidth: 140 }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: cell.color, fontFamily: "'Syne', sans-serif" }}>{cell.value.toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Mono', monospace", marginTop: 4 }}>{cell.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: 20, padding: "12px 16px", background: `${COLORS.success}11`, border: `1px solid ${COLORS.success}33`, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: COLORS.success, fontFamily: "'DM Mono', monospace" }}>
                    MODEL VERDICT · Logistic Regression outperformed Random Forest (81%) and SVM (79%) on validation set
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COHORTS TAB */}
        {activeTab === "cohorts" && (
          <div>
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 24, marginBottom: 20 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: COLORS.dim, fontFamily: "'DM Mono', monospace", letterSpacing: 1, textTransform: "uppercase" }}>Cohort Retention Analysis</div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Monthly retention % by cohort acquisition month</div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "10px 16px", fontSize: 11, color: COLORS.muted, fontFamily: "'DM Mono', monospace", textAlign: "left" }}>Cohort</th>
                      {["M+0", "M+1", "M+2", "M+3", "M+4", "M+5"].map(m => (
                        <th key={m} style={{ padding: "10px 16px", fontSize: 11, color: COLORS.muted, fontFamily: "'DM Mono', monospace", textAlign: "center" }}>{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((row, i) => {
                      const vals = [row.m0, row.m1, row.m2, row.m3, row.m4, row.m5];
                      return (
                        <tr key={i} style={{ borderTop: `1px solid ${COLORS.border}33` }}>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "'DM Mono', monospace", color: COLORS.dim }}>{row.month}</td>
                          {vals.map((v, j) => {
                            if (v === undefined) return <td key={j} />;
                            const opacity = v / 100;
                            const bg = v >= 85 ? COLORS.success : v >= 75 ? COLORS.accent : v >= 65 ? COLORS.warning : COLORS.danger;
                            return (
                              <td key={j} style={{ padding: "12px 16px", textAlign: "center" }}>
                                <div style={{
                                  background: `${bg}${Math.round(opacity * 60).toString(16).padStart(2, "0")}`,
                                  border: `1px solid ${bg}44`,
                                  borderRadius: 6, padding: "6px 10px",
                                  fontSize: 13, fontFamily: "'DM Mono', monospace",
                                  color: v >= 75 ? COLORS.text : COLORS.dim,
                                  fontWeight: j === 0 ? 700 : 400,
                                }}>
                                  {v}%
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: COLORS.dim, fontFamily: "'DM Mono', monospace", letterSpacing: 1, textTransform: "uppercase" }}>Retention Curve by Cohort</div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
                  <XAxis dataKey="month" type="category" allowDuplicatedCategory={false} stroke={COLORS.muted} tick={{ fontSize: 11, fontFamily: "'DM Mono', monospace" }} />
                  <YAxis stroke={COLORS.muted} tick={{ fontSize: 11, fontFamily: "'DM Mono', monospace" }} domain={[60, 100]} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  {cohortData.map((cohort, i) => {
                    const data = [
                      { month: "M+0", val: cohort.m0 }, { month: "M+1", val: cohort.m1 },
                      { month: "M+2", val: cohort.m2 }, { month: "M+3", val: cohort.m3 },
                      { month: "M+4", val: cohort.m4 }, { month: "M+5", val: cohort.m5 },
                    ].filter(d => d.val !== undefined);
                    const colors = [COLORS.accent, COLORS.success, COLORS.warning, "#a78bfa", "#fb7185", "#34d399"];
                    return (
                      <Line key={i} data={data} type="monotone" dataKey="val" stroke={colors[i]} strokeWidth={2}
                        dot={{ fill: colors[i], r: 3 }} name={cohort.month} connectNulls />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
