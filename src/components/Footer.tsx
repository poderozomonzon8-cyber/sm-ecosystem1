import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { InstagramLogo, YoutubeLogo, FacebookLogo, TiktokLogo, ArrowUpRight } from "@phosphor-icons/react";
import { useTheme } from "@/contexts/ThemeContext";

const LINKS = {
  Company: [
    { label: "About Us",    href: "/about"     },
    { label: "Services",    href: "/services"  },
    { label: "Portfolio",   href: "/portfolio" },
    { label: "Blog",        href: "/blog"      },
    { label: "Contact",     href: "/contact"   },
  ],
  Explore: [
    { label: "SM Store",        href: "/store"        },
    { label: "SM Collection",   href: "/store"        },
    { label: "Community",       href: "/community"    },
    { label: "Maintenance",     href: "/maintenance"  },
    { label: "Academy",         href: "/academy"      },
  ],
  Legal: [
    { label: "Privacy Policy",   href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy",    href: "#" },
    { label: "Sitemap",          href: "#" },
  ],
};

const SOCIALS = [
  { Icon: InstagramLogo, label: "Instagram", href: "#" },
  { Icon: YoutubeLogo,   label: "YouTube",   href: "#" },
  { Icon: TiktokLogo,    label: "TikTok",    href: "#" },
  { Icon: FacebookLogo,  label: "Facebook",  href: "#" },
];

/* ═══════════════════════════════════════════════════════
   FOOTER PARTICLE CANVAS — theme-driven ambient particles
   ═══════════════════════════════════════════════════════ */
function FooterParticles({ preset, density }: { preset: string | null; density: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const getParticleColor = (preset: string | null) => {
    if (preset === "hardscape-landscape")     return [80, 200, 80];
    if (preset === "construction-renovation") return [200, 163, 64];
    if (preset === "maintenance-service")     return [80, 160, 220];
    return [212, 160, 23];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const [r, g, b] = getParticleColor(preset);
    const count = Math.floor(density * 0.6);

    /* Hardscape: stone/dust chunks */
    /* Construction: blueprint fine dots + architectural lines */
    /* Maintenance: soft round blobs */

    type Particle = {
      x: number; y: number;
      vx: number; vy: number;
      size: number; opacity: number;
      life: number; maxLife: number;
      shape: "circle" | "rect" | "diamond";
    };

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.5 + 0.15),
      size: Math.random() * 2.5 + 0.6,
      opacity: Math.random() * 0.5 + 0.1,
      life: Math.random() * 200,
      maxLife: 160 + Math.random() * 80,
      shape: preset === "hardscape-landscape"    ? "rect"    :
             preset === "construction-renovation"? "diamond" : "circle",
    }));

    let running = true;
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* Blueprint grid lines for construction */
      if (preset === "construction-renovation") {
        ctx.strokeStyle = `rgba(${r},${g},${b},0.04)`;
        ctx.lineWidth = 0.5;
        for (let x = 0; x < canvas.width; x += 40) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 40) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }
      }

      /* Stone texture strokes for hardscape */
      if (preset === "hardscape-landscape") {
        ctx.strokeStyle = `rgba(${r},${g},${b},0.03)`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
          const y = 20 + i * 30;
          ctx.beginPath();
          for (let x = 0; x < canvas.width; x += 60) {
            ctx.moveTo(x, y + Math.sin(x * 0.05) * 4);
            ctx.lineTo(x + 55, y + Math.sin((x + 55) * 0.05) * 4);
          }
          ctx.stroke();
        }
      }

      particles.forEach(p => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.life++;

        const progress = p.life / p.maxLife;
        const fade = progress < 0.15 ? progress / 0.15 : progress > 0.75 ? (1 - progress) / 0.25 : 1;
        const alpha = p.opacity * fade;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${r},${g},${b})`;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "rect") {
          ctx.fillRect(p.x - p.size * 0.7, p.y - p.size * 0.5, p.size * 1.4, p.size);
        } else {
          /* diamond */
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.size);
          ctx.lineTo(p.x + p.size * 0.7, p.y);
          ctx.lineTo(p.x, p.y + p.size);
          ctx.lineTo(p.x - p.size * 0.7, p.y);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        if (p.life >= p.maxLife || p.y < -10) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.life = 0;
          p.maxLife = 160 + Math.random() * 80;
          p.vx = (Math.random() - 0.5) * 0.4;
          p.vy = -(Math.random() * 0.5 + 0.15);
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [preset, density]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
      aria-hidden="true"
    />
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subDone, setSubDone] = useState(false);
  const { themeSettings, activePresetId, liveTheme, isNightMode } = useTheme();

  // Logo final (según tu ThemeContext)
  const activeFooterLogo = liveTheme?.footerLogo ?? themeSettings?.footerLogo;

  const handleSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubDone(true);
      setEmail("");
    }
  };

  /* Resolve footer accent colors from settings */
  const footerBg     = themeSettings.footerGradient !== "none" ? themeSettings.footerGradient : liveTheme["--theme-footer-bg"];
  const accentColor  = themeSettings.footerAccentColor || liveTheme["--theme-accent"];
  const borderColor  = themeSettings.footerBorderColor || "rgba(255,255,255,0.05)";
  const textColor    = liveTheme["--theme-footer-text"];

  /* Night mode footer darkens further */
  const nightShift = isNightMode ? "brightness(0.75)" : undefined;

  return (
    <footer
      className="relative border-t overflow-hidden"
      style={{
        background: footerBg,
        borderColor,
        filter: nightShift,
      }}
      aria-label="Site footer"
    >
      {/* Cinematic footer particles */}
      {themeSettings.footerParticlesEnabled && (
        <FooterParticles preset={activePresetId} density={themeSettings.footerParticleDensity} />
      )}

      {/* Hardscape: stone texture shimmer line */}
      {activePresetId === "hardscape-landscape" && (
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} aria-hidden="true" />
      )}

      {/* Construction: blueprint grid overlay */}
      {activePresetId === "construction-renovation" && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(200,163,64,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(200,163,64,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden="true"
        />
      )}

      {/* Maintenance: clean top accent gradient */}
      {activePresetId === "maintenance-service" && (
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} aria-hidden="true" />
      )}

      {/* Accent line sweep animation */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none theme-anim-accent-line"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`, opacity: 0.5 }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-10 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group focus:outline-none">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden"
                style={{
                  border: "none",
                  background: "transparent",
                  width: "2.5rem",
                  height: "2.5rem",
                }}
              >
                <img
                  src={activeFooterLogo?.url || "https://c.animaapp.com/mmslviois4xSNv/img/uploaded-asset-1773625307363-0.png"}
                  alt="Aménagement Monzon Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <span className="font-headline font-bold text-[15px]" style={{ color: textColor ? `color-mix(in srgb, ${textColor} 85%, white)` : "hsl(36,20%,97%)" }}>
                Aménagement<span style={{ color: accentColor }}> Monzon</span>
              </span>
            </Link>
            <p className="font-sans text-sm leading-relaxed max-w-xs mb-6" style={{ color: textColor, opacity: 0.65 }}>
              Premium construction, renovation, landscaping, and maintenance services. Crafting spaces with a cinematic touch since 2015.
            </p>
            <div className="flex gap-2.5">
              {SOCIALS.map(({ Icon, label, href }) => (
                <a
  key={label}
  href={href}
  aria-label={label}
  className="
    w-9 h-9 rounded-xl flex items-center justify-center
    transition-all duration-200 hover:scale-110 group
    focus:outline-none focus-visible:ring-2
  "
  style={{
    background: "rgba(255,255,255,0.05)",
    border: `1px solid rgba(255,255,255,0.07)`,
    color: "rgba(255,255,255,0.35)",
    "--tw-ring-color": accentColor,
  } as React.CSSProperties}
  onMouseEnter={e => {
    e.currentTarget.style.background = accentColor;
    e.currentTarget.style.color = "white";
  }}
  onMouseLeave={e => {
    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
    e.currentTarget.style.color = "rgba(255,255,255,0.35)";
  }}
>
  <Icon size={16} weight="fill" />
</a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(LINKS).map(([cat, links]) => (
            <div key={cat}>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] mb-5" style={{ color: textColor, opacity: 0.4 }}>{cat}</h3>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href}
                      className="font-sans text-sm transition-all duration-200 focus:outline-none hover:pl-1"
                      style={{ color: textColor, opacity: 0.55 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = accentColor; (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = textColor ?? ""; (e.currentTarget as HTMLElement).style.opacity = "0.55"; }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t pt-10 mb-10" style={{ borderColor }}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="font-headline font-bold text-base mb-1" style={{ color: "hsl(36,20%,97%)" }}>Stay Updated</h3>
              <p className="font-sans text-sm" style={{ color: textColor, opacity: 0.55 }}>Subscribe for project reveals, industry insights, and exclusive offers.</p>
            </div>
            {subDone ? (
              <p className="font-sans text-sm flex items-center gap-2" style={{ color: accentColor }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${accentColor}20` }}>✓</span>
                You're subscribed!
              </p>
            ) : (
              <form onSubmit={handleSub} className="flex gap-2 w-full md:w-auto">
                <input
                  type="email" placeholder="your@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required
                  className="flex-1 md:w-64 px-4 py-2.5 text-sm font-sans rounded-xl outline-none transition-all duration-200 focus:ring-2"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid rgba(255,255,255,0.08)`,
                    color: "hsl(36,20%,97%)",
                  }}
                  aria-label="Email for newsletter"
                />
                <button type="submit"
                  className="px-4 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg flex items-center gap-1.5 text-sm font-semibold"
                  style={{ background: accentColor, color: activePresetId === "construction-renovation" ? "hsl(220,20%,10%)" : "#fff" }}
                >
                  Subscribe <ArrowUpRight size={14} weight="bold" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor }}>
          <p className="font-sans text-xs" style={{ color: textColor, opacity: 0.4 }}>© {new Date().getFullYear()} Aménagement Monzon. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about/company" className="font-sans text-xs transition-colors duration-200"
              style={{ color: textColor, opacity: 0.4 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = accentColor}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = textColor ?? ""; (e.currentTarget as HTMLElement).style.opacity = "0.4"; }}
            >Our Story</Link>
            <Link to="/academy" className="font-sans text-xs transition-colors duration-200"
              style={{ color: textColor, opacity: 0.4 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = accentColor}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = textColor ?? ""; (e.currentTarget as HTMLElement).style.opacity = "0.4"; }}
            >Academy</Link>
            <p className="font-mono text-xs" style={{ color: textColor, opacity: 0.25 }}>Crafted in Montreal, QC</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
