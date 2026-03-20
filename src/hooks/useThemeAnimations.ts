import { useMemo } from "react";
import { useAnimation } from "@/contexts/AnimationContext";
import { ThemeAnimationSet } from "@/config/ThemeAnimationConfig";

/* ═══════════════════════════════════════════════════════════
   useThemeAnimations
   Convenience hook that returns pre-built CSS class strings and
   inline-style helpers derived from the active animation set.
   All values come from CSS custom properties already applied to
   :root by AnimationContext — this hook provides ergonomic helpers.
   ═══════════════════════════════════════════════════════════ */

export type ThemeAnimationHelpers = {
  /** The full resolved animation set, or null if no ecosystem preset is active */
  set: ThemeAnimationSet | null;

  /** Active preset id */
  presetId: string | null;

  /** Returns CSS for a stagger-child item at a given index */
  staggerStyle: (index: number) => React.CSSProperties;

  /** Returns CSS for a parallax container */
  parallaxStyle: (offsetFactor?: number) => React.CSSProperties;

  /** Returns hover wrapper style with theme-specific lift + scale */
  hoverCardStyle: () => React.CSSProperties;

  /** Returns the icon-bounce class or empty string */
  iconHoverClass: string;

  /** Returns the blueprint-grid class (construction theme only) */
  blueprintGridClass: string;

  /** Returns the paver/card 3D rotate hover class (hardscape only) */
  paverHoverClass: string;

  /** Returns the subscription pulse class (maintenance only) */
  subscriptionPulseClass: string;

  /** Returns the accent line sweep class (construction only) */
  accentLineClass: string;

  /** Returns the section divider line class */
  dividerClass: string;

  /** Returns the reveal / transition enter class */
  revealClass: string;

  /** True when the dust micro-particle layer should render (hardscape only) */
  showDustParticles: boolean;

  /** True when the blueprint grid overlay should render */
  showBlueprintGrid: boolean;

  /** True when icon-bounce animations are active (maintenance only) */
  showIconBounce: boolean;

  /** True when gold accent line sweep should render (construction only) */
  showAccentLineSweep: boolean;

  /** True when subscription pulse should render (maintenance only) */
  showSubscriptionPulse: boolean;
};

export function useThemeAnimations(): ThemeAnimationHelpers {
  const { activeAnimSet, activePresetId } = useAnimation();

  return useMemo((): ThemeAnimationHelpers => {
    const set = activeAnimSet;
    const isHardscape    = activePresetId === "hardscape-landscape";
    const isConstruction = activePresetId === "construction-renovation";
    const isMaintenance  = activePresetId === "maintenance-service";

    const staggerStyle = (index: number): React.CSSProperties => ({
      transitionDelay: `${(set?.staggerDelay ?? 60) * index}ms`,
      transitionDuration: `${set?.durationCinematic ?? 1000}ms`,
      transitionTimingFunction: set?.easingReveal ?? "cubic-bezier(0.16,1,0.3,1)",
    });

    const parallaxStyle = (offsetFactor = 1): React.CSSProperties => ({
      willChange: "transform",
      transitionDuration: `${set?.durationCinematic ?? 1000}ms`,
      transitionTimingFunction: set?.easingParallax ?? "cubic-bezier(0.4,0,0.2,1)",
    });

    const hoverCardStyle = (): React.CSSProperties => ({
      transition: `transform ${set?.durationBase ?? 350}ms ${set?.easingHover ?? "cubic-bezier(0.34,1.56,0.64,1)"}, box-shadow ${set?.durationBase ?? 350}ms ease`,
    });

    return {
      set,
      presetId: activePresetId,
      staggerStyle,
      parallaxStyle,
      hoverCardStyle,

      iconHoverClass:         isMaintenance  ? "theme-anim-icon-bounce" : "",
      blueprintGridClass:     isConstruction ? "theme-anim-blueprint-grid" : "",
      paverHoverClass:        isHardscape    ? "theme-anim-paver-rotate" : "",
      subscriptionPulseClass: isMaintenance  ? "theme-anim-subscription-pulse" : "",
      accentLineClass:        isConstruction ? "theme-anim-accent-line" : "",
      dividerClass:           `theme-anim-divider theme-anim-divider--${activePresetId ?? "default"}`,
      revealClass:            `theme-anim-reveal theme-anim-reveal--${activePresetId ?? "default"}`,

      showDustParticles:     isHardscape    && (set?.dustParticleSize ?? 0) > 0,
      showBlueprintGrid:     isConstruction && (set?.blueprintGridOpacity ?? 0) > 0,
      showIconBounce:        isMaintenance  && !!(set?.iconBounceKeyframe),
      showAccentLineSweep:   isConstruction && (set?.accentLineDuration ?? 0) > 0,
      showSubscriptionPulse: isMaintenance  && (set?.pulseDuration ?? 0) > 0,
    };
  }, [activeAnimSet, activePresetId]);
}
