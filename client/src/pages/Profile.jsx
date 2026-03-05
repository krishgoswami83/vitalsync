import { useState } from "react";
import Navbar from "../components/Navbar";

// ── Helpers ───────────────────────────────────────────────────────────────────

function GlassCard({ children, style = {}, hover = true }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        padding: "24px",
        backdropFilter: "blur(20px)",
        transition: "transform .2s ease, box-shadow .2s ease",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? "0 20px 60px -10px rgba(48,209,88,0.15)" : "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
      textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
      marginBottom: 6,
    }}>
      {children}
    </div>
  );
}

function Tag({ children, color = "#30d158" }) {
  return (
    <span style={{
      display: "inline-block",
      background: `${color}18`,
      border: `1px solid ${color}35`,
      color: color,
      borderRadius: 50,
      padding: "4px 14px",
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.03em",
    }}>
      {children}
    </span>
  );
}

// ── Arc progress (like Apple Watch rings) ────────────────────────────────────
function ArcRing({ pct, color, size = 80, stroke = 7, label, value }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - Math.min(pct, 1))}
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 5px ${color})` }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#fff",
        }}>
          {Math.round(pct * 100)}%
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{value}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>
      </div>
    </div>
  );
}

// ── Stat row ─────────────────────────────────────────────────────────────────
function StatRow({ icon, label, value, color = "#30d158" }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "13px 16px", borderRadius: 14,
      background: "rgba(255,255,255,0.025)",
      marginBottom: 8,
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 14, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

// ── Editable field ────────────────────────────────────────────────────────────
function EditableField({ label, value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  const save = () => { setEditing(false); onChange(val); };

  return (
    <div style={{ marginBottom: 16 }}>
      <Label>{label}</Label>
      {editing ? (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={val}
            onChange={e => setVal(e.target.value)}
            style={{
              flex: 1, background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10, padding: "9px 14px",
              color: "#fff", fontSize: 14, outline: "none",
              fontFamily: "inherit",
            }}
          />
          <button onClick={save} style={{
            background: "#30d158", border: "none", borderRadius: 10,
            padding: "9px 18px", color: "#000", fontWeight: 700,
            fontSize: 13, cursor: "pointer",
          }}>Save</button>
        </div>
      ) : (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 14px", borderRadius: 10,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <span style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>{val}</span>
          <button onClick={() => setEditing(true)} style={{
            background: "none", border: "none", color: "#30d158",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>Edit</button>
        </div>
      )}
    </div>
  );
}

// ── Achievement badge ─────────────────────────────────────────────────────────
function Badge({ icon, title, desc, unlocked }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 8, padding: "16px 12px", borderRadius: 18,
      background: unlocked ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${unlocked ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}`,
      opacity: unlocked ? 1 : 0.4,
      transition: "transform .2s",
      cursor: unlocked ? "default" : "not-allowed",
    }}>
      <span style={{ fontSize: 28, filter: unlocked ? "none" : "grayscale(1)" }}>{icon}</span>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{title}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 2 }}>{desc}</div>
      </div>
      {unlocked && (
        <span style={{
          fontSize: 10, background: "#30d15820", color: "#30d158",
          border: "1px solid #30d15835", borderRadius: 50, padding: "2px 10px", fontWeight: 600,
        }}>Earned</span>
      )}
    </div>
  );
}

