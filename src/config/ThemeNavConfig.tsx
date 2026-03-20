import React from "react";

/* ═══════════════════════════════════════════════════════
   THEME NAV CONFIG
   Each ecosystem theme carries its own:
   - navLinks  (label, href, icon, iconCategory)
   - sections  (section layout descriptors with style hints)
   - ctaLabel / ctaHref
   - iconSet   (categorised icon reference for the Theme Manager)
   ═══════════════════════════════════════════════════════ */

export type ThemeNavLink = {
  label: string;
  href: string;
  icon: React.ReactNode;
  iconKey?: string;
  badge?: string;
};

export type ThemeSectionDescriptor = {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  order: number;
  enabled: boolean;
  /** Visual style hint for the section */
  style?: "hero" | "gallery" | "cards" | "slider" | "timeline" | "checklist" | "pricing" | "info" | "emergency";
  /** Accent colour family hint — used by the Theme Manager preview */
  accentFamily?: "stone" | "foliage" | "blueprint" | "brass" | "steel" | "sky";
  /** Short visual note describing the look */
  visualNote?: string;
};

export type ThemeIconEntry = {
  key: string;
  label: string;
  category: string;
  icon: React.ReactNode;
};

export type ThemeNavConfig = {
  presetId: string;
  navLinks: ThemeNavLink[];
  sections: ThemeSectionDescriptor[];
  ctaLabel: string;
  ctaHref: string;
  iconSet: ThemeIconEntry[];
  /** Short sentence summarising the menu personality */
  menuPersonality?: string;
};

/* ════════════════════════════════════════════════════════
   SVG ICON LIBRARY
   Organised by theme family. All 15×15 ViewBox, no fill,
   strokeWidth 1.1-1.3. Thin, architectural, premium.
   ════════════════════════════════════════════════════════ */

/* ── UNIVERSAL ICONS ──────────────────────────────────── */

export const HomeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M2 7.5L7.5 2L13 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.5 6.5V13H6.5V10H8.5V13H11.5V6.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
);

export const ContactIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1.5" y="3.5" width="12" height="9" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M1.5 4.5L7.5 9L13.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
);

export const StoreIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M4 5.5V5C4 3.07 5.57 1.5 7.5 1.5C9.43 1.5 11 3.07 11 5V5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <rect x="2" y="5.5" width="11" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
);

/* ── HARDSCAPE / LANDSCAPE ICONS ─────────────────────── */

export const StoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M2 11L5 4L8.5 8L11 5L13 11H2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M5 11V8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    <path d="M8.5 11V8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
  </svg>
);

export const LeafIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M3 12C3 12 4.5 6 10 4C10 4 11 9 7 11C5.5 11.8 4 12 3 12Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M3 12L7 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M6 9.5C6 9.5 8 8 9.5 6" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.4"/>
  </svg>
);

export const ShovelIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="5.5" y="1.5" width="4" height="5" rx="2" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M7.5 6.5V13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M5.5 11H9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export const PatioIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1.5" y="1.5" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="9" y="1.5" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="1.5" y="9" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="9" y="9" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
);

export const PaverIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1" y="6" width="6" height="3.5" rx="0.4" stroke="currentColor" strokeWidth="1.1"/>
    <rect x="8" y="4" width="6" height="3.5" rx="0.4" stroke="currentColor" strokeWidth="1.1"/>
    <rect x="1" y="10.5" width="6" height="3.5" rx="0.4" stroke="currentColor" strokeWidth="1.1"/>
    <rect x="8" y="8.5" width="6" height="3.5" rx="0.4" stroke="currentColor" strokeWidth="1.1"/>
  </svg>
);

export const MaterialsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M7.5 2L13 5.5L7.5 9L2 5.5L7.5 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M2 9L7.5 12.5L13 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export const OutdoorLivingIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M3 10H12M5 10V13M10 10V13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M3 6C3 4.5 4.5 3 7.5 3C10.5 3 12 4.5 12 6V10H3V6Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
);

/* ── CONSTRUCTION / RENOVATION ICONS ─────────────────── */

