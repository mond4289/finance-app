import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import t from "../i18n";

export default function Login() {
  const { login, lang, changeLang } = useAuth();
  const tr = t[lang];
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!username || !password) return;
    setLoading(true);
    setError("");
    try {
      const action = isRegister ? "register" : "login";
      const res = await api(action, { username, password });
      if (res.success) {
        login({ userId: res.userId, username: res.username });
      } else {
        setError(res.message);
      }
    } catch {
      setError(tr.error);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>💰</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{tr.appName}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
            {isRegister ? tr.register : tr.login}
          </div>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: 24, padding: "28px 24px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
          {/* Lang switcher */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20, justifyContent: "center" }}>
            {[["th","🇹🇭 ไทย"],["en","🇬🇧 EN"],["la","🇱🇦 ລາວ"]].map(([code, label]) => (
              <button key={code} onClick={() => changeLang(code)}
                style={{ flex: 1, padding: "6px 4px", border: "none", borderRadius: 8, background: lang === code ? "#6366f1" : "#f3f4f6", color: lang === code ? "#fff" : "#6b7280", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{tr.username}</label>
            <input value={username} onChange={e => setUsername(e.target.value)}
              placeholder={tr.username} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>{tr.password}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder={tr.password} style={inputStyle}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>

          {error && (
            <div style={{ background: "#fef2f2", color: "#ef4444", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>
              ⚠️ {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: "14px", border: "none", borderRadius: 14, background: loading ? "#c4b5fd" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 700, fontSize: 16, cursor: loading ? "default" : "pointer" }}>
            {loading ? tr.loading : (isRegister ? tr.register : tr.login)}
          </button>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#6b7280" }}>
            {isRegister ? tr.haveAccount : tr.noAccount}{" "}
            <span onClick={() => { setIsRegister(!isRegister); setError(""); }}
              style={{ color: "#6366f1", fontWeight: 700, cursor: "pointer" }}>
              {isRegister ? tr.login : tr.register}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 };
const inputStyle = { width: "100%", padding: "12px 14px", border: "1.5px solid #e5e7eb", borderRadius: 12, fontSize: 14, outline: "none", boxSizing: "border-box" };
