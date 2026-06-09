import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import t from "../i18n";

export default function BottomNav({ onAddTransaction }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useAuth();
  const tr = t[lang];
  const [fabOpen, setFabOpen] = useState(false);
  const page = location.pathname;

  const navItems = [
    { path: "/", icon: "🏠", label: tr.dashboard },
    { path: "/transactions", icon: "💸", label: tr.transactions },
    { path: null, icon: null, label: "" }, // FAB slot
    { path: "/reports", icon: "📊", label: tr.reports },
    { path: "/settings", icon: "⚙️", label: tr.settings },
  ];

  return (
    <>
      {/* FAB backdrop */}
      {fabOpen && (
        <div onClick={() => setFabOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 30, background: "rgba(0,0,0,0.3)" }} />
      )}

      {/* FAB options */}
      {fabOpen && (
        <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", gap: 10, zIndex: 40, alignItems: "center" }}>
          {[
            { label: tr.addIncome,  color: "#10b981", type: "income",   icon: "+" },
            { label: tr.addExpense, color: "#ef4444", type: "expense",  icon: "−" },
            { label: tr.transfer,   color: "#3b82f6", type: "transfer", icon: "⇄" },
          ].map(btn => (
            <button key={btn.type} onClick={() => { setFabOpen(false); onAddTransaction(btn.type); }}
              style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "none", borderRadius: 24, padding: "10px 18px 10px 10px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", cursor: "pointer", whiteSpace: "nowrap" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: btn.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>{btn.icon}</div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{btn.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Nav bar */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", height: 68, boxShadow: "0 -4px 20px rgba(0,0,0,0.06)", zIndex: 20 }}>
        {navItems.map((item, i) =>
          item.path === null ? (
            <div key="fab" style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button onClick={() => setFabOpen(o => !o)}
                style={{ width: 52, height: 52, borderRadius: "50%", background: fabOpen ? "#6366f1" : "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "#fff", fontSize: 26, cursor: "pointer", boxShadow: "0 4px 16px rgba(99,102,241,0.5)", transform: fabOpen ? "rotate(45deg)" : "none", transition: "all 0.2s", marginTop: -12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                +
              </button>
            </div>
          ) : (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, border: "none", background: "transparent", cursor: "pointer", padding: "4px 0" }}>
              <span style={{ fontSize: 22, filter: page === item.path ? "none" : "grayscale(1) opacity(0.45)" }}>{item.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: page === item.path ? "#6366f1" : "#9ca3af" }}>{item.label}</span>
            </button>
          )
        )}
      </div>
    </>
  );
}
