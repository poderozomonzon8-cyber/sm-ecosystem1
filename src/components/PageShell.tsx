import HeaderNav from "@/components/HeaderNav";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";
import { useTheme } from "@/contexts/ThemeContext";

export default function PageShell({ children }: { children: React.ReactNode }) {
  const { liveTheme, isNightMode } = useTheme();

  return (
    <div
      className="flex flex-col min-h-screen transition-colors duration-700"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        background: isNightMode
          ? `color-mix(in srgb, ${liveTheme["--theme-background"]} 60%, hsl(0,0%,4%))`
          : liveTheme["--theme-background"],
        color: liveTheme["--theme-text"],
      }}
    >
      <HeaderNav />
      <main className="flex-1" style={{ paddingTop: "var(--nav-height, 76px)" }}>{children}</main>
      <Footer />
      <AIChatWidget />
    </div>
  );
}
