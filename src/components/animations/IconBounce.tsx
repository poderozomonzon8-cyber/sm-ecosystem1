import { useState } from "react";
import { useAnimation } from "@/contexts/AnimationContext";

/* ═══════════════════════════════════════════════════════════
   IconBounce — Maintenance / Service Plans only
   Wraps an icon and triggers a bounce animation on hover.
   When the active theme is not maintenance, renders plain.
   ═══════════════════════════════════════════════════════════ */

export function IconBounce({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [bouncing, setBouncing] = useState(false);
  const { activeAnimSet } = useAnimation();
  const isMaintenance = activeAnimSet?.presetId === "maintenance-service";

  if (!isMaintenance) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        animation: bouncing ? "icon-bounce 0.55s var(--anim-easing-hover, cubic-bezier(0.34,1.56,0.64,1))" : "none",
        willChange: "transform",
      }}
      onMouseEnter={() => { setBouncing(false); requestAnimationFrame(() => setBouncing(true)); }}
      onAnimationEnd={() => setBouncing(false)}
    >
      {children}
    </span>
  );
}
