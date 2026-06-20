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

export interface PasswordLoginResult {
  requiresEmailCode?: boolean;
  email?: string;
  devCode?: string;
  ok?: boolean;
}

interface AuthState {
  user: PortalUser | null;
  loading: boolean;
  loginWithGoogle: (idToken: string) => Promise<PortalUser>;
  loginWithPassword: (email: string, password: string) => Promise<PasswordLoginResult>;
  registerWithPassword: (email: string, password: string, name: string) => Promise<PortalUser>;
  verifyEmailCode: (email: string, code: string) => Promise<PortalUser>;
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
    return res.user;
  };

  const loginWithPassword = async (email: string, password: string): Promise<PasswordLoginResult> => {
    const res = await api<{
      requiresEmailCode?: boolean;
      email?: string;
      devCode?: string;
      user?: PortalUser;
      tokens?: { accessToken: string };
    }>("/auth/login", { method: "POST", body: { email, password }, auth: false });
    if (res.requiresEmailCode) {
      return { requiresEmailCode: true, email: res.email, devCode: res.devCode };
    }
    if (res.tokens && res.user) {
      setToken(res.tokens.accessToken);
      setUser(res.user);
      return { ok: true };
    }
    throw new Error("Kirishda xato");
  };

  const registerWithPassword = async (email: string, password: string, name: string): Promise<PortalUser> => {
    const res = await api<{ user: PortalUser; tokens: { accessToken: string } }>(
      "/auth/register",
      { method: "POST", body: { email, password, name }, auth: false },
    );
    setToken(res.tokens.accessToken);
    setUser(res.user);
    return res.user;
  };

  const verifyEmailCode = async (email: string, code: string): Promise<PortalUser> => {
    const res = await api<{ user: PortalUser; tokens: { accessToken: string } }>(
      "/auth/login/email-verify",
      { method: "POST", body: { email, code }, auth: false },
    );
    setToken(res.tokens.accessToken);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginWithGoogle, loginWithPassword, registerWithPassword, verifyEmailCode, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth AuthProvider ichida ishlatilishi kerak");
  return ctx;
}
