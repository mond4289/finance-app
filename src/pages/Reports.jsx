import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import t from "../i18n";

function fmt(n) { return Number(n || 0).toLocaleString(); }

function generateColors(count) {
  return Array.from({ length: count }, (_, i) => {
    const hue = (i * 360 / count + 30) % 360;
    return `hsl(${hue}, 45%, 52%)`;
  });
}

const rLang = {
  la: {
    title: "ລາຍງານ ສະຫຸບລາຍຈ່າຍ", subtitle: "ສະຫຸບລາຍຈ່າຍປະຈຳເດືອນ",
    monthLabel: "ເດືອນທີ່ສະຫຸບ", reporter: "ຜູ້ລາຍງານ",
    t1: "ສະຫຸບຕາມປະເພດສິນຄ້າ", no: "ລຳດັບ", type: "ປະເພດ", totalCol: "ຍອດລວມ (₭)", grandTotal: "ລວມທັງໝົດ",
    t2: "ລາຍລະອຽດສະຫຸບ", totalIncome: "ລາຍຮັບທັງໝົດ", txCount: "ຈຳນວນລາຍການ", txUnit: "ລາຍການ",
    maxExp: "ລາຍການທີ່ແພງທີ່ສຸດ", minExp: "ລາຍການທີ່ຖືກທີ່ສຸດ", totalExp: "ລວມຍອດທັງໝົດ",
    pieTitle: "ສັດສ່ວນການໃຊ້ຈ່າຍ", net: "ຄົງເຫຼືອສຸດທິ", centerLabel: "ລວມ",
    preview: "ເບິ່ງຕົວຢ່າງລາຍງານ", close: "ປິດຕົວຢ່າງ",
    months: ["","ມັງກອນ","ກຸມພາ","ມີນາ","ເມສາ","ພຶດສະພາ","ມິຖຸນາ","ກໍລະກົດ","ສິງຫາ","ກັນຍາ","ຕຸລາ","ພະຈິກ","ທັນວາ"],
  },
  en: {
    title: "Expense Summary Report", subtitle: "Monthly Expense Summary",
    monthLabel: "Period", reporter: "Reported by",
    t1: "Summary by Category", no: "No.", type: "Category", totalCol: "Total (₭)", grandTotal: "Grand Total",
    t2: "Summary Details", totalIncome: "Total Income", txCount: "Total Transactions", txUnit: "items",
    maxExp: "Most Expensive", minExp: "Least Expensive", totalExp: "Total Expenses",
    pieTitle: "Expense Breakdown", net: "Net Balance", centerLabel: "Total",
    preview: "Preview Report", close: "Close Preview",
    months: ["","January","February","March","April","May","June","July","August","September","October","November","December"],
  },
};

const C = {
  header: "#3a7d5e", headerLight: "#6aaf8a",
  row1: "#f4f9f6", row2: "#ffffff",
  totalBg: "#e8f4ee", totalText: "#2d6a4f",
  border: "#c8e6d4", label: "#5a7a6a", value: "#1a3a2a",
};

function PieChart({ data, centerLabel }) {
  const colors = generateColors(data.length);
  const total  = data.reduce((s, d) => s + d.amount, 0);
  let cum = 0;
  const slices = data.map((d, i) => {
    const angle = (d.amount / total) * 360;
    const start = cum; cum += angle;
    return { ...d, start, angle, pct: Math.round((d.amount / total) * 100), color: colors[i] };
  });
  const polar = (cx, cy, r, deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const arc = (cx, cy, r, s, e) => {
    const p1 = polar(cx, cy, r, s), p2 = polar(cx, cy, r, e);
    return `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${e - s > 180 ? 1 : 0} 1 ${p2.x} ${p2.y} Z`;
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="190" height="190" viewBox="0 0 200 200">
        {slices.map((s, i) => (
          <path key={i} d={arc(100, 100, 88, s.start, s.start + s.angle - 0.5)} fill={s.color} stroke="#fff" strokeWidth="2.5" />
        ))}
        <circle cx="100" cy="100" r="48" fill="#fff" />
        <text x="100" y="97"  textAnchor="middle" fontSize="11" fill={C.label}  fontWeight="600">{centerLabel}</text>
        <text x="100" y="113" textAnchor="middle" fontSize="10" fill={C.header} fontWeight="800">{fmt(total)} ₭</text>
      </svg>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 5 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 12px", background: i % 2 === 0 ? C.row1 : C.row2, borderRadius: 8, borderLeft: `4px solid ${s.color}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
              <span style={{ fontSize: 12, color: C.value }}>{s.name}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.header }}>{fmt(s.amount)} ₭</span>
              <span style={{ fontSize: 10, color: C.label, marginLeft: 6 }}>({s.pct}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, marginTop: 4 }}>
      <div style={{ width: 4, height: 18, borderRadius: 2, background: C.header }} />
      <span style={{ fontSize: 13, fontWeight: 700, color: C.value }}>{children}</span>
    </div>
  );
}

