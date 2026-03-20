import { useEffect, useState, useCallback } from "react";

/* ── Types ── */
export type PWAStatus = "idle" | "installing" | "installed" | "updated" | "offline" | "error";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

export interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isUpdating: boolean;
  swStatus: PWAStatus;
  promptInstall: () => Promise<void>;
  skipWaiting: () => void;
  swRegistration: ServiceWorkerRegistration | null;
}

/* ── Service worker registration ── */
let _swReg: ServiceWorkerRegistration | null = null;

export function usePWA(): PWAState {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled]     = useState(false);
  const [isOnline,   setIsOnline]         = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [isUpdating, setIsUpdating]       = useState(false);
  const [swStatus,   setSwStatus]         = useState<PWAStatus>("idle");
  const [swReg,      setSwReg]            = useState<ServiceWorkerRegistration | null>(null);

  /* Register SW */
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        _swReg = reg;
        setSwReg(reg);
        setSwStatus("installed");

        // Listen for updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setIsUpdating(true);
              setSwStatus("updated");
            }
          });
        });

        // Periodic update check
        setInterval(() => reg.update(), 60 * 60 * 1000);
      } catch (err) {
        console.warn("[PWA] SW registration failed:", err);
        setSwStatus("error");
      }
    };

    registerSW();

    // Controller change → new SW active
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  /* Online/offline */
  useEffect(() => {
    const onOnline  = () => { setIsOnline(true);  setSwStatus("installed"); };
    const onOffline = () => { setIsOnline(false); setSwStatus("offline"); };
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online",  onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  /* Install prompt */
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  /* Already installed */
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    setIsInstalled(mq.matches || (navigator as any).standalone === true);
    const onChange = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  }, [installPrompt]);

  const skipWaiting = useCallback(() => {
    if (!swReg?.waiting) return;
    swReg.waiting.postMessage({ type: "SKIP_WAITING" });
    setIsUpdating(false);
  }, [swReg]);

  return {
    isInstallable: !!installPrompt && !isInstalled,
    isInstalled,
    isOnline,
    isUpdating,
    swStatus,
    promptInstall,
    skipWaiting,
    swRegistration: swReg,
  };
}
