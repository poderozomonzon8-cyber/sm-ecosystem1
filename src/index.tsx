import React from "react";
import ReactDOM from "react-dom/client";
// import { AnimaProvider } from "@animaapp/playground-react-sdk"; // Removed Anima (double React cause)
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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 min
    },
  },
});

/* Register Service Worker for PWA */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((err) => console.warn("[PWA] SW registration error:", err));
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
<React.StrictMode>
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  </React.StrictMode>
);
