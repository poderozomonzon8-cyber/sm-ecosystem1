import { useTheme } from "@/contexts/ThemeContext";

/* ═══════════════════════════════════════════════════════
   NIGHT MODE OVERLAY
   A fixed full-screen overlay that darkens all layers.
   Tint color is theme-specific.
   Applied on top of everything, pointer-events: none.
   ═══════════════════════════════════════════════════════ */
export default function NightModeOverlay() {
  const { isNightMode, themeSettings, activePresetId } = useTheme();

  if (!isNightMode || !themeSettings.nightModeEnabled) return null;

  const tintColor =
    activePresetId === "hardscape-landscape"     ? "rgba(4,12,4"    :
    activePresetId === "construction-renovation" ? "rgba(6,10,18"   :
    activePresetId === "maintenance-service"     ? "rgba(4,10,20"   :
    "rgba(0,0,0";

  const intensity = themeSettings.nightModeIntensity * 0.45;

  return (
    <div
      className="fixed inset-0 z-[9998] pointer-events-none"
      style={{
        background: `${tintColor}, ${intensity})`,
        transition: "opacity 1.5s cubic-bezier(0.16,1,0.3,1)",
      }}
      aria-hidden="true"
    />
  );
}
