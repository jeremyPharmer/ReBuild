"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { DashboardSnapshot } from "@/lib/journey";
import { emptyState } from "@/lib/journey";
import { normalizeState } from "@/lib/fund";
import type { RebuildState } from "@/lib/types";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  gender: string;
  usState: string;
  createdAt: string;
  lastLoginAt: string;
  hasPin: boolean;
  onboarded: boolean;
  isAdmin: boolean;
};

type AppData = {
  state: RebuildState;
  today: string;
  dashboard: DashboardSnapshot | null;
  env: "dev" | "prod";
  loading: boolean;
  authenticated: boolean;
  user: AuthUser | null;
  pinUnlockAvailable: boolean;
  deviceHint: { displayName: string; email: string } | null;
  refresh: () => Promise<void>;
  post: (url: string, body?: unknown) => Promise<unknown>;
};

const Ctx = createContext<AppData | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RebuildState>(emptyState());
  const [today, setToday] = useState("");
  const [dashboard, setDashboard] = useState<DashboardSnapshot | null>(null);
  const [env, setEnv] = useState<"dev" | "prod">("dev");
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pinUnlockAvailable, setPinUnlockAvailable] = useState(false);
  const [deviceHint, setDeviceHint] = useState<{
    displayName: string;
    email: string;
  } | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/state", { credentials: "include" });
    const data = await res.json().catch(() => ({}));

    if (res.status === 401 || data.authenticated === false) {
      setAuthenticated(false);
      setUser(null);
      setState(emptyState());
      setDashboard(null);
      setToday(data.today || "");
      setEnv(data.env === "prod" ? "prod" : "dev");

      const me = await fetch("/api/auth/me", { credentials: "include" });
      const meData = await me.json().catch(() => ({}));
      setPinUnlockAvailable(Boolean(meData.pinUnlockAvailable));
      setDeviceHint(meData.deviceHint ?? null);
      setLoading(false);
      return;
    }

    setAuthenticated(true);
    setUser(data.user ?? null);
    setState(normalizeState(data.state));
    setToday(data.today);
    setDashboard(data.dashboard);
    setEnv(data.env === "prod" ? "prod" : "dev");
    setPinUnlockAvailable(false);
    setDeviceHint(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const post = useCallback(
    async (url: string, body?: unknown) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body ?? {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Request failed");
      if (data.state) {
        setState(normalizeState(data.state));
      }
      if (data.user) {
        setUser(data.user);
        setAuthenticated(true);
      }
      await refresh();
      return data;
    },
    [refresh],
  );

  if (loading) {
    return (
      <div className="boot">
        <p className="brand-mark">JeremyOS</p>
        <p className="muted">Loading…</p>
      </div>
    );
  }

  return (
    <Ctx.Provider
      value={{
        state,
        today,
        dashboard,
        env,
        loading,
        authenticated,
        user,
        pinUnlockAvailable,
        deviceHint,
        refresh,
        post,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp outside provider");
  return ctx;
}
