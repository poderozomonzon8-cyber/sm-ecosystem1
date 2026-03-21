import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { getNavConfig, ThemeNavConfig } from "@/config/ThemeNavConfig";

/* ═══════════════════════════════════════════════════════
   GLOBAL THEME VARIABLE SYSTEM
   All theme values stored as CSS custom properties.
   Three ecosystem themes + classic presets.
   ═══════════════════════════════════════════════════════ */

export type ThemeVars = {
  footerLogo: any;
  /* ── Brand colors ── */
  "--theme-primary":          string;
  "--theme-secondary":        string;
  "--theme-accent":           string;
  "--theme-highlight":        string;
  /* ── Layout ── */
  "--theme-background":       string;
  "--theme-text":             string;
  "--theme-text-muted":       string;
  "--theme-section-bg":       string;
  "--theme-section-alt-bg":   string;
  "--theme-border":           string;
  /* ── Navigation ── */
  "--theme-header-bg":        string;
  "--theme-header-text":      string;
  "--theme-footer-bg":        string;
  "--theme-footer-text":      string;
  "--theme-link":             string;
  /* ── Buttons ── */
  "--theme-btn-bg":           string;
  "--theme-btn-text":         string;
  "--theme-btn-hover-bg":     string;
  "--theme-btn-ghost-border": string;
  /* ── Cards ── */
  "--theme-card-bg":          string;
  "--theme-card-border":      string;
  "--theme-card-shadow":      string;
  "--theme-card-hover-border":string;
  /* ── Typography ── */
  "--theme-font-display":     string;
  "--theme-font-body":        string;
  "--theme-tracking-headline":string;
  "--theme-weight-headline":  string;
  /* ── Spacing ── */
  "--theme-section-pad":      string;
  "--theme-card-radius":      string;
  "--theme-btn-radius":       string;
  /* ── Shadows ── */
  "--theme-shadow-sm":        string;
  "--theme-shadow-md":        string;
  "--theme-shadow-lg":        string;
  "--theme-shadow-accent":    string;
  /* ── Hero / Video overlay ── */
  "--theme-hero-overlay":     string;
  "--theme-hero-text":        string;
  "--theme-hero-eyebrow":     string;
  "--theme-hero-gradient":    string;
  /* ── 3D / Particles ── */
  "--theme-3d-bg":            string;
  "--theme-3d-grid-color":    string;
  "--theme-particle-color":   string;
  "--theme-particle-accent":  string;
  /* ── 3D Controls (admin-editable) ── */
  "--theme-3d-enabled":       string;   /* "1" | "0" */
  "--theme-3d-model":         string;   /* "paver" | "blueprint" | "badge" | "auto" */
  "--theme-3d-rotation-speed":string;   /* "0.5" – "3.0" multiplier */
  "--theme-particle-density": string;   /* "20" – "120" count */
  "--theme-particle-size":    string;   /* "0.5" – "3.0" px */
  "--theme-particle-speed":   string;   /* "0.2" – "1.5" multiplier */
  /* ── Cinematic fade stops ── */
  "--theme-fade-stop-0":      string;
  "--theme-fade-stop-1":      string;
  "--theme-fade-stop-2":      string;
  "--theme-fade-stop-3":      string;
};

export const DEFAULT_THEME: ThemeVars = {
  /* Brand */
  "--theme-primary":          "hsl(210, 15%, 12%)",
  "--theme-secondary":        "hsl(210, 10%, 25%)",
  "--theme-accent":           "hsl(42, 90%, 52%)",
  "--theme-highlight":        "hsl(42, 90%, 52%)",
  /* Layout */
  "--theme-background":       "hsl(0, 0%, 100%)",
  "--theme-text":             "hsl(210, 15%, 12%)",
  "--theme-text-muted":       "hsl(210, 8%, 48%)",
  "--theme-section-bg":       "hsl(210, 20%, 98%)",
  "--theme-section-alt-bg":   "hsl(210, 15%, 12%)",
  "--theme-border":           "hsl(210, 10%, 85%)",
  /* Navigation */
  "--theme-header-bg":        "hsl(210, 15%, 12%)",
  "--theme-header-text":      "hsl(0, 0%, 100%)",
  "--theme-footer-bg":        "hsl(220, 18%, 6%)",
  "--theme-footer-text":      "hsl(210, 12%, 65%)",
  "--theme-link":             "hsl(42, 90%, 52%)",
  /* Buttons */
  "--theme-btn-bg":           "hsl(42, 90%, 52%)",
  "--theme-btn-text":         "hsl(210, 15%, 12%)",
  "--theme-btn-hover-bg":     "hsl(36, 90%, 44%)",
  "--theme-btn-ghost-border": "rgba(255,255,255,0.18)",
  /* Cards */
  "--theme-card-bg":          "hsl(0, 0%, 100%)",
  "--theme-card-border":      "hsl(210, 12%, 92%)",
  "--theme-card-shadow":      "0 4px 20px rgba(0,0,0,0.08)",
  "--theme-card-hover-border":"hsl(42, 90%, 52%)",
  /* Typography */
  "--theme-font-display":     "'Cormorant Garamond', Georgia, serif",
  "--theme-font-body":        "'Outfit', system-ui, sans-serif",
  "--theme-tracking-headline":"-0.025em",
  "--theme-weight-headline":  "600",
  /* Spacing */
  "--theme-section-pad":      "8rem",
  "--theme-card-radius":      "0.25rem",
  "--theme-btn-radius":       "0.25rem",
  /* Shadows */
  "--theme-shadow-sm":        "0 1px 3px rgba(0,0,0,0.06)",
  "--theme-shadow-md":        "0 4px 20px rgba(0,0,0,0.08)",
  "--theme-shadow-lg":        "0 12px 48px rgba(0,0,0,0.12)",
  "--theme-shadow-accent":    "0 0 40px rgba(212,160,23,0.18)",
  /* Hero */
  "--theme-hero-overlay":     "linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.94) 100%)",
  "--theme-hero-text":        "hsl(0, 0%, 100%)",
  "--theme-hero-eyebrow":     "hsl(42, 90%, 52%)",
  "--theme-hero-gradient":    "hsl(220, 18%, 6%)",
  /* 3D */
  "--theme-3d-bg":            "hsl(220, 20%, 7%)",
  "--theme-3d-grid-color":    "rgba(212,160,23,0.12)",
  "--theme-particle-color":   "rgba(212,160,23,0.6)",
  "--theme-particle-accent":  "rgba(255,220,100,0.4)",
  "--theme-3d-enabled":       "1",
  "--theme-3d-model":         "auto",
  "--theme-3d-rotation-speed":"1.0",
  "--theme-particle-density": "50",
  "--theme-particle-size":    "1.5",
  "--theme-particle-speed":   "1.0",
  /* Cinematic fades */
  "--theme-fade-stop-0":      "#000000",
  "--theme-fade-stop-1":      "#1A1A1A",
  "--theme-fade-stop-2":      "#2A2A2A",
  "--theme-fade-stop-3":      "#F2F2F2",
};

