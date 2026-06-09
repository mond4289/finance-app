import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import t from "../i18n";

function fmt(n) { return Number(n || 0).toLocaleString(); }

export default function Reports({ refreshKey }) {
  const { user, lang } = useAuth();
  const tr = t[lang];
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportRange, setExportRange] = useState("thisMonth");
  const [exportCats, setExportCats]   = useState([]);
  const [allCats, setAllCats]         = useState([]);
  const [customFrom, setCustomFrom]   = useState("");
  const [customTo, setCustomTo]       = useState("");

  useEffect(() => { loadData(); }, [refreshKey]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [txRes, catRes] = await Promise.all([
        api("getTransactions", { username: user.username }),
        api("getCategories",   { username: user.username }),
      ]);
      if (txRes.success)  setTransactions(txRes.data || []);
      if (catRes.success) {
        const cats = (catRes.data || []).map(c => c.name);
        setAllCats(cats);
        setExportCats(cats);
      }
    } catch {}
    setLoading(false);
  };

  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth(), y = d.getFullYear();
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
  const totalInc = monthlyData.reduce((s, d) => s + d.inc, 0);
  const totalExp = monthlyData.reduce((s, d) => s + d.exp, 0);

  // Category breakdown
  const catBreakdown = allCats.map(cat => ({
    name: cat,
    total: transactions.filter(tx => tx.category === cat && tx.type === "expense").reduce((s, tx) => s + Number(tx.amount || 0), 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const maxCat = catBreakdown[0]?.total || 1;

  // Export
  const getExportData = () => {
    let data = [...transactions];
    const now = new Date();
    if (exportRange === "thisMonth") {
      data = data.filter(tx => {
        const d = new Date(tx.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (exportRange === "last3") {
      const from = new Date(); from.setMonth(from.getMonth() - 3);
      data = data.filter(tx => new Date(tx.date) >= from);
    } else if (exportRange === "thisYear") {
      data = data.filter(tx => new Date(tx.date).getFullYear() === now.getFullYear());
    } else if (exportRange === "custom" && customFrom && customTo) {
      data = data.filter(tx => tx.date >= customFrom && tx.date <= customTo);
    }
    if (exportCats.length > 0) {
      data = data.filter(tx => exportCats.includes(tx.category));
    }
    return data;
  };

  const handleExport = () => {
    const data = getExportData();
    const headers = ["Date", "Type", "Amount", "Category", "Account", "Note"];
    const rows = data.map(tx => [tx.date, tx.type, tx.amount, tx.category, tx.account, tx.note || ""]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "finance_export.csv"; a.click();
  };

  const toggleCat = (cat) => {
    setExportCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const previewCount = getExportData().length;

  if (loading) return <div style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>{tr.loading}</div>;

  return (
    <div style={{ padding: "16px 14px 0" }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 12 }}>{tr.reports}</div>

      {/* Summary cards */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, background: "#f0fdf4", borderRadius: 14, padding: "12px" }}>
          <div style={{ fontSize: 11, color: "#6b7280" }}>{tr.income} (6 {tr.monthly})</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#10b981" }}>+{fmt(totalInc)} ₭</div>
        </div>
        <div style={{ flex: 1, background: "#fef2f2", borderRadius: 14, padding: "12px" }}>
          <div style={{ fontSize: 11, color: "#6b7280" }}>{tr.expense} (6 {tr.monthly})</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#ef4444" }}>−{fmt(totalExp)} ₭</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "16px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>{tr.monthly}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
          {monthlyData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", height: 100 }}>
                <div style={{ flex: 1, background: "#10b981", borderRadius: "4px 4px 0 0", height: `${(d.inc / maxVal) * 100}px`, minHeight: d.inc > 0 ? 4 : 0 }} />
                <div style={{ flex: 1, background: "#f87171", borderRadius: "4px 4px 0 0", height: `${(d.exp / maxVal) * 100}px`, minHeight: d.exp > 0 ? 4 : 0 }} />
              </div>
              <div style={{ fontSize: 9, color: "#9ca3af" }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      {catBreakdown.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 16, padding: "16px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>{tr.categories}</div>
          {catBreakdown.slice(0, 6).map(c => (
            <div key={c.name} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: "#374151" }}>{c.name}</span>
                <span style={{ fontWeight: 700, color: "#ef4444" }}>{fmt(c.total)} ₭</span>
              </div>
              <div style={{ background: "#f3f4f6", borderRadius: 99, height: 6 }}>
                <div style={{ width: `${(c.total / maxCat) * 100}%`, background: "#6366f1", borderRadius: 99, height: "100%" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Export Section */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "16px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>💾 {tr.exportData}</div>

        {/* Range */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>📅 {tr.exportRange}</div>
          {[["thisMonth", tr.thisMonthOnly], ["last3", tr.last3], ["thisYear", tr.thisYear], ["custom", tr.custom]].map(([val, label]) => (
            <label key={val} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}>
              <input type="radio" name="range" value={val} checked={exportRange === val} onChange={() => setExportRange(val)} />
              <span style={{ fontSize: 13, color: "#374151" }}>{label}</span>
            </label>
          ))}
          {exportRange === "custom" && (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                style={{ flex: 1, padding: "8px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} />
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                style={{ flex: 1, padding: "8px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} />
            </div>
          )}
        </div>

        {/* Categories filter */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>🏷 {tr.categories}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {allCats.map(cat => (
              <button key={cat} onClick={() => toggleCat(cat)}
                style={{ padding: "4px 10px", border: "none", borderRadius: 20, background: exportCats.includes(cat) ? "#6366f1" : "#f3f4f6", color: exportCats.includes(cat) ? "#fff" : "#6b7280", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "#374151" }}>👁 {tr.preview}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#6366f1" }}>{previewCount} {tr.records}</span>
        </div>

        <button onClick={handleExport}
          style={{ width: "100%", padding: "13px", border: "none", borderRadius: 12, background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          ⬇ {tr.exportBtn}
        </button>
      </div>

    </div>
  );
}
