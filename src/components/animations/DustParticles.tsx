import { useEffect, useRef } from "react";
import { useAnimation } from "@/contexts/AnimationContext";

/* ═══════════════════════════════════════════════════════════
   DustParticles — Hardscape / Landscape only
   Stone-dust micro-particles drifting over hero sections.
   Pure canvas, no external libs.
   ═══════════════════════════════════════════════════════════ */

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  opacity: number;
  opacityDelta: number;
};

export function DustParticles({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const { activeAnimSet } = useAnimation();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particleColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--theme-particle-color").trim() || "rgba(80,200,80,0.55)";

    const count = Math.floor(55 * (activeAnimSet?.particleMultiplier ?? 1.4));
    const dustSize = activeAnimSet?.dustParticleSize ?? 2;
    const driftSpeed = activeAnimSet?.particleDriftSpeed ?? 28;
    const baseOpacity = activeAnimSet?.particleOpacity ?? 0.55;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * (driftSpeed * 0.012),
      vy: -(Math.random() * (driftSpeed * 0.018) + 0.2),
      size: dustSize * (0.6 + Math.random() * 0.8),
      opacity: Math.random() * baseOpacity,
      opacityDelta: (Math.random() - 0.5) * 0.004,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.opacity = Math.max(0, Math.min(baseOpacity, p.opacity + p.opacityDelta));
        if (p.opacity <= 0 || p.opacity >= baseOpacity) p.opacityDelta *= -1;

        if (p.y < -10) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 5;
        if (p.x > canvas.width + 10) p.x = -5;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [activeAnimSet]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 2, mixBlendMode: "screen", opacity: 0.7 }}
    />
  );
}
