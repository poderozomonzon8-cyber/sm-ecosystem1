/**
 * useNavOverride
 * Loads ThemeNavOverride records from the DB and merges them over the
 * static THEME_NAV_CONFIGS so that customised labels/hrefs/section order
 * survive page refreshes.
 */
import { useMemo } from "react";
import { useQuery } from "@/lib/anima-supabase-adapter";
import { THEME_NAV_CONFIGS, ThemeNavConfig, ThemeNavLink, ThemeSectionDescriptor } from "@/config/ThemeNavConfig";

export type NavOverrideRow = {
  id: string;
  presetId: string;
  navLinksJson: string;
  sectionsJson: string;
  ctaLabel: string;
  ctaHref: string;
};

/** Serialisable nav-link patch (no React nodes — icons are kept from the static config) */
export type NavLinkPatch = { label: string; href: string; iconKey?: string };
/** Serialisable section patch */
export type SectionPatch = { key: string; enabled: boolean; order: number };

/**
 * Merges a DB override row on top of the static ThemeNavConfig.
 * Icons (React nodes) are always taken from the static config — only
 * label, href, ctaLabel, ctaHref, and section enabled/order are overridable.
 */
export function applyOverride(
  base: ThemeNavConfig,
  row: Omit<NavOverrideRow, "id">
): ThemeNavConfig {
  let navLinks = base.navLinks;
  let sections = base.sections;
  let ctaLabel = base.ctaLabel;
  let ctaHref  = base.ctaHref;

  try {
    const linkPatches: NavLinkPatch[] = JSON.parse(row.navLinksJson);
    navLinks = base.navLinks.map((l, i) => {
      const patch = linkPatches[i];
      if (!patch) return l;
      return { ...l, label: patch.label, href: patch.href };
    });
  } catch { /* keep base */ }

  try {
    const sectionPatches: SectionPatch[] = JSON.parse(row.sectionsJson);
    const patchMap = new Map(sectionPatches.map(p => [p.key, p]));
    const patched = base.sections.map(s => {
      const p = patchMap.get(s.key);
      if (!p) return s;
      return { ...s, enabled: p.enabled, order: p.order };
    });
    // re-sort by saved order
    sections = [...patched].sort((a, b) => a.order - b.order);
  } catch { /* keep base */ }

  if (row.ctaLabel) ctaLabel = row.ctaLabel;
  if (row.ctaHref)  ctaHref  = row.ctaHref;

  return { ...base, navLinks, sections, ctaLabel, ctaHref };
}

/**
 * Returns a map of presetId → merged ThemeNavConfig.
 * Falls back to the static config if no DB override exists.
 */
export function useNavOverrides(): Map<string, ThemeNavConfig> {
  const { data: overrides, isPending } = useQuery("ThemeNavOverride" as any);

  return useMemo(() => {
    const map = new Map<string, ThemeNavConfig>();
    for (const baseConfig of THEME_NAV_CONFIGS) {
      if (!isPending && overrides && Array.isArray(overrides)) {
        const row = (overrides as NavOverrideRow[]).find(r => r.presetId === baseConfig.presetId);
        if (row) {
          map.set(baseConfig.presetId, applyOverride(baseConfig, row));
          continue;
        }
      }
      map.set(baseConfig.presetId, baseConfig);
    }
    return map;
  }, [overrides, isPending]);
}
