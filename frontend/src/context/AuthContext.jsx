import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/users/me")
        .then((r) => setUser(r.data))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    return api.get("/users/me").then((r) => {
      setUser(r.data);
      return r.data;
    });
  };

  const demoLogin = async (name, email) => {
    const r = await api.post(`/auth/demo-login?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`);
    await login(r.data.access_token);
    return r.data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const refreshUser = () =>
    api.get("/users/me").then((r) => { setUser(r.data); return r.data; });

  return (
    <AuthContext.Provider value={{ user, loading, login, demoLogin, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
