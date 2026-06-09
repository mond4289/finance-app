import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("finance_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [lang, setLang] = useState(() => localStorage.getItem("finance_lang") || "th");

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("finance_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("finance_user");
  };

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem("finance_lang", l);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, lang, changeLang }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
