"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, tokenStorage } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { LoginPayload, RegisterPayload, User } from "@/lib/types";
import { roleHome } from "@/lib/utils";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = tokenStorage.get();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const me = await api.auth.me();
      setUser(me);
      setError(null);
    } catch (err) {
      tokenStorage.clear();
      setUser(null);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await api.auth.login(payload);
    tokenStorage.set(response.access_token);
    setUser(response.user);
    setError(null);
    return response.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await api.auth.register(payload);
    const response = await api.auth.login({ email: payload.email, password: payload.password });
    tokenStorage.set(response.access_token);
    setUser(response.user);
    setError(null);
    return response.user;
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, error, login, register, logout, refresh }),
    [user, loading, error, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return value;
}

export function redirectForUser(user: User) {
  return roleHome(user.rol);
}
