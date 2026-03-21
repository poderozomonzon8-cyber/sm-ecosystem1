import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { List, X, ArrowUpRight, UserCircle, CaretDown } from "@phosphor-icons/react";
import { useAppAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
// import { useQuery } from "@/lib/supabase"; // REMOVED
import UserMenu from "@/components/auth/UserMenu";
import LoginModal from "@/components/auth/LoginModal";
import { WhichAreYourNeedsButton } from "@/components/ServiceSelector";
import { DEFAULT_NAV_LINKS, ThemeNavLink } from "@/config/ThemeNavConfig";
import { useNavOverrides } from "@/hooks/useNavOverride";
import { useQuery } from "@tanstack/react-query";

/* ── Collapsible desktop nav with a single dropdown ── */
function DesktopNav({
  navLinks,
  isActive,
  accentColor,
  headerText,
  isLightHeader,
  headerMenuSpacing,
  fontBody,
}: {
  navLinks: ThemeNavLink[];
  isActive: (href: string) => boolean;
  accentColor: string;
  headerText: string;
  isLightHeader: boolean;
  headerMenuSpacing: string;
  fontBody: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Separate "always visible" anchors from the dropdown list */
  const alwaysVisible = navLinks.filter((l) =>
    ["/", "/contact"].includes(l.href)
  );
  const dropdownLinks = navLinks.filter(
    (l) => !["/", "/contact"].includes(l.href)
  );

  const anyActive = dropdownLinks.some((l) => isActive(l.href));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const linkStyle = (active: boolean) => ({
    padding: `0.5rem ${headerMenuSpacing || "0.75rem"}`,
    fontSize: "0.75rem",
    fontFamily: fontBody,
    fontWeight: 300,
    letterSpacing: "0.04em",
    color: active ? accentColor : headerText,
    opacity: active ? 1 : isLightHeader ? 0.65 : 0.55,
  });

  return (
    <nav className="hidden md:flex items-center gap-0" aria-label="Main navigation">
      {/* Always-visible links (Home) */}
      {alwaysVisible
        .filter((l) => l.href === "/")
        .map((link) => (
          <Link
            key={link.label}
            to={link.href}
            className="relative flex items-center gap-1.5 uppercase group focus:outline-none transition-all duration-300"
            style={linkStyle(isActive(link.href))}
          >
            <span
              className="flex-shrink-0 transition-all duration-300"
              style={{ color: isActive(link.href) ? accentColor : headerText, opacity: isActive(link.href) ? 0.85 : 0 }}
              aria-hidden="true"
            >
              {link.icon}
            </span>
            {link.label}
            {isActive(link.href) && (
              <span className="absolute bottom-0 h-px" style={{ left: headerMenuSpacing || "0.75rem", right: headerMenuSpacing || "0.75rem", background: `linear-gradient(90deg,transparent,${accentColor}90,transparent)` }} />
            )}
          </Link>
        ))}

      {/* Dropdown trigger */}
      {dropdownLinks.length > 0 && (
        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative flex items-center gap-1.5 uppercase group focus:outline-none transition-all duration-300 cursor-pointer"
            style={linkStyle(anyActive || open)}
            aria-expanded={open}
            aria-haspopup="true"
          >
            Services
            <CaretDown
              size={11}
              weight="bold"
              className="transition-transform duration-300"
              style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", opacity: 0.7 }}
            />
            {anyActive && (
              <span className="absolute bottom-0 h-px" style={{ left: headerMenuSpacing || "0.75rem", right: headerMenuSpacing || "0.75rem", background: `linear-gradient(90deg,transparent,${accentColor}90,transparent)` }} />
            )}
          </button>

          {/* Dropdown panel */}
          <div
            className={[
              "absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-50 transition-all duration-250 origin-top",
              open ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none",
            ].join(" ")}
            style={{ minWidth: "210px" }}
          >
            {/* Arrow notch */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
              style={{ background: isLightHeader ? "rgba(255,255,255,0.96)" : "rgba(20,22,28,0.97)", border: `1px solid ${isLightHeader ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`, clipPath: "polygon(0 0,100% 0,100% 100%)" }}
            />
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: isLightHeader ? "rgba(255,255,255,0.96)" : "rgba(20,22,28,0.97)",
                border: `1px solid ${isLightHeader ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
                boxShadow: "0 16px 48px rgba(0,0,0,0.28)",
                backdropFilter: "blur(20px)",
              }}
            >
              {dropdownLinks.map((link, i) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 transition-all duration-200 group focus:outline-none"
                  style={{
                    borderBottom: i < dropdownLinks.length - 1 ? `1px solid ${isLightHeader ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}` : "none",
                    background: isActive(link.href) ? `${accentColor}12` : "transparent",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${accentColor}10`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = isActive(link.href) ? `${accentColor}12` : "transparent"; }}
                >
                  <span
                    className="flex-shrink-0 transition-colors duration-200"
                    style={{ color: isActive(link.href) ? accentColor : isLightHeader ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.35)" }}
                    aria-hidden="true"
                  >
                    {link.icon}
                  </span>
                  <span
                    className="text-[0.7rem] font-sans font-light tracking-[0.05em] uppercase flex-1"
                    style={{ color: isActive(link.href) ? accentColor : isLightHeader ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.75)" }}
                  >
                    {link.label}
                  </span>
                  {isActive(link.href) && (
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: accentColor }} />
                  )}
                  {link.badge && (
                    <span className="px-1 py-0.5 text-[8px] font-mono tracking-wider uppercase leading-none" style={{ background: `${accentColor}20`, color: accentColor }}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact link — always visible */}
      {alwaysVisible
        .filter((l) => l.href === "/contact")
        .map((link) => (
          <Link
            key={link.label}
            to={link.href}
            className="relative flex items-center gap-1.5 uppercase group focus:outline-none transition-all duration-300"
            style={linkStyle(isActive(link.href))}
          >
            <span
              className="flex-shrink-0 transition-all duration-300"
              style={{ color: isActive(link.href) ? accentColor : headerText, opacity: isActive(link.href) ? 0.85 : 0 }}
              aria-hidden="true"
            >
              {link.icon}
            </span>
            {link.label}
            {isActive(link.href) && (
              <span className="absolute bottom-0 h-px" style={{ left: headerMenuSpacing || "0.75rem", right: headerMenuSpacing || "0.75rem", background: `linear-gradient(90deg,transparent,${accentColor}90,transparent)` }} />
            )}
          </Link>
        ))}
    </nav>
  );
}

export default function HeaderNav() {
  const [hidden,      setHidden]      = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [loginModal,  setLoginModal]  = useState<"client"|"admin"|null>(null);
  const lastScrollY   = useRef(0);
  const mobileRef     = useRef<HTMLDivElement>(null);
  const location      = useLocation();
  const { isAnonymous, isAdmin, isStaff } = useAppAuth();
  const { activeNavConfig, themeSettings, liveTheme, activePresetId, isNightMode } = useTheme();
  /* Merge DB overrides on top of static nav config */
  const navOverrides = useNavOverrides();
  const resolvedNavConfig = activePresetId ? (navOverrides.get(activePresetId) ?? activeNavConfig) : activeNavConfig;

  /* Resolve the nav links — use theme-specific config if available */
  const navLinks: ThemeNavLink[] = resolvedNavConfig?.navLinks ?? DEFAULT_NAV_LINKS;
  const ctaLabel = resolvedNavConfig?.ctaLabel ?? "Start a Project";
  const ctaHref  = resolvedNavConfig?.ctaHref  ?? "/contact";

  /* Theme-specific header styles */
  const headerBg = liveTheme["--theme-header-bg"] ?? "hsl(220,22%,5%)";
  const headerText = liveTheme["--theme-header-text"] ?? "hsl(0,0%,100%)";
  const accentColor = themeSettings.headerIconColor || liveTheme["--theme-accent"] || "hsl(42,90%,52%)";
  const logoColor = themeSettings.headerLogoColor || liveTheme["--theme-accent"] || "hsl(42,90%,52%)";
  const headerShadow = themeSettings.headerShadow;
  const headerBlur = themeSettings.headerBlur;

  const { data: logoAssets } = useQuery("LogoAsset" as any);
  const activeLightLogo = (logoAssets as any[])?.find((l: any) => l.type === "light" && l.active === "yes");
  const activeDarkLogo  = (logoAssets as any[])?.find((l: any) => l.type === "dark"  && l.active === "yes");

  /* Maintenance theme has a light header */
  const isLightHeader = activePresetId === "maintenance-service";
  /* Use light logo on dark headers, dark logo on light (maintenance) header */
  const activeLogoUrl = isLightHeader ? (activeDarkLogo?.url || activeLightLogo?.url) : activeLightLogo?.url;
  /* Night mode dims the header slightly */
  const nightFilter = isNightMode ? "brightness(0.88)" : undefined;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 250 && y > lastScrollY.current);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) setMobileOpen(false);
    };
    if (mobileOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (href: string) => location.pathname === href;
  const isHome   = location.pathname === "/";

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out safe-top",
        hidden ? "-translate-y-full" : "translate-y-0",
      ].join(" ")}
      style={{
        minHeight: "var(--nav-height)",
        background: headerBg,
        boxShadow: headerShadow,
        backdropFilter: `blur(${headerBlur}px) saturate(180%)`,
        WebkitBackdropFilter: `blur(${headerBlur}px) saturate(180%)`,
        borderBottom: themeSettings.headerBorderVisible
          ? `1px solid ${isLightHeader ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)"}`
          : "1px solid transparent",
        filter: nightFilter,
      }}
    >
      {/* Construction: blueprint fine-line decoration */}
      {activePresetId === "construction-renovation" && (
        <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }}
          aria-hidden="true"
        />
      )}
      {/* Hardscape: stone-texture gradient overlay */}
      {activePresetId === "hardscape-landscape" && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 1px, transparent 0, transparent 50%)", backgroundSize: "6px 6px" }}
          aria-hidden="true"
        />
      )}
      <div className="max-w-[1320px] mx-auto px-8 md:px-12 flex items-center justify-between h-[76px]">

        {/* Logo — editorial wordmark */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-none"
          aria-label="Go to home"
        >
          <div
            className="relative w-10 h-10 flex items-center justify-center backdrop-blur-sm overflow-hidden transition-all duration-500"
            style={{
              border: "none",
              background: "transparent",
              borderRadius: liveTheme["--theme-card-radius"] ?? "0.25rem",
            }}
          >
            <img
              src={activeLogoUrl || "https://c.animaapp.com/mmslviois4xSNv/img/uploaded-asset-1773625307363-0.png"}
              alt="Aménagement Monzon Logo"
              className="w-full h-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          <div className="flex flex-col leading-none gap-0.5">
            <span
              className="font-headline font-light text-[16px] tracking-[0.04em] leading-none"
              style={{ color: headerText }}
            >
              Aménagement<span style={{ color: logoColor, fontWeight: 400 }}> Monzon</span>
            </span>
            <span className="font-mono text-[9px] tracking-[0.22em] uppercase leading-none hidden sm:block" style={{ color: headerText, opacity: 0.3 }}>
              {activePresetId === "hardscape-landscape"
                ? "Hardscape · Landscape"
                : activePresetId === "construction-renovation"
                ? "Construction · Rénovation"
                : activePresetId === "maintenance-service"
                ? "Service · Maintenance"
                : "Construction · Signature"}
            </span>
          </div>
        </Link>

        {/* Desktop nav — theme-aware, architectural */}
        <DesktopNav
          navLinks={navLinks}
          isActive={isActive}
          accentColor={accentColor}
          headerText={headerText}
          isLightHeader={isLightHeader}
          headerMenuSpacing={themeSettings.headerMenuSpacing}
          fontBody={liveTheme["--theme-font-body"]}
        />

        {/* CTA — refined, theme-aware */}
        <div className="hidden md:flex items-center gap-2">
          {isAnonymous ? (
            <>
              <button
                onClick={() => setLoginModal("client")}
                className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-sans font-light tracking-[0.04em] uppercase cursor-pointer transition-colors duration-300 focus:outline-none"
                style={{ color: headerText, opacity: 0.5 }}
              >
                <UserCircle size={14} weight="thin" /> Sign In
              </button>
              <Link
                to="/register"
                className="px-3 py-2 text-[12px] font-sans font-light tracking-[0.04em] uppercase transition-colors duration-300 focus:outline-none"
                style={{ color: headerText, opacity: 0.5 }}
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {(isAdmin || isStaff) && (
                <Link
                  to="/admin"
                  className="px-3 py-2 text-[12px] font-sans font-light tracking-[0.04em] uppercase transition-all duration-300 focus:outline-none"
                  style={{ color: headerText, opacity: 0.45 }}
                >
                  Admin
                </Link>
              )}
              <Link
                to="/portal"
                className="px-3 py-2 text-[12px] font-sans font-light tracking-[0.04em] uppercase transition-all duration-300"
                style={{ color: headerText, opacity: 0.45 }}
              >
                Portal
              </Link>
              <UserMenu />
            </>
          )}
          <WhichAreYourNeedsButton />

          <Link
            to={ctaHref}
            className="inline-flex items-center gap-2 focus:outline-none group transition-all duration-300"
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "0.6875rem",
              fontFamily: liveTheme["--theme-font-body"],
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: liveTheme["--theme-btn-bg"],
              color: liveTheme["--theme-btn-text"],
              borderRadius: liveTheme["--theme-btn-radius"] ?? "0.25rem",
            }}
          >
            {ctaLabel}
            <ArrowUpRight size={13} weight="regular" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          <WhichAreYourNeedsButton />

          <button
            className="relative w-10 h-10 flex items-center justify-center text-warm-white rounded-xl glass focus:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${mobileOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-90"}`}>
              <X size={20} weight="regular" />
            </span>
            <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${mobileOpen ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"}`}>
              <List size={20} weight="regular" />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        ref={mobileRef}
        className={["md:hidden overflow-hidden transition-all duration-500 ease-in-out", mobileOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"].join(" ")}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="glass-dark border-t border-white/5 px-6 py-6 flex flex-col gap-1">
          {/* Theme indicator badge */}
          {activeNavConfig && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span className="font-mono text-[9px] tracking-widest text-gold/60 uppercase">
                {activeNavConfig.presetId.replace(/-/g, " ")}
              </span>
            </div>
          )}
          {navLinks.map((link, i) => (
            <Link
              key={link.label}
              to={link.href}
              style={{ transitionDelay: mobileOpen ? `${i * 40}ms` : "0ms" }}
              className={[
                "flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-base font-sans font-medium transition-all duration-300 focus:outline-none",
                isActive(link.href) ? "bg-gold/10 text-gold border border-gold/20" : "text-gray-300 hover:bg-white/5 hover:text-warm-white border border-transparent",
              ].join(" ")}
            >
              {/* Icon */}
              <span className={isActive(link.href) ? "text-gold" : "text-gray-500"} aria-hidden="true">
                {link.icon}
              </span>
              <span className="flex-1">{link.label}</span>
              {isActive(link.href) && <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />}
            </Link>
          ))}
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-3">
            <Link to={ctaHref} className="w-full text-center px-5 py-3.5 text-base font-sans font-medium bg-gold text-charcoal rounded-xl transition-all duration-300 hover:bg-gold-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-gold">
              {ctaLabel}
            </Link>
            {isAnonymous ? (
              <>
                <button onClick={() => { setMobileOpen(false); setLoginModal("client"); }}
                  className="w-full text-center px-5 py-3 text-sm font-sans font-medium text-gray-300 hover:text-warm-white rounded-xl transition-colors duration-200 cursor-pointer border border-gray-700/30">
                  Sign In
                </button>
                <Link to="/register" className="w-full text-center px-5 py-3 text-sm font-sans font-medium text-gray-400 hover:text-warm-white rounded-xl transition-colors duration-200">
                  Create Account
                </Link>
              </>
            ) : (
              <>
                <Link to="/portal" className="w-full text-center px-5 py-3 text-sm font-sans font-medium text-gray-400 hover:text-warm-white rounded-xl transition-colors duration-200">
                  Client Portal
                </Link>
                {(isAdmin || isStaff) && (
                  <Link to="/admin" className="w-full text-center px-5 py-3 text-sm font-sans font-medium text-gray-400 hover:text-warm-white rounded-xl transition-colors duration-200">
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {loginModal && <LoginModal mode={loginModal} onClose={() => setLoginModal(null)} />}
    </header>
  );
}
