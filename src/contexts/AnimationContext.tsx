import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  ThemeAnimationSet,
  THEME_ANIMATION_SETS,
  HARDSCAPE_ANIMATIONS,
  CONSTRUCTION_ANIMATIONS,
  MAINTENANCE_ANIMATIONS,
  getAnimationSet,
  animationSetToCSSVars,
} from "@/config/ThemeAnimationConfig";

/* ═══════════════════════════════════════════════════════════
   ANIMATION CONTEXT
   Manages per-theme animation overrides.
   Falls back to preset defaults when no override is stored.
   ═══════════════════════════════════════════════════════════ */

const ANIM_STORAGE_KEY = "monzon-anim-overrides-v1";

type AnimationOverrides = Partial<Record<string, Partial<ThemeAnimationSet>>>;

type AnimationContextType = {
  /** The active animation set (defaults + any user overrides merged) */
  activeAnimSet: ThemeAnimationSet | null;
  /** The currently resolved preset id */
  activePresetId: string | null;
  /** Per-field overrides stored per preset id */
  overrides: AnimationOverrides;
  /** Update a single field in the active preset's animation set */
  setAnimVar: (presetId: string, field: keyof ThemeAnimationSet, value: number | string) => void;
  /** Reset a preset to its built-in defaults */
  resetPreset: (presetId: string) => void;
  /** Change which preset the context is driven from */
  setPresetId: (id: string | null) => void;
  /** All defaults, keyed by presetId — useful for the editor to show defaults */
  defaults: Record<string, ThemeAnimationSet>;
};

const AnimCtx = createContext<AnimationContextType | null>(null);

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [activePresetId, setPresetIdState] = useState<string | null>(null);

  const [overrides, setOverrides] = useState<AnimationOverrides>(() => {
    try {
      const stored = localStorage.getItem(ANIM_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  /* Derive the effective animation set for the active preset */
  const activeAnimSet = useMemo((): ThemeAnimationSet | null => {
    if (!activePresetId) return null;
    const base = getAnimationSet(activePresetId);
    if (!base) return null;
    const override = overrides[activePresetId] ?? {};
    return { ...base, ...override } as ThemeAnimationSet;
  }, [activePresetId, overrides]);

  /* Apply CSS vars to :root whenever the active set changes */
  useEffect(() => {
    if (!activeAnimSet) return;
    const vars = animationSetToCSSVars(activeAnimSet);
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [activeAnimSet]);

  /* When no ecosystem preset is active, clean up anim vars */
  useEffect(() => {
    if (activeAnimSet) return;
    const root = document.documentElement;
    const defaultVars = animationSetToCSSVars(HARDSCAPE_ANIMATIONS);
    Object.keys(defaultVars).forEach(k => root.style.removeProperty(k));
  }, [activeAnimSet]);

  const setPresetId = useCallback((id: string | null) => {
    setPresetIdState(id);
  }, []);

  const setAnimVar = useCallback((presetId: string, field: keyof ThemeAnimationSet, value: number | string) => {
    setOverrides(prev => {
      const next = {
        ...prev,
        [presetId]: { ...(prev[presetId] ?? {}), [field]: value },
      };
      localStorage.setItem(ANIM_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetPreset = useCallback((presetId: string) => {
    setOverrides(prev => {
      const next = { ...prev };
      delete next[presetId];
      localStorage.setItem(ANIM_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const defaults: Record<string, ThemeAnimationSet> = {
    "hardscape-landscape":     HARDSCAPE_ANIMATIONS,
    "construction-renovation": CONSTRUCTION_ANIMATIONS,
    "maintenance-service":     MAINTENANCE_ANIMATIONS,
  };

  return (
    <AnimCtx.Provider value={{
      activeAnimSet,
      activePresetId,
      overrides,
      setAnimVar,
      resetPreset,
      setPresetId,
      defaults,
    }}>
      {children}
    </AnimCtx.Provider>
  );
}

export function useAnimation() {
  const ctx = useContext(AnimCtx);
  if (!ctx) throw new Error("useAnimation must be used inside AnimationProvider");
  return ctx;
}