export type ThemePreset = {
  id: string;
  name: string;
  vars: Record<string, string>;
};

export type ThemePresetMeta = ThemePreset & {
  description?: string;
  mood?: string;
  category?: string;
  swatches?: string[];
  heroVideoHint?: string;
  useCases?: string[];
};

/* ═══════════════════════════════════════════════════════
   BUILT-IN PRESETS
   ═══════════════════════════════════════════════════════ */
export const BUILT_IN_PRESETS: ThemePresetMeta[] = [

  /* ────────────────────────────────────────────────────
     ECOSYSTEM PRESET 1: HARDSCAPE / LANDSCAPE
     Black + Charcoal + Deep Forest Green
     Rugged, cinematic, premium outdoor/stone
  ───────────────────────────────────────────────────── */
  {
    id: "hardscape-landscape",
    name: "Hardscape / Landscape",
    description: "Black and charcoal base anchored by deep forest green. Cinematic, rugged, outdoor-natural. Built for pavé, patios, retaining walls, and living landscapes.",
    mood: "Rugged · Natural · Premium",
    category: "ecosystem",
    heroVideoHint: "Hardscape timelapse — pavé / patio completion",
    useCases: ["Pavé", "Patios", "Walkways", "Retaining Walls", "Landscaping"],
    swatches: ["hsl(0,0%,8%)", "hsl(138,45%,22%)", "hsl(138,60%,38%)", "hsl(100,15%,96%)"],
    vars: {
      ...DEFAULT_THEME,
      /* Brand */
      "--theme-primary":          "hsl(0, 0%, 8%)",
      "--theme-secondary":        "hsl(0, 0%, 16%)",
      "--theme-accent":           "hsl(138, 60%, 38%)",
      "--theme-highlight":        "hsl(130, 65%, 48%)",
      /* Layout */
      "--theme-background":       "hsl(100, 8%, 97%)",
      "--theme-text":             "hsl(0, 0%, 10%)",
      "--theme-text-muted":       "hsl(0, 0%, 42%)",
      "--theme-section-bg":       "hsl(100, 10%, 96%)",
      "--theme-section-alt-bg":   "hsl(0, 0%, 8%)",
      "--theme-border":           "hsl(100, 8%, 84%)",
      /* Navigation */
      "--theme-header-bg":        "hsl(0, 0%, 5%)",
      "--theme-header-text":      "hsl(0, 0%, 100%)",
      "--theme-footer-bg":        "hsl(0, 0%, 4%)",
      "--theme-footer-text":      "hsl(0, 0%, 55%)",
      "--theme-link":             "hsl(138, 60%, 42%)",
      /* Buttons */
      "--theme-btn-bg":           "hsl(138, 60%, 34%)",
      "--theme-btn-text":         "hsl(0, 0%, 100%)",
      "--theme-btn-hover-bg":     "hsl(138, 65%, 28%)",
      "--theme-btn-ghost-border": "rgba(80,200,80,0.22)",
      /* Cards */
      "--theme-card-bg":          "hsl(0, 0%, 100%)",
      "--theme-card-border":      "hsl(100, 10%, 88%)",
      "--theme-card-shadow":      "0 4px 24px rgba(0,0,0,0.10)",
      "--theme-card-hover-border":"hsl(138, 60%, 38%)",
      /* Typography */
      "--theme-font-display":     "'Cormorant Garamond', Georgia, serif",
      "--theme-font-body":        "'Outfit', system-ui, sans-serif",
      "--theme-tracking-headline":"-0.02em",
      "--theme-weight-headline":  "600",
      /* Spacing */
      "--theme-section-pad":      "8rem",
      "--theme-card-radius":      "0.25rem",
      "--theme-btn-radius":       "0.25rem",
      /* Shadows */
      "--theme-shadow-sm":        "0 1px 4px rgba(0,0,0,0.08)",
      "--theme-shadow-md":        "0 4px 24px rgba(0,0,0,0.12)",
      "--theme-shadow-lg":        "0 16px 60px rgba(0,0,0,0.18)",
      "--theme-shadow-accent":    "0 0 40px rgba(60,180,60,0.18)",
      /* Hero */
      "--theme-hero-overlay":     "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.45) 60%, rgba(0,4,0,0.92) 100%)",
      "--theme-hero-text":        "hsl(0, 0%, 100%)",
      "--theme-hero-eyebrow":     "hsl(138, 60%, 48%)",
      "--theme-hero-gradient":    "hsl(0, 0%, 4%)",
      /* 3D / Particles */
      "--theme-3d-bg":            "hsl(140, 15%, 6%)",
      "--theme-3d-grid-color":    "rgba(60,180,60,0.10)",
      "--theme-particle-color":   "rgba(80,200,80,0.55)",
      "--theme-particle-accent":  "rgba(140,240,100,0.35)",
      "--theme-3d-enabled":       "1",
      "--theme-3d-model":         "paver",
      "--theme-3d-rotation-speed":"1.0",
      "--theme-particle-density": "55",
      "--theme-particle-size":    "1.8",
      "--theme-particle-speed":   "0.8",
      /* Cinematic fades */
      "--theme-fade-stop-0":      "#040804",
      "--theme-fade-stop-1":      "#0C160C",
      "--theme-fade-stop-2":      "#142014",
      "--theme-fade-stop-3":      "#F2F6F0",
    },
  },

  /* ────────────────────────────────────────────────────
     ECOSYSTEM PRESET 2: CONSTRUCTION / RENOVATION
     Charcoal + Pearl White + Soft Gold/Brass
     Architectural, minimal, blueprint-inspired
  ───────────────────────────────────────────────────── */
  {
    id: "construction-renovation",
    name: "Construction / Renovation",
    description: "Charcoal and pearl white with soft brass accents. Blueprint-inspired spacing, clean architectural lines — built for renovations, additions, and structural work.",
    mood: "Architectural · Minimal · Refined",
    category: "ecosystem",
    heroVideoHint: "Construction timelapse or interior renovation cinematic",
    useCases: ["Renovations", "Additions", "Interior Construction", "Structural Work"],
    swatches: ["hsl(220,18%,16%)", "hsl(38,70%,58%)", "hsl(0,0%,98%)", "hsl(220,20%,8%)"],
    vars: {
      ...DEFAULT_THEME,
      /* Brand */
      "--theme-primary":          "hsl(220, 18%, 16%)",
      "--theme-secondary":        "hsl(220, 14%, 26%)",
      "--theme-accent":           "hsl(38, 70%, 58%)",
      "--theme-highlight":        "hsl(38, 75%, 52%)",
      /* Layout */
      "--theme-background":       "hsl(0, 0%, 99%)",
      "--theme-text":             "hsl(220, 18%, 14%)",
      "--theme-text-muted":       "hsl(220, 8%, 48%)",
      "--theme-section-bg":       "hsl(220, 15%, 98%)",
      "--theme-section-alt-bg":   "hsl(220, 18%, 14%)",
      "--theme-border":           "hsl(220, 12%, 88%)",
      /* Navigation */
      "--theme-header-bg":        "hsl(220, 20%, 12%)",
      "--theme-header-text":      "hsl(0, 0%, 100%)",
      "--theme-footer-bg":        "hsl(220, 22%, 7%)",
      "--theme-footer-text":      "hsl(220, 10%, 58%)",
      "--theme-link":             "hsl(38, 70%, 52%)",
      /* Buttons */
      "--theme-btn-bg":           "hsl(38, 70%, 54%)",
      "--theme-btn-text":         "hsl(220, 20%, 10%)",
      "--theme-btn-hover-bg":     "hsl(34, 72%, 46%)",
      "--theme-btn-ghost-border": "rgba(200,160,80,0.20)",
      /* Cards */
      "--theme-card-bg":          "hsl(0, 0%, 100%)",
      "--theme-card-border":      "hsl(220, 12%, 90%)",
      "--theme-card-shadow":      "0 2px 16px rgba(30,40,60,0.07)",
      "--theme-card-hover-border":"hsl(38, 70%, 58%)",
      /* Typography */
      "--theme-font-display":     "'Cormorant Garamond', Georgia, serif",
      "--theme-font-body":        "'Outfit', system-ui, sans-serif",
      "--theme-tracking-headline":"-0.03em",
      "--theme-weight-headline":  "500",
      /* Spacing (blueprint-inspired generosity) */
      "--theme-section-pad":      "9rem",
      "--theme-card-radius":      "0.125rem",
      "--theme-btn-radius":       "0.125rem",
      /* Shadows (minimal, clean) */
      "--theme-shadow-sm":        "0 1px 3px rgba(30,40,60,0.05)",
      "--theme-shadow-md":        "0 3px 16px rgba(30,40,60,0.07)",
      "--theme-shadow-lg":        "0 10px 40px rgba(30,40,60,0.10)",
      "--theme-shadow-accent":    "0 0 32px rgba(200,160,70,0.15)",
      /* Hero */
      "--theme-hero-overlay":     "linear-gradient(to bottom, rgba(10,14,22,0.08) 0%, rgba(10,14,22,0.40) 60%, rgba(10,14,22,0.90) 100%)",
      "--theme-hero-text":        "hsl(0, 0%, 100%)",
      "--theme-hero-eyebrow":     "hsl(38, 70%, 62%)",
      "--theme-hero-gradient":    "hsl(220, 22%, 7%)",
      /* 3D / Particles */
      "--theme-3d-bg":            "hsl(220, 20%, 7%)",
      "--theme-3d-grid-color":    "rgba(200,165,80,0.09)",
      "--theme-particle-color":   "rgba(210,170,80,0.50)",
      "--theme-particle-accent":  "rgba(240,210,140,0.30)",
      "--theme-3d-enabled":       "1",
      "--theme-3d-model":         "blueprint",
      "--theme-3d-rotation-speed":"0.8",
      "--theme-particle-density": "40",
      "--theme-particle-size":    "1.2",
      "--theme-particle-speed":   "0.6",
      /* Cinematic fades */
      "--theme-fade-stop-0":      "#090E16",
      "--theme-fade-stop-1":      "#111824",
      "--theme-fade-stop-2":      "#1C2636",
      "--theme-fade-stop-3":      "#F8F8FA",
    },
  },

  /* ────────────────────────────────────────────────────
     ECOSYSTEM PRESET 3: MAINTENANCE / SERVICE PLANS
     Pearl White + Soft Charcoal + Blue-Gray
     Clean, service-oriented, friendly premium
  ───────────────────────────────────────────────────── */
  {
    id: "maintenance-service",
    name: "Maintenance / Service Plans",
    description: "Pearl white with soft charcoal and calm blue-gray accents. Clean, service-oriented, friendly but premium. Designed for residential/commercial maintenance and subscription plans.",
    mood: "Clean · Trustworthy · Friendly",
    category: "ecosystem",
    heroVideoHint: "Exterior / interior maintenance work — calm, professional",
    useCases: ["Residential Maintenance", "Commercial Maintenance", "Monthly/Annual Plans", "Seasonal Services"],
    swatches: ["hsl(215,20%,24%)", "hsl(205,70%,54%)", "hsl(210,30%,98%)", "hsl(215,22%,14%)"],
    vars: {
      ...DEFAULT_THEME,
      /* Brand */
      "--theme-primary":          "hsl(215, 20%, 24%)",
      "--theme-secondary":        "hsl(215, 15%, 36%)",
      "--theme-accent":           "hsl(205, 70%, 54%)",
      "--theme-highlight":        "hsl(200, 75%, 48%)",
      /* Layout */
      "--theme-background":       "hsl(210, 30%, 99%)",
      "--theme-text":             "hsl(215, 20%, 18%)",
      "--theme-text-muted":       "hsl(215, 10%, 52%)",
      "--theme-section-bg":       "hsl(210, 25%, 97%)",
      "--theme-section-alt-bg":   "hsl(215, 20%, 22%)",
      "--theme-border":           "hsl(210, 18%, 88%)",
      /* Navigation */
      "--theme-header-bg":        "hsl(0, 0%, 100%)",
      "--theme-header-text":      "hsl(215, 20%, 20%)",
      "--theme-footer-bg":        "hsl(215, 22%, 14%)",
      "--theme-footer-text":      "hsl(215, 10%, 62%)",
      "--theme-link":             "hsl(205, 70%, 48%)",
      /* Buttons */
      "--theme-btn-bg":           "hsl(205, 70%, 50%)",
      "--theme-btn-text":         "hsl(0, 0%, 100%)",
      "--theme-btn-hover-bg":     "hsl(205, 75%, 42%)",
      "--theme-btn-ghost-border": "rgba(80,160,220,0.22)",
      /* Cards */
      "--theme-card-bg":          "hsl(0, 0%, 100%)",
      "--theme-card-border":      "hsl(210, 20%, 90%)",
      "--theme-card-shadow":      "0 2px 12px rgba(30,60,100,0.07)",
      "--theme-card-hover-border":"hsl(205, 70%, 54%)",
      /* Typography (clean, modern sans-lean) */
      "--theme-font-display":     "'Cormorant Garamond', Georgia, serif",
      "--theme-font-body":        "'Outfit', system-ui, sans-serif",
      "--theme-tracking-headline":"-0.02em",
      "--theme-weight-headline":  "600",
      /* Spacing (service-friendly, comfortable) */
      "--theme-section-pad":      "7rem",
      "--theme-card-radius":      "0.5rem",
      "--theme-btn-radius":       "0.375rem",
      /* Shadows (light, airy) */
      "--theme-shadow-sm":        "0 1px 4px rgba(30,60,100,0.05)",
      "--theme-shadow-md":        "0 3px 14px rgba(30,60,100,0.07)",
      "--theme-shadow-lg":        "0 8px 36px rgba(30,60,100,0.10)",
      "--theme-shadow-accent":    "0 0 32px rgba(80,160,220,0.16)",
      /* Hero */
      "--theme-hero-overlay":     "linear-gradient(to bottom, rgba(10,20,40,0.06) 0%, rgba(10,20,40,0.35) 60%, rgba(10,20,40,0.88) 100%)",
      "--theme-hero-text":        "hsl(0, 0%, 100%)",
      "--theme-hero-eyebrow":     "hsl(205, 70%, 62%)",
      "--theme-hero-gradient":    "hsl(215, 22%, 12%)",
      /* 3D / Particles */
      "--theme-3d-bg":            "hsl(215, 25%, 8%)",
      "--theme-3d-grid-color":    "rgba(80,160,220,0.10)",
      "--theme-particle-color":   "rgba(80,160,220,0.50)",
      "--theme-particle-accent":  "rgba(160,210,240,0.30)",
      "--theme-3d-enabled":       "1",
      "--theme-3d-model":         "badge",
      "--theme-3d-rotation-speed":"1.2",
      "--theme-particle-density": "45",
      "--theme-particle-size":    "1.4",
      "--theme-particle-speed":   "1.2",
      /* Cinematic fades */
      "--theme-fade-stop-0":      "#080F1A",
      "--theme-fade-stop-1":      "#0E1828",
      "--theme-fade-stop-2":      "#162238",
      "--theme-fade-stop-3":      "#F0F5FA",
    },
  },

  /* ── CLASSIC PRESETS ─────────────────────────────── */
  {
    id: "monzon-dark",
    name: "Monzon Dark",
    description: "The signature look. Deep charcoal with warm gold accents — cinematic and authoritative.",
    mood: "Cinematic · Architectural",
    category: "classic",
    swatches: ["hsl(210,15%,12%)", "hsl(42,90%,52%)", "hsl(210,20%,98%)", "hsl(220,18%,6%)"],
    vars: {
      ...DEFAULT_THEME,
    },
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    description: "Deep navy authority with electric blue accents. Bold, corporate, and modern.",
    mood: "Bold · Trustworthy",
    category: "classic",
    swatches: ["hsl(230,50%,15%)", "hsl(210,100%,60%)", "hsl(0,0%,100%)", "hsl(230,55%,8%)"],
    vars: {
      ...DEFAULT_THEME,
      "--theme-primary":          "hsl(230, 50%, 15%)",
      "--theme-secondary":        "hsl(230, 40%, 25%)",
      "--theme-accent":           "hsl(210, 100%, 60%)",
      "--theme-highlight":        "hsl(210, 100%, 60%)",
      "--theme-btn-bg":           "hsl(210, 100%, 60%)",
      "--theme-btn-text":         "hsl(0, 0%, 100%)",
      "--theme-btn-hover-bg":     "hsl(210, 100%, 50%)",
      "--theme-header-bg":        "hsl(230, 50%, 15%)",
      "--theme-footer-bg":        "hsl(230, 55%, 8%)",
      "--theme-link":             "hsl(210, 100%, 60%)",
      "--theme-hero-eyebrow":     "hsl(210, 100%, 60%)",
      "--theme-particle-color":   "rgba(80,160,255,0.55)",
      "--theme-shadow-accent":    "0 0 40px rgba(80,150,255,0.18)",
      "--theme-fade-stop-0":      "#050B1E",
      "--theme-fade-stop-1":      "#0A1530",
      "--theme-fade-stop-2":      "#122042",
      "--theme-fade-stop-3":      "#F0F4FF",
    },
  },
  {
    id: "forest-green",
    name: "Forest Green",
    description: "Organic and grounded. Earthy deep greens with vibrant emerald highlights.",
    mood: "Natural · Premium",
    category: "classic",
    swatches: ["hsl(140,40%,12%)", "hsl(145,65%,46%)", "hsl(0,0%,100%)", "hsl(140,45%,6%)"],
    vars: {
      ...DEFAULT_THEME,
      "--theme-primary":          "hsl(140, 40%, 12%)",
      "--theme-secondary":        "hsl(140, 30%, 22%)",
      "--theme-accent":           "hsl(145, 65%, 46%)",
      "--theme-highlight":        "hsl(145, 65%, 46%)",
      "--theme-btn-bg":           "hsl(145, 65%, 46%)",
      "--theme-btn-text":         "hsl(0, 0%, 100%)",
      "--theme-btn-hover-bg":     "hsl(145, 65%, 38%)",
      "--theme-header-bg":        "hsl(140, 40%, 12%)",
      "--theme-footer-bg":        "hsl(140, 45%, 6%)",
      "--theme-link":             "hsl(145, 65%, 46%)",
      "--theme-hero-eyebrow":     "hsl(145, 65%, 55%)",
      "--theme-particle-color":   "rgba(60,200,80,0.55)",
      "--theme-shadow-accent":    "0 0 40px rgba(60,180,80,0.18)",
      "--theme-fade-stop-0":      "#040E06",
      "--theme-fade-stop-1":      "#08180A",
      "--theme-fade-stop-2":      "#10220E",
      "--theme-fade-stop-3":      "#F0F8F0",
    },
  },
  {
    id: "warm-terracotta",
    name: "Warm Terracotta",
    description: "Sun-baked warmth. Earthy terracotta tones with white space freshness.",
    mood: "Warm · Inviting",
    category: "classic",
    swatches: ["hsl(20,40%,18%)", "hsl(20,80%,55%)", "hsl(20,30%,97%)", "hsl(20,45%,10%)"],
    vars: {
      ...DEFAULT_THEME,
      "--theme-primary":          "hsl(20, 40%, 18%)",
      "--theme-secondary":        "hsl(20, 35%, 28%)",
      "--theme-accent":           "hsl(20, 80%, 55%)",
      "--theme-highlight":        "hsl(20, 80%, 55%)",
      "--theme-background":       "hsl(20, 30%, 99%)",
      "--theme-section-bg":       "hsl(20, 30%, 97%)",
      "--theme-btn-bg":           "hsl(20, 80%, 55%)",
      "--theme-btn-text":         "hsl(0, 0%, 100%)",
      "--theme-btn-hover-bg":     "hsl(16, 82%, 46%)",
      "--theme-header-bg":        "hsl(20, 40%, 18%)",
      "--theme-footer-bg":        "hsl(20, 45%, 10%)",
      "--theme-link":             "hsl(20, 80%, 55%)",
      "--theme-hero-eyebrow":     "hsl(20, 80%, 62%)",
      "--theme-particle-color":   "rgba(220,120,60,0.55)",
      "--theme-shadow-accent":    "0 0 40px rgba(220,120,60,0.18)",
      "--theme-fade-stop-0":      "#160A04",
      "--theme-fade-stop-1":      "#221208",
      "--theme-fade-stop-2":      "#301C0E",
      "--theme-fade-stop-3":      "#FBF6F0",
    },
  },
  {
    id: "pure-white",
    name: "Clean White",
    description: "Minimalist and editorial. Pure white light with precise black typography.",
    mood: "Minimal · Editorial",
    category: "classic",
    swatches: ["hsl(0,0%,100%)", "hsl(0,0%,10%)", "hsl(0,0%,50%)", "hsl(0,0%,8%)"],
    vars: {
      ...DEFAULT_THEME,
      "--theme-primary":          "hsl(0, 0%, 8%)",
      "--theme-secondary":        "hsl(0, 0%, 20%)",
      "--theme-accent":           "hsl(0, 0%, 10%)",
      "--theme-highlight":        "hsl(0, 0%, 10%)",
      "--theme-btn-bg":           "hsl(0, 0%, 10%)",
      "--theme-btn-text":         "hsl(0, 0%, 100%)",
      "--theme-btn-hover-bg":     "hsl(0, 0%, 20%)",
      "--theme-header-bg":        "hsl(0, 0%, 100%)",
      "--theme-header-text":      "hsl(0, 0%, 10%)",
      "--theme-footer-bg":        "hsl(0, 0%, 8%)",
      "--theme-link":             "hsl(0, 0%, 10%)",
      "--theme-hero-eyebrow":     "hsl(0, 0%, 70%)",
      "--theme-particle-color":   "rgba(30,30,30,0.40)",
      "--theme-shadow-accent":    "0 0 30px rgba(0,0,0,0.12)",
      "--theme-fade-stop-0":      "#080808",
      "--theme-fade-stop-1":      "#141414",
      "--theme-fade-stop-2":      "#202020",
      "--theme-fade-stop-3":      "#FEFEFE",
    },
  },
  {
    id: "industrial-loft",
    name: "Industrial Loft",
    description: "Raw concrete textures meet copper warmth. Urban, edgy, and distinctly crafted.",
    mood: "Urban · Raw · Crafted",
    category: "classic",
    swatches: ["hsl(25,8%,22%)", "hsl(22,75%,52%)", "hsl(30,10%,95%)", "hsl(25,10%,10%)"],
    vars: {
      ...DEFAULT_THEME,
      "--theme-primary":          "hsl(25, 8%, 22%)",
      "--theme-secondary":        "hsl(25, 6%, 32%)",
      "--theme-accent":           "hsl(22, 75%, 52%)",
      "--theme-highlight":        "hsl(22, 75%, 52%)",
      "--theme-background":       "hsl(30, 10%, 97%)",
      "--theme-text":             "hsl(25, 8%, 18%)",
      "--theme-section-bg":       "hsl(30, 10%, 95%)",
      "--theme-btn-bg":           "hsl(22, 75%, 52%)",
      "--theme-btn-text":         "hsl(0, 0%, 100%)",
      "--theme-btn-hover-bg":     "hsl(18, 78%, 44%)",
      "--theme-header-bg":        "hsl(25, 8%, 16%)",
      "--theme-footer-bg":        "hsl(25, 10%, 10%)",
      "--theme-border":           "hsl(25, 8%, 80%)",
      "--theme-link":             "hsl(22, 75%, 52%)",
      "--theme-hero-eyebrow":     "hsl(22, 75%, 60%)",
      "--theme-particle-color":   "rgba(200,120,50,0.55)",
      "--theme-shadow-accent":    "0 0 40px rgba(200,120,50,0.18)",
      "--theme-fade-stop-0":      "#1C1A17",
      "--theme-fade-stop-1":      "#2E2A24",
      "--theme-fade-stop-2":      "#433E36",
      "--theme-fade-stop-3":      "#F5F2EE",
    },
  },
  {
    id: "arctic-slate",
    name: "Arctic Slate",
    description: "Cool, crystalline precision. Icy blue-greys with crisp white voids — sharp and luxurious.",
    mood: "Cool · Precise · Luxury",
    category: "classic",
    swatches: ["hsl(210,25%,18%)", "hsl(195,85%,60%)", "hsl(210,30%,98%)", "hsl(215,30%,8%)"],
    vars: {
      ...DEFAULT_THEME,
      "--theme-primary":          "hsl(210, 25%, 18%)",
      "--theme-secondary":        "hsl(210, 20%, 28%)",
      "--theme-accent":           "hsl(195, 85%, 60%)",
      "--theme-highlight":        "hsl(195, 85%, 60%)",
      "--theme-background":       "hsl(210, 30%, 98%)",
      "--theme-text":             "hsl(215, 20%, 15%)",
      "--theme-section-bg":       "hsl(210, 25%, 97%)",
      "--theme-btn-bg":           "hsl(195, 85%, 60%)",
      "--theme-btn-text":         "hsl(215, 30%, 10%)",
      "--theme-btn-hover-bg":     "hsl(195, 90%, 50%)",
      "--theme-header-bg":        "hsl(210, 25%, 14%)",
      "--theme-footer-bg":        "hsl(215, 30%, 7%)",
      "--theme-border":           "hsl(210, 20%, 85%)",
      "--theme-link":             "hsl(195, 85%, 55%)",
      "--theme-hero-eyebrow":     "hsl(195, 85%, 65%)",
      "--theme-particle-color":   "rgba(80,200,230,0.55)",
      "--theme-shadow-accent":    "0 0 40px rgba(80,200,230,0.18)",
      "--theme-fade-stop-0":      "#0D1520",
      "--theme-fade-stop-1":      "#142030",
      "--theme-fade-stop-2":      "#1E3040",
      "--theme-fade-stop-3":      "#F0F5FA",
    },
  },
  {
    id: "ember-noir",
    name: "Ember Noir",
    description: "Smoldering luxury. Near-black with deep crimson ember glow — dramatic and unforgettable.",
    mood: "Dramatic · Luxurious · Bold",
    category: "classic",
    swatches: ["hsl(0,0%,8%)", "hsl(6,80%,50%)", "hsl(0,0%,96%)", "hsl(0,0%,4%)"],
    vars: {
      ...DEFAULT_THEME,
      "--theme-primary":          "hsl(0, 0%, 8%)",
      "--theme-secondary":        "hsl(0, 0%, 15%)",
      "--theme-accent":           "hsl(6, 80%, 50%)",
      "--theme-highlight":        "hsl(6, 80%, 50%)",
      "--theme-background":       "hsl(0, 0%, 97%)",
      "--theme-text":             "hsl(0, 0%, 10%)",
      "--theme-section-bg":       "hsl(0, 0%, 96%)",
      "--theme-btn-bg":           "hsl(6, 80%, 50%)",
      "--theme-btn-text":         "hsl(0, 0%, 100%)",
      "--theme-btn-hover-bg":     "hsl(6, 82%, 40%)",
      "--theme-header-bg":        "hsl(0, 0%, 5%)",
      "--theme-footer-bg":        "hsl(0, 0%, 3%)",
      "--theme-border":           "hsl(0, 0%, 84%)",
      "--theme-link":             "hsl(6, 80%, 50%)",
      "--theme-hero-eyebrow":     "hsl(6, 80%, 62%)",
      "--theme-particle-color":   "rgba(220,60,40,0.55)",
      "--theme-shadow-accent":    "0 0 40px rgba(220,60,40,0.18)",
      "--theme-fade-stop-0":      "#080808",
      "--theme-fade-stop-1":      "#150505",
      "--theme-fade-stop-2":      "#220808",
      "--theme-fade-stop-3":      "#F8F5F5",
    },
  },
];

