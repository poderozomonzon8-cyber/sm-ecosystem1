import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AnimaProvider } from "@animaapp/playground-react-sdk";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SplashProvider } from "@/contexts/SplashContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AnimationProvider } from "@/contexts/AnimationContext";
import { ThemeAnimationBridge } from "@/components/ThemeAnimationBridge";
import { SoundProvider } from "@/contexts/SoundContext";
import NightModeOverlay from "@/components/NightModeOverlay";
import AmbientSoundWidget from "@/components/AmbientSoundWidget";

import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <AnimaProvider>
      <ThemeProvider>
        <AnimationProvider>
          <SplashProvider>
            <AuthProvider>
              <NotificationProvider>
                <SoundProvider>
                  <ThemeAnimationBridge />
                  <NightModeOverlay />
                  <AmbientSoundWidget />
                  <App />
                </SoundProvider>
              </NotificationProvider>
            </AuthProvider>
          </SplashProvider>
        </AnimationProvider>
      </ThemeProvider>
    </AnimaProvider>
  </StrictMode>
);

/* Register Service Worker for PWA */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((err) => console.warn("[PWA] SW registration error:", err));
  });
}