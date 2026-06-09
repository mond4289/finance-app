import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import t from "../i18n";

function fmt(n) { return Number(n || 0).toLocaleString(); }

export default function Transactions({ refreshKey }) {
  const { user, lang } = useAuth();
  const tr = t[lang];
  const [tab, setTab]               = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);

  useEffect(() => { loadData(); }, [refreshKey]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api("getTransactions", { username: user.username });
      if (res.success) setTransactions(res.data || []);
    } catch {}
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(tr.confirmDelete)) return;
    await api("deleteTransaction", { username: user.username, id });
    loadData();
    setSelected(null);
  };

  const filtered = tab === "all" ? transactions : transactions.filter(tx => tx.type === tab);

  return (
    <div style={{ padding: "16px 14px 0" }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 12 }}>{tr.transactions}</div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["all", tr.allTx], ["income", tr.income], ["expense", tr.expense]].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            style={{ flex: 1, padding: "9px", border: "none", borderRadius: 12, background: tab === val ? "#6366f1" : "#f3f4f6", color: tab === val ? "#fff" : "#6b7280", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>{tr.loading}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>{tr.noData}</div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, padding: "4px 14px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          {filtered.map((tx, i) => (
            <div key={tx.id}>
              <div onClick={() => setSelected(selected?.id === tx.id ? null : tx)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: tx.type === "income" ? "#f0fdf4" : "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                    {tx.type === "income" ? "💚" : "🛒"}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{tx.note || tx.category}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{tx.account} · {tx.date}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: tx.type === "income" ? "#10b981" : "#ef4444", textAlign: "right" }}>
                    {tx.type === "income" ? "+" : "−"}{fmt(tx.amount)} ₭
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "right" }}>{tx.category}</div>
                </div>
              </div>

              {/* Detail expand */}
              {selected?.id === tx.id && (
                <div style={{ background: "#f9fafb", borderRadius: 12, padding: 12, marginBottom: 8 }}>
                  {tx.note && <div style={{ fontSize: 12, color: "#374151", marginBottom: 6 }}>📝 {tx.note}</div>}
                  {tx.items && tx.items !== "" && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>📦 {tr.items}</div>
                      {JSON.parse(tx.items || "[]").map((item, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", padding: "2px 0" }}>
                          <span>{item.name} × {item.qty}</span>
                          <span>{fmt(item.qty * item.price)} ₭</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {tx.image_url && tx.image_url !== "" && (
                    <a href={tx.image_url} target="_blank" rel="noreferrer">
                      <img src={tx.image_url} alt="receipt" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 10, marginBottom: 8 }} />
                    </a>
                  )}
                  <button onClick={() => handleDelete(tx.id)}
                    style={{ width: "100%", padding: "8px", border: "none", borderRadius: 10, background: "#fef2f2", color: "#ef4444", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                    🗑 {tr.delete}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
