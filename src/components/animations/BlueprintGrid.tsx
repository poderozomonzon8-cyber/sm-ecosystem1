import { useAnimation } from "@/contexts/AnimationContext";

/* ═══════════════════════════════════════════════════════════
   BlueprintGrid — Construction / Renovation only
   Subtle architectural grid that fades into hero sections.
   Reads blueprint opacity from the active animation set.
   ═══════════════════════════════════════════════════════════ */

export function BlueprintGrid({ className = "" }: { className?: string }) {
  const { activeAnimSet } = useAnimation();
  const opacity = activeAnimSet?.blueprintGridOpacity ?? 0.06;

  return (
    <div
      className={`absolute inset-0 pointer-events-none theme-anim-blueprint-grid ${className}`}
      style={{
        zIndex: 2,
        opacity,
        backgroundImage: `
          linear-gradient(rgba(200,165,80,0.5) 1px, transparent 1px),
          linear-gradient(90deg, rgba(200,165,80,0.5) 1px, transparent 1px)
        `,
        backgroundSize: "52px 52px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
      }}
    />
  );
}
