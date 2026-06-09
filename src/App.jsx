import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { api } from "./api";
import BottomNav from "./components/BottomNav";
import AddModal from "./components/AddModal";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

// ฟอนต์หลักของแอป
const APP_FONT = "'Saysettha OT','Phetsarath OT','Noto Sans Lao','Noto Sans Thai','Times New Roman',Times,serif";

function AppInner() {
  const { user } = useAuth();
  const [modal, setModal] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const openModal = async (type) => {
    if (user) {
      const [accRes, catRes] = await Promise.all([
        api("getAccounts",   { username: user.username }),
        api("getCategories", { username: user.username }),
      ]);
      if (accRes.success) setAccounts(accRes.data);
      if (catRes.success) setCategories(catRes.data);
    }
    setModal(type);
  };

  if (!user) return <Login />;

  return (
    <BrowserRouter>
      <div style={{
        fontFamily: APP_FONT,
        background: "#f8f9fb",
        minHeight: "100vh",
        maxWidth: 480,
        margin: "0 auto",
        paddingBottom: 80,
      }}>
        <Routes>
          <Route path="/"             element={<Dashboard    refreshKey={refreshKey} />} />
          <Route path="/transactions" element={<Transactions refreshKey={refreshKey} />} />
          <Route path="/reports"      element={<Reports      refreshKey={refreshKey} />} />
          <Route path="/settings"     element={<Settings />} />
          <Route path="*"             element={<Navigate to="/" />} />
        </Routes>

        <BottomNav onAddTransaction={openModal} />

        {modal && (
          <AddModal
            type={modal}
            accounts={accounts}
            categories={categories}
            onClose={() => setModal(null)}
            onSaved={() => setRefreshKey(k => k + 1)}
          />
        )}
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
