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
import { normalizeState } from "@/lib/fund";
import type { RebuildState } from "@/lib/types";

type AppData = {
  state: RebuildState;
  today: string;
  dashboard: DashboardSnapshot | null;
  loading: boolean;
  refresh: () => Promise<void>;
  post: (url: string, body?: unknown) => Promise<unknown>;
};

const Ctx = createContext<AppData | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RebuildState | null>(null);
  const [today, setToday] = useState("");
  const [dashboard, setDashboard] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/state");
    const data = await res.json();
    setState(normalizeState(data.state));
    setToday(data.today);
    setDashboard(data.dashboard);
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
        body: JSON.stringify(body ?? {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      if (data.state) {
        setState(normalizeState(data.state));
        await refresh();
      }
      return data;
    },
    [refresh],
  );

  if (loading || !state) {
    return (
      <div className="boot">
        <p className="brand-mark">REBUILD</p>
        <p className="muted">Loading your journey…</p>
      </div>
    );
  }

  return (
    <Ctx.Provider
      value={{ state, today, dashboard, loading, refresh, post }}
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
