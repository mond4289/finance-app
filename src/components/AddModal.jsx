import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import t from "../i18n";

export default function AddModal({ type, onClose, onSaved, accounts, categories }) {
  const { user, lang } = useAuth();
  const tr = t[lang];
  const isExpense  = type === "expense";
  const isTransfer = type === "transfer";
  const fileRef = useRef();

  const [date, setDate]         = useState(new Date().toISOString().split("T")[0]);
  const [account, setAccount]   = useState(accounts[0]?.name || "");
  const [toAccount, setToAccount] = useState(accounts[1]?.name || "");
  const [cat, setCat]           = useState("");
  const [note, setNote]         = useState("");
  const [incomeAmt, setIncomeAmt] = useState("");
  const [items, setItems]       = useState([{ name: "", qty: 1, price: 0 }]);
  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading]   = useState(false);

  const filteredCats = categories.filter(c => c.type === (isExpense ? "expense" : "income"));
  const expenseTotal = items.reduce((s, i) => s + (Number(i.qty) * Number(i.price)), 0);
  const total = isExpense ? expenseTotal : Number(incomeAmt);
  const accentColor = isExpense ? "#ef4444" : isTransfer ? "#3b82f6" : "#10b981";

  const updateItem = (idx, field, val) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  const addItem = () => setItems(prev => [...prev, { name: "", qty: 1, price: 0 }]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageBase64(ev.target.result);
      setImagePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);
    try {
      let image_url = "";
      if (imageBase64) {
        const imgRes = await api("uploadImage", {
          username: user.username, base64: imageBase64,
          filename: `${Date.now()}.jpg`
        });
        if (imgRes.success) image_url = imgRes.url;
      }

      if (isTransfer) {
        await api("transferMoney", { username: user.username, fromAccount: account, toAccount, amount: incomeAmt, note });
      } else {
        await api("addTransaction", {
          username: user.username, date, type,
          amount: total, category: cat, account, note,
          items: isExpense ? items : null, image_url,
        });
      }
      onSaved && onSaved();
      onClose();
    } catch {
      alert(tr.error);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: 480, margin: "0 auto", borderRadius: "24px 24px 0 0", padding: "20px 16px 36px", maxHeight: "90vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: accentColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 800 }}>
              {isTransfer ? "⇄" : isExpense ? "−" : "+"}
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, color: "#111827" }}>
              {isTransfer ? tr.transfer : isExpense ? tr.addExpense : tr.addIncome}
            </span>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "#f3f4f6", borderRadius: 10, padding: "6px 12px", cursor: "pointer", color: "#6b7280", fontSize: 14 }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Date */}
          <div>
            <label style={lbl}>{tr.date}</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} />
          </div>

          {/* Account(s) */}
          {isTransfer ? (
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={lbl}>{tr.from}</label>
                <select value={account} onChange={e => setAccount(e.target.value)} style={inp}>
                  {accounts.map(a => <option key={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 8, color: "#6b7280", fontSize: 20 }}>→</div>
              <div style={{ flex: 1 }}>
                <label style={lbl}>{tr.to}</label>
                <select value={toAccount} onChange={e => setToAccount(e.target.value)} style={inp}>
                  {accounts.map(a => <option key={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label style={lbl}>{tr.account}</label>
              <select value={account} onChange={e => setAccount(e.target.value)} style={inp}>
                {accounts.map(a => <option key={a.id}>{a.name}</option>)}
              </select>
            </div>
          )}

          {/* Category (not transfer) */}
          {!isTransfer && (
            <div>
              <label style={lbl}>{tr.category}</label>
              <select value={cat} onChange={e => setCat(e.target.value)} style={inp}>
                <option value="">-- ເລືອກ / เลือก --</option>
                {filteredCats.map(c => (
                  <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Amount / Line items */}
          {isTransfer || !isExpense ? (
            <div>
              <label style={lbl}>{tr.amount} (₭)</label>
              <input type="number" placeholder="0" value={incomeAmt}
                onChange={e => setIncomeAmt(e.target.value)}
                style={{ ...inp, fontSize: 20, fontWeight: 800, color: accentColor }} />
            </div>
          ) : (
            <div style={{ background: "#f9fafb", borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>📦 {tr.items}</div>
              {items.map((item, idx) => (
                <div key={idx} style={{ background: "#fff", borderRadius: 12, padding: 10, marginBottom: 8, border: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input placeholder={tr.itemName} value={item.name}
                      onChange={e => updateItem(idx, "name", e.target.value)}
                      style={{ ...inp, flex: 1 }} />
                    {items.length > 1 && (
                      <button onClick={() => removeItem(idx)}
                        style={{ border: "none", background: "#fee2e2", color: "#ef4444", borderRadius: 8, padding: "0 10px", cursor: "pointer" }}>🗑</button>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ ...lbl, fontSize: 10 }}>{tr.qty}</label>
                      <input type="number" min="1" value={item.qty}
                        onChange={e => updateItem(idx, "qty", e.target.value)} style={inp} />
                    </div>
                    <div style={{ flex: 2 }}>
                      <label style={{ ...lbl, fontSize: 10 }}>{tr.priceEach} (₭)</label>
                      <input type="number" min="0" value={item.price}
                        onChange={e => updateItem(idx, "price", e.target.value)} style={inp} />
                    </div>
                    <div style={{ flex: 2 }}>
                      <label style={{ ...lbl, fontSize: 10 }}>ລວມ / รวม</label>
                      <div style={{ ...inp, background: "#f3f4f6", color: "#ef4444", fontWeight: 700 }}>
                        {(Number(item.qty) * Number(item.price)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addItem}
                style={{ width: "100%", border: "1.5px dashed #d1d5db", background: "transparent", borderRadius: 10, padding: "10px", color: "#6b7280", cursor: "pointer", fontSize: 13 }}>
                {tr.addItem}
              </button>
            </div>
          )}

          {/* Total */}
          <div style={{ background: isExpense ? "#fef2f2" : isTransfer ? "#eff6ff" : "#f0fdf4", borderRadius: 14, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>💰 {tr.total}</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: accentColor }}>{total.toLocaleString()} ₭</span>
          </div>

          {/* Note */}
          <div>
            <label style={lbl}>{tr.note}</label>
            <input placeholder="..." value={note} onChange={e => setNote(e.target.value)} style={inp} />
          </div>

          {/* Image */}
          <div>
            <label style={lbl}>📎 {tr.attachImage}</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { fileRef.current.accept="image/*"; fileRef.current.capture="environment"; fileRef.current.click(); }}
                style={imgBtn}>📷 {tr.takePhoto}</button>
              <button onClick={() => { fileRef.current.accept="image/*"; fileRef.current.removeAttribute("capture"); fileRef.current.click(); }}
                style={imgBtn}>🖼 {tr.choosePhoto}</button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
            {imagePreview && (
              <div style={{ position: "relative", marginTop: 10 }}>
                <img src={imagePreview} alt="preview" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 12 }} />
                <button onClick={() => { setImageBase64(null); setImagePreview(null); }}
                  style={{ position: "absolute", top: 6, right: 6, border: "none", background: "rgba(0,0,0,0.5)", color: "#fff", borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>🗑 ลบ</button>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "14px", border: "1.5px solid #e5e7eb", borderRadius: 14, background: "#fff", color: "#6b7280", fontWeight: 600, cursor: "pointer" }}>
            {tr.cancel}
          </button>
          <button onClick={handleSave} disabled={loading}
            style={{ flex: 2, padding: "14px", border: "none", borderRadius: 14, background: loading ? "#c4b5fd" : accentColor, color: "#fff", fontWeight: 800, fontSize: 16, cursor: loading ? "default" : "pointer" }}>
            {loading ? tr.loading : tr.save}
          </button>
        </div>
      </div>
    </div>
  );
}

const lbl = { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 };
const inp = { width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff" };
const imgBtn = { flex: 1, padding: "10px", border: "1.5px solid #e5e7eb", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151" };