const STORAGE_KEY = "monzon-theme-v2";
const PRESETS_KEY = "monzon-theme-presets-v2";
const ACTIVE_PRESET_KEY = "monzon-active-preset-v2";
const SETTINGS_KEY = "monzon-theme-settings-v2";
// Stores per-preset color customizations so edits survive switching between presets
const PRESET_OVERRIDES_KEY = "monzon-preset-overrides-v2";

/* ─────────────────────────────────────────────────
   PER-THEME EXTENDED SETTINGS
   Stored separately so theme token changes don't
   accidentally wipe sound/night-mode prefs.
───────────────────────────────────────────────── */
export type ThemeTransitionStyle = "dust-fade" | "blueprint-wipe" | "clean-slide" | "fade";

export type ThemeSettings = {
  footerLogo: any;
  /** Night mode */
  nightModeEnabled:   boolean;
  nightModeAuto:      boolean;   // follows system preference OR time
  nightModeTimeStart: number;    // 0-23 hour
  nightModeTimeEnd:   number;
  nightModeIntensity: number;    // 0–1
  /** Ambient sound */
  soundEnabled:       boolean;
  soundVolume:        number;    // 0–1
  soundFadeIn:        number;    // ms
  soundFadeOut:       number;    // ms
  soundAutoMuteOnMobile: boolean;
  soundUrl:           string;    // custom URL or ""
  /** Page transitions */
  transitionStyle:    ThemeTransitionStyle;
  transitionSpeed:    number;    // ms
  transitionIntensity:number;    // 0–1
  transitionEasing:   string;
  /** Header */
  headerOpacity:      number;    // 0–1
  headerBorderVisible:boolean;
  headerBlur:         number;    // px
  headerGradient:     string;
  headerShadow:       string;
  headerIconColor:    string;
  headerLogoColor:    string;
  headerMenuSpacing:  string;    // e.g. "0.875rem"
  headerDropdownAnim: "fade" | "slide" | "scale";
  /** Footer */
  footerParticlesEnabled: boolean;
  footerParticleDensity:  number;
  footerGradient:         string;
  footerAccentColor:      string;
  footerBorderColor:      string;
  footerTextureEnabled:   boolean;
};

