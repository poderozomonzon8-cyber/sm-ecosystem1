import { ReactNode } from "react";

export interface ThemeNavLink {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

export const DEFAULT_NAV_LINKS: ThemeNavLink[] = [
  { label: "Home", href: "/", icon: null },
  { label: "Services", href: "/services", icon: null },
  { label: "Portfolio", href: "/portfolio", icon: null },
  { label: "About", href: "/about", icon: null },
  { label: "Contact", href: "/contact", icon: null },
];

export interface ThemeSectionDescriptor {
  key: string;
  enabled: boolean;
  order: number;
}

export interface ThemeNavConfig {
  presetId: string;
  navLinks: ThemeNavLink[];
  sections: ThemeSectionDescriptor[];
  ctaLabel: string;
  ctaHref: string;
}

export const THEME_NAV_CONFIGS: ThemeNavConfig[] = [
  {
    presetId: "default",
    navLinks: DEFAULT_NAV_LINKS,
    sections: [
      { key: "hero", enabled: true, order: 1 },
      { key: "services", enabled: true, order: 2 },
      { key: "portfolio", enabled: true, order: 3 },
      { key: "reviews", enabled: true, order: 4 },
      { key: "contact", enabled: true, order: 5 },
    ],
    ctaLabel: "Get Quote",
    ctaHref: "/contact",
  }
];

export function getNavConfig(presetId: string = "default") {
  return (
    THEME_NAV_CONFIGS.find(cfg => cfg.presetId === presetId) ||
    THEME_NAV_CONFIGS[0]
  );
}