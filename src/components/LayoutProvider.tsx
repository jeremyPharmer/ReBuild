"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_HOME_LAYOUT,
  HOME_LAYOUT_STORAGE_KEY,
  isHomeLayoutId,
  type HomeLayoutId,
} from "@/lib/home-layouts";

type LayoutContextValue = {
  homeLayout: HomeLayoutId;
  setHomeLayout: (id: HomeLayoutId) => void;
};

const LayoutCtx = createContext<LayoutContextValue | null>(null);

function applyHomeLayout(id: HomeLayoutId) {
  document.documentElement.setAttribute("data-home-layout", id);
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [homeLayout, setHomeLayoutState] =
    useState<HomeLayoutId>(DEFAULT_HOME_LAYOUT);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HOME_LAYOUT_STORAGE_KEY);
      if (stored && isHomeLayoutId(stored)) {
        applyHomeLayout(stored);
        setHomeLayoutState(stored);
        return;
      }
    } catch {
      /* ignore */
    }
    applyHomeLayout(DEFAULT_HOME_LAYOUT);
  }, []);

  const setHomeLayout = useCallback((id: HomeLayoutId) => {
    try {
      localStorage.setItem(HOME_LAYOUT_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
    applyHomeLayout(id);
    setHomeLayoutState(id);
  }, []);

  return (
    <LayoutCtx.Provider value={{ homeLayout, setHomeLayout }}>
      {children}
    </LayoutCtx.Provider>
  );
}

export function useHomeLayout() {
  const ctx = useContext(LayoutCtx);
  if (!ctx) throw new Error("useHomeLayout must be used within LayoutProvider");
  return ctx;
}
