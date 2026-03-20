import { useState } from "react";
import { useAnimation } from "@/contexts/AnimationContext";

/* ═══════════════════════════════════════════════════════════
   PaverRotate — Hardscape / Landscape only
   Applies a 3D perspective rotation on hover for cards /
   paver image tiles. Inactive on other themes.
   ═══════════════════════════════════════════════════════════ */

export function PaverRotate({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [hoverStyle, setHoverStyle] = useState<React.CSSProperties>({});
  const { activeAnimSet } = useAnimation();
  const isHardscape = activeAnimSet?.presetId === "hardscape-landscape";
  const maxRotate = activeAnimSet?.hoverRotate ?? 14;
  const duration = activeAnimSet?.durationBase ?? 400;
  const easing = activeAnimSet?.easingHover ?? "cubic-bezier(0.34,1.56,0.64,1)";

  if (!isHardscape) {
    return <div className={className}>{children}</div>;
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rx = ((e.clientY - rect.top - cy) / cy) * -maxRotate * 0.6;
    const ry = ((e.clientX - rect.left - cx) / cx) * maxRotate;
    setHoverStyle({
      transform: `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${activeAnimSet?.hoverScale ?? 1.02})`,
      transition: `transform ${duration * 0.4}ms ${easing}`,
    });
  };

  const handleMouseLeave = () => {
    setHoverStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)",
      transition: `transform ${duration}ms ${easing}`,
    });
  };

  return (
    <div
      className={`theme-anim-paver-rotate ${className}`}
      style={{
        willChange: "transform",
        transformStyle: "preserve-3d",
        ...hoverStyle,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
