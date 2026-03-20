/* ═══════════════════════════════════════════════════════════
   THEME ANIMATION CONFIG
   Per-ecosystem animation sets + CSS variable bridge.
   All values are editable at runtime via ThemeManagerPanel.
   ═══════════════════════════════════════════════════════════ */

export type ThemeAnimationSet = {
  /** Unique theme identifier — matches ThemePresetMeta.id */
  presetId: string;

  /* ── Timing & easing ── */
  /** Base transition duration for most interactions (ms) */
  durationBase: number;
  /** Slower "cinematic" transition duration (ms) */
  durationCinematic: number;
  /** Stagger delay between successive children (ms) */
  staggerDelay: number;
  /** CSS cubic-bezier easing for hero / reveal motions */
  easingReveal: string;
  /** CSS cubic-bezier easing for hover microinteractions */
  easingHover: string;
  /** CSS cubic-bezier easing for parallax scroll effects */
  easingParallax: string;

  /* ── Scroll reveal ── */
  /** translateY start distance for reveal (px) */
  revealDistance: number;
  /** Reveal entry animation name (maps to a @keyframes name) */
  revealKeyframe: string;

  /* ── Parallax ── */
  /** Parallax speed multiplier (0 = none, 1 = full) */
  parallaxIntensity: number;
  /** Parallax easing class / description */
  parallaxEase: string;

  /* ── Hover ── */
  /** Card hover translateY lift (px) */
  hoverLift: number;
  /** Card hover scale factor */
  hoverScale: number;
  /** Icon / paver 3D rotation max angle on hover (deg) */
  hoverRotate: number;

  /* ── Particles / dust ── */
  /** Particle count multiplier (1 = default) */
  particleMultiplier: number;
  /** Particle drift speed (px/s) */
  particleDriftSpeed: number;
  /** Particle size (px) */
  particleSize: number;
  /** Particle opacity (0–1) */
  particleOpacity: number;
  /** Particle drift animation name */
  particleKeyframe: string;

  /* ── Section dividers ── */
  /** Divider line-draw animation name */
  dividerKeyframe: string;
  /** Divider animation duration (ms) */
  dividerDuration: number;

  /* ── Transitions ── */
  /** Page / section transition animation name */
  transitionKeyframe: string;

  /* ── Theme-specific extra ── */
  /** Blueprint grid fade-in opacity target (0–1), used by construction */
  blueprintGridOpacity: number;
  /** Gold accent line sweep duration (ms), used by construction */
  accentLineDuration: number;
  /** Subscription pulse animation interval (ms), used by maintenance */
  pulseDuration: number;
  /** Icon bounce animation, used by maintenance */
  iconBounceKeyframe: string;
  /** Dust micro-particle size (px), used by hardscape */
  dustParticleSize: number;

  /* ── Human labels for Theme Manager ── */
  label: string;
  description: string;
};

/* ─────────────────────────────────────────────────────────
   HARDSCAPE / LANDSCAPE — rugged, organic, warm cinematic
───────────────────────────────────────────────────────── */
export const HARDSCAPE_ANIMATIONS: ThemeAnimationSet = {
  presetId: "hardscape-landscape",
  label: "Hardscape / Landscape",
  description: "Stone particle drift, slow organic parallax, rugged fade reveals, paver 3D hover rotation, and dust micro-particles.",

  durationBase: 400,
  durationCinematic: 1100,
  staggerDelay: 80,
  easingReveal: "cubic-bezier(0.16, 1, 0.3, 1)",
  easingHover: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  easingParallax: "cubic-bezier(0.4, 0, 0.2, 1)",

  revealDistance: 52,
  revealKeyframe: "hardscape-reveal",

  parallaxIntensity: 0.55,
  parallaxEase: "slow-organic",

  hoverLift: 10,
  hoverScale: 1.02,
  hoverRotate: 14,

  particleMultiplier: 1.4,
  particleDriftSpeed: 28,
  particleSize: 3,
  particleOpacity: 0.55,
  particleKeyframe: "stone-drift",

  dividerKeyframe: "rugged-line-grow",
  dividerDuration: 1600,

  transitionKeyframe: "rugged-fade",

  blueprintGridOpacity: 0,
  accentLineDuration: 0,
  pulseDuration: 0,
  iconBounceKeyframe: "",
  dustParticleSize: 2,
};

