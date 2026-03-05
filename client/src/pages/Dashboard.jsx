import { useEffect, useState, useRef } from "react";
import { getHealthData } from "../services/api";
import { io } from "socket.io-client";
import HealthChart from "../components/HealthChart";
import HealthScore from "../components/HealthScore";
import AIInsights from "../components/AIInsights";
import HealthAlerts from "../components/HealthAlerts";
import Navbar from "../components/Navbar";

const socket = io("http://localhost:5000");

// ── Animated number ───────────────────────────────────────────────────────────
function AnimatedNumber({ value, decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  const displayRef = useRef(0);
  useEffect(() => {
    const start = displayRef.current;
    const end = Number(value) || 0;
    const dur = 900;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const next = start + (end - start) * ease;
      displayRef.current = next;
      setDisplay(next);
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{display.toFixed(decimals)}</>;
}

// ── Arc ring ─────────────────────────────────────────────────────────────────
function ArcRing({ value, max, color, size = 120, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min((value || 0) / max, 1);
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnim(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - anim)}
        style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 8px ${color}99)` }}
      />
    </svg>
  );
}

// ── Hero metric card ──────────────────────────────────────────────────────────
function HeroCard({ label, value, unit, max, color, icon, decimals = 0, trend }) {
  const [hov, setHov] = useState(false);
  const pct = Math.min((value || 0) / max * 100, 100).toFixed(0);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", borderRadius: 28, padding: "28px 24px",
        background: hov
          ? `linear-gradient(145deg, ${color}18, ${color}08)`
          : "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
        border: `1px solid ${hov ? color + "40" : "rgba(255,255,255,0.07)"}`,
        backdropFilter: "blur(20px)",
        transition: "all .3s cubic-bezier(.4,0,.2,1)",
        transform: hov ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
        boxShadow: hov ? `0 24px 64px -12px ${color}30` : "none",
        cursor: "default", overflow: "hidden",
      }}
    >
      {/* bg glow */}
      <div style={{
        position: "absolute", top: -40, right: -40, width: 140, height: 140,
        borderRadius: "50%", background: color, opacity: hov ? 0.08 : 0.04,
        filter: "blur(40px)", transition: "opacity .3s", pointerEvents: "none",
      }} />

      {/* top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 13,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>{icon}</div>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 50, padding: "3px 10px",
        }}>{pct}%</div>
      </div>

      {/* ring + value */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <ArcRing value={value} max={max} color={color} size={80} stroke={7} />
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 18, transform: "rotate(90deg)",
          }}>{icon}</div>
        </div>
        <div>
          <div style={{
            fontSize: 36, fontWeight: 800, color: "#fff",
            letterSpacing: "-1.5px", lineHeight: 1,
            fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
          }}>
            <AnimatedNumber value={value} decimals={decimals} />
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 4 }}>
            {unit}
            {trend && (
              <span style={{
                marginLeft: 8, fontSize: 11, fontWeight: 700,
                color: trend > 0 ? "#30d158" : "#ff375f",
              }}>
                {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* progress bar */}
      <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          width: `${Math.min((value || 0) / max * 100, 100)}%`,
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          boxShadow: `0 0 8px ${color}60`,
          transition: "width 1.3s cubic-bezier(.4,0,.2,1)",
        }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{label}</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Goal: {max.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function Chip({ icon, label, value, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: `${color}10`, border: `1px solid ${color}25`,
      borderRadius: 14, padding: "10px 16px", flex: 1,
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 10,
        background: `${color}18`, display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0,
      }}>{icon}</span>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>{value}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

// ── Section title ─────────────────────────────────────────────────────────────
function SectionTitle({ title, subtitle, accent }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 3, height: 18, borderRadius: 99, background: accent || "#30d158" }} />
        <h2 style={{
          margin: 0, fontSize: 16, fontWeight: 700, color: "#fff",
          letterSpacing: "-0.2px", fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        }}>{title}</h2>
      </div>
      {subtitle && <p style={{ margin: "5px 0 0 13px", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{subtitle}</p>}
    </div>
  );
}

// ── Glass panel ───────────────────────────────────────────────────────────────
function Panel({ children, style = {} }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 28, padding: "28px",
      backdropFilter: "blur(24px)",
      ...style,
    }}>{children}</div>
  );
}

// ── Reading row ───────────────────────────────────────────────────────────────
function ReadingRow({ d, i, total }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "32px 1fr 1fr 1fr 1fr",
      gap: 12, alignItems: "center",
      padding: "11px 14px", borderRadius: 12,
      background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
    }}>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: 700, textAlign: "center" }}>
        {total - i}
      </span>
      <span style={{ fontSize: 13, color: "#30d158", fontWeight: 600 }}>🏃 {d.steps?.toLocaleString()}</span>
      <span style={{ fontSize: 13, color: "#ff375f", fontWeight: 600 }}>❤️ {d.heartRate} bpm</span>
      <span style={{ fontSize: 13, color: "#0a84ff", fontWeight: 600 }}>🌙 {d.sleepHours?.toFixed(1)}h</span>
      <span style={{ fontSize: 13, color: "#5ac8fa", fontWeight: 600 }}>💧 {d.waterIntake?.toFixed(1)}L</span>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [healthData, setHealthData] = useState([]);
  const [liveData, setLiveData] = useState(null);
  const [time, setTime] = useState(new Date());
  const user = JSON.parse(localStorage.getItem("vs_user") || "{}");
  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getHealthData();
        setHealthData(res.data.slice(-10));
      } catch (err) { console.error(err); }
    };
    loadData();
    socket.on("healthUpdate", (data) => {
      setLiveData(data);
      setHealthData(prev => [...prev, data].slice(-10));
    });
    return () => socket.off("healthUpdate");
  }, []);

  const metrics = liveData ? [
    { label: "Daily Steps",  value: liveData.steps,       unit: "steps",  max: 10000, color: "#30d158", icon: "🏃", decimals: 0, trend: 8  },
    { label: "Heart Rate",   value: liveData.heartRate,   unit: "bpm",    max: 100,   color: "#ff375f", icon: "❤️", decimals: 0, trend: -3 },
    { label: "Sleep",        value: liveData.sleepHours,  unit: "hours",  max: 9,     color: "#0a84ff", icon: "🌙", decimals: 1, trend: 5  },
    { label: "Hydration",    value: liveData.waterIntake, unit: "litres", max: 3,     color: "#5ac8fa", icon: "💧", decimals: 1, trend: 12 },
  ] : [];

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #060608; overflow-x: hidden; }
        @keyframes ping { 75%,100%{ transform:scale(2.2); opacity:0; } }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .fu { animation: fadeUp .6s cubic-bezier(.4,0,.2,1) both; }
        .fu:nth-child(1){animation-delay:.04s}
        .fu:nth-child(2){animation-delay:.10s}
        .fu:nth-child(3){animation-delay:.16s}
        .fu:nth-child(4){animation-delay:.22s}
        .fu:nth-child(5){animation-delay:.28s}
        .fu:nth-child(6){animation-delay:.34s}
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 99px; }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#060608",
        color: "#fff", fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        overflowX: "hidden", display: "flex", flexDirection: "column", alignItems: "center",
      }}>

        {/* ── deep background texture ── */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 80% 50% at 20% 10%, #30d15812 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, #0a84ff0e 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 60% 30%, #ff375f08 0%, transparent 50%)
          `,
        }} />

        {/* subtle grid overlay */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.3,
          backgroundImage: `linear-gradient(rgba(255,255,255,.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.015) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />

        <Navbar />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "88px 32px 80px", width: "100%" }}>

          {/* ── HERO HEADER ── */}
          <div className="fu" style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.16em",
                  textTransform: "uppercase", marginBottom: 8,
                  background: "linear-gradient(90deg, #30d158, #0a84ff)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>Health Intelligence</div>
                <h1 style={{
                  fontSize: 34, fontWeight: 700, letterSpacing: "-0.8px",
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", lineHeight: 1.2,
                  color: "#fff",
                }}>
                  {greeting},<br />{firstName} 👋
                </h1>
              </div>

              {/* live clock card */}
              <div style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20, padding: "16px 24px", textAlign: "right",
                backdropFilter: "blur(20px)",
              }}>
                <div style={{
                  fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px",
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", fontVariantNumeric: "tabular-nums",
                }}>
                  {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                  {time.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
                  <span style={{ position: "relative", display: "inline-flex", width: 7, height: 7 }}>
                    <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#30d158", opacity: 0.5, animation: "ping 1.4s cubic-bezier(0,0,.2,1) infinite" }} />
                    <span style={{ borderRadius: "50%", width: 7, height: 7, background: "#30d158", display: "block" }} />
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#30d158", letterSpacing: "0.05em" }}>LIVE</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── HEALTH SCORE + CHIPS ── */}
          <div className="fu">
            <Panel style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <div style={{ minWidth: 200 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>Overall Score</div>
                <HealthScore data={liveData} />
              </div>
              <div style={{ width: "1px", height: 60, background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />
              {liveData ? (
                <div style={{ display: "flex", gap: 10, flex: 1, flexWrap: "wrap" }}>
                  <Chip icon="🏃" label="Steps"      value={liveData.steps?.toLocaleString()}       color="#30d158" />
                  <Chip icon="❤️" label="Heart Rate" value={`${liveData.heartRate} bpm`}             color="#ff375f" />
                  <Chip icon="🌙" label="Sleep"      value={`${liveData.sleepHours?.toFixed(1)} hrs`} color="#0a84ff" />
                  <Chip icon="💧" label="Water"      value={`${liveData.waterIntake?.toFixed(1)} L`}  color="#5ac8fa" />
                </div>
              ) : (
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.25)" }}>Waiting for sensor data…</div>
              )}
            </Panel>
          </div>

          {/* ── METRIC CARDS ── */}
          {liveData ? (
            <div className="fu" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}>
              {metrics.map(m => <HeroCard key={m.label} {...m} />)}
            </div>
          ) : (
            <Panel style={{ marginBottom: 20, textAlign: "center", padding: "60px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📡</div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.3)" }}>Waiting for live sensor data…</div>
            </Panel>
          )}

          {/* ── ALERTS + CHART row ── */}
          <div className="fu" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 20 }}>
            <Panel>
              <SectionTitle title="Alerts" subtitle="Anomaly detection" accent="#ff375f" />
              <HealthAlerts data={liveData} />
            </Panel>
            <Panel>
              <SectionTitle title="Health Trends" subtitle="Last 10 readings" accent="#0a84ff" />
              <HealthChart data={healthData} />
            </Panel>
          </div>

          {/* ── READINGS TABLE ── */}
          <div className="fu">
            <Panel style={{ marginBottom: 20 }}>
              <SectionTitle title="Recent Readings" subtitle="Raw sensor feed" accent="#5ac8fa" />
              {healthData.length === 0 ? (
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 14, padding: "16px 0" }}>No readings yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* header */}
                  <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 1fr 1fr", gap: 12, padding: "8px 14px", marginBottom: 4 }}>
                    {["#", "Steps", "Heart Rate", "Sleep", "Water"].map(h => (
                      <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
                    ))}
                  </div>
                  {healthData.map((d, i) => <ReadingRow key={i} d={d} i={i} total={healthData.length} />)}
                </div>
              )}
            </Panel>
          </div>

          {/* ── AI INSIGHTS ── */}
          <div className="fu">
            <Panel style={{
              background: "linear-gradient(145deg, rgba(48,209,88,0.05), rgba(10,132,255,0.05))",
              border: "1px solid rgba(48,209,88,0.12)",
            }}>
              <SectionTitle title="AI Health Insights" subtitle="Powered by Gemini AI" accent="#30d158" />
              {liveData ? (
                <AIInsights data={liveData} />
              ) : (
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 14 }}>Waiting for live data…</div>
              )}
            </Panel>
          </div>

        </div>
      </div>
    </>
  );
}