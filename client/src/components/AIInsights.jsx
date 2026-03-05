import { useState, useRef, useEffect } from "react";
import axios from "axios";

const SUGGESTIONS = [
  "How are my steps today?",
  "Is my heart rate normal?",
  "How was my sleep?",
  "Am I hydrated enough?",
];

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: "#30d158",
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 12, animation: "fadeUp .3s cubic-bezier(.4,0,.2,1)",
    }}>
      {!isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: 10, flexShrink: 0,
          background: "linear-gradient(135deg, #30d158, #0a84ff)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, marginRight: 10, marginTop: 2,
        }}>⚡</div>
      )}
      <div style={{
        maxWidth: "75%", padding: "12px 16px", borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser
          ? "linear-gradient(135deg, #30d158, #0a84ff)"
          : "rgba(255,255,255,0.06)",
        border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
        fontSize: 14, color: isUser ? "#000" : "rgba(255,255,255,0.85)",
        fontWeight: isUser ? 600 : 400,
        lineHeight: 1.6,
      }}>
        {msg.content}
      </div>
      {isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: 10, flexShrink: 0,
          background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, marginLeft: 10, marginTop: 2,
        }}>👤</div>
      )}
    </div>
  );
}

export default function AIInsights({ data }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey! I'm VitalSync AI 👋 I can see your live health data. Ask me anything about your steps, heart rate, sleep, or hydration!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const q = text || input.trim();
    if (!q || !data || loading) return;
    setInput("");

    const userMsg = { role: "user", content: q };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    try {
      // send only actual conversation (skip the initial greeting)
      const history = updated
        .slice(1) // skip greeting
        .slice(-8) // keep last 8 messages for context window
        .slice(0, -1) // exclude current message (sent separately)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await axios.post("http://localhost:5000/api/ai/ask", {
        question: q,
        data,
        history,
      });

      setMessages(prev => [...prev, { role: "assistant", content: response.data.answer }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I couldn't connect to the AI service. Please check the server.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 420 }}>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* suggestion chips — only show if only greeting is present */}
      {messages.length === 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              background: "rgba(48,209,88,0.08)", border: "1px solid rgba(48,209,88,0.2)",
              borderRadius: 50, padding: "6px 14px", color: "rgba(255,255,255,0.6)",
              fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              transition: "all .18s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(48,209,88,0.15)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(48,209,88,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
            >{s}</button>
          ))}
        </div>
      )}

      {/* messages area */}
      <div style={{
        flex: 1, overflowY: "auto", paddingRight: 4,
        marginBottom: 16,
      }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg, #30d158, #0a84ff)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, marginRight: 10, marginTop: 2,
            }}>⚡</div>
            <div style={{
              padding: "12px 16px", borderRadius: "18px 18px 18px 4px",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* input row */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about your health…"
          disabled={loading}
          style={{
            flex: 1, background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
            padding: "13px 18px", color: "#fff", fontSize: 14,
            fontFamily: "inherit", outline: "none",
            transition: "border-color .2s, box-shadow .2s",
            opacity: loading ? 0.6 : 1,
          }}
          onFocus={e => { e.target.style.borderColor = "rgba(48,209,88,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(48,209,88,0.08)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{
            padding: "13px 22px", borderRadius: 14, border: "none",
            background: loading || !input.trim()
              ? "rgba(48,209,88,0.25)"
              : "linear-gradient(135deg, #30d158, #0a84ff)",
            color: "#000", fontWeight: 700, fontSize: 14,
            fontFamily: "inherit",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 20px rgba(48,209,88,0.25)",
            transition: "all .2s",
          }}
        >
          {loading ? "…" : "↑"}
        </button>
      </div>
    </div>
  );
}