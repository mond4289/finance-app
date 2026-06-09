import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import t from "../i18n";

function fmt(n) { return Number(n || 0).toLocaleString(); }

export default function Settings() {
  const { user, logout, lang, changeLang } = useAuth();
  const tr = t[lang];
  const [section, setSection] = useState(null);

  // Accounts
  const [accounts, setAccounts]   = useState([]);
  const [accName, setAccName]     = useState("");
  const [accBalance, setAccBalance] = useState("");
  const [accColor, setAccColor]   = useState("#6366f1");

  // Categories
  const [categories, setCategories] = useState([]);
  const [catName, setCatName]       = useState("");
  const [catType, setCatType]       = useState("expense");
  const [catIcon, setCatIcon]       = useState("📦");
  const [catColor, setCatColor]     = useState("#6b7280");

  // Goals
  const [goals, setGoals]         = useState([]);
  const [goalName, setGoalName]   = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");

  // Recurring
  const [recurring, setRecurring] = useState([]);
  const [recName, setRecName]     = useState("");
  const [recType, setRecType]     = useState("expense");
  const [recAmount, setRecAmount] = useState("");
  const [recDay, setRecDay]       = useState(1);
  const [recCat, setRecCat]       = useState("");
  const [recAcc, setRecAcc]       = useState("");

  useEffect(() => {
    if (section === "accounts")   loadAccounts();
    if (section === "categories") loadCategories();
    if (section === "goals")      loadGoals();
    if (section === "recurring")  loadRecurring();
  }, [section]);

  const loadAccounts   = async () => { const r = await api("getAccounts",   { username: user.username }); if (r.success) setAccounts(r.data || []); };
  const loadCategories = async () => { const r = await api("getCategories", { username: user.username }); if (r.success) setCategories(r.data || []); };
  const loadGoals      = async () => { const r = await api("getGoals",      { username: user.username }); if (r.success) setGoals(r.data || []); };
  const loadRecurring  = async () => { const r = await api("getRecurring",  { username: user.username }); if (r.success) setRecurring(r.data || []); };

  const addAccount = async () => {
    if (!accName) return;
    await api("addAccount", { username: user.username, name: accName, balance: accBalance, color: accColor });
    setAccName(""); setAccBalance(""); loadAccounts();
  };
  const deleteAccount = async (id) => {
    if (!window.confirm(tr.confirmDelete)) return;
    await api("deleteAccount", { username: user.username, id }); loadAccounts();
  };

  const addCategory = async () => {
    if (!catName) return;
    await api("addCategory", { username: user.username, type: catType, name: catName, icon: catIcon, color: catColor });
    setCatName(""); loadCategories();
  };
  const deleteCategory = async (id) => {
    if (!window.confirm(tr.confirmDelete)) return;
    await api("deleteCategory", { username: user.username, id }); loadCategories();
  };

  const addGoal = async () => {
    if (!goalName || !goalTarget) return;
    await api("addGoal", { username: user.username, name: goalName, target: goalTarget, current: goalCurrent || 0, deadline: goalDeadline });
    setGoalName(""); setGoalTarget(""); setGoalCurrent(""); setGoalDeadline(""); loadGoals();
  };
  const deleteGoal = async (id) => {
    if (!window.confirm(tr.confirmDelete)) return;
    await api("deleteGoal", { username: user.username, id }); loadGoals();
  };

  const addRecurring = async () => {
    if (!recName || !recAmount) return;
    await api("addRecurring", { username: user.username, type: recType, name: recName, amount: recAmount, category: recCat, account: recAcc, day_of_month: recDay });
    setRecName(""); setRecAmount(""); loadRecurring();
  };
  const deleteRecurring = async (id) => {
    if (!window.confirm(tr.confirmDelete)) return;
    await api("deleteRecurring", { username: user.username, id }); loadRecurring();
  };

  const menuItems = [
    { id: "accounts",   icon: "🏦", label: tr.myAccounts },
    { id: "categories", icon: "🏷", label: tr.categories },
    { id: "goals",      icon: "🎯", label: tr.savingsGoal },
    { id: "recurring",  icon: "🔄", label: tr.recurring },
  ];

  return (
    <div style={{ padding: "16px 14px 0" }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 12 }}>{tr.settings}</div>

      {/* Language */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "14px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>🌐 {tr.language}</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["th","🇹🇭 ไทย"],["en","🇬🇧 EN"],["la","🇱🇦 ລາວ"]].map(([code, label]) => (
            <button key={code} onClick={() => changeLang(code)}
              style={{ flex: 1, padding: "8px", border: "none", borderRadius: 10, background: lang === code ? "#6366f1" : "#f3f4f6", color: lang === code ? "#fff" : "#6b7280", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: 10 }}>
        {menuItems.map((item, i) => (
          <div key={item.id}>
            <div onClick={() => setSection(section === item.id ? null : item.id)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: i < menuItems.length - 1 ? "1px solid #f3f4f6" : "none", cursor: "pointer", background: section === item.id ? "#f5f3ff" : "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: "#374151", fontWeight: section === item.id ? 700 : 400 }}>{item.label}</span>
              </div>
              <span style={{ color: "#d1d5db", transform: section === item.id ? "rotate(90deg)" : "none", transition: "0.2s" }}>›</span>
            </div>

            {/* Accounts Section */}
            {section === "accounts" && item.id === "accounts" && (
              <div style={{ padding: "12px 16px", background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                {accounts.map(acc => (
                  <div key={acc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: acc.color }} />
                      <span style={{ fontSize: 13 }}>{acc.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>₭ {fmt(acc.balance)}</span>
                      <button onClick={() => deleteAccount(acc.id)} style={{ border: "none", background: "#fee2e2", color: "#ef4444", borderRadius: 6, padding: "3px 7px", cursor: "pointer", fontSize: 12 }}>🗑</button>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                  <input placeholder={tr.accountName} value={accName} onChange={e => setAccName(e.target.value)} style={inp} />
                  <input type="number" placeholder={tr.initialBalance} value={accBalance} onChange={e => setAccBalance(e.target.value)} style={inp} />
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={accColor} onChange={e => setAccColor(e.target.value)} style={{ width: 36, height: 36, border: "none", borderRadius: 8, cursor: "pointer" }} />
                    <button onClick={addAccount} style={addBtn}>{tr.addAccount}</button>
                  </div>
                </div>
              </div>
            )}

            {/* Categories Section */}
            {section === "categories" && item.id === "categories" && (
              <div style={{ padding: "12px 16px", background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                {["income", "expense"].map(type => (
                  <div key={type} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: type === "income" ? "#10b981" : "#ef4444", marginBottom: 6 }}>
                      {type === "income" ? tr.income : tr.expense}
                    </div>
                    {categories.filter(c => c.type === type).map(c => (
                      <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f3f4f6" }}>
                        <span style={{ fontSize: 13 }}>{c.icon} {c.name}</span>
                        <button onClick={() => deleteCategory(c.id)} style={{ border: "none", background: "#fee2e2", color: "#ef4444", borderRadius: 6, padding: "3px 7px", cursor: "pointer", fontSize: 12 }}>🗑</button>
                      </div>
                    ))}
                  </div>
                ))}
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  <select value={catType} onChange={e => setCatType(e.target.value)} style={inp}>
                    <option value="expense">{tr.expense}</option>
                    <option value="income">{tr.income}</option>
                  </select>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input placeholder="emoji" value={catIcon} onChange={e => setCatIcon(e.target.value)} style={{ ...inp, width: 60 }} />
                    <input placeholder={tr.categories} value={catName} onChange={e => setCatName(e.target.value)} style={{ ...inp, flex: 1 }} />
                  </div>
                  <button onClick={addCategory} style={addBtn}>{tr.addNew}</button>
                </div>
              </div>
            )}

            {/* Goals Section */}
            {section === "goals" && item.id === "goals" && (
              <div style={{ padding: "12px 16px", background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                {goals.map(g => {
                  const pct = Math.min(Math.round((Number(g.current) / Number(g.target)) * 100), 100);
                  return (
                    <div key={g.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #f3f4f6" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{g.name}</span>
                        <button onClick={() => deleteGoal(g.id)} style={{ border: "none", background: "#fee2e2", color: "#ef4444", borderRadius: 6, padding: "3px 7px", cursor: "pointer", fontSize: 12 }}>🗑</button>
                      </div>
                      <div style={{ background: "#f3f4f6", borderRadius: 99, height: 6, marginBottom: 2 }}>
                        <div style={{ width: `${pct}%`, background: "#6366f1", borderRadius: 99, height: "100%" }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>₭{fmt(g.current)} / {fmt(g.target)} ({pct}%)</div>
                    </div>
                  );
                })}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <input placeholder={tr.goalName} value={goalName} onChange={e => setGoalName(e.target.value)} style={inp} />
                  <input type="number" placeholder={tr.target + " (₭)"} value={goalTarget} onChange={e => setGoalTarget(e.target.value)} style={inp} />
                  <input type="number" placeholder={tr.current + " (₭)"} value={goalCurrent} onChange={e => setGoalCurrent(e.target.value)} style={inp} />
                  <input type="date" value={goalDeadline} onChange={e => setGoalDeadline(e.target.value)} style={inp} />
                  <button onClick={addGoal} style={addBtn}>{tr.addGoal}</button>
                </div>
              </div>
            )}

            {/* Recurring Section */}
            {section === "recurring" && item.id === "recurring" && (
              <div style={{ padding: "12px 16px", background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                {recurring.map(r => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>วันที่ {r.day_of_month} ทุกเดือน · ₭{fmt(r.amount)}</div>
                    </div>
                    <button onClick={() => deleteRecurring(r.id)} style={{ border: "none", background: "#fee2e2", color: "#ef4444", borderRadius: 6, padding: "3px 7px", cursor: "pointer", fontSize: 12 }}>🗑</button>
                  </div>
                ))}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  <select value={recType} onChange={e => setRecType(e.target.value)} style={inp}>
                    <option value="expense">{tr.expense}</option>
                    <option value="income">{tr.income}</option>
                  </select>
                  <input placeholder={tr.recurringName} value={recName} onChange={e => setRecName(e.target.value)} style={inp} />
                  <input type="number" placeholder={tr.amount + " (₭)"} value={recAmount} onChange={e => setRecAmount(e.target.value)} style={inp} />
                  <input type="number" min="1" max="31" placeholder={tr.dayOfMonth} value={recDay} onChange={e => setRecDay(e.target.value)} style={inp} />
                  <button onClick={addRecurring} style={addBtn}>{tr.addNew}</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Logout */}
      <button onClick={logout}
        style={{ width: "100%", padding: "13px", border: "none", borderRadius: 14, background: "#fef2f2", color: "#ef4444", fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 20 }}>
        🚪 {tr.logout}
      </button>
    </div>
  );
}

const inp = { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box", background: "#fff" };
const addBtn = { width: "100%", padding: "10px", border: "none", borderRadius: 10, background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" };
