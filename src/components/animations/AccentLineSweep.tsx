import { useAnimation } from "@/contexts/AnimationContext";

/* ═══════════════════════════════════════════════════════════
   AccentLineSweep — Construction / Renovation only
   Horizontal gold accent line that draws across a section
   divider using CSS animation driven by --anim vars.
   ═══════════════════════════════════════════════════════════ */

export function AccentLineSweep({
  className = "",
  triggered = true,
}: {
  className?: string;
  triggered?: boolean;
}) {
  const { activeAnimSet } = useAnimation();
  const duration = activeAnimSet?.accentLineDuration ?? 1400;

  return (
    <div
      className={`theme-anim-accent-line-sweep ${className}`}
      style={{
        height: "1px",
        background: "linear-gradient(90deg, transparent, var(--theme-accent, hsl(38,70%,58%)), transparent)",
        transformOrigin: "left center",
        animation: triggered
          ? `accent-line-sweep ${duration}ms var(--anim-easing-reveal, cubic-bezier(0.2,0,0.1,1)) forwards`
          : "none",
        opacity: triggered ? 1 : 0,
      }}
    />
  );
}

/* SVG line-drawing divider for section borders */
export function LineDivider({
  width = 120,
  className = "",
  triggered = true,
}: {
  width?: number;
  className?: string;
  triggered?: boolean;
}) {
  const { activeAnimSet } = useAnimation();
  const duration = activeAnimSet?.dividerDuration ?? 1200;

  return (
    <svg
      width={width}
      height="2"
      viewBox={`0 0 ${width} 2`}
      className={`overflow-visible ${className}`}
    >
      <line
        x1="0" y1="1" x2={width} y2="1"
        stroke="var(--theme-accent, hsl(38,70%,58%))"
        strokeWidth="1"
        strokeLinecap="round"
        style={{
          strokeDasharray: width,
          strokeDashoffset: triggered ? 0 : width,
          transition: triggered
            ? `stroke-dashoffset ${duration}ms var(--anim-easing-reveal, cubic-bezier(0.2,0,0.1,1))`
            : "none",
        }}
      />
    </svg>
  );
}