/* ─────────────────────────────────────────────────────────
   CONSTRUCTION / RENOVATION — architectural, precise, brass
───────────────────────────────────────────────────────── */
export const CONSTRUCTION_ANIMATIONS: ThemeAnimationSet = {
  presetId: "construction-renovation",
  label: "Construction / Renovation",
  description: "Blueprint grid fade-in, SVG line-drawing dividers, soft architectural parallax, gold accent line sweep, and smooth slide transitions.",

  durationBase: 320,
  durationCinematic: 900,
  staggerDelay: 60,
  easingReveal: "cubic-bezier(0.2, 0, 0.1, 1)",
  easingHover: "cubic-bezier(0.4, 0, 0.2, 1)",
  easingParallax: "cubic-bezier(0.2, 0, 0.1, 1)",

  revealDistance: 40,
  revealKeyframe: "blueprint-slide",

  parallaxIntensity: 0.35,
  parallaxEase: "architectural",

  hoverLift: 6,
  hoverScale: 1.008,
  hoverRotate: 0,

  particleMultiplier: 0.7,
  particleDriftSpeed: 12,
  particleSize: 2,
  particleOpacity: 0.35,
  particleKeyframe: "blueprint-particle",

  dividerKeyframe: "line-draw",
  dividerDuration: 1200,

  transitionKeyframe: "slide-architectural",

  blueprintGridOpacity: 0.06,
  accentLineDuration: 1400,
  pulseDuration: 0,
  iconBounceKeyframe: "",
  dustParticleSize: 0,
};

/* ─────────────────────────────────────────────────────────
   MAINTENANCE / SERVICE — clean, friendly, light
───────────────────────────────────────────────────────── */
export const MAINTENANCE_ANIMATIONS: ThemeAnimationSet = {
  presetId: "maintenance-service",
  label: "Maintenance / Service",
  description: "Clean slide-up reveals, soft fade transitions, icon bounce on hover, subscription card highlight pulse, and gentle parallax.",

  durationBase: 280,
  durationCinematic: 700,
  staggerDelay: 50,
  easingReveal: "cubic-bezier(0.16, 1, 0.3, 1)",
  easingHover: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  easingParallax: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",

  revealDistance: 30,
  revealKeyframe: "clean-slide-up",

  parallaxIntensity: 0.2,
  parallaxEase: "gentle",

  hoverLift: 7,
  hoverScale: 1.015,
  hoverRotate: 0,

  particleMultiplier: 0.5,
  particleDriftSpeed: 8,
  particleSize: 2,
  particleOpacity: 0.3,
  particleKeyframe: "soft-float",

  dividerKeyframe: "fade-line",
  dividerDuration: 800,

  transitionKeyframe: "soft-fade",

  blueprintGridOpacity: 0,
  accentLineDuration: 0,
  pulseDuration: 3200,
  iconBounceKeyframe: "icon-bounce",
  dustParticleSize: 0,
};

/* All animation sets indexed by presetId */
export const THEME_ANIMATION_SETS: Record<string, ThemeAnimationSet> = {
  "hardscape-landscape":     HARDSCAPE_ANIMATIONS,
  "construction-renovation": CONSTRUCTION_ANIMATIONS,
  "maintenance-service":     MAINTENANCE_ANIMATIONS,
};

/** Resolve the animation set for a given preset id, falling back gracefully */
export function getAnimationSet(presetId: string | null | undefined): ThemeAnimationSet | null {
  if (!presetId) return null;
  return THEME_ANIMATION_SETS[presetId] ?? null;
}

/** Convert an animation set into CSS custom property key/value pairs */
export function animationSetToCSSVars(set: ThemeAnimationSet): Record<string, string> {
  return {
    "--anim-duration-base":         `${set.durationBase}ms`,
    "--anim-duration-cinematic":    `${set.durationCinematic}ms`,
    "--anim-stagger-delay":         `${set.staggerDelay}ms`,
    "--anim-easing-reveal":         set.easingReveal,
    "--anim-easing-hover":          set.easingHover,
    "--anim-easing-parallax":       set.easingParallax,
    "--anim-reveal-distance":       `${set.revealDistance}px`,
    "--anim-reveal-keyframe":       set.revealKeyframe,
    "--anim-parallax-intensity":    String(set.parallaxIntensity),
    "--anim-hover-lift":            `${set.hoverLift}px`,
    "--anim-hover-scale":           String(set.hoverScale),
    "--anim-hover-rotate":          `${set.hoverRotate}deg`,
    "--anim-particle-size":         `${set.particleSize}px`,
    "--anim-particle-opacity":      String(set.particleOpacity),
    "--anim-particle-drift-speed":  `${set.particleDriftSpeed}s`,
    "--anim-particle-keyframe":     set.particleKeyframe,
    "--anim-divider-keyframe":      set.dividerKeyframe,
    "--anim-divider-duration":      `${set.dividerDuration}ms`,
    "--anim-transition-keyframe":   set.transitionKeyframe,
    "--anim-blueprint-opacity":     String(set.blueprintGridOpacity),
    "--anim-accent-line-duration":  `${set.accentLineDuration}ms`,
    "--anim-pulse-duration":        set.pulseDuration > 0 ? `${set.pulseDuration}ms` : "0ms",
    "--anim-icon-bounce":           set.iconBounceKeyframe,
    "--anim-dust-size":             `${set.dustParticleSize}px`,
  };
}
