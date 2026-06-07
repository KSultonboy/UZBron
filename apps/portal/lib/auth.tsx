"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken, setToken } from "./api";

export interface PortalUser {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: string;
}

interface AuthState {
  user: PortalUser | null;
  loading: boolean;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sahifa yuklanganda tokendan foydalanuvchini tiklash
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api<PortalUser & Record<string, unknown>>("/auth/me")
      .then((me) => setUser({ id: me.id, name: me.name ?? null, email: (me.email as string) ?? null, avatarUrl: (me.avatarUrl as string) ?? null, role: me.role }))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const loginWithGoogle = async (idToken: string) => {
    const res = await api<{ user: PortalUser; tokens: { accessToken: string } }>(
      "/auth/google",
      { method: "POST", body: { idToken }, auth: false },
    );
    setToken(res.tokens.accessToken);
    setUser(res.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth AuthProvider ichida ishlatilishi kerak");
  return ctx;
}