export const BlueprintIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1.5" y="1.5" width="12" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M1.5 6H13.5M6 1.5V13.5" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
    <rect x="7.5" y="8" width="4" height="4" stroke="currentColor" strokeWidth="1"/>
    <path d="M7.5 3H10M7.5 4.5H11" stroke="currentColor" strokeWidth="0.9" opacity="0.5" strokeLinecap="round"/>
  </svg>
);

export const HammerIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1.5" y="5" width="6" height="3.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M7.5 6.5L13 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M6 5L8.5 2.5L11 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
  </svg>
);

export const LevelIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1" y="5.5" width="13" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="7.5" cy="7.5" r="1" stroke="currentColor" strokeWidth="1"/>
    <path d="M2 7.5H4M11 7.5H13" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.4"/>
  </svg>
);

export const FloorplanIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1.5" y="1.5" width="12" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M7.5 1.5V13.5M1.5 7.5H7.5" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
    <path d="M9.5 5V7.5M9.5 5H12.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    <rect x="9.5" y="10" width="3" height="3" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
  </svg>
);

export const StructuralIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="3" y="2" width="3" height="11" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="9" y="2" width="3" height="11" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M3 4.5H12M3 10.5H12" stroke="currentColor" strokeWidth="1" opacity="0.5" strokeLinecap="round"/>
    <path d="M6 7.5H9" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeLinecap="round"/>
  </svg>
);

export const AcademyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M7.5 2L13.5 5.5L7.5 9L1.5 5.5L7.5 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M4 7.5V11C4 11 5.5 12.5 7.5 12.5C9.5 12.5 11 11 11 11V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.5 5.5V8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export const InteriorIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1.5" y="1.5" width="12" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M5 13.5V7.5C5 6.7 5.7 6 6.5 6H8.5C9.3 6 10 6.7 10 7.5V13.5" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M1.5 6.5H13.5" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
  </svg>
);

/* ── MAINTENANCE / SERVICE ICONS ──────────────────────── */

export const WrenchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M10 2C8.5 2 7.5 3 7.5 4.5C7.5 5 7.6 5.5 7.9 5.9L2.5 11.3C2.2 11.6 2.2 12.1 2.5 12.5C2.9 12.8 3.4 12.8 3.7 12.5L9.1 7.1C9.5 7.4 10 7.5 10.5 7.5C12 7.5 13 6.5 13 5C13 4.6 12.9 4.2 12.7 3.9L11 5.6L9.4 4L11.1 2.3C10.8 2.1 10.4 2 10 2Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
  </svg>
);

export const CalendarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1.5" y="3" width="12" height="11" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M1.5 6.5H13.5M5 1.5V4.5M10 1.5V4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="5" cy="9.5" r="0.75" fill="currentColor"/>
    <circle cx="7.5" cy="9.5" r="0.75" fill="currentColor"/>
    <circle cx="10" cy="9.5" r="0.75" fill="currentColor"/>
  </svg>
);

export const ChecklistIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1.5" y="1.5" width="12" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M4 5.5L6 7.5L11 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 10H11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    <path d="M4 12H8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.35"/>
  </svg>
);

export const BroomIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M9 2L5.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M3 12C3 10 4.5 9 5.5 9.5H9.5C10 9.5 11.5 10 11.5 12H3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M4 12L3.5 13.5M7.5 12V13.5M11 12L11.5 13.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.45"/>
  </svg>
);

export const ResidentialIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M2 7.5L7.5 2.5L13 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="4" y="7.5" width="7" height="5.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="6.5" y="10" width="2" height="3" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const CommercialIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="3" y="2" width="9" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M5 5H10M5 7.5H10M5 10H10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    <rect x="5.5" y="11" width="3.5" height="3" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const SeasonalIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <circle cx="7.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M7.5 1.5V3.5M7.5 11.5V13.5M1.5 7.5H3.5M11.5 7.5H13.5M3.3 3.3L4.7 4.7M10.3 10.3L11.7 11.7M11.7 3.3L10.3 4.7M4.7 10.3L3.3 11.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export const SubscriptionIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M2 7.5C2 4.46 4.46 2 7.5 2C9.4 2 11.1 2.97 12.1 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M13 7.5C13 10.54 10.54 13 7.5 13C5.6 13 3.9 12.03 2.9 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M11.5 2L12.5 5L9.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M3.5 13L2.5 10L5.5 11" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
);