const DEFAULT_SETTINGS_BY_PRESET: Record<string, Partial<ThemeSettings>> = {
  "hardscape-landscape": {
    soundUrl: "",
    soundEnabled: false,
    transitionStyle: "dust-fade",
    nightModeIntensity: 0.9,
    footerParticlesEnabled: true,
    footerParticleDensity: 55,
    footerAccentColor: "rgba(80,200,80,0.45)",
    footerGradient: "linear-gradient(160deg, hsl(0,0%,4%) 0%, hsl(140,15%,5%) 100%)",
    footerBorderColor: "rgba(80,200,80,0.12)",
    footerTextureEnabled: true,
    headerGradient: "none",
    headerShadow: "0 2px 48px rgba(0,0,0,0.75)",
    headerIconColor: "hsl(138,60%,42%)",
    headerLogoColor: "hsl(138,60%,42%)",
    headerDropdownAnim: "fade",
    headerBlur: 24,
    headerOpacity: 1,
    headerBorderVisible: true,
  },
  "construction-renovation": {
    soundUrl: "",
    soundEnabled: false,
    transitionStyle: "blueprint-wipe",
    nightModeIntensity: 0.85,
    footerParticlesEnabled: true,
    footerParticleDensity: 40,
    footerAccentColor: "rgba(200,163,64,0.45)",
    footerGradient: "linear-gradient(160deg, hsl(220,22%,7%) 0%, hsl(220,18%,4%) 100%)",
    footerBorderColor: "rgba(200,163,64,0.10)",
    footerTextureEnabled: false,
    headerGradient: "none",
    headerShadow: "0 1px 32px rgba(20,30,50,0.65)",
    headerIconColor: "hsl(38,70%,58%)",
    headerLogoColor: "hsl(38,70%,58%)",
    headerDropdownAnim: "slide",
    headerBlur: 28,
    headerOpacity: 1,
    headerBorderVisible: true,
  },
  "maintenance-service": {
    soundUrl: "",
    soundEnabled: false,
    transitionStyle: "clean-slide",
    nightModeIntensity: 0.8,
    footerParticlesEnabled: true,
    footerParticleDensity: 45,
    footerAccentColor: "rgba(80,160,220,0.40)",
    footerGradient: "linear-gradient(160deg, hsl(215,22%,14%) 0%, hsl(215,25%,10%) 100%)",
    footerBorderColor: "rgba(80,160,220,0.12)",
    footerTextureEnabled: false,
    headerGradient: "none",
    headerShadow: "0 1px 24px rgba(30,60,100,0.10)",
    headerIconColor: "hsl(205,70%,54%)",
    headerLogoColor: "hsl(205,70%,54%)",
    headerDropdownAnim: "scale",
    headerBlur: 20,
    headerOpacity: 1,
    headerBorderVisible: true,
  },
};

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  nightModeEnabled:   false,
  nightModeAuto:      true,
  nightModeTimeStart: 19,
  nightModeTimeEnd:   7,
  nightModeIntensity: 0.88,
  soundEnabled:       false,
  soundVolume:        0.35,
  soundFadeIn:        2000,
  soundFadeOut:       1500,
  soundAutoMuteOnMobile: true,
  soundUrl:           "",
  transitionStyle:    "fade",
  transitionSpeed:    500,
  transitionIntensity:0.85,
  transitionEasing:   "cubic-bezier(0.16,1,0.3,1)",
  headerOpacity:      1,
  headerBorderVisible:true,
  headerBlur:         24,
  headerGradient:     "none",
  headerShadow:       "0 2px 48px rgba(0,0,0,0.65)",
  headerIconColor:    "hsl(42,90%,52%)",
  headerLogoColor:    "hsl(42,90%,52%)",
  headerMenuSpacing:  "0.875rem",
  headerDropdownAnim: "fade",
  footerParticlesEnabled: true,
  footerParticleDensity:  50,
  footerGradient:     "linear-gradient(160deg, hsl(220,22%,5%) 0%, hsl(220,18%,3%) 100%)",
  footerAccentColor:  "rgba(212,160,23,0.4)",
  footerBorderColor:  "rgba(255,255,255,0.06)",
  footerTextureEnabled: false,
};

