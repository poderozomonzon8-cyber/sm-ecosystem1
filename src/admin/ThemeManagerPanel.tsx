import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { applyOverride, NavLinkPatch, SectionPatch } from "@/hooks/useNavOverride";
import {
  useTheme, ThemeVars, ThemePresetMeta, DEFAULT_THEME
} from "@/contexts/ThemeContext";
import {
  Check, FloppyDisk, ArrowCounterClockwise, Plus, Trash, Eye,
  Sparkle, SlidersHorizontal, Copy, Upload, Download,
  PaintBrush, Lightning, Wrench, TreeEvergreen,
  NavigationArrow, Layout, ToggleLeft, ToggleRight, ArrowsDownUp, Cube,
  SpeakerHigh, Moon, ArrowsLeftRight, Funnel
} from "@phosphor-icons/react";
import { DEFAULT_THEME_SETTINGS, ThemeSettings, ThemeTransitionStyle } from "@/contexts/ThemeContext";
import {
  THEME_NAV_CONFIGS, ThemeNavConfig, ThemeSectionDescriptor, ThemeNavLink, ThemeIconEntry
} from "@/config/ThemeNavConfig";

/* ═══════════════════════════════════════════════════════
   TOKEN REGISTRY — all 40+ theme variables, grouped
   ═══════════════════════════════════════════════════════ */