export const ExclusiveIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M7.5 2L9 5.5H13L10 7.8L11 11.5L7.5 9.3L4 11.5L5 7.8L2 5.5H6L7.5 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
);

/* ── SECTION LAYOUT ICONS ─────────────────────────────── */

const GalleryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="1" width="5" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
    <rect x="8" y="1" width="5" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
    <rect x="8" y="7" width="5" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
    <rect x="1" y="10" width="5" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
  </svg>
);

const SliderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="1" width="12" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M7 1V13" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M1 7H7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    <path d="M7 4L10 7L7 10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
  </svg>
);

const TimelineIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1V13" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <circle cx="7" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
    <circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
    <circle cx="7" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M8.5 3H12M8.5 7H12M8.5 11H12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

const CertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="1" width="12" height="9" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M4 5.5L6 7.5L10 3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 12L7 10L10 12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlanCardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="3" width="3.5" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
    <rect x="5.25" y="1" width="3.5" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
    <rect x="9.5" y="3" width="3.5" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
  </svg>
);

const EmergencyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1L13 12H1L7 1Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
    <path d="M7 5V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <circle cx="7" cy="10" r="0.75" fill="currentColor"/>
  </svg>
);

const CaseStudyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="1" width="12" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M3 5H11M3 7.5H8M3 10H9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    <circle cx="9.5" cy="4" r="2" stroke="currentColor" strokeWidth="1"/>
    <path d="M9 4.5L9.5 5L10.5 3.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HeroIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="1" width="12" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M1 9L4 6L7 8.5L10 5L13 7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
    <path d="M3 11H7M3 9.5H5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
  </svg>
);

const ShowcaseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1.5" y="4.5" width="4" height="5" rx="0.4" stroke="currentColor" strokeWidth="1.1"/>
    <rect x="6.5" y="3" width="6" height="8" rx="0.4" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M9.5 6L10.5 7.5L9 9" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
  </svg>
);

/* ════════════════════════════════════════════════════════
   THE THREE ECOSYSTEM THEME NAV CONFIGS
   ════════════════════════════════════════════════════════ */