type ThemeContextType = {
  liveTheme: ThemeVars;
  savedTheme: ThemeVars;
  presets: ThemePresetMeta[];
  activePresetId: string | null;
  activeNavConfig: ThemeNavConfig | null;
  setLiveVar: (key: keyof ThemeVars, value: string) => void;
  applyPreset: (preset: ThemePresetMeta) => void;
  saveTheme: () => void;
  discardChanges: () => void;
  saveAsPreset: (name: string) => void;
  duplicatePreset: (id: string) => void;
  deletePreset: (id: string) => void;
  exportTheme: () => string;
  importTheme: (json: string) => boolean;
  hasUnsavedChanges: boolean;
  /* Extended settings */
  themeSettings: ThemeSettings;
  setThemeSetting: <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => void;
  isNightMode: boolean;
};

const ThemeCtx = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [savedTheme, setSavedTheme] = useState<ThemeVars>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_THEME, ...JSON.parse(stored) } : DEFAULT_THEME;
    } catch { return DEFAULT_THEME; }
  });

  const [liveTheme, setLiveTheme] = useState<ThemeVars>(savedTheme);

  const [activePresetId, setActivePresetId] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_PRESET_KEY) ?? "monzon-dark";
  });

  const [userPresets, setUserPresets] = useState<ThemePresetMeta[]>(() => {
    try {
      const stored = localStorage.getItem(PRESETS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const presets: ThemePresetMeta[] = [...BUILT_IN_PRESETS, ...userPresets];

  /* Apply all CSS vars to :root on every live theme change */
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(liveTheme).forEach(([key, val]) => root.style.setProperty(key, val));
  }, [liveTheme]);

  const setLiveVar = useCallback((key: keyof ThemeVars, value: string) => {
    setLiveTheme(prev => ({ ...prev, [key]: value }));
    // Keep the activePresetId so the user knows which preset they're editing
    // (do NOT null it out — that was causing confusion and losing the preset context)
  }, []);

  // Load stored per-preset overrides from localStorage
  const loadPresetOverrides = useCallback((): Record<string, Partial<ThemeVars>> => {
    try {
      const stored = localStorage.getItem(PRESET_OVERRIDES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  }, []);

  // Save a per-preset override snapshot
  const savePresetOverride = useCallback((presetId: string, vars: ThemeVars) => {
    try {
      const all = (() => { try { const s = localStorage.getItem(PRESET_OVERRIDES_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; } })();
      all[presetId] = vars;
      localStorage.setItem(PRESET_OVERRIDES_KEY, JSON.stringify(all));
    } catch {}
  }, []);

  const applyPreset = useCallback((preset: ThemePresetMeta) => {
    // Merge: built-in preset vars → any previously saved user edits for this preset
    const baseVars: ThemeVars = { ...DEFAULT_THEME, ...(preset.vars as Partial<ThemeVars>) } as ThemeVars;
    const overrides = loadPresetOverrides();
    const savedEdits = overrides[preset.id] ?? {};
    const merged: ThemeVars = { ...baseVars, ...savedEdits };
    setLiveTheme(merged);
    setActivePresetId(preset.id);
    localStorage.setItem(ACTIVE_PRESET_KEY, preset.id);
  }, [loadPresetOverrides]);

  const saveTheme = useCallback(() => {
    setSavedTheme(liveTheme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(liveTheme));
    if (activePresetId) {
      localStorage.setItem(ACTIVE_PRESET_KEY, activePresetId);
      // Also persist the per-preset override so switching & coming back restores custom colors
      savePresetOverride(activePresetId, liveTheme);
    }
  }, [liveTheme, activePresetId, savePresetOverride]);

  const discardChanges = useCallback(() => {
    setLiveTheme(savedTheme);
    const savedPreset = localStorage.getItem(ACTIVE_PRESET_KEY);
    setActivePresetId(savedPreset);
  }, [savedTheme]);

  const saveAsPreset = useCallback((name: string) => {
    const id = `user-${Date.now()}`;
    const newPreset: ThemePresetMeta = {
      id, name,
      category: "user",
      description: "Custom saved theme",
      mood: "Custom",
      swatches: [
        liveTheme["--theme-primary"],
        liveTheme["--theme-accent"],
        liveTheme["--theme-section-bg"],
        liveTheme["--theme-footer-bg"],
      ],
      vars: { ...liveTheme },
    };
    setUserPresets(prev => {
      const next = [...prev, newPreset];
      localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
      return next;
    });
    setActivePresetId(id);
  }, [liveTheme]);

  const duplicatePreset = useCallback((id: string) => {
    const source = presets.find(p => p.id === id);
    if (!source) return;
    const newId = `user-${Date.now()}`;
    const dupe: ThemePresetMeta = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      category: "user",
    };
    setUserPresets(prev => {
      const next = [...prev, dupe];
      localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
      return next;
    });
  }, [presets]);

  const deletePreset = useCallback((id: string) => {
    setUserPresets(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
      return next;
    });
    if (activePresetId === id) setActivePresetId(null);
  }, [activePresetId]);

  const exportTheme = useCallback((): string => {
    return JSON.stringify({ vars: liveTheme, presetId: activePresetId }, null, 2);
  }, [liveTheme, activePresetId]);

  const importTheme = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.vars && typeof parsed.vars === "object") {
        setLiveTheme(prev => ({ ...prev, ...parsed.vars }));
        setActivePresetId(null);
        return true;
      }
      return false;
    } catch { return false; }
  }, []);

  const hasUnsavedChanges = JSON.stringify(liveTheme) !== JSON.stringify(savedTheme);

  const activeNavConfig = useMemo(() => getNavConfig(activePresetId), [activePresetId]);

  /* ── Extended settings state ── */
  const [themeSettings, setThemeSettingsState] = useState<ThemeSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      const base = stored ? JSON.parse(stored) : {};
      const presetDefaults = activePresetId ? (DEFAULT_SETTINGS_BY_PRESET[activePresetId] ?? {}) : {};
      return { ...DEFAULT_THEME_SETTINGS, ...presetDefaults, ...base };
    } catch { return DEFAULT_THEME_SETTINGS; }
  });

  /* ── Night mode detection (auto OR time) ── */
  const [isNightMode, setIsNightMode] = useState(false);

  useEffect(() => {
    if (!themeSettings.nightModeEnabled) { setIsNightMode(false); return; }
    const check = () => {
      if (!themeSettings.nightModeAuto) { setIsNightMode(false); return; }
      const prefDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const hour = new Date().getHours();
      const { nightModeTimeStart: s, nightModeTimeEnd: e } = themeSettings;
      const byTime = s > e ? (hour >= s || hour < e) : (hour >= s && hour < e);
      setIsNightMode(prefDark || byTime);
    };
    check();
    const interval = setInterval(check, 60_000);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", check);
    return () => { clearInterval(interval); mq.removeEventListener("change", check); };
  }, [themeSettings]);

  /* ── Apply night-mode CSS class to <html> ── */
  useEffect(() => {
    if (isNightMode) document.documentElement.classList.add("night-mode");
    else document.documentElement.classList.remove("night-mode");
  }, [isNightMode]);

  /* ── Merge preset defaults when active preset changes ── */
  useEffect(() => {
    if (!activePresetId) return;
    const presetDefaults = DEFAULT_SETTINGS_BY_PRESET[activePresetId] ?? {};
    setThemeSettingsState(prev => {
      const stored = (() => { try { const s = localStorage.getItem(SETTINGS_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; } })();
      return { ...DEFAULT_THEME_SETTINGS, ...presetDefaults, ...stored };
    });
  }, [activePresetId]);

  const setThemeSetting = useCallback(<K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    setThemeSettingsState(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  /* ── Apply settings as CSS vars ── */
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--settings-header-blur",        `${themeSettings.headerBlur}px`);
    root.style.setProperty("--settings-header-opacity",     String(themeSettings.headerOpacity));
    root.style.setProperty("--settings-header-shadow",      themeSettings.headerShadow);
    root.style.setProperty("--settings-header-gradient",    themeSettings.headerGradient);
    root.style.setProperty("--settings-header-icon-color",  themeSettings.headerIconColor);
    root.style.setProperty("--settings-header-logo-color",  themeSettings.headerLogoColor);
    root.style.setProperty("--settings-header-menu-spacing",themeSettings.headerMenuSpacing);
    root.style.setProperty("--settings-footer-accent",      themeSettings.footerAccentColor);
    root.style.setProperty("--settings-footer-gradient",    themeSettings.footerGradient);
    root.style.setProperty("--settings-footer-border",      themeSettings.footerBorderColor);
    root.style.setProperty("--settings-transition-speed",   `${themeSettings.transitionSpeed}ms`);
    root.style.setProperty("--settings-transition-intensity",String(themeSettings.transitionIntensity));
    root.style.setProperty("--settings-transition-easing",  themeSettings.transitionEasing);
    root.style.setProperty("--night-mode-intensity",        String(themeSettings.nightModeIntensity));
  }, [themeSettings]);

  return (
    <ThemeCtx.Provider value={{
      liveTheme, savedTheme, presets, activePresetId, activeNavConfig,
      setLiveVar, applyPreset, saveTheme, discardChanges,
      saveAsPreset, duplicatePreset, deletePreset,
      exportTheme, importTheme, hasUnsavedChanges,
      themeSettings, setThemeSetting, isNightMode,
    }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