const TOKEN_GROUPS: { group: string; tokens: { key: keyof ThemeVars; label: string }[] }[] = [
  {
    group: "Brand",
    tokens: [
      { key: "--theme-primary",    label: "Primary" },
      { key: "--theme-secondary",  label: "Secondary" },
      { key: "--theme-accent",     label: "Accent" },
      { key: "--theme-highlight",  label: "Highlight" },
    ],
  },
  {
    group: "Layout",
    tokens: [
      { key: "--theme-background",     label: "Page Background" },
      { key: "--theme-text",           label: "Body Text" },
      { key: "--theme-text-muted",     label: "Muted Text" },
      { key: "--theme-section-bg",     label: "Section Background" },
      { key: "--theme-section-alt-bg", label: "Alt Section Background" },
      { key: "--theme-border",         label: "Borders" },
    ],
  },
  {
    group: "Navigation",
    tokens: [
      { key: "--theme-header-bg",     label: "Header Background" },
      { key: "--theme-header-text",   label: "Header Text" },
      { key: "--theme-footer-bg",     label: "Footer Background" },
      { key: "--theme-footer-text",   label: "Footer Text" },
      { key: "--theme-link",          label: "Link Color" },
    ],
  },
  {
    group: "Buttons",
    tokens: [
      { key: "--theme-btn-bg",           label: "Button Background" },
      { key: "--theme-btn-text",         label: "Button Text" },
      { key: "--theme-btn-hover-bg",     label: "Button Hover" },
      { key: "--theme-btn-ghost-border", label: "Ghost Border" },
    ],
  },
  {
    group: "Cards",
    tokens: [
      { key: "--theme-card-bg",           label: "Card Background" },
      { key: "--theme-card-border",       label: "Card Border" },
      { key: "--theme-card-hover-border", label: "Card Hover Border" },
    ],
  },
  {
    group: "Hero",
    tokens: [
      { key: "--theme-hero-text",    label: "Hero Text" },
      { key: "--theme-hero-eyebrow", label: "Hero Eyebrow" },
      { key: "--theme-hero-gradient","label": "Hero Gradient Base" },
    ],
  },
  {
    group: "3D / Particles",
    tokens: [
      { key: "--theme-3d-bg",           label: "3D Background" },
      { key: "--theme-particle-color",  label: "Particle Color" },
      { key: "--theme-particle-accent", label: "Particle Accent" },
    ],
  },
  {
    group: "Fades",
    tokens: [
      { key: "--theme-fade-stop-0", label: "Fade Stop 0 (Deepest)" },
      { key: "--theme-fade-stop-1", label: "Fade Stop 1" },
      { key: "--theme-fade-stop-2", label: "Fade Stop 2" },
      { key: "--theme-fade-stop-3", label: "Fade Stop 3 (Lightest)" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════
   COLOR CONVERSION UTILITIES
   ═══════════════════════════════════════════════════════ */
function colorToHex(val: string): string {
  if (!val) return "#888888";
  if (val.startsWith("#")) return val.length === 7 ? val : "#888888";
  if (val.startsWith("hsl")) {
    try {
      const m = val.match(/hsl\((\d+\.?\d*),\s*(\d+\.?\d*)%,\s*(\d+\.?\d*)%\)/);
      if (!m) return "#888888";
      let [, h, s, l] = m.map(Number);
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        return Math.round(255 * c).toString(16).padStart(2, "0");
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    } catch { return "#888888"; }
  }
  if (val.startsWith("rgba") || val.startsWith("rgb")) return "#888888";
  return "#888888";
}

function hexToHsl(hex: string): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  } catch { return "hsl(0, 0%, 50%)"; }
}

function isPickable(val: string): boolean {
  return val.startsWith("hsl") || val.startsWith("#");
}

/* ═══════════════════════════════════════════════════════
   CATEGORY ICONS
   ═══════════════════════════════════════════════════════ */
function CategoryIcon({ id }: { id: string }) {
  if (id === "hardscape-landscape") return <TreeEvergreen size={14} weight="fill" className="text-emerald-400" />;
  if (id === "construction-renovation") return <Wrench size={14} weight="fill" className="text-amber-400" />;
  if (id === "maintenance-service") return <Lightning size={14} weight="fill" className="text-sky-400" />;
  return <PaintBrush size={14} weight="fill" className="text-gold" />;
}

/* ═══════════════════════════════════════════════════════
   COLOR ROW COMPONENT
   ═══════════════════════════════════════════════════════ */
function ColorRow({ tokenKey, label, value, onChange }: {
  tokenKey: keyof ThemeVars;
  label: string;
  value: string;
  onChange: (k: keyof ThemeVars, v: string) => void;
}) {
  const [textVal, setTextVal] = useState(value);
  const [hexVal, setHexVal] = useState(colorToHex(value));

  const handlePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setHexVal(hex);
    const hsl = hexToHsl(hex);
    setTextVal(hsl);
    onChange(tokenKey, hsl);
  };

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTextVal(raw);
    onChange(tokenKey, raw);
    try { setHexVal(colorToHex(raw)); } catch {}
  };

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <label className="relative w-8 h-8 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0 cursor-pointer hover:border-charcoal/40 transition-colors">
        {isPickable(value) ? (
          <input type="color" value={hexVal} onChange={handlePicker} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
        ) : null}
        <span className="block w-full h-full rounded-md" style={{ background: value }} />
      </label>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-xs font-medium text-charcoal truncate">{label}</p>
        <p className="font-mono text-[9px] text-gray-400 truncate">{tokenKey}</p>
      </div>
      <input
        type="text"
        value={textVal}
        onChange={handleText}
        className="w-36 px-2 py-1.5 text-[10px] font-mono bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:border-charcoal/30 text-gray-700 truncate"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ECOSYSTEM HERO PRESET CARD
   ═══════════════════════════════════════════════════════ */
function EcosystemCard({
  preset, isActive, onApply, onDuplicate,
}: {
  preset: ThemePresetMeta;
  isActive: boolean;
  onApply: (p: ThemePresetMeta) => void;
  onDuplicate: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const gradientBg = isActive
    ? `linear-gradient(140deg, ${preset.swatches?.[0] ?? "#111"} 0%, ${preset.swatches?.[1] ?? "#333"} 100%)`
    : `linear-gradient(140deg, ${preset.swatches?.[0] ?? "#111"} 0%, ${preset.swatches?.[2] ?? "#222"} 100%)`;

  return (
    <div
      className={`relative flex flex-col gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-500 overflow-hidden ${isActive ? "border-white/30 shadow-lg" : "border-white/8 hover:border-white/20"}`}
      style={{ background: gradientBg }}
      onClick={() => onApply(preset)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />

      {/* Header row */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="flex items-center gap-1.5">
          <CategoryIcon id={preset.id} />
          {isActive && (
            <span className="w-4 h-4 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
              <Check size={8} weight="bold" className="text-white" />
            </span>
          )}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDuplicate(preset.id); }}
          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          style={{ opacity: hovered ? 0.7 : 0 }}
          title="Duplicate preset"
        >
          <Copy size={10} className="text-white" />
        </button>
      </div>

      {/* Swatch strip */}
      <div className="flex gap-0.5 h-7 rounded-xl overflow-hidden relative z-10 border border-white/10">
        {(preset.swatches ?? []).map((s, i) => (
          <span key={i} className="flex-1 transition-all duration-300" style={{ background: s }} />
        ))}
      </div>

      {/* Name + mood */}
      <div className="relative z-10">
        <p className="font-headline font-semibold text-base text-white leading-tight">{preset.name}</p>
        {preset.mood && (
          <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-0.5">{preset.mood}</p>
        )}
      </div>

      {/* Description (reveal on hover/active) */}
      <div className={`relative z-10 overflow-hidden transition-all duration-500 ${hovered || isActive ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}>
        {preset.description && (
          <p className="text-[10px] font-sans text-white/60 leading-relaxed">{preset.description}</p>
        )}
        {preset.useCases && preset.useCases.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {preset.useCases.map(uc => (
              <span key={uc} className="px-2 py-0.5 text-[9px] font-sans rounded-full bg-white/10 text-white/60 border border-white/10">{uc}</span>
            ))}
          </div>
        )}
      </div>

      {/* Video hint badge */}
      {preset.heroVideoHint && (isActive || hovered) && (
        <div className="relative z-10 mt-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/30 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <p className="text-[9px] font-mono text-white/50 truncate">{preset.heroVideoHint}</p>
          </div>
        </div>
      )}

      {/* Apply button */}
      <button
        onClick={e => { e.stopPropagation(); onApply(preset); }}
        className={`relative z-10 w-full py-2 rounded-xl text-[10px] font-sans font-semibold uppercase tracking-wider transition-all duration-300 ${isActive ? "bg-white/20 text-white border border-white/20" : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/8"}`}
      >
        {isActive ? "✓ Active" : "Apply Theme"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CLASSIC PRESET CARD
   ═══════════════════════════════════════════════════════ */
function ClassicCard({
  preset, isActive, onApply, onDelete, onDuplicate,
}: {
  preset: ThemePresetMeta;
  isActive: boolean;
  onApply: (p: ThemePresetMeta) => void;
  onDelete?: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative flex flex-col gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all group ${isActive ? "border-charcoal bg-gray-50 shadow-md" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"}`}
      onClick={() => onApply(preset)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Swatch strip */}
      <div className="flex gap-0.5 h-5 rounded-lg overflow-hidden">
        {(preset.swatches ?? []).map((s, i) => (
          <span key={i} className="flex-1" style={{ background: s }} />
        ))}
      </div>

      <div>
        <p className="font-sans text-[11px] font-semibold text-charcoal leading-tight">{preset.name}</p>
        {preset.mood && <p className="text-[9px] font-mono text-gray-400">{preset.mood}</p>}
      </div>

      {/* Active check */}
      {isActive && (
        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-charcoal flex items-center justify-center">
          <Check size={8} weight="bold" className="text-white" />
        </span>
      )}

      {/* Action buttons on hover */}
      <div className={`absolute bottom-2 right-2 flex items-center gap-1 transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0"}`}>
        <button
          onClick={e => { e.stopPropagation(); onDuplicate(preset.id); }}
          className="w-5 h-5 rounded-md bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
          title="Duplicate"
        >
          <Copy size={9} weight="bold" />
        </button>
        {onDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(preset.id); }}
            className="w-5 h-5 rounded-md bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash size={9} weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   LIVE PREVIEW PANEL
   ═══════════════════════════════════════════════════════ */
function LivePreview({ theme, activePreset, hasUnsaved }: {
  theme: ThemeVars;
  activePreset?: ThemePresetMeta;
  hasUnsaved: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm sticky top-20">
      {/* Preview header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <Eye size={13} className="text-gray-400" />
        <p className="font-headline font-semibold text-xs text-charcoal flex-1">Live Preview</p>
        {hasUnsaved && (
          <span className="px-2 py-0.5 text-[9px] font-mono bg-amber-100 text-amber-600 rounded-full uppercase tracking-wide">Draft</span>
        )}
      </div>

      {/* Active preset info */}
      {activePreset?.description && (
        <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/80">
          <p className="text-[10px] font-sans text-gray-500 leading-snug">{activePreset.description}</p>
          {activePreset.useCases && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {activePreset.useCases.slice(0, 3).map(uc => (
                <span key={uc} className="px-1.5 py-0.5 text-[8px] font-mono bg-gray-200 text-gray-500 rounded-full">{uc}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Color swatch strip */}
      <div className="flex h-2">
        {["--theme-primary","--theme-accent","--theme-btn-bg","--theme-section-bg","--theme-footer-bg"].map(k => (
          <span key={k} className="flex-1" style={{ background: theme[k as keyof ThemeVars] }} />
        ))}
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Header simulation */}
        <div className="rounded-xl overflow-hidden" style={{ background: theme["--theme-header-bg"] }}>
          <div className="px-4 py-2.5 flex items-center justify-between">
            <span className="font-headline font-bold text-xs" style={{ color: theme["--theme-accent"] }}>Monzon</span>
            <div className="flex gap-2">
              {["Services","Portfolio","Contact"].map(l => (
                <span key={l} className="text-[9px] font-sans" style={{ color: theme["--theme-header-text"], opacity: 0.7 }}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Hero simulation */}
        <div className="rounded-xl overflow-hidden" style={{ background: theme["--theme-primary"] }}>
          <div className="relative p-5 flex flex-col gap-2" style={{ background: theme["--theme-hero-overlay"] }}>
            <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: theme["--theme-hero-eyebrow"] }}>
              {activePreset?.useCases?.[0] ?? "Construction · Rénovation"}
            </span>
            <p className="font-headline font-bold text-sm leading-tight" style={{ color: theme["--theme-hero-text"] }}>
              Crafting Spaces
            </p>
            <p className="text-[10px] font-sans opacity-60" style={{ color: theme["--theme-hero-text"] }}>Aménagement Monzon</p>
            <button
              className="mt-2 px-4 py-1.5 text-[10px] font-sans font-semibold w-fit transition-all"
              style={{
                background: theme["--theme-btn-bg"],
                color: theme["--theme-btn-text"],
                borderRadius: theme["--theme-btn-radius"],
              }}
            >
              Start a Project
            </button>
          </div>
        </div>

        {/* Section simulation */}
        <div className="rounded-xl p-4" style={{
          background: theme["--theme-section-bg"],
          border: `1px solid ${theme["--theme-border"]}`,
          boxShadow: theme["--theme-shadow-sm"],
        }}>
          <p className="font-headline font-semibold text-xs mb-2" style={{ color: theme["--theme-text"] }}>Our Services</p>
          <div className="flex flex-col gap-1.5">
            {(activePreset?.useCases ?? ["Construction","Renovation","Landscaping"]).slice(0, 3).map(s => (
              <div key={s} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: theme["--theme-accent"] }} />
                <span className="text-[11px] font-sans" style={{ color: theme["--theme-text"] }}>{s}</span>
              </div>
            ))}
          </div>

          {/* Card simulation */}
          <div className="mt-3 p-3 rounded-lg" style={{
            background: theme["--theme-card-bg"],
            border: `1px solid ${theme["--theme-card-border"]}`,
            borderRadius: theme["--theme-card-radius"],
            boxShadow: theme["--theme-card-shadow"],
          }}>
            <p className="text-[10px] font-sans font-medium" style={{ color: theme["--theme-text"] }}>Service Card</p>
            <p className="text-[9px] font-sans mt-0.5" style={{ color: theme["--theme-text-muted"] }}>Premium quality service</p>
          </div>
          <a href="#" className="text-[10px] font-sans mt-2 block" style={{ color: theme["--theme-link"] }}>View all →</a>
        </div>

        {/* 3D / Particle preview */}
        <div className="rounded-xl p-4 flex items-center justify-center" style={{ background: theme["--theme-3d-bg"], minHeight: "60px" }}>
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-full" style={{
                width: 6 + i * 2,
                height: 6 + i * 2,
                background: theme["--theme-particle-color"],
                opacity: 1 - i * 0.15,
              }} />
            ))}
          </div>
          <p className="ml-3 text-[9px] font-mono" style={{ color: theme["--theme-particle-color"] }}>3D / Particles</p>
        </div>

        {/* Footer simulation */}
        <div className="rounded-xl px-4 py-3" style={{ background: theme["--theme-footer-bg"] }}>
          <p className="font-mono text-[9px] text-center" style={{ color: theme["--theme-footer-text"], opacity: 0.6 }}>© 2026 Aménagement Monzon</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN THEME MANAGER PANEL
   ═══════════════════════════════════════════════════════ */
export default function ThemeManagerPanel() {
  const {
    liveTheme, presets, activePresetId,
    setLiveVar, applyPreset, saveTheme, discardChanges,
    saveAsPreset, duplicatePreset, deletePreset,
    exportTheme, importTheme, hasUnsavedChanges,
  } = useTheme();

  const [activeTab, setActiveTab] = useState<"presets" | "editor" | "menus" | "3d" | "header" | "footer" | "sound" | "night" | "transitions">("presets");
  const [activeGroup, setActiveGroup] = useState("Brand");
  const [presetNameInput, setPresetNameInput] = useState("");
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [importValue, setImportValue] = useState("");
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ecosystemIds = ["hardscape-landscape", "construction-renovation", "maintenance-service"];
  const ecosystemPresets = presets.filter(p => ecosystemIds.includes(p.id)) as ThemePresetMeta[];
  const classicPresets = presets.filter(p => !ecosystemIds.includes(p.id)) as ThemePresetMeta[];
  const activePreset = presets.find(p => p.id === activePresetId) as ThemePresetMeta | undefined;

  const groupTokens = TOKEN_GROUPS.find(g => g.group === activeGroup)?.tokens ?? [];

  const handleSave = () => {
    saveTheme();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSavePreset = () => {
    if (!presetNameInput.trim()) return;
    saveAsPreset(presetNameInput.trim());
    setPresetNameInput("");
    setShowSavePreset(false);
  };

  const handleExportJSON = () => {
    const json = exportTheme();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monzon-theme-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportError("");
    setImportSuccess(false);
    const ok = importTheme(importValue.trim());
    if (ok) {
      setImportSuccess(true);
      setImportValue("");
      setTimeout(() => setImportSuccess(false), 2500);
    } else {
      setImportError("Invalid theme JSON. Make sure it has a \"vars\" key.");
    }
  };

  return (
    <div>
      {/* ── Panel Header ── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">Theme Manager</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">
            Switch ecosystem themes, fine-tune tokens, and preview in real time. All changes apply instantly.
          </p>
          {activePreset && (
            <div className="mt-2 flex items-center gap-2">
              <CategoryIcon id={activePreset.id} />
              <span className="font-sans text-xs font-medium text-charcoal">{activePreset.name}</span>
              {activePreset.mood && <span className="text-[10px] font-mono text-gray-400">— {activePreset.mood}</span>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowExport(p => !p)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-sans text-gray-500 border border-gray-200 rounded-xl hover:border-gray-400 transition-all cursor-pointer"
          >
            <Download size={12} /> Export
          </button>
          {hasUnsavedChanges && (
            <button
              onClick={discardChanges}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-sans text-gray-500 border border-gray-200 rounded-xl hover:border-gray-400 transition-all cursor-pointer"
            >
              <ArrowCounterClockwise size={12} /> Discard
            </button>
          )}
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-sans font-semibold rounded-xl transition-all cursor-pointer ${saveSuccess ? "bg-emerald-500 text-white" : hasUnsavedChanges ? "bg-gold text-charcoal hover:bg-gold-dark" : "bg-gray-100 text-gray-400"}`}
          >
            {saveSuccess
              ? <><Check size={13} weight="bold" /> Saved!</>
              : <><FloppyDisk size={13} weight="bold" /> {hasUnsavedChanges ? "Publish" : "Saved"}</>
            }
          </button>
        </div>
      </div>

      {/* ── Export/Import Panel ── */}
      {showExport && (
        <div className="mb-6 p-4 bg-surface-1 border border-white/6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="font-sans text-xs font-semibold text-white/80">Export / Import Theme JSON</p>
            <button onClick={() => setShowExport(false)} className="text-white/40 hover:text-white/80 text-xs cursor-pointer">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Export */}
            <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/8">
              <p className="text-[11px] font-mono text-white/60">Export active theme as JSON</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { const j = exportTheme(); navigator.clipboard.writeText(j); }}
                  className="flex-1 py-2 text-[10px] font-sans font-medium bg-white/10 text-white/70 rounded-lg hover:bg-white/20 hover:text-white transition-all cursor-pointer"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={handleExportJSON}
                  className="flex-1 py-2 text-[10px] font-sans font-medium bg-gold/80 text-charcoal rounded-lg hover:bg-gold transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Download size={10} weight="bold" /> Download
                </button>
              </div>
            </div>
            {/* Import */}
            <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/8">
              <p className="text-[11px] font-mono text-white/60">Import theme JSON</p>
              <textarea
                value={importValue}
                onChange={e => setImportValue(e.target.value)}
                placeholder={`{\n  "vars": { "--theme-accent": "hsl(42,90%,52%)", ... }\n}`}
                rows={3}
                className="w-full px-2.5 py-2 text-[9px] font-mono bg-white/5 border border-white/10 rounded-lg text-white/70 placeholder-white/20 focus:outline-none focus:border-white/25 resize-none"
              />
              {importError && <p className="text-[9px] text-red-400 font-sans">{importError}</p>}
              {importSuccess && <p className="text-[9px] text-emerald-400 font-sans">Theme imported successfully!</p>}
              <button
                onClick={handleImport}
                disabled={!importValue.trim()}
                className="w-full py-2 text-[10px] font-sans font-medium bg-white/10 text-white/70 rounded-lg hover:bg-white/20 hover:text-white transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1"
              >
                <Upload size={10} weight="bold" /> Apply Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Switcher ── */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-6 flex-wrap">
        {([
          { id: "presets",     icon: <Sparkle size={11} />,            label: "Presets" },
          { id: "editor",      icon: <SlidersHorizontal size={11} />,  label: "Colors" },
          { id: "header",      icon: <Layout size={11} />,              label: "Header" },
          { id: "footer",      icon: <ArrowsLeftRight size={11} />,    label: "Footer" },
          { id: "menus",       icon: <NavigationArrow size={11} />,     label: "Menus" },
          { id: "3d",          icon: <Cube size={11} />,                label: "3D" },
          { id: "transitions", icon: <Funnel size={11} />,              label: "Transitions" },
          { id: "sound",       icon: <SpeakerHigh size={11} />,         label: "Sound" },
          { id: "night",       icon: <Moon size={11} />,                label: "Night Mode" },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? "bg-white text-charcoal shadow-sm" : "text-gray-500 hover:text-charcoal"}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Presets or Editor */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* ════ PRESETS TAB ════ */}
          {activeTab === "presets" && (
            <>
              {/* Ecosystem Presets Hero Section */}
              <div className="bg-gradient-to-br from-surface-0 via-surface-1 to-surface-2 border border-white/6 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkle size={14} weight="fill" className="text-gold" />
                  <p className="font-headline font-semibold text-sm text-white">Ecosystem Themes</p>
                  <span className="ml-auto px-2 py-0.5 text-[9px] font-mono bg-gold/20 text-gold rounded-full uppercase tracking-widest">3 Themes</span>
                </div>
                <p className="text-[11px] font-sans text-white/45 mb-4 max-w-md">
                  Three complete visual identities crafted for Aménagement Monzon's core service verticals. Each controls colors, spacing, shadows, hero overlays, and 3D particle styles.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ecosystemPresets.map(preset => (
                    <EcosystemCard
                      key={preset.id}
                      preset={preset}
                      isActive={activePresetId === preset.id}
                      onApply={applyPreset}
                      onDuplicate={duplicatePreset}
                    />
                  ))}
                </div>
              </div>

              {/* Classic + User Presets */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-headline font-semibold text-sm text-charcoal">All Presets</p>
                    <p className="text-[10px] font-sans text-gray-400 mt-0.5">{classicPresets.length} presets — click to apply, duplicate to save a copy</p>
                  </div>
                  <button
                    onClick={() => setShowSavePreset(p => !p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans text-gray-500 bg-gray-100 rounded-xl hover:bg-charcoal hover:text-white transition-all cursor-pointer"
                  >
                    <Plus size={12} weight="bold" /> Save Current
                  </button>
                </div>

                {showSavePreset && (
                  <div className="flex gap-2 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <input
                      type="text"
                      placeholder="Preset name…"
                      value={presetNameInput}
                      onChange={e => setPresetNameInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleSavePreset(); }}
                      className="flex-1 px-3 py-2 text-xs font-sans bg-white border border-gray-200 rounded-lg focus:outline-none"
                    />
                    <button onClick={handleSavePreset} className="px-4 py-2 text-xs font-sans font-semibold bg-charcoal text-white rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                      Save
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                  {classicPresets.map(preset => (
                    <ClassicCard
                      key={preset.id}
                      preset={preset}
                      isActive={activePresetId === preset.id}
                      onApply={applyPreset}
                      onDelete={preset.id.startsWith("user-") ? deletePreset : undefined}
                      onDuplicate={duplicatePreset}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ════ EDITOR TAB ════ */}
          {activeTab === "editor" && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Active preset strip */}
              {activePreset && (
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50/60">
                  <div className="flex gap-1 h-5">
                    {(activePreset.swatches ?? []).map((s, i) => (
                      <span key={i} className="w-5 h-5 rounded-md border border-black/5" style={{ background: s }} />
                    ))}
                  </div>
                  <span className="font-sans text-[11px] font-semibold text-charcoal">{activePreset.name}</span>
                  {activePreset.mood && (
                    <span className="ml-auto text-[9px] font-mono text-gray-400">{activePreset.mood}</span>
                  )}
                  <button
                    onClick={() => duplicatePreset(activePreset.id)}
                    className="flex items-center gap-1 px-2 py-1 text-[9px] font-mono bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    title="Duplicate this preset before editing"
                  >
                    <Copy size={9} /> Duplicate
                  </button>
                </div>
              )}

              {/* Group tabs */}
              <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
                {TOKEN_GROUPS.map(g => (
                  <button
                    key={g.group}
                    onClick={() => setActiveGroup(g.group)}
                    className={`flex-shrink-0 px-4 py-3 text-[11px] font-sans font-medium transition-colors cursor-pointer whitespace-nowrap ${activeGroup === g.group ? "bg-charcoal text-white" : "text-gray-400 hover:text-gray-600 bg-gray-50/50"}`}
                  >
                    {g.group}
                  </button>
                ))}
              </div>

              {/* Token rows */}
              <div className="px-5 py-1">
                {groupTokens.map(token => (
                  <ColorRow
                    key={token.key}
                    tokenKey={token.key}
                    label={token.label}
                    value={liveTheme[token.key]}
                    onChange={setLiveVar}
                  />
                ))}
              </div>

              {/* Non-color tokens (spacing, radius, etc.) for current group */}
              {(activeGroup === "Layout" || activeGroup === "Buttons" || activeGroup === "Cards") && (
                <div className="mx-5 mb-4 mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[9px] font-mono text-gray-400 uppercase tracking-wider mb-2">Spacing & Radius tokens (edit via CSS vars)</p>
                  {activeGroup === "Layout" && (
                    <div className="flex flex-col gap-1">
                      {[
                        { key: "--theme-section-pad" as keyof ThemeVars, label: "Section Padding" },
                        { key: "--theme-shadow-sm"   as keyof ThemeVars, label: "Shadow SM" },
                        { key: "--theme-shadow-md"   as keyof ThemeVars, label: "Shadow MD" },
                      ].map(tk => (
                        <div key={tk.key} className="flex items-center gap-2">
                          <span className="font-mono text-[9px] text-gray-400 w-28 shrink-0">{tk.label}</span>
                          <input
                            type="text"
                            value={liveTheme[tk.key]}
                            onChange={e => setLiveVar(tk.key, e.target.value)}
                            className="flex-1 px-2 py-1 text-[9px] font-mono bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal/30 text-gray-700"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {activeGroup === "Buttons" && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-gray-400 w-28 shrink-0">Button Radius</span>
                        <input
                          type="text"
                          value={liveTheme["--theme-btn-radius"]}
                          onChange={e => setLiveVar("--theme-btn-radius", e.target.value)}
                          className="flex-1 px-2 py-1 text-[9px] font-mono bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal/30 text-gray-700"
                        />
                      </div>
                    </div>
                  )}
                  {activeGroup === "Cards" && (
                    <div className="flex flex-col gap-1">
                      {[
                        { key: "--theme-card-radius" as keyof ThemeVars, label: "Card Radius" },
                        { key: "--theme-card-shadow" as keyof ThemeVars, label: "Card Shadow" },
                      ].map(tk => (
                        <div key={tk.key} className="flex items-center gap-2">
                          <span className="font-mono text-[9px] text-gray-400 w-28 shrink-0">{tk.key.replace("--theme-","")}</span>
                          <input
                            type="text"
                            value={liveTheme[tk.key]}
                            onChange={e => setLiveVar(tk.key, e.target.value)}
                            className="flex-1 px-2 py-1 text-[9px] font-mono bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal/30 text-gray-700"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {/* ════ MENUS & SECTIONS TAB ════ */}
          {activeTab === "menus" && (
            <MenuSectionsEditor activePresetId={activePresetId} />
          )}

          {/* ════ 3D & PARTICLES TAB ════ */}
          {activeTab === "3d" && <ThreeDParticlesEditor />}

          {/* ════ HEADER EDITOR ════ */}
          {activeTab === "header" && <HeaderEditor />}

          {/* ════ FOOTER EDITOR ════ */}
          {activeTab === "footer" && <FooterEditor />}

          {/* ════ SOUND EDITOR ════ */}
          {activeTab === "sound" && <SoundEditor />}

          {/* ════ NIGHT MODE EDITOR ════ */}
          {activeTab === "night" && <NightModeEditor />}

          {/* ════ TRANSITIONS EDITOR ════ */}
          {activeTab === "transitions" && <TransitionsEditor />}
        </div>

        {/* Right: Live Preview */}
        <LivePreview
          theme={liveTheme}
          activePreset={activePreset}
          hasUnsaved={hasUnsavedChanges}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   HEADER EDITOR
   Controls header bg, blur, shadow, border, icon colors
   ═══════════════════════════════════════════════════════ */
function HeaderEditor() {
  const { themeSettings, setThemeSetting, activePresetId, liveTheme } = useTheme();

  const DROPDOWN_ANIMS: { value: ThemeSettings["headerDropdownAnim"]; label: string }[] = [
    { value: "fade",  label: "Fade (All themes)" },
    { value: "slide", label: "Slide down (Construction)" },
    { value: "scale", label: "Scale in (Maintenance)" },
  ];

  const PRESET_HEADER_STYLES = [
    { id: "hardscape-landscape",     label: "Hardscape (Dark charcoal)", bg: "hsl(0,0%,5%)",     text: "hsl(0,0%,100%)",       accent: "hsl(138,60%,42%)" },
    { id: "construction-renovation", label: "Construction (Blueprint)",  bg: "hsl(220,20%,12%)", text: "hsl(0,0%,100%)",       accent: "hsl(38,70%,58%)" },
    { id: "maintenance-service",     label: "Maintenance (White clean)", bg: "hsl(0,0%,100%)",   text: "hsl(215,20%,20%)",     accent: "hsl(205,70%,54%)" },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <Layout size={13} className="text-gray-400" />
        <p className="font-sans text-xs font-semibold text-charcoal flex-1">Header Appearance Editor</p>
        {activePresetId && (
          <span className="text-[9px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{activePresetId.replace(/-/g, " ")}</span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Quick preset header styles */}
        <div>
          <p className="font-mono text-[9px] text-gray-400 uppercase tracking-wider mb-2">Quick Header Presets</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESET_HEADER_STYLES.map(ps => (
              <button
                key={ps.id}
                onClick={() => {
                  setThemeSetting("headerIconColor",  ps.accent);
                  setThemeSetting("headerLogoColor",  ps.accent);
                }}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all cursor-pointer ${activePresetId === ps.id ? "border-charcoal bg-gray-50 shadow-sm" : "border-gray-200 hover:border-gray-300"}`}
              >
                <span className="w-6 h-6 rounded-md border border-gray-200 flex-shrink-0" style={{ background: ps.bg }} />
                <div>
                  <p className="font-sans text-[10px] font-medium text-charcoal leading-tight">{ps.label}</p>
                  <p className="font-mono text-[8px] text-gray-400 mt-0.5" style={{ color: ps.accent }}>accent: {ps.accent.slice(0, 18)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* LEFT column */}
          <div className="flex flex-col gap-3">

            {/* Opacity */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Header Opacity</label>
                <span className="font-mono text-[10px] text-charcoal font-semibold">{Math.round(themeSettings.headerOpacity * 100)}%</span>
              </div>
              <input type="range" min="0.5" max="1" step="0.01" value={themeSettings.headerOpacity}
                onChange={e => setThemeSetting("headerOpacity", parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-charcoal"
              />
            </div>

            {/* Blur */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Backdrop Blur</label>
                <span className="font-mono text-[10px] text-charcoal font-semibold">{themeSettings.headerBlur}px</span>
              </div>
              <input type="range" min="0" max="48" step="2" value={themeSettings.headerBlur}
                onChange={e => setThemeSetting("headerBlur", parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-charcoal"
              />
            </div>

            {/* Menu Spacing */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Menu Item Spacing</label>
              <input type="text" value={themeSettings.headerMenuSpacing}
                onChange={e => setThemeSetting("headerMenuSpacing", e.target.value)}
                className="w-full px-3 py-2 text-[10px] font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/30 text-gray-700"
                placeholder="0.875rem"
              />
            </div>

            {/* Dropdown animation */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Dropdown Animation</label>
              <div className="flex flex-col gap-1">
                {DROPDOWN_ANIMS.map(opt => (
                  <button key={opt.value}
                    onClick={() => setThemeSetting("headerDropdownAnim", opt.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-sans text-left cursor-pointer transition-all ${themeSettings.headerDropdownAnim === opt.value ? "bg-charcoal text-white border-charcoal" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${themeSettings.headerDropdownAnim === opt.value ? "bg-white" : "bg-gray-300"}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT column */}
          <div className="flex flex-col gap-3">

            {/* Border visible toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="font-sans text-xs font-semibold text-charcoal">Bottom Border</p>
                <p className="font-sans text-[10px] text-gray-400 mt-0.5">Show subtle border under header</p>
              </div>
              <button onClick={() => setThemeSetting("headerBorderVisible", !themeSettings.headerBorderVisible)} className="cursor-pointer flex-shrink-0">
                {themeSettings.headerBorderVisible
                  ? <ToggleRight size={26} className="text-emerald-500" weight="fill" />
                  : <ToggleLeft  size={26} className="text-gray-300" />}
              </button>
            </div>

            {/* Icon color */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Nav Icon Color</label>
              <div className="flex gap-2 items-center">
                <span className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0" style={{ background: themeSettings.headerIconColor }} />
                <input type="text" value={themeSettings.headerIconColor}
                  onChange={e => setThemeSetting("headerIconColor", e.target.value)}
                  className="flex-1 px-3 py-2 text-[10px] font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/30 text-gray-700"
                />
              </div>
            </div>

            {/* Logo color */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Logo Accent Color</label>
              <div className="flex gap-2 items-center">
                <span className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0" style={{ background: themeSettings.headerLogoColor }} />
                <input type="text" value={themeSettings.headerLogoColor}
                  onChange={e => setThemeSetting("headerLogoColor", e.target.value)}
                  className="flex-1 px-3 py-2 text-[10px] font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/30 text-gray-700"
                />
              </div>
            </div>

            {/* Shadow */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Header Shadow</label>
              <input type="text" value={themeSettings.headerShadow}
                onChange={e => setThemeSetting("headerShadow", e.target.value)}
                className="w-full px-3 py-2 text-[10px] font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/30 text-gray-700"
                placeholder="0 2px 48px rgba(0,0,0,0.65)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FOOTER EDITOR
   ═══════════════════════════════════════════════════════ */
function FooterEditor() {
  const { themeSettings, setThemeSetting, activePresetId } = useTheme();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <ArrowsLeftRight size={13} className="text-gray-400" />
        <p className="font-sans text-xs font-semibold text-charcoal flex-1">Footer Appearance Editor</p>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* LEFT */}
          <div className="flex flex-col gap-3">
            {/* Particles toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="font-sans text-xs font-semibold text-charcoal">Ambient Particles</p>
                <p className="font-sans text-[10px] text-gray-400 mt-0.5">
                  {activePresetId === "hardscape-landscape" ? "Dust/gravel fragments" :
                   activePresetId === "construction-renovation" ? "Blueprint dots + diamond sparks" :
                   "Soft blue-gray floating orbs"}
                </p>
              </div>
              <button onClick={() => setThemeSetting("footerParticlesEnabled", !themeSettings.footerParticlesEnabled)} className="cursor-pointer flex-shrink-0">
                {themeSettings.footerParticlesEnabled
                  ? <ToggleRight size={26} className="text-emerald-500" weight="fill" />
                  : <ToggleLeft  size={26} className="text-gray-300" />}
              </button>
            </div>

            {/* Particle density */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Particle Density</label>
                <span className="font-mono text-[10px] text-charcoal font-semibold">{themeSettings.footerParticleDensity}</span>
              </div>
              <input type="range" min="0" max="100" step="5" value={themeSettings.footerParticleDensity}
                onChange={e => setThemeSetting("footerParticleDensity", parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-charcoal"
              />
              <div className="flex justify-between text-[8px] font-mono text-gray-300">
                <span>0 (None)</span><span>100 (Dense)</span>
              </div>
            </div>

            {/* Texture toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="font-sans text-xs font-semibold text-charcoal">Stone Texture Overlay</p>
                <p className="font-sans text-[10px] text-gray-400 mt-0.5">Hardscape theme only</p>
              </div>
              <button onClick={() => setThemeSetting("footerTextureEnabled", !themeSettings.footerTextureEnabled)} className="cursor-pointer flex-shrink-0"
                disabled={activePresetId !== "hardscape-landscape"}
              >
                {themeSettings.footerTextureEnabled
                  ? <ToggleRight size={26} className={activePresetId === "hardscape-landscape" ? "text-emerald-500" : "text-gray-200"} weight="fill" />
                  : <ToggleLeft  size={26} className="text-gray-300" />}
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-3">
            {/* Accent color */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Accent Color</label>
              <div className="flex gap-2 items-center">
                <span className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0" style={{ background: themeSettings.footerAccentColor }} />
                <input type="text" value={themeSettings.footerAccentColor}
                  onChange={e => setThemeSetting("footerAccentColor", e.target.value)}
                  className="flex-1 px-3 py-2 text-[10px] font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/30 text-gray-700"
                />
              </div>
            </div>

            {/* Border color */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Border / Divider Color</label>
              <div className="flex gap-2 items-center">
                <span className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0" style={{ background: themeSettings.footerBorderColor }} />
                <input type="text" value={themeSettings.footerBorderColor}
                  onChange={e => setThemeSetting("footerBorderColor", e.target.value)}
                  className="flex-1 px-3 py-2 text-[10px] font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/30 text-gray-700"
                />
              </div>
            </div>

            {/* Gradient */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Footer Background Gradient</label>
              <div className="w-full h-8 rounded-xl border border-gray-200 mb-1.5" style={{ background: themeSettings.footerGradient }} />
              <textarea
                rows={3}
                value={themeSettings.footerGradient}
                onChange={e => setThemeSetting("footerGradient", e.target.value)}
                className="w-full px-3 py-2 text-[10px] font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/30 text-gray-700 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Preview mini-footer */}
        <div className="rounded-xl overflow-hidden relative" style={{ background: themeSettings.footerGradient, minHeight: 56 }}>
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${themeSettings.footerAccentColor}, transparent)` }} />
          <div className="p-4 flex items-center justify-between">
            <span className="font-headline font-bold text-sm" style={{ color: themeSettings.footerAccentColor }}>Monzon</span>
            <p className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>Footer Preview</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SOUND EDITOR
   ═══════════════════════════════════════════════════════ */
function SoundEditor() {
  const { themeSettings, setThemeSetting, activePresetId } = useTheme();

  const PRESET_DESCRIPTIONS: Record<string, string> = {
    "hardscape-landscape":     "Wind through stone — low gravel ambience, outdoor atmosphere",
    "construction-renovation": "Cinematic hum — subtle metallic resonance, architectural depth",
    "maintenance-service":     "Clean air — soft indoor ambience, light and fresh",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <SpeakerHigh size={13} className="text-gray-400" />
        <p className="font-sans text-xs font-semibold text-charcoal flex-1">Ambient Sound</p>
        {activePresetId && (
          <span className="text-[9px] font-mono text-gray-400 italic">{PRESET_DESCRIPTIONS[activePresetId] ?? "—"}</span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Enable toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="font-sans text-xs font-semibold text-charcoal">Enable Ambient Sound</p>
            <p className="font-sans text-[10px] text-gray-400 mt-0.5">Plays a gentle ambient track matching the active theme</p>
          </div>
          <button onClick={() => setThemeSetting("soundEnabled", !themeSettings.soundEnabled)} className="cursor-pointer flex-shrink-0">
            {themeSettings.soundEnabled
              ? <ToggleRight size={26} className="text-emerald-500" weight="fill" />
              : <ToggleLeft  size={26} className="text-gray-300" />}
          </button>
        </div>

        {/* Auto-mute mobile */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="font-sans text-xs font-semibold text-charcoal">Auto-Mute on Mobile</p>
            <p className="font-sans text-[10px] text-gray-400 mt-0.5">Prevents audio on phones/tablets</p>
          </div>
          <button onClick={() => setThemeSetting("soundAutoMuteOnMobile", !themeSettings.soundAutoMuteOnMobile)} className="cursor-pointer flex-shrink-0">
            {themeSettings.soundAutoMuteOnMobile
              ? <ToggleRight size={26} className="text-emerald-500" weight="fill" />
              : <ToggleLeft  size={26} className="text-gray-300" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Volume */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Volume</label>
              <span className="font-mono text-[10px] text-charcoal font-semibold">{Math.round(themeSettings.soundVolume * 100)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.05" value={themeSettings.soundVolume}
              onChange={e => setThemeSetting("soundVolume", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-charcoal"
            />
            <div className="flex justify-between text-[8px] font-mono text-gray-300">
              <span>0% (Silent)</span><span>100% (Full)</span>
            </div>
          </div>

          {/* Fade in */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Fade In Duration</label>
              <span className="font-mono text-[10px] text-charcoal font-semibold">{(themeSettings.soundFadeIn / 1000).toFixed(1)}s</span>
            </div>
            <input type="range" min="500" max="8000" step="250" value={themeSettings.soundFadeIn}
              onChange={e => setThemeSetting("soundFadeIn", parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-charcoal"
            />
          </div>

          {/* Fade out */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Fade Out Duration</label>
              <span className="font-mono text-[10px] text-charcoal font-semibold">{(themeSettings.soundFadeOut / 1000).toFixed(1)}s</span>
            </div>
            <input type="range" min="200" max="5000" step="200" value={themeSettings.soundFadeOut}
              onChange={e => setThemeSetting("soundFadeOut", parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-charcoal"
            />
          </div>

          {/* Custom URL */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Custom Audio URL</label>
            <input type="url" value={themeSettings.soundUrl}
              onChange={e => setThemeSetting("soundUrl", e.target.value)}
              className="w-full px-3 py-2 text-[10px] font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/30 text-gray-700"
              placeholder="https://... (leave empty for default)"
            />
          </div>
        </div>

        {/* Per-theme sound description */}
        <div className="p-4 bg-surface-1 border border-white/6 rounded-2xl">
          <p className="font-mono text-[9px] text-white/40 uppercase tracking-wider mb-2">Per-Theme Sound Profiles</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: "hardscape-landscape",     label: "Hardscape", desc: "Wind + gravel outdoor ambience", color: "text-emerald-400" },
              { id: "construction-renovation", label: "Construction", desc: "Cinematic hum + metallic resonance", color: "text-amber-400" },
              { id: "maintenance-service",     label: "Maintenance", desc: "Clean air indoor soft ambience", color: "text-sky-400" },
            ].map(t => (
              <div key={t.id} className="p-3 bg-white/5 rounded-xl border border-white/8">
                <p className={`font-mono text-[9px] font-semibold uppercase tracking-wider mb-1 ${t.color}`}>{t.label}</p>
                <p className="font-sans text-[10px] text-white/55">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   NIGHT MODE EDITOR
   ═══════════════════════════════════════════════════════ */
function NightModeEditor() {
  const { themeSettings, setThemeSetting, isNightMode, activePresetId } = useTheme();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <Moon size={13} className="text-gray-400" />
        <p className="font-sans text-xs font-semibold text-charcoal flex-1">Night Mode</p>
        <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full ${isNightMode ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
          {isNightMode ? "● Active now" : "○ Day mode"}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Enable toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="font-sans text-xs font-semibold text-charcoal">Enable Night Mode</p>
            <p className="font-sans text-[10px] text-gray-400 mt-0.5">Darkens ALL pages, backgrounds, overlays, and particles</p>
          </div>
          <button onClick={() => setThemeSetting("nightModeEnabled", !themeSettings.nightModeEnabled)} className="cursor-pointer flex-shrink-0">
            {themeSettings.nightModeEnabled
              ? <ToggleRight size={26} className="text-blue-500" weight="fill" />
              : <ToggleLeft  size={26} className="text-gray-300" />}
          </button>
        </div>

        {/* Auto detection toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="font-sans text-xs font-semibold text-charcoal">Auto Detection</p>
            <p className="font-sans text-[10px] text-gray-400 mt-0.5">Follows system preference AND time window</p>
          </div>
          <button onClick={() => setThemeSetting("nightModeAuto", !themeSettings.nightModeAuto)} className="cursor-pointer flex-shrink-0">
            {themeSettings.nightModeAuto
              ? <ToggleRight size={26} className="text-blue-500" weight="fill" />
              : <ToggleLeft  size={26} className="text-gray-300" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Time Window */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Night Start Hour (24h)</label>
            <div className="flex items-center gap-2">
              <input type="range" min="0" max="23" step="1" value={themeSettings.nightModeTimeStart}
                onChange={e => setThemeSetting("nightModeTimeStart", parseInt(e.target.value))}
                className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
              />
              <span className="font-mono text-[10px] text-charcoal font-semibold w-8 text-right">{themeSettings.nightModeTimeStart}:00</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Night End Hour (24h)</label>
            <div className="flex items-center gap-2">
              <input type="range" min="0" max="23" step="1" value={themeSettings.nightModeTimeEnd}
                onChange={e => setThemeSetting("nightModeTimeEnd", parseInt(e.target.value))}
                className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
              />
              <span className="font-mono text-[10px] text-charcoal font-semibold w-8 text-right">{themeSettings.nightModeTimeEnd}:00</span>
            </div>
          </div>

          {/* Intensity */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Night Mode Intensity</label>
              <span className="font-mono text-[10px] text-charcoal font-semibold">{Math.round(themeSettings.nightModeIntensity * 100)}%</span>
            </div>
            <input type="range" min="0.1" max="1" step="0.05" value={themeSettings.nightModeIntensity}
              onChange={e => setThemeSetting("nightModeIntensity", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
            />
            <div className="flex justify-between text-[8px] font-mono text-gray-300">
              <span>10% (Very light)</span><span>100% (Full dark)</span>
            </div>
          </div>
        </div>

        {/* Per-theme night mode palette summary */}
        <div className="p-4 bg-surface-1 border border-white/6 rounded-2xl">
          <p className="font-mono text-[9px] text-white/40 uppercase tracking-wider mb-2">Per-Theme Night Mode Palettes</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: "hardscape-landscape",     label: "Hardscape",    tint: "rgba(4,12,4, 0.35)",  desc: "Forest-black tint, green-muted particles", color: "text-emerald-400" },
              { id: "construction-renovation", label: "Construction", tint: "rgba(6,10,18, 0.35)", desc: "Deep navy tint, brass-muted accents",        color: "text-amber-400" },
              { id: "maintenance-service",     label: "Maintenance",  tint: "rgba(4,10,20, 0.35)", desc: "Midnight-blue tint, blue-gray soft glow",    color: "text-sky-400" },
            ].map(t => (
              <div key={t.id} className="p-3 bg-white/5 rounded-xl border border-white/8">
                <p className={`font-mono text-[9px] font-semibold uppercase tracking-wider mb-1 ${t.color}`}>{t.label}</p>
                <div className="w-full h-3 rounded-md mb-1.5" style={{ background: t.tint, border: "1px solid rgba(255,255,255,0.06)" }} />
                <p className="font-sans text-[10px] text-white/55">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TRANSITIONS EDITOR
   ═══════════════════════════════════════════════════════ */
function TransitionsEditor() {
  const { themeSettings, setThemeSetting, activePresetId } = useTheme();

  const TRANSITION_STYLES: { value: ThemeTransitionStyle; label: string; desc: string; theme: string }[] = [
    { value: "dust-fade",      label: "Dust Fade",        desc: "Grainy opacity sweep — organic, rugged",     theme: "Hardscape" },
    { value: "blueprint-wipe", label: "Blueprint Wipe",   desc: "Horizontal architectural reveal sweep",       theme: "Construction" },
    { value: "clean-slide",    label: "Clean Slide",      desc: "Smooth vertical slide — friendly, precise",   theme: "Maintenance" },
    { value: "fade",           label: "Simple Fade",      desc: "Universal crossfade — works everywhere",      theme: "Universal" },
  ];

  const EASING_PRESETS = [
    { label: "Cinematic (spring)",    value: "cubic-bezier(0.16,1,0.3,1)" },
    { label: "Snappy (back-out)",     value: "cubic-bezier(0.34,1.56,0.64,1)" },
    { label: "Architectural (ease)",  value: "cubic-bezier(0.2,0,0.1,1)" },
    { label: "Linear",                value: "linear" },
    { label: "Ease",                  value: "ease" },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <Funnel size={13} className="text-gray-400" />
        <p className="font-sans text-xs font-semibold text-charcoal flex-1">Page Transitions</p>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Transition style selector */}
        <div>
          <p className="font-mono text-[9px] text-gray-400 uppercase tracking-wider mb-3">Transition Style</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TRANSITION_STYLES.map(opt => (
              <button
                key={opt.value}
                onClick={() => setThemeSetting("transitionStyle", opt.value)}
                className={`flex flex-col gap-1 p-3 rounded-xl border text-left transition-all cursor-pointer ${themeSettings.transitionStyle === opt.value ? "bg-charcoal text-white border-charcoal" : "bg-gray-50 text-charcoal border-gray-200 hover:border-gray-300"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs font-semibold">{opt.label}</span>
                  <span
                    className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${themeSettings.transitionStyle === opt.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}
                  >
                    {opt.theme}
                  </span>
                </div>
                <p className={`font-sans text-[10px] leading-snug ${themeSettings.transitionStyle === opt.value ? "text-white/70" : "text-gray-500"}`}>{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Speed */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Transition Speed</label>
              <span className="font-mono text-[10px] text-charcoal font-semibold">{themeSettings.transitionSpeed}ms</span>
            </div>
            <input type="range" min="150" max="1500" step="50" value={themeSettings.transitionSpeed}
              onChange={e => setThemeSetting("transitionSpeed", parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-charcoal"
            />
            <div className="flex justify-between text-[8px] font-mono text-gray-300">
              <span>150ms (Snappy)</span><span>1500ms (Cinematic)</span>
            </div>
          </div>

          {/* Intensity */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Overlay Intensity</label>
              <span className="font-mono text-[10px] text-charcoal font-semibold">{Math.round(themeSettings.transitionIntensity * 100)}%</span>
            </div>
            <input type="range" min="0.1" max="1" step="0.05" value={themeSettings.transitionIntensity}
              onChange={e => setThemeSetting("transitionIntensity", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-charcoal"
            />
          </div>

          {/* Easing selector */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Easing Function</label>
            <div className="flex flex-wrap gap-1.5">
              {EASING_PRESETS.map(ep => (
                <button
                  key={ep.value}
                  onClick={() => setThemeSetting("transitionEasing", ep.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-sans border cursor-pointer transition-all ${themeSettings.transitionEasing === ep.value ? "bg-charcoal text-white border-charcoal" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"}`}
                >
                  {ep.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={themeSettings.transitionEasing}
              onChange={e => setThemeSetting("transitionEasing", e.target.value)}
              className="w-full px-3 py-2 text-[10px] font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/30 text-gray-700"
              placeholder="cubic-bezier(0.16,1,0.3,1)"
            />
          </div>
        </div>

        {/* Visual demo of current transition type */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-charcoal flex items-center justify-center flex-shrink-0 relative">
            <div
              className="w-10 h-10 rounded-lg"
              style={{
                background: "linear-gradient(135deg, rgba(212,160,23,0.6), rgba(255,220,100,0.3))",
                animation: themeSettings.transitionStyle === "dust-fade"      ? `dust-fade-in ${themeSettings.transitionSpeed}ms ${themeSettings.transitionEasing} infinite alternate` :
                           themeSettings.transitionStyle === "clean-slide"    ? `clean-slide-in ${themeSettings.transitionSpeed}ms ${themeSettings.transitionEasing} infinite alternate` :
                           themeSettings.transitionStyle === "blueprint-wipe" ? `blueprint-slide-in ${themeSettings.transitionSpeed}ms ${themeSettings.transitionEasing} infinite alternate` :
                           `page-fade-in ${themeSettings.transitionSpeed}ms ${themeSettings.transitionEasing} infinite alternate`,
              }}
            />
          </div>
          <div>
            <p className="font-sans text-xs font-semibold text-charcoal">{TRANSITION_STYLES.find(t => t.value === themeSettings.transitionStyle)?.label}</p>
            <p className="font-sans text-[10px] text-gray-500 mt-0.5">{themeSettings.transitionSpeed}ms · {themeSettings.transitionEasing.slice(0, 30)}</p>
            <p className="font-mono text-[9px] text-gray-400 mt-0.5">Intensity: {Math.round(themeSettings.transitionIntensity * 100)}% overlay</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   3D & PARTICLES EDITOR
   Full admin control over theme-specific 3D settings
   ═══════════════════════════════════════════════════════ */
function ThreeDParticlesEditor() {
  const { liveTheme, setLiveVar, activePresetId } = useTheme();

  const enabled      = liveTheme["--theme-3d-enabled"]         !== "0";
  const model        = liveTheme["--theme-3d-model"]           ?? "auto";
  const rotSpeed     = liveTheme["--theme-3d-rotation-speed"]  ?? "1.0";
  const density      = liveTheme["--theme-particle-density"]   ?? "50";
  const pSize        = liveTheme["--theme-particle-size"]      ?? "1.5";
  const pSpeed       = liveTheme["--theme-particle-speed"]     ?? "1.0";
  const pColor       = liveTheme["--theme-particle-color"]     ?? "rgba(212,160,23,0.6)";
  const pAccent      = liveTheme["--theme-particle-accent"]    ?? "rgba(255,220,100,0.4)";
  const gridColor    = liveTheme["--theme-3d-grid-color"]      ?? "rgba(212,160,23,0.12)";
  const bgColor      = liveTheme["--theme-3d-bg"]              ?? "hsl(220,20%,7%)";

  const themeLabel =
    activePresetId === "hardscape-landscape"     ? "Hardscape / Landscape" :
    activePresetId === "construction-renovation" ? "Construction / Renovation" :
    activePresetId === "maintenance-service"     ? "Maintenance / Service Plans" : "Current Theme";

  const MODEL_OPTIONS = [
    { value: "auto",      label: "Auto (follows theme)" },
    { value: "paver",     label: "Paver Grid + Stone Slab (Hardscape)" },
    { value: "blueprint", label: "Blueprint Cube + Floorplan (Construction)" },
    { value: "badge",     label: "Service Badge + Wrench (Maintenance)" },
  ];

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-charcoal/5 to-charcoal/2 border border-gray-200 flex gap-3 items-start">
        <Cube size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-sans text-xs font-semibold text-charcoal">3D Elements &amp; Particle System</p>
            {activePresetId && (
              <span className="px-2 py-0.5 text-[9px] font-mono bg-gray-100 text-gray-500 rounded-full">{themeLabel}</span>
            )}
          </div>
          <p className="font-sans text-[11px] text-gray-500 mt-0.5 leading-relaxed">
            Each ecosystem theme has a unique 3D model and particle system. Use the controls below to adjust behavior and appearance.
            Changes apply instantly to the live 3D preview.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* LEFT: 3D Model Controls */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <Cube size={13} className="text-gray-400" />
            <p className="font-sans text-xs font-semibold text-charcoal flex-1">3D Model Controls</p>
          </div>

          <div className="p-5 flex flex-col gap-4">

            {/* Enable / Disable toggle */}
            <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="font-sans text-xs font-semibold text-charcoal">Enable 3D Renderer</p>
                <p className="font-sans text-[10px] text-gray-400 mt-0.5">Show the interactive 3D canvas on public pages</p>
              </div>
              <button
                onClick={() => setLiveVar("--theme-3d-enabled", enabled ? "0" : "1")}
                className="flex-shrink-0 cursor-pointer"
                title={enabled ? "Disable 3D" : "Enable 3D"}
              >
                {enabled
                  ? <ToggleRight size={28} className="text-emerald-500" weight="fill" />
                  : <ToggleLeft  size={28} className="text-gray-300" />
                }
              </button>
            </div>

            {/* Model selector */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">3D Model / Scene</label>
              <div className="flex flex-col gap-1.5">
                {MODEL_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setLiveVar("--theme-3d-model", opt.value)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-left transition-all cursor-pointer text-xs font-sans ${model === opt.value ? "bg-charcoal text-white border-charcoal" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"}`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${model === opt.value ? "bg-white" : "bg-gray-300"}`} />
                    {opt.label}
                    {model === opt.value && <Check size={11} weight="bold" className="ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Rotation speed */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Rotation Speed</label>
                <span className="font-mono text-[10px] text-charcoal font-semibold">{parseFloat(rotSpeed).toFixed(1)}×</span>
              </div>
              <input
                type="range" min="0.1" max="3.0" step="0.1"
                value={rotSpeed}
                onChange={e => setLiveVar("--theme-3d-rotation-speed", e.target.value)}
                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-charcoal"
              />
              <div className="flex justify-between text-[8px] font-mono text-gray-300">
                <span>0.1× (Slow)</span><span>3.0× (Fast)</span>
              </div>
            </div>

            {/* 3D Background */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">3D Background Color</label>
              <div className="flex gap-2 items-center">
                <span className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0" style={{ background: bgColor }} />
                <input
                  type="text" value={bgColor}
                  onChange={e => setLiveVar("--theme-3d-bg", e.target.value)}
                  className="flex-1 px-3 py-2 text-[10px] font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/30 text-gray-700"
                />
              </div>
            </div>

            {/* Grid color */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">3D Grid / Blueprint Color</label>
              <div className="flex gap-2 items-center">
                <span className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0" style={{ background: gridColor }} />
                <input
                  type="text" value={gridColor}
                  onChange={e => setLiveVar("--theme-3d-grid-color", e.target.value)}
                  className="flex-1 px-3 py-2 text-[10px] font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/30 text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Particle System Controls */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <Sparkle size={13} className="text-gray-400" />
            <p className="font-sans text-xs font-semibold text-charcoal flex-1">Particle System</p>
          </div>

          <div className="p-5 flex flex-col gap-4">

            {/* Particle density */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Particle Density</label>
                <span className="font-mono text-[10px] text-charcoal font-semibold">{density} particles</span>
              </div>
              <input
                type="range" min="10" max="120" step="5"
                value={density}
                onChange={e => setLiveVar("--theme-particle-density", e.target.value)}
                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-charcoal"
              />
              <div className="flex justify-between text-[8px] font-mono text-gray-300">
                <span>10 (Minimal)</span><span>120 (Dense)</span>
              </div>
            </div>

            {/* Particle size */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Particle Size</label>
                <span className="font-mono text-[10px] text-charcoal font-semibold">{parseFloat(pSize).toFixed(1)}px</span>
              </div>
              <input
                type="range" min="0.5" max="4.0" step="0.1"
                value={pSize}
                onChange={e => setLiveVar("--theme-particle-size", e.target.value)}
                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-charcoal"
              />
              <div className="flex justify-between text-[8px] font-mono text-gray-300">
                <span>0.5px (Dust)</span><span>4px (Bold)</span>
              </div>
            </div>

            {/* Particle speed */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Particle Drift Speed</label>
                <span className="font-mono text-[10px] text-charcoal font-semibold">{parseFloat(pSpeed).toFixed(1)}×</span>
              </div>
              <input
                type="range" min="0.1" max="2.5" step="0.1"
                value={pSpeed}
                onChange={e => setLiveVar("--theme-particle-speed", e.target.value)}
                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-charcoal"
              />
              <div className="flex justify-between text-[8px] font-mono text-gray-300">
                <span>0.1× (Calm)</span><span>2.5× (Energetic)</span>
              </div>
            </div>

            {/* Particle color */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Primary Particle Color</label>
              <div className="flex gap-2 items-center">
                <span className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0" style={{ background: pColor }} />
                <input
                  type="text" value={pColor}
                  onChange={e => setLiveVar("--theme-particle-color", e.target.value)}
                  className="flex-1 px-3 py-2 text-[10px] font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/30 text-gray-700"
                />
              </div>
            </div>

            {/* Particle accent */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Accent Particle Color</label>
              <div className="flex gap-2 items-center">
                <span className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0" style={{ background: pAccent }} />
                <input
                  type="text" value={pAccent}
                  onChange={e => setLiveVar("--theme-particle-accent", e.target.value)}
                  className="flex-1 px-3 py-2 text-[10px] font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/30 text-gray-700"
                />
              </div>
            </div>

            {/* Live particle preview strip */}
            <div
              className="rounded-xl h-14 flex items-center justify-center gap-2 overflow-hidden relative"
              style={{ background: bgColor }}
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full flex-shrink-0 transition-all duration-300"
                  style={{
                    width:   `${parseFloat(pSize) * (0.6 + i * 0.1)}px`,
                    height:  `${parseFloat(pSize) * (0.6 + i * 0.1)}px`,
                    background: i % 3 === 0 ? pAccent : pColor,
                    opacity: 0.7 - i * 0.05,
                  }}
                />
              ))}
              <p
                className="absolute bottom-1.5 right-3 font-mono text-[8px] opacity-50"
                style={{ color: pColor }}
              >
                live preview
              </p>
            </div>

            {/* Theme presets quick-apply */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Quick Particle Presets</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: "Earth Tones",    color: "rgba(80,200,80,0.55)",  accent: "rgba(140,240,100,0.35)", density: "55", size: "1.8", speed: "0.8" },
                  { label: "Blueprint",      color: "rgba(210,170,80,0.50)", accent: "rgba(240,210,140,0.30)", density: "40", size: "1.2", speed: "0.6" },
                  { label: "Clean Air",      color: "rgba(80,160,220,0.50)", accent: "rgba(160,210,240,0.30)", density: "45", size: "1.4", speed: "1.2" },
                  { label: "Gold Dust",      color: "rgba(212,160,23,0.6)",  accent: "rgba(255,220,100,0.4)",  density: "60", size: "1.6", speed: "1.0" },
                  { label: "Minimal",        color: "rgba(180,180,180,0.3)", accent: "rgba(220,220,220,0.2)",  density: "20", size: "1.0", speed: "0.5" },
                  { label: "Dense Storm",    color: "rgba(120,100,80,0.7)",  accent: "rgba(160,140,110,0.4)",  density: "100", size: "2.0", speed: "1.8" },
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setLiveVar("--theme-particle-color",   preset.color);
                      setLiveVar("--theme-particle-accent",  preset.accent);
                      setLiveVar("--theme-particle-density", preset.density);
                      setLiveVar("--theme-particle-size",    preset.size);
                      setLiveVar("--theme-particle-speed",   preset.speed);
                    }}
                    className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 transition-all cursor-pointer"
                  >
                    <span className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0" style={{ background: preset.color }} />
                    <span className="font-sans text-[8px] text-gray-500 text-center leading-tight">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Theme visual summary */}
      <div className="p-4 bg-surface-1 border border-white/6 rounded-2xl">
        <p className="font-mono text-[9px] text-white/40 uppercase tracking-wider mb-3">Per-Theme 3D Summary</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: "hardscape-landscape",     label: "Hardscape / Landscape",      model: "Paver Grid + Stone Slab",     particles: "Dust · Earth tones · Gravel fragments",   color: "text-emerald-400" },
            { id: "construction-renovation", label: "Construction / Renovation",   model: "Blueprint Cube + Floorplan",  particles: "Blueprint dots · Gold micro-lines · Arch drafting", color: "text-amber-400" },
            { id: "maintenance-service",     label: "Maintenance / Service Plans", model: "Service Badge + Wrench Icon", particles: "Clean air · Soft blue-gray dots · Floating icons",    color: "text-sky-400" },
          ].map(th => (
            <div key={th.id} className="p-3 bg-white/5 rounded-xl border border-white/8">
              <p className={`font-mono text-[9px] font-semibold uppercase tracking-wider mb-1 ${th.color}`}>{th.label}</p>
              <p className="font-sans text-[10px] text-white/60 mb-1">
                <span className="text-white/30">3D: </span>{th.model}
              </p>
              <p className="font-sans text-[10px] text-white/50">
                <span className="text-white/30">Particles: </span>{th.particles}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STYLE BADGE HELPERS
   ═══════════════════════════════════════════════════════ */
const STYLE_META: Record<string, { label: string; bg: string; text: string }> = {
  hero:      { label: "Hero",       bg: "bg-violet-100",  text: "text-violet-600" },
  gallery:   { label: "Gallery",    bg: "bg-blue-100",    text: "text-blue-600" },
  cards:     { label: "Cards",      bg: "bg-amber-100",   text: "text-amber-700" },
  slider:    { label: "Slider",     bg: "bg-indigo-100",  text: "text-indigo-600" },
  timeline:  { label: "Timeline",   bg: "bg-teal-100",    text: "text-teal-700" },
  checklist: { label: "Checklist",  bg: "bg-green-100",   text: "text-green-700" },
  pricing:   { label: "Pricing",    bg: "bg-emerald-100", text: "text-emerald-700" },
  info:      { label: "Info",       bg: "bg-gray-100",    text: "text-gray-600" },
  emergency: { label: "Emergency",  bg: "bg-red-100",     text: "text-red-600" },
};

const ACCENT_META: Record<string, { dot: string }> = {
  stone:     { dot: "bg-stone-400" },
  foliage:   { dot: "bg-emerald-500" },
  blueprint: { dot: "bg-blue-500" },
  brass:     { dot: "bg-amber-500" },
  steel:     { dot: "bg-slate-500" },
  sky:       { dot: "bg-sky-500" },
};

function StyleBadge({ style }: { style?: string }) {
  if (!style) return null;
  const meta = STYLE_META[style] ?? { label: style, bg: "bg-gray-100", text: "text-gray-500" };
  return (
    <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-mono font-medium uppercase tracking-wider ${meta.bg} ${meta.text}`}>
      {meta.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION VISUAL PREVIEW CARD
   ═══════════════════════════════════════════════════════ */
function SectionPreviewCard({ section, idx, onToggle, onMoveUp, onMoveDown, isLast }: {
  section: ThemeSectionDescriptor;
  idx: number;
  onToggle: (key: string) => void;
  onMoveUp: (idx: number) => void;
  onMoveDown: (idx: number) => void;
  isLast: boolean;
}) {
  const accentDot = section.accentFamily ? ACCENT_META[section.accentFamily]?.dot : "bg-gray-400";

  return (
    <div className={`relative flex gap-3 p-4 rounded-xl border transition-all ${section.enabled ? "bg-white border-gray-200 shadow-sm" : "bg-gray-50/60 border-gray-100 opacity-55"}`}>
      {/* Left: order + reorder */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
        <span className="w-6 h-6 rounded-lg bg-charcoal/5 border border-gray-200 text-[10px] font-mono font-bold text-charcoal/50 flex items-center justify-center">{idx + 1}</span>
        <button onClick={() => onMoveUp(idx)} disabled={idx === 0} className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-charcoal disabled:opacity-0 transition-colors cursor-pointer" title="Move up">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 6.5V1.5M1.5 4L4 1.5L6.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button onClick={() => onMoveDown(idx)} disabled={isLast} className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-charcoal disabled:opacity-0 transition-colors cursor-pointer" title="Move down">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 1.5V6.5M1.5 4L4 6.5L6.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* Icon */}
      <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 mt-0.5">
        {section.icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="font-sans text-xs font-semibold text-charcoal leading-tight">{section.title}</p>
          <StyleBadge style={section.style} />
          {section.accentFamily && (
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${accentDot}`} />
              <span className="font-mono text-[8px] text-gray-400">{section.accentFamily}</span>
            </span>
          )}
        </div>
        <p className="font-sans text-[10px] text-gray-400 leading-relaxed">{section.description}</p>
        {section.visualNote && (
          <p className="mt-1.5 font-mono text-[9px] text-gray-300 leading-relaxed border-l-2 border-gray-200 pl-2">{section.visualNote}</p>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={() => onToggle(section.key)}
        className="flex-shrink-0 mt-0.5 cursor-pointer self-start"
        title={section.enabled ? "Disable section" : "Enable section"}
      >
        {section.enabled
          ? <ToggleRight size={20} className="text-emerald-500" weight="fill" />
          : <ToggleLeft size={20} className="text-gray-300" />
        }
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ICON SHOWCASE PANEL
   Shows the full icon set grouped by category
   ═══════════════════════════════════════════════════════ */
function IconShowcase({ iconSet }: { iconSet: ThemeIconEntry[] }) {
  const categories = Array.from(new Set(iconSet.map(e => e.category)));

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-gray-400">
          <rect x="1" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
          <rect x="8" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
          <rect x="1" y="8" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
          <rect x="8" y="8" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
        </svg>
        <p className="font-sans text-xs font-semibold text-charcoal flex-1">Icon Set</p>
        <span className="text-[9px] font-mono text-gray-400">{iconSet.length} icons · {categories.length} categories</span>
      </div>
      <div className="p-4 flex flex-col gap-4">
        {categories.map(cat => (
          <div key={cat}>
            <p className="font-mono text-[9px] text-gray-400 uppercase tracking-wider mb-2">{cat}</p>
            <div className="flex flex-wrap gap-2">
              {iconSet.filter(e => e.category === cat).map(entry => (
                <div
                  key={entry.key}
                  className="group flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:bg-charcoal hover:border-charcoal transition-all cursor-default"
                  title={entry.key}
                >
                  <span className="text-gray-500 group-hover:text-white transition-colors">{entry.icon}</span>
                  <span className="font-sans text-[10px] text-gray-600 group-hover:text-white transition-colors">{entry.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   NAV MENU MINI PREVIEW
   Visual mockup of how the nav looks for this theme
   ═══════════════════════════════════════════════════════ */
function NavMiniPreview({ links, ctaLabel, presetId }: {
  links: ThemeNavLink[];
  ctaLabel: string;
  presetId: string;
}) {
  const accentColor =
    presetId === "hardscape-landscape"     ? "#3cb855" :
    presetId === "construction-renovation" ? "#c8a340" :
    presetId === "maintenance-service"     ? "#3b9dd2" : "#d4a017";

  const headerBg =
    presetId === "hardscape-landscape"     ? "hsl(0,0%,5%)" :
    presetId === "construction-renovation" ? "hsl(220,20%,12%)" :
    presetId === "maintenance-service"     ? "hsl(0,0%,100%)" : "hsl(220,22%,5%)";

  const textColor =
    presetId === "maintenance-service" ? "hsl(215,20%,20%)" : "hsl(0,0%,100%)";

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Simulated header */}
      <div className="px-4 py-3 flex items-center justify-between gap-2" style={{ background: headerBg }}>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-6 h-6 border flex items-center justify-center text-[10px] font-bold" style={{ borderColor: `${accentColor}66`, color: accentColor }}>M</div>
          <span className="font-headline text-[11px] font-light" style={{ color: textColor, opacity: 0.85 }}>Aménagement Monzon</span>
        </div>
        <div className="flex items-center gap-0.5 overflow-hidden">
          {links.slice(0, 5).map(link => (
            <div key={link.label} className="flex items-center gap-1 px-2 py-1 rounded-md transition-all" style={{ color: textColor, opacity: 0.6 }}>
              <span style={{ opacity: 0.5 }}>{link.icon}</span>
              <span className="font-sans text-[8px] uppercase tracking-wide hidden sm:block">{link.label}</span>
            </div>
          ))}
          {links.length > 5 && (
            <span className="font-mono text-[8px] px-1" style={{ color: `${textColor}60` }}>+{links.length - 5}</span>
          )}
        </div>
        <div className="flex-shrink-0 px-3 py-1.5 text-[8px] font-sans font-semibold uppercase tracking-wider rounded-sm" style={{ background: accentColor, color: presetId === "construction-renovation" ? "hsl(220,20%,10%)" : "#fff" }}>
          {ctaLabel}
        </div>
      </div>
      {/* Accent line */}
      <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}55, transparent)` }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION STRUCTURE MINI PREVIEW
   Visual wireframe showing enabled sections in order
   ═══════════════════════════════════════════════════════ */
function SectionStructurePreview({ sections, presetId }: {
  sections: ThemeSectionDescriptor[];
  presetId: string;
}) {
  const accentColor =
    presetId === "hardscape-landscape"     ? "#3cb855" :
    presetId === "construction-renovation" ? "#c8a340" :
    presetId === "maintenance-service"     ? "#3b9dd2" : "#d4a017";

  const enabledSections = sections.filter(s => s.enabled);

  const getBlockStyle = (style?: string): React.CSSProperties => {
    switch (style) {
      case "hero":      return { height: 44, background: "linear-gradient(135deg,#1a1a1a 0%,#2a2a2a 100%)" };
      case "gallery":   return { height: 32, background: "#f3f4f6", backgroundImage: "repeating-linear-gradient(90deg,#e5e7eb 0,#e5e7eb 1px,transparent 0,transparent 25%)" };
      case "cards":     return { height: 28, background: "#f9fafb" };
      case "slider":    return { height: 30, background: "linear-gradient(90deg,#e5e7eb 0 50%,#d1d5db 50% 100%)" };
      case "timeline":  return { height: 28, background: "#f3f4f6" };
      case "checklist": return { height: 26, background: "#f0fdf4" };
      case "pricing":   return { height: 36, background: "#f8fafc" };
      case "info":      return { height: 28, background: "#fafafa" };
      case "emergency": return { height: 26, background: "#fef2f2" };
      default:          return { height: 28, background: "#f3f4f6" };
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <Layout size={13} className="text-gray-400" />
        <p className="font-sans text-xs font-semibold text-charcoal flex-1">Section Structure Preview</p>
        <span className="text-[9px] font-mono text-gray-400">{enabledSections.length} active sections</span>
      </div>
      <div className="p-4">
        <div className="flex flex-col gap-1 rounded-xl overflow-hidden border border-gray-100">
          {enabledSections.map((section, i) => (
            <div
              key={section.key}
              className="relative flex items-center px-3"
              style={getBlockStyle(section.style)}
            >
              {/* Section number marker */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-mono font-bold text-white/80" style={{ background: `${accentColor}99` }}>
                {i + 1}
              </div>
              {/* Section title */}
              <span className="ml-6 font-sans text-[9px] font-medium truncate" style={{ color: section.style === "hero" ? "rgba(255,255,255,0.75)" : "rgba(30,40,50,0.65)" }}>
                {section.title}
              </span>
              {/* Style badge dot */}
              <span className="ml-auto mr-1 flex-shrink-0 text-[8px] font-mono" style={{ color: section.style === "hero" ? "rgba(255,255,255,0.4)" : "rgba(100,120,140,0.55)" }}>
                {section.style}
              </span>
            </div>
          ))}
        </div>
        {enabledSections.length === 0 && (
          <p className="font-sans text-[11px] text-gray-300 text-center py-4">All sections disabled</p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MENU & SECTIONS EDITOR
   Allows per-theme editing of nav links and section layout
   ═══════════════════════════════════════════════════════ */
function MenuSectionsEditor({ activePresetId }: { activePresetId: string | null }) {
  const ecosystemIds = ["hardscape-landscape", "construction-renovation", "maintenance-service"];
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    activePresetId && ecosystemIds.includes(activePresetId)
      ? activePresetId
      : "hardscape-landscape"
  );
  const [innerTab, setInnerTab] = useState<"menu" | "sections" | "icons">("menu");

  /* SDK hooks */
  const { data: overrides, isPending: loadingOverrides } = useQuery("ThemeNavOverride" as any);
  const { create, update } = useMutation("ThemeNavOverride" as any);

  const baseConfig = THEME_NAV_CONFIGS.find(c => c.presetId === selectedPresetId)!;

  /* Resolve initial state: DB override merged onto base config */
  const getInitialForPreset = (pid: string) => {
    const base = THEME_NAV_CONFIGS.find(c => c.presetId === pid)!;
    if (overrides && Array.isArray(overrides)) {
      const row = (overrides as any[]).find((r: any) => r.presetId === pid);
      if (row) return applyOverride(base, row);
    }
    return base;
  };

  /* Local editable copies */
  const [localLinks, setLocalLinks] = useState<ThemeNavLink[]>(baseConfig?.navLinks ?? []);
  const [localSections, setLocalSections] = useState<ThemeSectionDescriptor[]>(baseConfig?.sections ?? []);
  const [localCta, setLocalCta] = useState<string>(baseConfig?.ctaLabel ?? "");
  const [localCtaHref, setLocalCtaHref] = useState<string>(baseConfig?.ctaHref ?? "");
  const [editingLinkIdx, setEditingLinkIdx] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  /* Once overrides load, hydrate local state from DB */
  const hydratedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (loadingOverrides || !overrides) return;
    if (hydratedRef.current.has(selectedPresetId)) return;
    hydratedRef.current.add(selectedPresetId);
    const resolved = getInitialForPreset(selectedPresetId);
    setLocalLinks(resolved.navLinks);
    setLocalSections(resolved.sections);
    setLocalCta(resolved.ctaLabel);
    setLocalCtaHref(resolved.ctaHref);
  }, [loadingOverrides, overrides, selectedPresetId]);

  /* Reset local state when switching presets */
  const handlePresetSwitch = (id: string) => {
    setSelectedPresetId(id);
    const resolved = getInitialForPreset(id);
    setLocalLinks(resolved.navLinks);
    setLocalSections(resolved.sections);
    setLocalCta(resolved.ctaLabel);
    setLocalCtaHref(resolved.ctaHref);
    setEditingLinkIdx(null);
  };

  const handleToggleSection = (key: string) => {
    setLocalSections(prev => prev.map(s => s.key === key ? { ...s, enabled: !s.enabled } : s));
  };

  const handleMoveSectionUp = (idx: number) => {
    if (idx === 0) return;
    setLocalSections(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const handleMoveSectionDown = (idx: number) => {
    setLocalSections(prev => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const handleLinkLabelChange = (idx: number, label: string) => {
    setLocalLinks(prev => prev.map((l, i) => i === idx ? { ...l, label } : l));
  };

  const handleLinkHrefChange = (idx: number, href: string) => {
    setLocalLinks(prev => prev.map((l, i) => i === idx ? { ...l, href } : l));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const navLinksJson = JSON.stringify(
        localLinks.map(l => ({ label: l.label, href: l.href, iconKey: l.iconKey } as NavLinkPatch))
      );
      const sectionsJson = JSON.stringify(
        localSections.map((s, i) => ({ key: s.key, enabled: s.enabled, order: i + 1 } as SectionPatch))
      );
      const existingRow = overrides && Array.isArray(overrides)
        ? (overrides as any[]).find((r: any) => r.presetId === selectedPresetId)
        : null;

      if (existingRow) {
        await update(existingRow.id, { navLinksJson, sectionsJson, ctaLabel: localCta, ctaHref: localCtaHref });
      } else {
        await create({ presetId: selectedPresetId, navLinksJson, sectionsJson, ctaLabel: localCta, ctaHref: localCtaHref });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Failed to save nav override", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const existingRow = overrides && Array.isArray(overrides)
      ? (overrides as any[]).find((r: any) => r.presetId === selectedPresetId)
      : null;
    const base = THEME_NAV_CONFIGS.find(c => c.presetId === selectedPresetId)!;
    if (existingRow) {
      await update(existingRow.id, {
        navLinksJson: JSON.stringify(base.navLinks.map(l => ({ label: l.label, href: l.href, iconKey: l.iconKey }))),
        sectionsJson: JSON.stringify(base.sections.map((s, i) => ({ key: s.key, enabled: s.enabled, order: i + 1 }))),
        ctaLabel: base.ctaLabel,
        ctaHref: base.ctaHref,
      });
    }
    setLocalLinks(base.navLinks);
    setLocalSections(base.sections);
    setLocalCta(base.ctaLabel);
    setLocalCtaHref(base.ctaHref);
    hydratedRef.current.delete(selectedPresetId);
  };

  const presetMeta: Record<string, { label: string; color: string; pill: string }> = {
    "hardscape-landscape":     { label: "Hardscape / Landscape",      color: "bg-emerald-100 text-emerald-700 border-emerald-200", pill: "bg-emerald-500" },
    "construction-renovation": { label: "Construction / Renovation",   color: "bg-amber-100 text-amber-700 border-amber-200",       pill: "bg-amber-500"  },
    "maintenance-service":     { label: "Maintenance / Service Plans", color: "bg-sky-100 text-sky-700 border-sky-200",             pill: "bg-sky-500"    },
  };

  const currentConfig = THEME_NAV_CONFIGS.find(c => c.presetId === selectedPresetId)!;

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header banner ── */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-charcoal/5 to-charcoal/2 border border-gray-200 flex gap-3 items-start">
        <NavigationArrow size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-sans text-xs font-semibold text-charcoal">Theme-Specific Menus, Icons &amp; Sections</p>
            {activePresetId && ecosystemIds.includes(activePresetId) && (
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono border ${presetMeta[activePresetId]?.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${presetMeta[activePresetId]?.pill}`} />
                Active
              </span>
            )}
          </div>
          <p className="font-sans text-[11px] text-gray-500 mt-0.5 leading-relaxed">
            Each ecosystem theme has its own navigation menu with theme-matched icons, section layout structure, and CTA wording.
            Switch themes below, then use the tabs to edit the menu, reorder sections, or browse the icon set.
          </p>
          {currentConfig?.menuPersonality && (
            <p className="mt-1.5 font-mono text-[9px] text-gray-400 italic">{currentConfig.menuPersonality}</p>
          )}
        </div>
      </div>

      {/* ── Theme selector pills ── */}
      <div className="flex flex-wrap gap-2">
        {ecosystemIds.map(id => (
          <button
            key={id}
            onClick={() => handlePresetSwitch(id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-sans font-medium border transition-all cursor-pointer ${selectedPresetId === id ? presetMeta[id].color : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"}`}
          >
            <CategoryIcon id={id} />
            {presetMeta[id].label}
            {activePresetId === id && <span className={`w-1.5 h-1.5 rounded-full ${presetMeta[id].pill}`} />}
          </button>
        ))}
      </div>

      {/* ── Nav mini-preview ── */}
      <NavMiniPreview
        links={localLinks}
        ctaLabel={localCta}
        presetId={selectedPresetId}
      />

      {/* ── Inner tab switcher ── */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {(["menu", "sections", "icons"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setInnerTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-sans font-medium transition-all cursor-pointer capitalize ${innerTab === tab ? "bg-white text-charcoal shadow-sm" : "text-gray-400 hover:text-charcoal"}`}
          >
            {tab === "menu" ? "Nav Menu" : tab === "sections" ? "Section Structure" : "Icon Set"}
          </button>
        ))}
      </div>

      {/* ══════════════ TAB: NAV MENU ══════════════ */}
      {innerTab === "menu" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Editor */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
              <NavigationArrow size={13} className="text-gray-400" />
              <p className="font-sans text-xs font-semibold text-charcoal flex-1">Navigation Links</p>
              <span className="text-[9px] font-mono text-gray-400">{localLinks.length} links</span>
            </div>

            {/* CTA row */}
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60">
              <p className="font-mono text-[9px] text-gray-400 uppercase tracking-wider mb-2">Primary CTA Button</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localCta}
                  onChange={e => setLocalCta(e.target.value)}
                  placeholder="Button label…"
                  className="flex-1 px-3 py-2 text-xs font-sans bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal/30"
                />
                <input
                  type="text"
                  value={localCtaHref}
                  onChange={e => setLocalCtaHref(e.target.value)}
                  placeholder="/contact"
                  className="w-28 px-3 py-2 text-xs font-mono bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal/30 text-gray-600"
                />
              </div>
            </div>

            {/* Nav link rows */}
            <div className="divide-y divide-gray-100">
              {localLinks.map((link, idx) => (
                <div key={idx} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500">
                    {link.icon}
                  </span>
                  {editingLinkIdx === idx ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={link.label}
                        onChange={e => handleLinkLabelChange(idx, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs font-sans bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal/30"
                        autoFocus
                        onBlur={() => setEditingLinkIdx(null)}
                      />
                      <input
                        type="text"
                        value={link.href}
                        onChange={e => handleLinkHrefChange(idx, e.target.value)}
                        className="w-32 px-2.5 py-1.5 text-xs font-mono bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal/30 text-gray-500"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-xs font-medium text-charcoal truncate">{link.label}</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-[9px] text-gray-400 truncate">{link.href}</p>
                        {link.iconKey && (
                          <span className="font-mono text-[8px] text-gray-300 bg-gray-100 px-1 rounded">icon:{link.iconKey}</span>
                        )}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setEditingLinkIdx(editingLinkIdx === idx ? null : idx)}
                    className="flex-shrink-0 w-6 h-6 rounded-md bg-gray-100 hover:bg-charcoal/10 text-gray-400 hover:text-charcoal flex items-center justify-center transition-colors cursor-pointer"
                    title="Edit link"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M7 1L9 3L3 9H1V7L7 1Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: icon legend */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
              <div className="w-3 h-3 text-gray-400">
                <svg viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.1"/><path d="M4.5 5C4.5 4.17 5.17 3.5 6 3.5C6.83 3.5 7.5 4.17 7.5 5C7.5 5.83 6.83 6.5 6 7V7.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><circle cx="6" cy="9" r="0.6" fill="currentColor"/></svg>
              </div>
              <p className="font-sans text-xs font-semibold text-charcoal flex-1">Icon Reference</p>
              <span className="text-[9px] font-mono text-gray-400">{localLinks.length} nav icons</span>
            </div>
            <div className="p-4">
              <p className="font-mono text-[9px] text-gray-400 uppercase tracking-wider mb-3">Nav Link Icons</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {localLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition-colors">
                    <span className="text-charcoal">{link.icon}</span>
                    <div>
                      <p className="font-sans text-[10px] font-medium text-charcoal leading-tight">{link.label}</p>
                      {link.iconKey && <p className="font-mono text-[8px] text-gray-400">{link.iconKey}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <p className="font-mono text-[9px] text-gray-400 uppercase tracking-wider mb-1.5">Menu Personality</p>
                <p className="font-sans text-[10px] text-gray-500 leading-relaxed">{currentConfig?.menuPersonality ?? "—"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ TAB: SECTIONS ══════════════ */}
      {innerTab === "sections" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Section card list (2/3 width) */}
          <div className="xl:col-span-2 flex flex-col gap-2.5">
            {localSections.map((section, idx) => (
              <SectionPreviewCard
                key={section.key}
                section={section}
                idx={idx}
                onToggle={handleToggleSection}
                onMoveUp={handleMoveSectionUp}
                onMoveDown={handleMoveSectionDown}
                isLast={idx === localSections.length - 1}
              />
            ))}
          </div>

          {/* Wireframe structure preview (1/3 width) */}
          <div className="xl:col-span-1">
            <SectionStructurePreview
              sections={localSections}
              presetId={selectedPresetId}
            />
          </div>
        </div>
      )}

      {/* ══════════════ TAB: ICONS ══════════════ */}
      {innerTab === "icons" && (
        <IconShowcase iconSet={currentConfig?.iconSet ?? []} />
      )}

      {/* ── Save bar ── */}
      <div className="flex items-center justify-between pt-1 gap-3 flex-wrap">
        <div>
          <p className="font-sans text-[10px] text-gray-400">
            Changes persist to the database and update the live nav instantly.
          </p>
          {loadingOverrides && (
            <p className="font-mono text-[9px] text-amber-500 mt-0.5">Loading saved overrides…</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-sans text-gray-400 border border-gray-200 rounded-xl hover:border-gray-400 transition-all cursor-pointer disabled:opacity-40"
            title="Reset this theme back to the static defaults"
          >
            <ArrowCounterClockwise size={12} /> Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-sans font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-60 ${saved ? "bg-emerald-500 text-white" : "bg-charcoal text-white hover:bg-gray-800"}`}
          >
            {saving ? (
              <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
            ) : saved ? (
              <><Check size={13} weight="bold" /> Saved to DB!</>
            ) : (
              <><FloppyDisk size={13} weight="bold" /> Save Menu &amp; Sections</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