export const THEME_NAV_CONFIGS: ThemeNavConfig[] = [

  /* ──────────────────────────────────────────────────────
     HARDSCAPE / LANDSCAPE
     Palette family: stone, foliage
     Icons: stone, leaf, shovel, patio, paver
  ─────────────────────────────────────────────────────── */
  {
    presetId: "hardscape-landscape",
    ctaLabel: "Request a Design",
    ctaHref: "/contact",
    menuPersonality: "Natural, textured, outdoor-premium. Navigation evokes craftsmanship and organic materials.",

    navLinks: [
      { label: "Home",              href: "/",                    icon: <HomeIcon />,         iconKey: "home" },
      { label: "Hardscape Projects",href: "/portfolio",           icon: <PatioIcon />,        iconKey: "patio" },
      { label: "Landscaping",       href: "/services",            icon: <LeafIcon />,         iconKey: "leaf" },
      { label: "Outdoor Living",    href: "/services#outdoor",    icon: <OutdoorLivingIcon />,iconKey: "outdoor-living" },
      { label: "Materials",         href: "/store",               icon: <MaterialsIcon />,    iconKey: "materials" },
      { label: "SM Store",          href: "/store#collection",    icon: <StoreIcon />,        iconKey: "store" },
      { label: "Contact",           href: "/contact",             icon: <ContactIcon />,      iconKey: "contact" },
    ],

    iconSet: [
      { key: "stone",         label: "Stone",          category: "Hardscape", icon: <StoneIcon /> },
      { key: "leaf",          label: "Leaf",           category: "Nature",    icon: <LeafIcon /> },
      { key: "shovel",        label: "Shovel",         category: "Tools",     icon: <ShovelIcon /> },
      { key: "patio",         label: "Patio",          category: "Hardscape", icon: <PatioIcon /> },
      { key: "paver",         label: "Paver",          category: "Hardscape", icon: <PaverIcon /> },
      { key: "materials",     label: "Materials",      category: "Hardscape", icon: <MaterialsIcon /> },
      { key: "outdoor-living",label: "Outdoor Living", category: "Lifestyle", icon: <OutdoorLivingIcon /> },
      { key: "store",         label: "SM Store",       category: "Commerce",  icon: <StoreIcon /> },
      { key: "home",          label: "Home",           category: "Universal", icon: <HomeIcon /> },
      { key: "contact",       label: "Contact",        category: "Universal", icon: <ContactIcon /> },
    ],

    sections: [
      {
        key: "stone-hero",
        title: "Stone-Texture Hero",
        description: "Full-screen cinematic hero with natural stone/aggregate texture overlay, organic gradient, and earthy colour palette.",
        icon: <HeroIcon />,
        order: 1,
        enabled: true,
        style: "hero",
        accentFamily: "stone",
        visualNote: "Dark stone texture bg · forest-green eyebrow · white headline · organic grain overlay",
      },
      {
        key: "project-gallery",
        title: "Grid-Based Project Gallery",
        description: "Masonry / asymmetric grid showcasing hardscape and landscaping projects with before/after hover state.",
        icon: <GalleryIcon />,
        order: 2,
        enabled: true,
        style: "gallery",
        accentFamily: "foliage",
        visualNote: "Asymmetric 3-column grid · tall + wide variants · project tag overlays",
      },
      {
        key: "material-showcase",
        title: "Material Showcase",
        description: "Full-bleed horizontal scroll of material texture cards — paver types, stone finishes, aggregates, laminates.",
        icon: <ShowcaseIcon />,
        order: 3,
        enabled: true,
        style: "cards",
        accentFamily: "stone",
        visualNote: "Texture thumbnail cards · material name overlay · filter by category",
      },
      {
        key: "before-after-slider",
        title: "Before / After Slider",
        description: "Interactive drag-handle slider comparing outdoor living spaces pre- and post-installation.",
        icon: <SliderIcon />,
        order: 4,
        enabled: true,
        style: "slider",
        accentFamily: "foliage",
        visualNote: "Centre-drag split reveal · full-bleed image · label tags · keyboard accessible",
      },
      {
        key: "outdoor-inspiration",
        title: "Outdoor Living Inspiration",
        description: "Curated lifestyle imagery grid of completed patios, pergolas, fire pits, and living spaces.",
        icon: <OutdoorLivingIcon />,
        order: 5,
        enabled: true,
        style: "gallery",
        accentFamily: "stone",
        visualNote: "Pinterest-style mosaic · hover zoom · project link to full portfolio entry",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────
     CONSTRUCTION / RENOVATION
     Palette family: blueprint, brass
     Icons: blueprint, hammer, level, floorplan
  ─────────────────────────────────────────────────────── */
  {
    presetId: "construction-renovation",
    ctaLabel: "Start a Project",
    ctaHref: "/contact",
    menuPersonality: "Architectural, precise, blueprint-inspired. Navigation communicates trust, technical authority, and clean lines.",

    navLinks: [
      { label: "Home",           href: "/",                       icon: <HomeIcon />,       iconKey: "home" },
      { label: "Renovations",    href: "/services",               icon: <HammerIcon />,     iconKey: "hammer" },
      { label: "Additions",      href: "/portfolio",              icon: <FloorplanIcon />,  iconKey: "floorplan" },
      { label: "Interiors",      href: "/services#interiors",     icon: <InteriorIcon />,   iconKey: "interior" },
      { label: "Structural Work",href: "/portfolio#structural",   icon: <StructuralIcon />, iconKey: "structural" },
      { label: "Academy",        href: "/academy",                icon: <AcademyIcon />,    iconKey: "academy" },
      { label: "Contact",        href: "/contact",                icon: <ContactIcon />,    iconKey: "contact" },
    ],

    iconSet: [
      { key: "blueprint",   label: "Blueprint",      category: "Design",       icon: <BlueprintIcon /> },
      { key: "hammer",      label: "Hammer",         category: "Tools",        icon: <HammerIcon /> },
      { key: "level",       label: "Level",          category: "Tools",        icon: <LevelIcon /> },
      { key: "floorplan",   label: "Floor Plan",     category: "Design",       icon: <FloorplanIcon /> },
      { key: "structural",  label: "Structural",     category: "Construction", icon: <StructuralIcon /> },
      { key: "interior",    label: "Interiors",      category: "Renovation",   icon: <InteriorIcon /> },
      { key: "academy",     label: "Academy",        category: "Education",    icon: <AcademyIcon /> },
      { key: "home",        label: "Home",           category: "Universal",    icon: <HomeIcon /> },
      { key: "contact",     label: "Contact",        category: "Universal",    icon: <ContactIcon /> },
    ],

    sections: [
      {
        key: "blueprint-hero",
        title: "Blueprint-Style Hero",
        description: "Architectural hero with blueprint grid overlay, fine line-weight typography, and technical annotation aesthetic.",
        icon: <HeroIcon />,
        order: 1,
        enabled: true,
        style: "hero",
        accentFamily: "blueprint",
        visualNote: "Blueprint grid lines overlay · brass eyebrow · charcoal/pearl palette · annotation typeset",
      },
      {
        key: "renovation-case-studies",
        title: "Renovation Case Studies",
        description: "Clean editorial cards with before/after imagery, project scope, budget range, and timeline snapshot.",
        icon: <CaseStudyIcon />,
        order: 2,
        enabled: true,
        style: "cards",
        accentFamily: "brass",
        visualNote: "2-up editorial layout · before/after toggle · scope tags · minimal drop shadow",
      },
      {
        key: "interior-design-section",
        title: "Interior Design Sections",
        description: "Room-by-room feature breakdown with material palettes, 3D renders, finish samples, and client quotes.",
        icon: <InteriorIcon />,
        order: 3,
        enabled: true,
        style: "info",
        accentFamily: "blueprint",
        visualNote: "Split-screen text + full-bleed room render · swatchable finishes · quote pull-out",
      },
      {
        key: "process-timeline",
        title: "Process Timeline",
        description: "Numbered vertical/horizontal timeline walking clients through the renovation process — consult to handover.",
        icon: <TimelineIcon />,
        order: 4,
        enabled: true,
        style: "timeline",
        accentFamily: "brass",
        visualNote: "5-step linear timeline · numbered nodes · phase label + duration · progress connector",
      },
      {
        key: "certifications-permits",
        title: "Certifications & Permits",
        description: "Trust-building section listing licences, accreditations, insurance certificates, and permit completion history.",
        icon: <CertIcon />,
        order: 5,
        enabled: true,
        style: "info",
        accentFamily: "blueprint",
        visualNote: "Logo grid of certifications · permit count KPI · insurance badge · authority typography",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────
     MAINTENANCE / SERVICE PLANS
     Palette family: steel, sky
     Icons: wrench, calendar, checklist, broom
  ─────────────────────────────────────────────────────── */
  {
    presetId: "maintenance-service",
    ctaLabel: "Get a Service Plan",
    ctaHref: "/maintenance",
    menuPersonality: "Friendly, service-first, trustworthy. Navigation is approachable but premium — clear value hierarchy.",

    navLinks: [
      { label: "Home",              href: "/",                       icon: <HomeIcon />,         iconKey: "home" },
      { label: "Residential Plans", href: "/maintenance#residential",icon: <ResidentialIcon />,  iconKey: "residential" },
      { label: "Commercial Plans",  href: "/maintenance#commercial", icon: <CommercialIcon />,   iconKey: "commercial" },
      { label: "Seasonal Services", href: "/maintenance#seasonal",   icon: <SeasonalIcon />,     iconKey: "seasonal" },
      { label: "Subscriptions",     href: "/maintenance#subscribe",  icon: <SubscriptionIcon />, iconKey: "subscription" },
      { label: "Exclusive Content", href: "/academy",                icon: <ExclusiveIcon />,    iconKey: "exclusive" },
      { label: "Contact",           href: "/contact",                icon: <ContactIcon />,      iconKey: "contact" },
    ],

    iconSet: [
      { key: "wrench",       label: "Wrench",       category: "Tools",      icon: <WrenchIcon /> },
      { key: "calendar",     label: "Calendar",     category: "Scheduling", icon: <CalendarIcon /> },
      { key: "checklist",    label: "Checklist",    category: "Operations", icon: <ChecklistIcon /> },
      { key: "broom",        label: "Broom",        category: "Cleaning",   icon: <BroomIcon /> },
      { key: "residential",  label: "Residential",  category: "Plans",      icon: <ResidentialIcon /> },
      { key: "commercial",   label: "Commercial",   category: "Plans",      icon: <CommercialIcon /> },
      { key: "seasonal",     label: "Seasonal",     category: "Scheduling", icon: <SeasonalIcon /> },
      { key: "subscription", label: "Subscription", category: "Commerce",   icon: <SubscriptionIcon /> },
      { key: "exclusive",    label: "Exclusive",    category: "Premium",    icon: <ExclusiveIcon /> },
      { key: "home",         label: "Home",         category: "Universal",  icon: <HomeIcon /> },
      { key: "contact",      label: "Contact",      category: "Universal",  icon: <ContactIcon /> },
    ],

    sections: [
      {
        key: "service-plan-cards",
        title: "Service Plan Cards",
        description: "Three-tier pricing cards (Basic / Standard / Premium) with feature checklists, monthly/annual toggle, and savings badges.",
        icon: <PlanCardIcon />,
        order: 1,
        enabled: true,
        style: "pricing",
        accentFamily: "sky",
        visualNote: "3-column pricing cards · toggle monthly/annual · popular badge · feature checklist rows",
      },
      {
        key: "subscription-tiers",
        title: "Subscription Tiers",
        description: "Auto-renewal subscription plans with visit frequency options, what's included, and multi-month savings callouts.",
        icon: <SubscriptionIcon />,
        order: 2,
        enabled: true,
        style: "pricing",
        accentFamily: "steel",
        visualNote: "Horizontal tier band · frequency selector · savings flag ribbon · subscribe CTA",
      },
      {
        key: "seasonal-checklist",
        title: "Seasonal Checklist",
        description: "Interactive Spring / Summer / Fall / Winter maintenance checklists. Clients can check off items to see coverage.",
        icon: <ChecklistIcon />,
        order: 3,
        enabled: true,
        style: "checklist",
        accentFamily: "sky",
        visualNote: "4-tab season selector · interactive tick rows · coverage % progress bar · CTA to book",
      },
      {
        key: "maintenance-timeline",
        title: "Maintenance Timeline",
        description: "Calendar-style 12-month annual timeline showing which service is performed each month, colour-coded by type.",
        icon: <CalendarIcon />,
        order: 4,
        enabled: true,
        style: "timeline",
        accentFamily: "steel",
        visualNote: "12-month horizontal strip · colour-coded service bands · tooltip on hover · legend",
      },
      {
        key: "emergency-services",
        title: "Emergency Services",
        description: "24/7 emergency call-out section with rapid-response guarantee, escalation process, and direct booking link.",
        icon: <EmergencyIcon />,
        order: 5,
        enabled: true,
        style: "emergency",
        accentFamily: "sky",
        visualNote: "High-contrast alert band · 24/7 badge · average response time · one-click call CTA",
      },
    ],
  },
];

/* ── Fallback default nav (no active ecosystem preset) ── */
export const DEFAULT_NAV_LINKS: ThemeNavLink[] = [
  { label: "Services",    href: "/services",    icon: <WrenchIcon /> },
  { label: "Portfolio",   href: "/portfolio",   icon: <GalleryIcon /> },
  { label: "Store",       href: "/store",       icon: <StoreIcon /> },
  { label: "Maintenance", href: "/maintenance", icon: <SeasonalIcon /> },
  { label: "Academy",     href: "/academy",     icon: <AcademyIcon /> },
  { label: "Community",   href: "/community",   icon: <LeafIcon /> },
  { label: "About",       href: "/about",       icon: <HomeIcon /> },
  { label: "Contact",     href: "/contact",     icon: <ContactIcon /> },
];

/** Resolve active nav config by preset id */
export function getNavConfig(activePresetId: string | null): ThemeNavConfig | null {
  if (!activePresetId) return null;
  return THEME_NAV_CONFIGS.find(c => c.presetId === activePresetId) ?? null;
}
