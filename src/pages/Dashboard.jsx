import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import t from "../i18n";

function fmt(n) {
  return Number(n || 0).toLocaleString();
}

export default function Dashboard({ refreshKey }) {
  const { user, lang } = useAuth();
  const tr = t[lang];
  const navigate = useNavigate();

  const [accounts, setAccounts]       = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals]             = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accRes, txRes, goalRes] = await Promise.all([
        api("getAccounts",     { username: user.username }),
        api("getTransactions", { username: user.username }),
        api("getGoals",        { username: user.username }),
      ]);
      if (accRes.success)  setAccounts(accRes.data || []);
      if (txRes.success)   setTransactions(txRes.data || []);
      if (goalRes.success) setGoals(goalRes.data || []);
    } catch {}
    setLoading(false);
  };

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);

  const now = new Date();
  const thisMonth = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthIncome  = thisMonth.filter(tx => tx.type === "income").reduce((s, tx) => s + Number(tx.amount || 0), 0);
  const monthExpense = thisMonth.filter(tx => tx.type === "expense").reduce((s, tx) => s + Number(tx.amount || 0), 0);

  // Monthly chart data (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth();
    const y = d.getFullYear();
    const filtered = transactions.filter(tx => {
      const td = new Date(tx.date);
      return td.getMonth() === m && td.getFullYear() === y;
    });
    return {
      label: d.toLocaleString("default", { month: "short" }),
      inc: filtered.filter(tx => tx.type === "income").reduce((s, tx) => s + Number(tx.amount || 0), 0),
      exp: filtered.filter(tx => tx.type === "expense").reduce((s, tx) => s + Number(tx.amount || 0), 0),
    };
  });
  const maxVal = Math.max(...monthlyData.map(d => Math.max(d.inc, d.exp)), 1);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "#6b7280" }}>
      {tr.loading}
    </div>
  );

  return (
    <div style={{ padding: "16px 14px 0" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>{tr.welcomeBack} 👋</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>{user.username}</div>
        </div>
      </div>

      {/* Net Worth Card */}
      <div style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)", borderRadius: 20, padding: "20px", marginBottom: 12, color: "#fff" }}>
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>{tr.netWorth}</div>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>₭ {fmt(totalBalance)}</div>
        <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "8px 14px", flex: 1 }}>
            <div style={{ fontSize: 10, opacity: 0.8 }}>{tr.income}</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>+{fmt(monthIncome)}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "8px 14px", flex: 1 }}>
            <div style={{ fontSize: 10, opacity: 0.8 }}>{tr.expense}</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>−{fmt(monthExpense)}</div>
          </div>
        </div>
      </div>

      {/* Accounts */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>{tr.myAccounts}</div>
        {accounts.length === 0 ? (
          <div style={{ color: "#9ca3af", fontSize: 13, padding: "10px 0" }}>{tr.noData}</div>
        ) : (
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
            {accounts.map(acc => (
              <div key={acc.id} style={{ minWidth: 140, background: "#fff", borderRadius: 14, padding: "12px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", borderTop: `3px solid ${acc.color || "#6366f1"}`, flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>{acc.name}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>₭ {fmt(acc.balance)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mini Chart */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "16px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>{tr.monthly}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
          {monthlyData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", height: 64 }}>
                <div style={{ flex: 1, background: "#10b981", borderRadius: "3px 3px 0 0", height: `${(d.inc / maxVal) * 64}px`, minHeight: d.inc > 0 ? 3 : 0 }} />
                <div style={{ flex: 1, background: "#f87171", borderRadius: "3px 3px 0 0", height: `${(d.exp / maxVal) * 64}px`, minHeight: d.exp > 0 ? 3 : 0 }} />
              </div>
              <div style={{ fontSize: 9, color: "#9ca3af" }}>{d.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6b7280" }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: "#10b981" }} /> {tr.income}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6b7280" }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: "#f87171" }} /> {tr.expense}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "14px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{tr.recentTx}</div>
          <span onClick={() => navigate("/transactions")} style={{ fontSize: 11, color: "#6366f1", cursor: "pointer" }}>{tr.seeAll}</span>
        </div>
        {transactions.length === 0 ? (
          <div style={{ color: "#9ca3af", fontSize: 13, padding: "8px 0" }}>{tr.noData}</div>
        ) : (
          transactions.slice(0, 5).map((tx, i, arr) => (
            <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: tx.type === "income" ? "#f0fdf4" : "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                  {tx.type === "income" ? "💚" : "🛒"}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{tx.note || tx.category}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{tx.category} · {tx.date}</div>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: tx.type === "income" ? "#10b981" : "#ef4444" }}>
                {tx.type === "income" ? "+" : "−"}{fmt(tx.amount)} ₭
              </div>
            </div>
          ))
        )}
      </div>

      {/* Goals */}
      {goals.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 16, padding: "14px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>{tr.savingsGoal}</div>
          {goals.map(g => {
            const pct = Math.min(Math.round((Number(g.current) / Number(g.target)) * 100), 100);
            return (
              <div key={g.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: "#374151" }}>{g.name}</span>
                  <span style={{ color: "#6b7280" }}>{pct}%</span>
                </div>
                <div style={{ background: "#f3f4f6", borderRadius: 99, height: 8 }}>
                  <div style={{ width: `${pct}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius: 99, height: "100%" }} />
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>₭ {fmt(g.current)} / {fmt(g.target)}</div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
