import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useSplash } from "@/contexts/SplashContext";

/* ── Shared service definitions (single source of truth) ── */
export const SERVICES = [
  {
    id: "hardscape",
    label: "Hardscape / Landscape",
    sublabel: "Pavé · Patios · Retaining Walls",
    themePresetId: "hardscape-landscape",
    destination: "/",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="12" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="12" y="12" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="7" y="4" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    accent: "hsl(138,60%,38%)",
  },
  {
    id: "construction",
    label: "Construction / Renovation",
    sublabel: "Rénovation · Additions · Structural",
    themePresetId: "construction-renovation",
    destination: "/",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 18V9l7-5 7 5v9" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <rect x="8" y="13" width="6" height="5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    accent: "hsl(38,70%,54%)",
  },
  {
    id: "maintenance",
    label: "Maintenance / Service Plans",
    sublabel: "Plans mensuels · Saisonniers · Commercial",
    themePresetId: "maintenance-service",
    destination: "/maintenance",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M11 7v4l3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    accent: "hsl(205,70%,54%)",
  },
] as const;

/* ══════════════════════════════════════════════════════════
   FULL-SCREEN MOBILE SLIDE-UP PANEL
   ══════════════════════════════════════════════════════════ */
function MobilePanel({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm md:hidden"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transition: "opacity 0.38s ease",
        }}
        onClick={onClose}
      />
      {/* Bottom slide-up panel */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[9991] md:hidden p-4 pb-4 pt-0"
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
          opacity: open ? 1 : 0,
        }}
      >
        <div className="glass-dark rounded-2xl w-full max-w-md max-h-[70vh] pt-6 pb-10 px-6 flex flex-col h-fit shadow-2xl">
          {/* Handle bar arriba */}
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6 self-start" />

          <div className="mb-5 flex-1">
            <p className="font-mono text-[10px] tracking-[0.28em] text-gold/60 uppercase mb-1">
              Bienvenue · Welcome
            </p>
            <h3 className="font-headline text-warm-white text-[1.4rem] font-light">
              Which are your needs?
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {SERVICES.map((svc, i) => (
              <button
                key={svc.id}
                onClick={() => onSelect(svc.id)}
                className="group w-full text-left flex items-center gap-4 px-4 py-4 rounded-xl border border-white/[0.07] bg-white/[0.03] active:bg-white/[0.08] transition-all duration-300"
                style={{ transitionDelay: open ? `${i * 60}ms` : "0ms" }}
              >
                <span className="shrink-0 w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-active:border-gold/40">
                  {svc.icon}
                </span>
                <div className="flex flex-col">
                  <span className="font-headline text-warm-white text-[1.1rem] font-medium leading-tight">
                    {svc.label}
                  </span>
                  <span className="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 mt-0.5">
                    {svc.sublabel}
                  </span>
                </div>
                <svg className="ml-auto shrink-0 text-gray-600 group-active:text-gold transition-colors" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 9H14M9.5 5L14 9L9.5 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square"/>
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   DESKTOP DROPDOWN
   ══════════════════════════════════════════════════════════ */
function DesktopDropdown({
  open,
  onSelect,
}: {
  open: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className="absolute top-[calc(100%+10px)] right-0 w-[340px] hidden md:block"
      style={{
        opacity: open ? 1 : 0,
        transform: open ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.98)",
        pointerEvents: open ? "all" : "none",
        transition: "opacity 0.32s cubic-bezier(0.16,1,0.3,1), transform 0.32s cubic-bezier(0.16,1,0.3,1)",
        transformOrigin: "top right",
        zIndex: 9900,
      }}
    >
      <div
        className="rounded-xl overflow-hidden shadow-deep"
        style={{
          background: "rgba(10,12,18,0.97)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(32px)",
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-white/5">
          <p className="font-mono text-[9.5px] tracking-[0.28em] text-gold/55 uppercase mb-1">
            Bienvenue · Welcome
          </p>
          <p className="font-headline text-warm-white/90 text-[1.15rem] font-light">
            Which are your needs?
          </p>
        </div>

        {/* Options */}
        <div className="p-3 flex flex-col gap-1.5">
          {SERVICES.map((svc, i) => (
            <button
              key={svc.id}
              onClick={() => onSelect(svc.id)}
              className="group w-full text-left flex items-center gap-3.5 px-3.5 py-3 rounded-lg hover:bg-white/[0.055] transition-all duration-250 focus:outline-none"
              style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
            >
              {/* Icon */}
              <span
                className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(200,200,200,0.65)",
                }}
              >
                {svc.icon}
              </span>

              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-headline text-warm-white/90 text-[1rem] font-medium leading-tight group-hover:text-warm-white transition-colors">
                  {svc.label}
                </span>
                <span className="font-mono text-[0.58rem] tracking-[0.16em] uppercase text-gray-500 mt-0.5 group-hover:text-gray-400 transition-colors">
                  {svc.sublabel}
                </span>
              </div>

              <svg
                className="shrink-0 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300 text-gold/70"
                width="16" height="16" viewBox="0 0 16 16" fill="none"
              >
                <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square"/>
              </svg>
            </button>
          ))}
        </div>

        {/* Footer rule */}
        <div className="h-px mx-3 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="px-5 py-3">
          <p className="font-mono text-[8.5px] tracking-[0.22em] text-gray-600 uppercase">
            Aménagement Monzon · Montréal
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT — ServiceSelector hook + trigger component
   ══════════════════════════════════════════════════════════ */
export function useServiceSelector() {
  const { applyPreset, saveTheme, presets } = useTheme();
  const navigate = useNavigate();

  const handleSelect = useCallback((serviceId: string) => {
    const svc = SERVICES.find(s => s.id === serviceId);
    if (!svc) return;
    const preset = presets.find(p => p.id === svc.themePresetId);
    if (preset) { applyPreset(preset); saveTheme(); }
    navigate(svc.destination);
  }, [applyPreset, saveTheme, presets, navigate]);

  return { handleSelect };
}

/* ══════════════════════════════════════════════════════════
   HEADER BUTTON — "Which are your needs"
   Renders desktop dropdown + mobile slide-up
   ══════════════════════════════════════════════════════════ */
export function WhichAreYourNeedsButton() {
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  // Force closed on mount
  useEffect(() => {
    setMobileOpen(false);
  }, []);
  const [hovered, setHovered] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { handleSelect } = useServiceSelector();

  /* Close desktop dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setDesktopOpen(false);
      }
    };
    if (desktopOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [desktopOpen]);

  const onSelect = useCallback((id: string) => {
    setDesktopOpen(false);
    setMobileOpen(false);
    handleSelect(id);
  }, [handleSelect]);

  return (
    <>
      <div ref={wrapRef} className="relative">
        {/* Desktop button */}
        <button
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-[11.5px] font-sans font-light tracking-[0.08em] uppercase transition-all duration-300 focus:outline-none cursor-pointer group"
          style={{
            color: hovered || desktopOpen ? "rgba(212,160,23,0.95)" : "rgba(200,200,200,0.65)",
            border: `1px solid ${hovered || desktopOpen ? "rgba(212,160,23,0.28)" : "rgba(255,255,255,0.08)"}`,
            background: desktopOpen ? "rgba(212,160,23,0.07)" : hovered ? "rgba(255,255,255,0.04)" : "transparent",
            transition: "all 0.28s ease",
          }}
          onClick={() => setDesktopOpen(o => !o)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-expanded={desktopOpen}
          aria-label="Open service selector"
        >
          {/* Grid icon */}
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="0.75" y="0.75" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="7.75" y="0.75" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="0.75" y="7.75" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="7.75" y="7.75" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
          </svg>

          <span>Which are your needs</span>

          {/* Chevron */}
          <svg
            width="10" height="10" viewBox="0 0 10 10" fill="none"
            style={{
              transform: desktopOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.28s ease",
            }}
          >
            <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Desktop dropdown */}
        <DesktopDropdown open={desktopOpen} onSelect={onSelect} />
      </div>

      {/* Mobile icon button */}
      <button
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-gray-400 hover:border-gold/30 hover:text-gold/80 transition-all duration-300 focus:outline-none cursor-pointer"
        onClick={() => setMobileOpen(o => !o)}
        aria-expanded={mobileOpen}
        aria-label="Which are your needs — choose service"
        title="Which are your needs"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="5.5" height="5.5" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="9.5" y="1" width="5.5" height="5.5" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="1" y="9.5" width="5.5" height="5.5" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
        </svg>
      </button>

      {/* Mobile slide-up panel (portaled to body via fixed positioning) */}
      <MobilePanel open={mobileOpen} onClose={() => setMobileOpen(false)} onSelect={onSelect} />
    </>
  );
}