// ─── Report Card — มี id="report-print" สำหรับ PDF ───────────
function ReportCard({ reportData, lang }) {
  const tr = rLang[lang];
  const { username, monthIndex, year, totalIncome, totalExpense, transactionCount, maxExpense, minExpense, categories } = reportData;
  const net    = totalIncome - totalExpense;
  const colors = generateColors(categories.length);

  return (
    <div id="report-print" style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 16px rgba(58,125,94,0.10)" }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.header}, ${C.headerLight})`, padding: "20px 20px 16px", textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{tr.title}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{tr.subtitle}</div>
        <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>{tr.monthLabel}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{tr.months[monthIndex]} {year}</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.3)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>{tr.reporter}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{username}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 16px 20px" }}>

        {/* Table 1 */}
        <SectionTitle>{tr.t1}</SectionTitle>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18, fontSize: 12 }}>
          <thead>
            <tr style={{ background: C.header }}>
              <th style={{ padding: "9px 10px", textAlign: "center", color: "#fff", width: 40 }}>{tr.no}</th>
              <th style={{ padding: "9px 10px", textAlign: "left",   color: "#fff" }}>{tr.type}</th>
              <th style={{ padding: "9px 10px", textAlign: "right",  color: "#fff" }}>{tr.totalCol}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? C.row1 : C.row2 }}>
                <td style={{ padding: "9px 10px", textAlign: "center", color: C.label, borderBottom: `1px solid ${C.border}` }}>{i + 1}</td>
                <td style={{ padding: "9px 10px", color: C.value, borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[i] }} />
                    {c.name}
                  </div>
                </td>
                <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 600, color: C.value, borderBottom: `1px solid ${C.border}` }}>{fmt(c.amount)}</td>
              </tr>
            ))}
            <tr style={{ background: C.totalBg }}>
              <td colSpan={2} style={{ padding: "11px 10px", fontWeight: 700, color: C.totalText }}>{tr.grandTotal}</td>
              <td style={{ padding: "11px 10px", textAlign: "right", fontWeight: 800, color: C.totalText, fontSize: 14 }}>{fmt(totalExpense)}</td>
            </tr>
          </tbody>
        </table>

        {/* Table 2 */}
        <SectionTitle>{tr.t2}</SectionTitle>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18, fontSize: 12 }}>
          <tbody>
            {[
              [tr.totalIncome, fmt(totalIncome) + " ₭",               C.header],
              [tr.txCount,     transactionCount + " " + tr.txUnit,     "#5c8a7a"],
              [tr.maxExp,      fmt(maxExpense) + " ₭",                 "#8a6a5c"],
              [tr.minExp,      fmt(minExpense) + " ₭",                 "#6a8a5c"],
              [tr.totalExp,    fmt(totalExpense) + " ₭",               "#7a5c5c"],
            ].map(([label, value, color], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? C.row1 : C.row2 }}>
                <td style={{ padding: "9px 12px", color: C.label, borderBottom: `1px solid ${C.border}` }}>{label}</td>
                <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 700, color, borderBottom: `1px solid ${C.border}` }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pie */}
        <SectionTitle>{tr.pieTitle}</SectionTitle>
        <PieChart data={categories} centerLabel={tr.centerLabel} />

        {/* Net */}
        <div style={{ marginTop: 16, background: net >= 0 ? C.totalBg : "#fdf0f0", borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${net >= 0 ? C.border : "#f5c6c6"}` }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.value }}>🌿 {tr.net}</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: net >= 0 ? C.totalText : "#c0392b" }}>
            {net >= 0 ? "+" : ""}{fmt(net)} ₭
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function Reports({ refreshKey }) {
  const { user, lang: appLang } = useAuth();
  const tr = t[appLang];
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [exportLang, setExportLang]     = useState("la");
  const [exportRange, setExportRange]   = useState("thisMonth");
  const [customFrom, setCustomFrom]     = useState("");
  const [customTo, setCustomTo]         = useState("");
  const [showReport, setShowReport]     = useState(false);

  useEffect(() => { loadData(); }, [refreshKey]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api("getTransactions", { username: user.username });
      if (res.success) setTransactions(res.data || []);
    } catch {}
    setLoading(false);
  };

  const getFiltered = () => {
    const now = new Date();
    let data = [...transactions];
    if (exportRange === "thisMonth") {
      data = data.filter(tx => { const d = new Date(tx.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    } else if (exportRange === "last3") {
      const from = new Date(); from.setMonth(from.getMonth() - 3);
      data = data.filter(tx => new Date(tx.date) >= from);
    } else if (exportRange === "thisYear") {
      data = data.filter(tx => new Date(tx.date).getFullYear() === now.getFullYear());
    } else if (exportRange === "custom" && customFrom && customTo) {
      data = data.filter(tx => tx.date >= customFrom && tx.date <= customTo);
    }
    return data;
  };

  const buildReportData = () => {
    const filtered     = getFiltered();
    const now          = new Date();
    const expenses     = filtered.filter(tx => tx.type === "expense");
    const incomes      = filtered.filter(tx => tx.type === "income");
    const totalIncome  = incomes.reduce((s, tx) => s + Number(tx.amount || 0), 0);
    const totalExpense = expenses.reduce((s, tx) => s + Number(tx.amount || 0), 0);
    const amounts      = expenses.map(tx => Number(tx.amount || 0));
    const maxExpense   = amounts.length ? Math.max(...amounts) : 0;
    const minExpense   = amounts.length ? Math.min(...amounts) : 0;
    const catMap = {};
    expenses.forEach(tx => { const cat = tx.category || "Other"; catMap[cat] = (catMap[cat] || 0) + Number(tx.amount || 0); });
    const categories = Object.entries(catMap).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
    let monthIndex = now.getMonth() + 1, year = String(now.getFullYear());
    if (exportRange === "custom" && customFrom) { const d = new Date(customFrom); monthIndex = d.getMonth() + 1; year = String(d.getFullYear()); }
    return { username: user.username, monthIndex, year, totalIncome, totalExpense, transactionCount: expenses.length, maxExpense, minExpense, categories };
  };

  const handleExportCSV = () => {
    const rl = rLang[exportLang];
    const rd = buildReportData();
    const rows = [
      [rl.title],
      [`${rl.monthLabel}: ${rl.months[rd.monthIndex]} ${rd.year}`],
      [`${rl.reporter}: ${rd.username}`],
      [],
      [rl.t1],
      [rl.no, rl.type, rl.totalCol],
      ...rd.categories.map((c, i) => [i + 1, c.name, c.amount]),
      [rl.grandTotal, "", rd.totalExpense],
      [],
      [rl.t2],
      [rl.totalIncome,  rd.totalIncome],
      [rl.txCount,      rd.transactionCount + " " + rl.txUnit],
      [rl.maxExp,       rd.maxExpense],
      [rl.minExp,       rd.minExpense],
      [rl.totalExp,     rd.totalExpense],
      [],
      [rl.net, rd.totalIncome - rd.totalExpense],
    ];
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `report_${rd.username}_${rd.year}_${rd.monthIndex}.csv`; a.click();
  };

  // PDF — แสดง report ก่อน แล้วค่อย print
  const handleExportPDF = async () => {
    if (!showReport) {
      setShowReport(true);
      await new Promise(r => setTimeout(r, 600));
    }
    window.print();
  };

  const reportData = buildReportData();

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth(), y = d.getFullYear();
    const f = transactions.filter(tx => { const td = new Date(tx.date); return td.getMonth() === m && td.getFullYear() === y; });
    return {
      label: d.toLocaleString("default", { month: "short" }),
      inc: f.filter(tx => tx.type === "income").reduce((s, tx) => s + Number(tx.amount || 0), 0),
      exp: f.filter(tx => tx.type === "expense").reduce((s, tx) => s + Number(tx.amount || 0), 0),
    };
  });
  const maxVal = Math.max(...monthlyData.map(d => Math.max(d.inc, d.exp)), 1);

  if (loading) return <div style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>{tr.loading}</div>;

  return (
    <div style={{ padding: "16px 14px 0" }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 12 }}>{tr.reports}</div>

      {/* Summary */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, background: "#f0fdf4", borderRadius: 14, padding: 12 }}>
          <div style={{ fontSize: 11, color: "#6b7280" }}>{tr.income}</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#10b981" }}>+{fmt(reportData.totalIncome)} ₭</div>
        </div>
        <div style={{ flex: 1, background: "#fef2f2", borderRadius: 14, padding: 12 }}>
          <div style={{ fontSize: 11, color: "#6b7280" }}>{tr.expense}</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#ef4444" }}>−{fmt(reportData.totalExpense)} ₭</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: 12 }}>
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
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6b7280" }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#10b981" }} /> {tr.income}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6b7280" }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#f87171" }} /> {tr.expense}</div>
        </div>
      </div>

      {/* Export Section */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.value, marginBottom: 12 }}>💾 {tr.exportData}</div>

        {/* Lang */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.label, marginBottom: 6 }}>🌐 ພາສາ / Language</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["la","🇱🇦 ລາວ"],["en","🇬🇧 English"]].map(([code, label]) => (
              <button key={code} onClick={() => setExportLang(code)}
                style={{ flex: 1, padding: "9px", border: "none", borderRadius: 10, background: exportLang === code ? C.header : "#f3f4f6", color: exportLang === code ? "#fff" : "#6b7280", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Range */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.label, marginBottom: 6 }}>📅 {tr.exportRange}</div>
          {[["thisMonth", tr.thisMonthOnly],["last3", tr.last3],["thisYear", tr.thisYear],["custom", tr.custom]].map(([val, label]) => (
            <label key={val} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}>
              <input type="radio" name="range" value={val} checked={exportRange === val} onChange={() => setExportRange(val)} />
              <span style={{ fontSize: 13, color: C.value }}>{label}</span>
            </label>
          ))}
          {exportRange === "custom" && (
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} style={{ flex: 1, padding: "8px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
              <input type="date" value={customTo}   onChange={e => setCustomTo(e.target.value)}   style={{ flex: 1, padding: "8px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
            </div>
          )}
        </div>

        {/* Preview count */}
        <div style={{ background: C.row1, borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: C.label }}>👁 {tr.preview}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.header }}>{getFiltered().length} {tr.records}</span>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleExportPDF}
            style={{ flex: 1, padding: "12px", border: "none", borderRadius: 12, background: C.header, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            📄 PDF
          </button>
          <button onClick={handleExportCSV}
            style={{ flex: 1, padding: "12px", border: "none", borderRadius: 12, background: C.headerLight, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            📊 Excel/CSV
          </button>
        </div>
      </div>

      {/* Toggle Preview */}
      <button onClick={() => setShowReport(v => !v)}
        style={{ width: "100%", padding: "12px", border: `1.5px solid ${C.border}`, borderRadius: 12, background: "#fff", color: C.header, fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 12 }}>
        👁 {showReport ? rLang[exportLang].close : rLang[exportLang].preview}
      </button>

      {/* Report Card */}
      {showReport && (
        <div style={{ marginBottom: 20 }}>
          <ReportCard reportData={reportData} lang={exportLang} />
        </div>
      )}
    </div>
  );
}
