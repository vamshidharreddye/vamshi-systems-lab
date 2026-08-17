"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface XRayContextValue {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  toggle: () => void;
}

const XRayContext = createContext<XRayContextValue | null>(null);
const STORAGE_KEY = "vamshi-systems-xray";

export function XRayProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setEnabled(window.localStorage.getItem(STORAGE_KEY) === "on");
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.dataset.xray = enabled ? "on" : "off";
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  }, [enabled, hydrated]);

  const setPersisted = useCallback((next: boolean) => {
    setEnabled(next);
    setHydrated(true);
    document.documentElement.dataset.xray = next ? "on" : "off";
    window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
  }, []);
  const toggle = useCallback(() => setPersisted(!enabled), [enabled, setPersisted]);
  const value = useMemo(
    () => ({ enabled, setEnabled: setPersisted, toggle }),
    [enabled, setPersisted, toggle]
  );
  return <XRayContext.Provider value={value}>{children}</XRayContext.Provider>;
}

export function useXRay() {
  const value = useContext(XRayContext);
  if (!value) throw new Error("useXRay must be used within XRayProvider");
  return value;
}
