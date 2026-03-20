import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

/* ═══════════════════════════════════════════════════════
   PAGE TRANSITION COMPONENT
   Wraps page content with theme-specific entrance animations:
   - Hardscape:    dust-fade (grainy opacity sweep)
   - Construction: blueprint-wipe (horizontal reveal sweep)
   - Maintenance:  clean-slide (vertical slide-up)
   - Default:      simple fade
   ═══════════════════════════════════════════════════════ */

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const { themeSettings, activePresetId, isNightMode } = useTheme();
  const location = useLocation();
  const [phase, setPhase] = useState<"in" | "visible">("visible");
  const [key, setKey] = useState(location.pathname);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === prevPath.current) return;
    prevPath.current = location.pathname;
    setPhase("in");
    setKey(location.pathname);
    const t = setTimeout(() => setPhase("visible"), themeSettings.transitionSpeed);
    return () => clearTimeout(t);
  }, [location.pathname, themeSettings.transitionSpeed]);

  const style = themeSettings.transitionStyle;
  const speed = themeSettings.transitionSpeed;
  const ease  = themeSettings.transitionEasing;
  const intensity = themeSettings.transitionIntensity;

  /* Overlay color per theme */
  const overlayColor =
    activePresetId === "hardscape-landscape"     ? `rgba(8,22,8,${intensity})`    :
    activePresetId === "construction-renovation" ? `rgba(9,14,22,${intensity})`   :
    activePresetId === "maintenance-service"     ? `rgba(8,15,28,${intensity})`   :
    `rgba(0,0,0,${intensity})`;

  const nightBg = isNightMode ? "hsl(0,0%,4%)" : undefined;

  return (
    <div
      key={key}
      className="relative w-full min-h-screen"
      style={{ background: nightBg ?? "var(--theme-background, #fff)" }}
    >
      {/* Transition overlay */}
      {phase === "in" && (
        <div
          className="fixed inset-0 z-[999] pointer-events-none"
          style={{
            background: style === "blueprint-wipe"
              ? `linear-gradient(90deg, ${overlayColor} 0%, transparent 100%)`
              : overlayColor,
            animation:
              style === "dust-fade"       ? `dust-fade-out ${speed}ms ${ease} forwards` :
              style === "blueprint-wipe"  ? `blueprint-wipe-out ${speed}ms ${ease} forwards` :
              style === "clean-slide"     ? `clean-slide-out ${speed}ms ${ease} forwards` :
              `page-fade-out ${speed}ms ${ease} forwards`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Content entrance */}
      <div
        style={{
          animation:
            style === "dust-fade"       ? `dust-fade-in ${speed}ms ${ease} forwards` :
            style === "blueprint-wipe"  ? `blueprint-slide-in ${speed}ms ${ease} forwards` :
            style === "clean-slide"     ? `clean-slide-in ${speed}ms ${ease} forwards` :
            `page-fade-in ${speed}ms ${ease} forwards`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