// ── Main Profile Page ─────────────────────────────────────────────────────────
export default
function Profile() {
  const storedUser = localStorage.getItem("vs_user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;

  const [profile, setProfile] = useState({
    name:   parsedUser?.name  || "Your Name",
    email:  parsedUser?.email || "your@email.com",
    age:    "22",
    height: "178 cm",
    weight: "72 kg",
    goal:   "Improve cardiovascular health",
  });

  const update = (key) => (val) => setProfile(p => ({ ...p, [key]: val }));

  // Weekly goals progress
  const goals = [
    { label: "Steps",      value: "68.4k / 70k", pct: 0.977, color: "#30d158" },
    { label: "Sleep",      value: "7.4h avg",     pct: 0.82,  color: "#0a84ff" },
    { label: "Water",      value: "2.6L avg",      pct: 0.87,  color: "#5ac8fa" },
    { label: "Heart Rate", value: "64 bpm",        pct: 0.91,  color: "#ff375f" },
  ];

  const badges = [
    { icon: "🏅", title: "Step Master",    desc: "10k steps in a day",   unlocked: true  },
    { icon: "💧", title: "Hydration Pro",  desc: "3L water 3 days row",  unlocked: true  },
    { icon: "🌙", title: "Sleep Champion", desc: "8h sleep 5 days row",  unlocked: false },
    { icon: "❤️", title: "Heart Hero",     desc: "HR < 60 bpm at rest",  unlocked: false },
    { icon: "🔥", title: "7-Day Streak",   desc: "Active 7 days in row", unlocked: true  },
    { icon: "⚡", title: "Early Adopter",  desc: "Joined VitalSync",     unlocked: true  },
  ];

  // Avatar initials
  const initials = profile.name.split(" ").map(n => n[0]).join("");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .5s cubic-bezier(.4,0,.2,1) both; }
        .fade-up:nth-child(1) { animation-delay: .05s }
        .fade-up:nth-child(2) { animation-delay: .12s }
        .fade-up:nth-child(3) { animation-delay: .19s }
        .fade-up:nth-child(4) { animation-delay: .26s }
        .fade-up:nth-child(5) { animation-delay: .33s }
        input:focus { border-color: rgba(48,209,88,0.5) !important; box-shadow: 0 0 0 3px rgba(48,209,88,0.1); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 99px; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#fff",
        fontFamily: "'DM Sans', -apple-system, sans-serif",
        position: "relative",
        overflowX: "hidden",
      }}>

        {/* ambient blobs */}
        <div style={{
          position: "fixed", top: -180, left: -180, width: 500, height: 500,
          borderRadius: "50%", background: "radial-gradient(circle, #30d15815 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{
          position: "fixed", bottom: -200, right: -200, width: 600, height: 600,
          borderRadius: "50%", background: "radial-gradient(circle, #0a84ff12 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        {/* ── NAVBAR ── */}
        <Navbar />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1060, margin: "0 auto", padding: "92px 24px 80px" }}>

          {/* ── page header ── */}
          <div className="fade-up" style={{ marginBottom: 36 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6,
            }}>VitalSync</div>
            <h1 style={{
              fontSize: 30, fontWeight: 700, letterSpacing: "-0.6px", color: "#fff",
            }}>Your Profile</h1>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>

            {/* ── LEFT COLUMN ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Avatar card */}
              <div className="fade-up">
                <GlassCard style={{ textAlign: "center", padding: "36px 24px" }}>
                  {/* avatar ring */}
                  <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
                    <svg width={96} height={96} style={{ position: "absolute", top: -8, left: -8, transform: "rotate(-90deg)" }}>
                      <circle cx={48} cy={48} r={44} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={3} />
                      <circle cx={48} cy={48} r={44} fill="none" stroke="#30d158" strokeWidth={3}
                        strokeLinecap="round" strokeDasharray={276.5} strokeDashoffset={276.5 * 0.18}
                        style={{ filter: "drop-shadow(0 0 4px #30d158)" }} />
                    </svg>
                    <div style={{
                      width: 80, height: 80, borderRadius: "50%",
                      background: "linear-gradient(135deg, #30d158, #0a84ff)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 28, fontWeight: 800, color: "#000", letterSpacing: "-1px",
                    }}>
                      {initials}
                    </div>
                  </div>

                  <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{profile.name}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 16 }}>{profile.email}</div>

                  <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                    <Tag color="#30d158">Active</Tag>
                    <Tag color="#0a84ff">Premium</Tag>
                    <Tag color="#ff9f0a">🔥 5 day streak</Tag>
                  </div>

                  {/* quick bio pills */}
                  <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                    {[
                      { label: "Age", val: profile.age },
                      { label: "Height", val: profile.height },
                      { label: "Weight", val: profile.weight },
                    ].map(item => (
                      <div key={item.label} style={{
                        flex: 1, background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 12, padding: "10px 6px", textAlign: "center",
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{item.val}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Best week card */}
              <div className="fade-up">
                <GlassCard>
                  <Label>🏆 Personal Best Week</Label>
                  <div style={{ marginTop: 12 }}>
                    <StatRow icon="🏃" label="Total Steps"   value="68,420"    color="#30d158" />
                    <StatRow icon="🌙" label="Avg Sleep"     value="7.4 hrs"   color="#0a84ff" />
                    <StatRow icon="💧" label="Avg Water"     value="2.6 L"     color="#5ac8fa" />
                    <StatRow icon="❤️" label="Resting HR"    value="64 bpm"    color="#ff375f" />
                  </div>
                </GlassCard>
              </div>

            </div>

            {/* ── RIGHT COLUMN ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Edit profile */}
              <div className="fade-up">
                <GlassCard>
                  <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>Personal Info</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 2 }}>Tap Edit to update any field</div>
                    </div>
                    <span style={{ fontSize: 20 }}>👤</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                    <EditableField label="Full Name"  value={profile.name}   onChange={update("name")} />
                    <EditableField label="Email"      value={profile.email}  onChange={update("email")} />
                    <EditableField label="Age"        value={profile.age}    onChange={update("age")} />
                    <EditableField label="Height"     value={profile.height} onChange={update("height")} />
                    <EditableField label="Weight"     value={profile.weight} onChange={update("weight")} />
                    <EditableField label="Health Goal" value={profile.goal}  onChange={update("goal")} />
                  </div>
                </GlassCard>
              </div>

              {/* Weekly goals rings */}
              <div className="fade-up">
                <GlassCard>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>Weekly Goal Progress</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 2 }}>This week vs your targets</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    {goals.map(g => (
                      <ArcRing key={g.label} pct={g.pct} color={g.color} label={g.label} value={g.value} />
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Achievements */}
              <div className="fade-up">
                <GlassCard>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>Achievements</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 2 }}>
                      {badges.filter(b => b.unlocked).length} of {badges.length} earned
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {badges.map(b => <Badge key={b.title} {...b} />)}
                  </div>
                </GlassCard>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}