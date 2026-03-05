import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Navbar from "../components/Navbar";

const socket = io("http://localhost:5000");

const DEFAULT_GOALS = {
  steps:      { label: "Daily Steps",    icon: "🏃", color: "#30d158", unit: "steps", min: 1000,  max: 20000, default: 10000 },
  heartRate:  { label: "Target HR",      icon: "❤️", color: "#ff375f", unit: "bpm",   min: 50,    max: 120,   default: 75    },
  sleepHours: { label: "Sleep Duration", icon: "🌙", color: "#0a84ff", unit: "hrs",   min: 4,     max: 12,    default: 8     },
  waterIntake:{ label: "Water Intake",   icon: "💧", color: "#5ac8fa", unit: "L",     min: 0.5,   max: 5,     default: 2.5   },
};

// ── Radial progress ring ──────────────────────────────────────────────────────
function RadialProgress({ pct, color, size = 160, stroke = 12, children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(pct), 100); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute", inset: 0 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={circ * (1 - Math.min(anim, 1))}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 10px ${color}80)` }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

// ── Goal card ─────────────────────────────────────────────────────────────────
function GoalCard({ metricKey, config, goal, current, onGoalChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(goal);
  const [hov, setHov] = useState(false);

  const pct = current != null ? Math.min(current / goal, 1) : 0;
  const pctDisplay = Math.round(pct * 100);
  const achieved = pct >= 1;

  const save = () => {
    const val = parseFloat(draft);
    if (!isNaN(val) && val >= config.min && val <= config.max) {
      onGoalChange(metricKey, val);
    }
    setEditing(false);
  };

  const statusText = achieved ? "Goal achieved! 🎉"
    : pct >= 0.75 ? "Almost there!"
    : pct >= 0.5  ? "Halfway there"
    : pct >= 0.25 ? "Keep going"
    : "Just started";

  const statusColor = achieved ? "#30d158"
    : pct >= 0.75 ? "#ffd60a"
    : pct >= 0.5  ? "#ff9f0a"
    : "rgba(255,255,255,0.4)";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov
          ? `linear-gradient(145deg, ${config.color}12, ${config.color}06)`
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${hov ? config.color + "35" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 28, padding: "28px 24px",
        backdropFilter: "blur(20px)",
        transition: "all .3s cubic-bezier(.4,0,.2,1)",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hov ? `0 20px 60px -12px ${config.color}25` : "none",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
        position: "relative", overflow: "hidden",
      }}
    >
      {/* achieved badge */}
      {achieved && (
        <div style={{
          position: "absolute", top: 16, right: 16,
          background: "rgba(48,209,88,0.15)", border: "1px solid rgba(48,209,88,0.3)",
          borderRadius: 50, padding: "3px 10px",
          fontSize: 11, fontWeight: 700, color: "#30d158",
        }}>✓ Done</div>
      )}

      {/* bg glow */}
      <div style={{
        position: "absolute", top: -60, right: -60, width: 180, height: 180,
        borderRadius: "50%", background: config.color,
        opacity: hov ? 0.07 : 0.03, filter: "blur(50px)",
        transition: "opacity .3s", pointerEvents: "none",
      }} />

      {/* ring */}
      <RadialProgress pct={pct} color={config.color} size={150} stroke={11}>
        <div style={{ fontSize: 28 }}>{config.icon}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.8px", lineHeight: 1 }}>
          {pctDisplay}%
        </div>
      </RadialProgress>

      {/* current value */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Current</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: config.color, letterSpacing: "-0.5px" }}>
          {current != null
            ? metricKey === "steps" ? current.toLocaleString()
            : Number(current).toFixed(metricKey === "heartRate" ? 0 : 1)
            : "—"}
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>{config.unit}</span>
        </div>
      </div>

      {/* divider */}
      <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.06)" }} />

      {/* goal setting */}
      <div style={{ width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {config.label} Goal
        </div>
        {editing ? (
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <input
              type="number" value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
              min={config.min} max={config.max}
              style={{
                width: 100, background: "rgba(255,255,255,0.08)",
                border: `1px solid ${config.color}60`, borderRadius: 10,
                padding: "8px 12px", color: "#fff", fontSize: 15,
                fontWeight: 700, textAlign: "center", outline: "none", fontFamily: "inherit",
              }}
              autoFocus
            />
            <button onClick={save} style={{
              padding: "8px 16px", borderRadius: 10, border: "none",
              background: config.color, color: "#000",
              fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            }}>Save</button>
          </div>
        ) : (
          <button onClick={() => { setDraft(goal); setEditing(true); }} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 50, padding: "8px 20px", color: "#fff",
            fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            transition: "all .18s",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = `${config.color}20`; e.currentTarget.style.borderColor = `${config.color}40`; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          >
            {metricKey === "steps" ? goal.toLocaleString() : goal} {config.unit}
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>✏️</span>
          </button>
        )}
      </div>

      {/* status */}
      <div style={{ fontSize: 13, fontWeight: 600, color: statusColor }}>{statusText}</div>
    </div>
  );
}

