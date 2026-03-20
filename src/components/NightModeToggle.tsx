import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "@phosphor-icons/react";

export default function NightModeToggle() {
  const { isNightMode, setNightMode, liveTheme } = useTheme();
  const enabled = liveTheme["--theme-night-mode-enabled"] !== "0";
  if (!enabled) return null;

  return (
    <button
      onClick={() => setNightMode(!isNightMode)}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 cursor-pointer"
      style={{
        background: isNightMode ? "var(--theme-accent, hsl(42,90%,52%))" : "var(--theme-header-hover-bg, rgba(255,255,255,0.06))",
        border: "1px solid var(--theme-header-border, rgba(255,255,255,0.08))",
        color: isNightMode ? "var(--theme-btn-text, hsl(210,15%,10%))" : "var(--theme-header-text, hsl(0,0%,100%))",
      }}
      title={isNightMode ? "Switch to day mode" : "Switch to night mode"}
      aria-label={isNightMode ? "Switch to day mode" : "Switch to night mode"}
    >
      {isNightMode
        ? <Sun  size={14} weight="fill" />
        : <Moon size={14} weight="fill" />
      }
    </button>
  );
}
