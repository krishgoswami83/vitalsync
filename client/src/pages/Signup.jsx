import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Field component OUTSIDE Signup so it doesn't remount on every keystroke ──
function Field({ label, name, type, placeholder, value, onChange, onKeyDown, showPass, setShowPass }) {
  const isPassword = name === "password" || name === "confirm";
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)",
        textTransform: "uppercase", letterSpacing: "0.07em",
        display: "block", marginBottom: 8,
      }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={isPassword ? (showPass ? "text" : "password") : (type || "text")}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          style={{
            width: "100%", background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
            padding: name === "password" ? "13px 48px 13px 16px" : "13px 16px",
            color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none",
            transition: "border-color .2s, box-shadow .2s",
          }}
          onFocus={e => { e.target.style.borderColor = "rgba(48,209,88,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(48,209,88,0.1)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
        />
        {name === "password" && (
          <button onClick={() => setShowPass(p => !p)} style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            fontSize: 16, color: "rgba(255,255,255,0.35)", padding: 0,
          }}>{showPass ? "🙈" : "👁️"}</button>
        )}
      </div>
    </div>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const update = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  // password strength
  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Excellent"][strength];
  const strengthColor = ["", "#ff375f", "#ff9f0a", "#ffd60a", "#30d158", "#30d158"][strength];

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields"); return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords don't match"); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters"); return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed"); return; }
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
        .fu { animation: fadeUp .55s cubic-bezier(.4,0,.2,1) both; }
        .fu1{animation-delay:.05s} .fu2{animation-delay:.13s} .fu3{animation-delay:.21s}
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #111 inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#080808", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: "relative", overflow: "hidden", padding: "24px",
      }}>

        {/* blobs */}
        <div style={{ position:"fixed", top:-250, left:-250, width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle,#0a84ff10 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"fixed", bottom:-250, right:-250, width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle,#30d15812 0%,transparent 70%)", pointerEvents:"none" }} />

        <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>

          {/* logo */}
          <div className="fu fu1" style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: "linear-gradient(135deg, #30d158, #0a84ff)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(48,209,88,0.3)",
            }}>⚡</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.5px" }}>VitalSync</h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>Start your health journey today</p>
          </div>

          {/* form card */}
          <div className="fu fu2" style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 28, padding: "36px 32px", backdropFilter: "blur(24px)",
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Create account</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>Free forever. No credit card needed.</p>

            {error && (
              <div style={{
                background: "rgba(255,55,95,0.1)", border: "1px solid rgba(255,55,95,0.25)",
                borderRadius: 12, padding: "12px 16px", marginBottom: 20,
                fontSize: 13, color: "#ff375f", display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <Field label="Full Name"        name="name"     placeholder="Aryan Mehta"        value={form.name}     onChange={update("name")}     onKeyDown={handleKey} showPass={showPass} setShowPass={setShowPass} />
            <Field label="Email"            name="email"    type="email" placeholder="you@example.com" value={form.email}    onChange={update("email")}    onKeyDown={handleKey} showPass={showPass} setShowPass={setShowPass} />
            <Field label="Password"         name="password" placeholder="Min. 6 characters"  value={form.password} onChange={update("password")} onKeyDown={handleKey} showPass={showPass} setShowPass={setShowPass} />

            {/* password strength bar */}
            {form.password && (
              <div style={{ marginTop: -8, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 99,
                      background: i <= strength ? strengthColor : "rgba(255,255,255,0.1)",
                      transition: "background .3s",
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: strengthColor, fontWeight: 600 }}>{strengthLabel}</div>
              </div>
            )}

            <Field label="Confirm Password" name="confirm"  placeholder="Repeat password"    value={form.confirm}  onChange={update("confirm")}  onKeyDown={handleKey} showPass={showPass} setShowPass={setShowPass} />

            <button
              onClick={handleSubmit} disabled={loading}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: loading ? "rgba(48,209,88,0.4)" : "linear-gradient(135deg, #30d158, #0a84ff)",
                color: "#000", fontWeight: 700, fontSize: 15, fontFamily: "inherit",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 24px rgba(48,209,88,0.35)",
                transition: "all .2s", marginTop: 8,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {loading ? "Creating account…" : "Create Account →"}
            </button>
          </div>

          {/* login link */}
          <div className="fu fu3" style={{ textAlign: "center", marginTop: 24 }}>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Already have an account? </span>
            <button onClick={() => navigate("/login")} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 700, color: "#30d158", fontFamily: "inherit",
            }}>Sign in →</button>
          </div>

        </div>
      </div>
    </>
  );
}