import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const update = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Login failed"); return; }
      localStorage.setItem("vs_token", data.token);
      localStorage.setItem("vs_user", JSON.stringify(data.user));
      navigate("/");
    } catch {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ping { 75%,100%{ transform:scale(2.2); opacity:0; } }
        .fu { animation: fadeUp .55s cubic-bezier(.4,0,.2,1) both; }
        .fu1 { animation-delay: .05s }
        .fu2 { animation-delay: .13s }
        .fu3 { animation-delay: .21s }
        .fu4 { animation-delay: .29s }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #111 inset !important;
          -webkit-text-fill-color: #fff !important;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 99px; }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#080808", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: "relative", overflow: "hidden", padding: "24px",
      }}>

        {/* ambient blobs */}
        <div style={{ position:"fixed", top:-250, right:-250, width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle,#30d15814 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"fixed", bottom:-250, left:-250, width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle,#0a84ff10 0%,transparent 70%)", pointerEvents:"none" }} />

        {/* card */}
        <div style={{
          width: "100%", maxWidth: 420, position: "relative", zIndex: 1,
        }}>

          {/* logo */}
          <div className="fu fu1" style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: "linear-gradient(135deg, #30d158, #0a84ff)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(48,209,88,0.3)",
            }}>⚡</div>
            <h1 style={{
              fontSize: 28, fontWeight: 800, color: "#fff",
              fontFamily: "'Syne', sans-serif", letterSpacing: "-0.5px",
            }}>VitalSync</h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
              Your personal health intelligence
            </p>
          </div>

          {/* form card */}
          <div className="fu fu2" style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 28, padding: "36px 32px",
            backdropFilter: "blur(24px)",
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Welcome back</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>Sign in to your account</p>

            {/* error */}
            {error && (
              <div style={{
                background: "rgba(255,55,95,0.1)", border: "1px solid rgba(255,55,95,0.25)",
                borderRadius: 12, padding: "12px 16px", marginBottom: 20,
                fontSize: 13, color: "#ff375f", display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8 }}>Email</label>
              <input
                type="email" value={form.email} onChange={update("email")} onKeyDown={handleKey}
                placeholder="you@example.com"
                style={{
                  width: "100%", background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                  padding: "13px 16px", color: "#fff", fontSize: 14,
                  fontFamily: "inherit", outline: "none",
                  transition: "border-color .2s, box-shadow .2s",
                }}
                onFocus={e => { e.target.style.borderColor = "rgba(48,209,88,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(48,209,88,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"} value={form.password} onChange={update("password")} onKeyDown={handleKey}
                  placeholder="••••••••"
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                    padding: "13px 48px 13px 16px", color: "#fff", fontSize: 14,
                    fontFamily: "inherit", outline: "none",
                    transition: "border-color .2s, box-shadow .2s",
                  }}
                  onFocus={e => { e.target.style.borderColor = "rgba(48,209,88,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(48,209,88,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                />
                <button onClick={() => setShowPass(p => !p)} style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 16, color: "rgba(255,255,255,0.35)", padding: 0,
                }}>{showPass ? "🙈" : "👁️"}</button>
              </div>
            </div>

            {/* submit */}
            <button
              onClick={handleSubmit} disabled={loading}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: loading ? "rgba(48,209,88,0.4)" : "linear-gradient(135deg, #30d158, #0a84ff)",
                color: "#000", fontWeight: 700, fontSize: 15, fontFamily: "inherit",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 24px rgba(48,209,88,0.35)",
                transition: "all .2s", letterSpacing: "0.01em",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </div>

          {/* signup link */}
          <div className="fu fu3" style={{ textAlign: "center", marginTop: 24 }}>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Don't have an account? </span>
            <button onClick={() => navigate("/signup")} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 700, color: "#30d158", fontFamily: "inherit",
            }}>Create one →</button>
          </div>

        </div>
      </div>
    </>
  );
}