// ── Static past performance (generated once, outside component) ──────────────
const PAST_DAYS_ACHIEVED = [true, false, true, true, false, true].map(() => Math.random() > 0.35);

// ── Weekly streak card ────────────────────────────────────────────────────────
function StreakCard({ goals, liveData }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date().getDay();
  const achieved = days.map((_, i) => {
    const dayIdx = i + 1;
    if (dayIdx > (today === 0 ? 7 : today)) return null; // future
    if (dayIdx === (today === 0 ? 7 : today) && liveData) {
      return liveData.steps >= goals.steps;
    }
    return PAST_DAYS_ACHIEVED[i] ?? false;
  });

  const streak = (() => {
    let s = 0;
    for (let i = achieved.length - 1; i >= 0; i--) {
      if (achieved[i] === true) s++;
      else if (achieved[i] === false) break;
    }
    return s;
  })();

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 24, padding: "24px 28px", backdropFilter: "blur(20px)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Weekly Streak</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Days you hit your step goal</div>
        </div>
        <div style={{
          background: "rgba(255,150,0,0.12)", border: "1px solid rgba(255,150,0,0.25)",
          borderRadius: 14, padding: "8px 18px", textAlign: "center",
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#ff9f0a" }}>{streak}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em" }}>day streak 🔥</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
        {days.map((day, i) => {
          const status = achieved[i];
          return (
            <div key={day} style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                width: "100%", aspectRatio: "1", borderRadius: 12,
                background: status === true ? "rgba(48,209,88,0.2)"
                  : status === false ? "rgba(255,55,95,0.1)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${status === true ? "rgba(48,209,88,0.4)"
                  : status === false ? "rgba(255,55,95,0.2)"
                  : "rgba(255,255,255,0.07)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, marginBottom: 6,
                transition: "all .2s",
              }}>
                {status === true ? "✓" : status === false ? "✗" : "·"}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>{day}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Overview bar ──────────────────────────────────────────────────────────────
function OverviewBar({ goals, liveData }) {
  const metrics = [
    { key: "steps",       label: "Steps",      color: "#30d158", icon: "🏃" },
    { key: "heartRate",   label: "Heart Rate", color: "#ff375f", icon: "❤️" },
    { key: "sleepHours",  label: "Sleep",      color: "#0a84ff", icon: "🌙" },
    { key: "waterIntake", label: "Water",      color: "#5ac8fa", icon: "💧" },
  ];

  const achieved = metrics.filter(m => liveData && liveData[m.key] >= goals[m.key]).length;

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 24, padding: "24px 28px", backdropFilter: "blur(20px)",
      marginBottom: 20,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Today's Progress</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            {achieved} of 4 goals achieved today
          </div>
        </div>
        <div style={{
          background: achieved === 4 ? "rgba(48,209,88,0.12)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${achieved === 4 ? "rgba(48,209,88,0.3)" : "rgba(255,255,255,0.08)"}`,
          borderRadius: 50, padding: "6px 18px",
          fontSize: 13, fontWeight: 700,
          color: achieved === 4 ? "#30d158" : "rgba(255,255,255,0.5)",
        }}>
          {achieved === 4 ? "🏆 All goals hit!" : `${achieved}/4 complete`}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {metrics.map(m => {
          const current = liveData?.[m.key] ?? 0;
          const goal = goals[m.key];
          const pct = Math.min(current / goal * 100, 100);
          return (
            <div key={m.key}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>{m.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{m.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>
                    {m.key === "steps" ? current.toLocaleString() : Number(current).toFixed(m.key === "heartRate" ? 0 : 1)}
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 3 }}>
                      / {m.key === "steps" ? goal.toLocaleString() : goal}
                    </span>
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 100 ? "#30d158" : "rgba(255,255,255,0.3)", minWidth: 36, textAlign: "right" }}>
                    {Math.round(pct)}%
                  </span>
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 99,
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${m.color}80, ${m.color})`,
                  boxShadow: `0 0 8px ${m.color}50`,
                  transition: "width 1.2s cubic-bezier(.4,0,.2,1)",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Goals() {
  const [liveData, setLiveData] = useState(null);
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem("vs_goals");
    if (saved) return JSON.parse(saved);
    return {
      steps:       DEFAULT_GOALS.steps.default,
      heartRate:   DEFAULT_GOALS.heartRate.default,
      sleepHours:  DEFAULT_GOALS.sleepHours.default,
      waterIntake: DEFAULT_GOALS.waterIntake.default,
    };
  });

  useEffect(() => {
    socket.on("healthUpdate", setLiveData);
    return () => socket.off("healthUpdate");
  }, []);

  const updateGoal = (key, val) => {
    const updated = { ...goals, [key]: val };
    setGoals(updated);
    localStorage.setItem("vs_goals", JSON.stringify(updated));
  };

  const resetGoals = () => {
    const defaults = {
      steps: 10000, heartRate: 75, sleepHours: 8, waterIntake: 2.5,
    };
    setGoals(defaults);
    localStorage.setItem("vs_goals", JSON.stringify(defaults));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060608; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu { animation: fadeUp .55s cubic-bezier(.4,0,.2,1) both; }
        .fu1{animation-delay:.04s} .fu2{animation-delay:.10s}
        .fu3{animation-delay:.16s} .fu4{animation-delay:.22s}
        .fu5{animation-delay:.28s}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:99px}
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#060608", color: "#fff",
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        overflowX: "hidden",
      }}>
        {/* bg gradients */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 70% 50% at 15% 15%, #30d15810 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 85% 75%, #0a84ff0c 0%, transparent 60%)
          `,
        }} />

        <Navbar />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "88px 28px 80px", width: "100%" }}>

          {/* header */}
          <div className="fu fu1" style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.16em",
                  textTransform: "uppercase", marginBottom: 8,
                  background: "linear-gradient(90deg, #30d158, #0a84ff)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>VitalSync</div>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.8px" }}>
                  Goals & Progress
                </h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                  Set your daily targets and track progress in real time
                </p>
              </div>
              <button onClick={resetGoals} style={{
                padding: "9px 20px", borderRadius: 50, border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)",
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                transition: "all .18s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
              >↺ Reset Defaults</button>
            </div>
          </div>

          {/* overview bar */}
          <div className="fu fu2">
            <OverviewBar goals={goals} liveData={liveData} />
          </div>

          {/* goal cards */}
          <div className="fu fu3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16, marginBottom: 20 }}>
            {Object.entries(DEFAULT_GOALS).map(([key, config]) => (
              <GoalCard
                key={key}
                metricKey={key}
                config={config}
                goal={goals[key]}
                current={liveData?.[key] ?? null}
                onGoalChange={updateGoal}
              />
            ))}
          </div>

          {/* streak */}
          <div className="fu fu4">
            <StreakCard goals={goals} liveData={liveData} />
          </div>

        </div>
      </div>
    </>
  );
}