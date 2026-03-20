import { useEffect, useRef, useState } from "react";
import { useAnimation } from "@/contexts/AnimationContext";

/* ═══════════════════════════════════════════════════════════
   RevealSection
   Theme-aware scroll-reveal wrapper.
   Uses the active theme's revealDistance, easingReveal, and
   durationCinematic from AnimationContext CSS vars.
   Plays the appropriate theme keyframe on intersection.
   ═══════════════════════════════════════════════════════════ */

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Stagger index — adds staggerDelay * index to transitionDelay */
  staggerIndex?: number;
  /** IntersectionObserver threshold (0–1) */
  threshold?: number;
  /** Override reveal direction: "up" | "left" | "right" | "fade" */
  direction?: "up" | "left" | "right" | "fade";
};

export function RevealSection({
  children,
  className = "",
  staggerIndex = 0,
  threshold = 0.15,
  direction = "up",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { activeAnimSet } = useAnimation();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  const distance = activeAnimSet?.revealDistance ?? 40;
  const duration = activeAnimSet?.durationCinematic ?? 1000;
  const easing = activeAnimSet?.easingReveal ?? "cubic-bezier(0.16,1,0.3,1)";
  const stagger = activeAnimSet?.staggerDelay ?? 60;

  const hiddenTransform = () => {
    switch (direction) {
      case "left":  return `translateX(-${distance}px)`;
      case "right": return `translateX(${distance}px)`;
      case "fade":  return "none";
      default:      return `translateY(${distance}px)`;
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) translateX(0)" : hiddenTransform(),
        transition: `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`,
        transitionDelay: `${stagger * staggerIndex}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/* Stagger group — wraps children with automatic stagger indices */
export function RevealStaggerGroup({
  children,
  className = "",
  threshold = 0.12,
}: {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { activeAnimSet } = useAnimation();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  const stagger = activeAnimSet?.staggerDelay ?? 60;
  const duration = activeAnimSet?.durationCinematic ?? 1000;
  const easing = activeAnimSet?.easingReveal ?? "cubic-bezier(0.16,1,0.3,1)";
  const distance = activeAnimSet?.revealDistance ?? 40;

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div
              key={i}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : `translateY(${distance}px)`,
                transition: `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`,
                transitionDelay: `${stagger * i}ms`,
                willChange: "opacity, transform",
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}
