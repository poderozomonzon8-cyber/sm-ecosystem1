import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type SplashSettings = {
  enabled: boolean;
  questionText: string;
  animationSpeed: number; // 1 = normal, 0.5 = slow, 2 = fast
  particleIntensity: number; // 0–1
  backgroundStyle: "default" | "pure-black" | "charcoal";
  buttons: SplashButton[];
};

export type SplashButton = {
  id: string;
  label: string;
  sublabel: string;
  themePresetId: string;
  destination: string;
};

const DEFAULT_BUTTONS: SplashButton[] = [
  {
    id: "hardscape",
    label: "Hardscape / Landscape",
    sublabel: "Pavé · Patios · Retaining Walls",
    themePresetId: "hardscape-landscape",
    destination: "/",
  },
  {
    id: "construction",
    label: "Construction / Renovation",
    sublabel: "Rénovation · Additions · Structural",
    themePresetId: "construction-renovation",
    destination: "/",
  },
  {
    id: "maintenance",
    label: "Maintenance / Service Plans",
    sublabel: "Plans mensuels · Saisonniers · Commercial",
    themePresetId: "maintenance-service",
    destination: "/maintenance",
  },
];

export const DEFAULT_SPLASH_SETTINGS: SplashSettings = {
  enabled: true,
  questionText: "¿Qué servicio deseas?",
  animationSpeed: 1,
  particleIntensity: 0.65,
  backgroundStyle: "default",
  buttons: DEFAULT_BUTTONS,
};

const SPLASH_SETTINGS_KEY = "monzon-splash-settings-v1";
const SPLASH_SEEN_KEY = "monzon-splash-seen-v1";

type SplashContextType = {
  settings: SplashSettings;
  updateSettings: (partial: Partial<SplashSettings>) => void;
  updateButton: (id: string, partial: Partial<SplashButton>) => void;
  resetSettings: () => void;
  // Runtime splash state
  shouldShowSplash: boolean;
  dismissSplash: () => void;
  resetSplashForPreview: () => void;
};

const SplashCtx = createContext<SplashContextType | null>(null);

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SplashSettings>(() => {
    try {
      const stored = localStorage.getItem(SPLASH_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge to preserve any new default buttons
        return { ...DEFAULT_SPLASH_SETTINGS, ...parsed };
      }
    } catch { /* ignore */ }
    return DEFAULT_SPLASH_SETTINGS;
  });

  const [splashSeen, setSplashSeen] = useState<boolean>(() => {
    return localStorage.getItem(SPLASH_SEEN_KEY) === "true";
  });

  const shouldShowSplash = settings.enabled && !splashSeen;

  const updateSettings = useCallback((partial: Partial<SplashSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem(SPLASH_SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateButton = useCallback((id: string, partial: Partial<SplashButton>) => {
    setSettings(prev => {
      const next = {
        ...prev,
        buttons: prev.buttons.map(b => b.id === id ? { ...b, ...partial } : b),
      };
      localStorage.setItem(SPLASH_SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SPLASH_SETTINGS);
    localStorage.setItem(SPLASH_SETTINGS_KEY, JSON.stringify(DEFAULT_SPLASH_SETTINGS));
  }, []);

  const dismissSplash = useCallback(() => {
    setSplashSeen(true);
    localStorage.setItem(SPLASH_SEEN_KEY, "true");
  }, []);

  const resetSplashForPreview = useCallback(() => {
    setSplashSeen(false);
    localStorage.removeItem(SPLASH_SEEN_KEY);
  }, []);

  return (
    <SplashCtx.Provider value={{
      settings,
      updateSettings,
      updateButton,
      resetSettings,
      shouldShowSplash,
      dismissSplash,
      resetSplashForPreview,
    }}>
      {children}
    </SplashCtx.Provider>
  );
}

export function useSplash() {
  const ctx = useContext(SplashCtx);
  if (!ctx) throw new Error("useSplash must be used inside SplashProvider");
  return ctx;
}
