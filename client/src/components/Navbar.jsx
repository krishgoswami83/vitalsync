import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const stored = localStorage.getItem("vs_user");
  const [user] = useState(stored ? JSON.parse(stored) : null);

  useEffect(() => {
    const token = localStorage.getItem("vs_token");
    if (!token) { navigate("/login"); return; }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("vs_token");
        localStorage.removeItem("vs_user");
        navigate("/login");
      }
    } catch {
      localStorage.removeItem("vs_token");
      localStorage.removeItem("vs_user");
      navigate("/login");
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("vs_token");
    localStorage.removeItem("vs_user");
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const links = [
    { path: "/",        label: "Dashboard", icon: "📊" },
    { path: "/profile", label: "Profile",   icon: "👤" },
    { path: "/tracker", label: "Goals",     icon: "🎯" },
  ];

  return (
    <>
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(8,8,8,0.80)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "0 24px", height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        }}>

          {/* Logo */}
          <div onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg, #30d158, #0a84ff)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            }}>⚡</div>
            <span style={{
              fontSize: 15, fontWeight: 700, letterSpacing: "-0.3px",
              background: "linear-gradient(90deg, #30d158, #0a84ff)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>VitalSync</span>
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {links.map(link => {
              const active = location.pathname === link.path;
              return (
                <button key={link.path} onClick={() => navigate(link.path)} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "7px 16px", borderRadius: 50, border: "none",
                  cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                  transition: "all .18s ease",
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.45)",
                  outline: active ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

            {/* Live badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "rgba(48,209,88,0.1)", border: "1px solid rgba(48,209,88,0.2)",
              borderRadius: 50, padding: "6px 14px",
            }}>
              <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
                <span style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  background: "#30d158", opacity: 0.4,
                  animation: "ping 1.4s cubic-bezier(0,0,.2,1) infinite",
                }} />
                <span style={{ borderRadius: "50%", width: 8, height: 8, background: "#30d158", display: "block" }} />
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#30d158" }}>Live</span>
            </div>

            {/* User avatar + name */}
            {user && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg, #30d158, #0a84ff)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: "#000", flexShrink: 0,
                }}>{initials}</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
                  {user.name.split(" ")[0]}
                </span>
              </div>
            )}

            {/* Logout */}
            <button onClick={logout} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 50, border: "none",
              cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
              background: "rgba(255,55,95,0.1)", color: "#ff375f",
              outline: "1px solid rgba(255,55,95,0.2)", transition: "all .18s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,55,95,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,55,95,0.1)"; }}
            >
              <span>→</span>
              <span>Logout</span>
            </button>

          </div>
        </div>
      </nav>
    </>
  );
}