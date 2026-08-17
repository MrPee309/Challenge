import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("tchak_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("tchak_token"))
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = useCallback((data) => {
    localStorage.setItem("tchak_token", data.token);
    setUser(data.user);
  }, []);

  const login = useCallback(async (identifier, password) => {
    const res = await api.post("/auth/login", { identifier, password });
    handleAuth(res.data);
    return res.data.user;
  }, [handleAuth]);

  const loginWithGoogle = useCallback(async (credential) => {
    const res = await api.post("/auth/google", { credential });
    handleAuth(res.data);
    return res.data.user;
  }, [handleAuth]);

  const register = useCallback(async (payload) => {
    const res = await api.post("/auth/register", payload);
    // No auto-login: backend now requires email confirmation before login.
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("tchak_token");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (_) {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
