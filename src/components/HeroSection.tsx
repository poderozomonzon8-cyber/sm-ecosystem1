import { useEffect, useRef, useState } from "react";
import { ArrowDown, Play, Pause } from "@phosphor-icons/react";
import { useTheme } from "@/contexts/ThemeContext";

const STATS = [
  { value: "250+", label: "Projects Completed" },
  { value: "8+",   label: "Years of Excellence" },
  { value: "100%", label: "Client Satisfaction" },
];

export default function HeroSection() {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const textRef     = useRef<HTMLDivElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [scrollPct,   setScrollPct]   = useState(0);
  const [videoPaused, setVideoPaused] = useState(false);
  const [fadeIn,      setFadeIn]      = useState(false);
  const { liveTheme, isNightMode, activePresetId } = useTheme();

  /* Night mode darkens the hero video overlay further */
  const heroOverlay = isNightMode
    ? "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0.97) 100%)"
    : liveTheme["--theme-hero-overlay"];

  /* Theme-specific eyebrow text */
  const eyebrowText =
    activePresetId === "hardscape-landscape"     ? "Hardscape · Paysagement · Aménagement" :
    activePresetId === "construction-renovation" ? "Construction · Rénovation · Intérieurs" :
    activePresetId === "maintenance-service"     ? "Entretien · Service · Abonnements"      :
    "Construction · Rénovation · Aménagement";

  // Smooth fade-in on mount
  useEffect(() => { setTimeout(() => setFadeIn(true), 100); }, []);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (videoPaused) { videoRef.current.play(); setVideoPaused(false); }
    else { videoRef.current.pause(); setVideoPaused(true); }
  };

  /* Parallax on scroll */
  useEffect(() => {
    const onScroll = () => {
      const pct = Math.min(window.scrollY / window.innerHeight, 1);
      setScrollPct(pct);
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${pct * 120}px) scale(${1 + pct * 0.06})`;
      }
      if (textRef.current) {
        textRef.current.style.transform = `translateY(${pct * 60}px)`;
        textRef.current.style.opacity   = String(1 - pct * 1.8);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Staggered entrance */
  useEffect(() => {
    const children = textRef.current?.querySelectorAll<HTMLElement>(".hero-anim");
    children?.forEach((el, i) => {
      el.style.opacity   = "0";
      el.style.transform = "translateY(36px)";
      setTimeout(() => {
        el.style.transition = `opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)`;
        el.style.opacity    = "1";
        el.style.transform  = "translateY(0)";
      }, 400 + i * 180);
    });
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative w-full h-screen min-h-screen flex flex-col items-center justify-end overflow-hidden"
      aria-label="Hero section"
      style={{ paddingTop: "var(--nav-height, 76px)" }}
    >
      {/* ── Background Video Layer — starts BELOW header ── */}
      <div
        ref={parallaxRef}
        className="absolute will-change-transform"
        style={{
          top: "var(--nav-height, 76px)",
          left: 0,
          right: 0,
          bottom: 0,
          transform: "translateY(0)",
          height: `calc(120% - var(--nav-height, 76px))`,
        }}
      >
        {/* Placeholder while video loads */}
        <div
          className={`absolute inset-0 bg-surface-0 transition-opacity duration-1000 ${videoLoaded ? "opacity-0" : "opacity-100"}`}
          aria-hidden="true"
        />

        {/* ── VIDEO SLOT — replace src with your actual video ── */}
        <video
          ref={videoRef}
          src="https://c.animaapp.com/mmslviois4xSNv/img/ai_1.mp4"
          poster="https://c.animaapp.com/mmslviois4xSNv/img/ai_1-poster.png"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
          autoPlay loop muted playsInline
          onCanPlay={() => setVideoLoaded(true)}
          aria-hidden="true"
        />

      </div>

      {/* ── Gradient overlays ── */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: heroOverlay }} aria-hidden="true" />
      {/* Vignette */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)" }}
        aria-hidden="true"
      />

      {/* ── Depth scroll effect strips ── */}
      <div className="absolute left-0 right-0 pointer-events-none z-15" style={{ top: "50%", height: "1px", background: "linear-gradient(90deg,transparent,rgba(212,160,23,0.08),transparent)", opacity: 1 - scrollPct * 2 }} />

      {/* ── Scan line at letterbox edges ── */}
      <div className="hero-scanline" style={{ top: "clamp(32px, 5.5vh, 60px)" }} aria-hidden="true" />
      <div className="hero-scanline" style={{ bottom: "clamp(32px, 5.5vh, 60px)" }} aria-hidden="true" />

      {/* ── Main content ── */}
      <div
        ref={textRef}
        className={`relative z-30 w-full max-w-screen-xl mx-auto px-6 md:px-10 pb-[14vh] will-change-transform transition-opacity duration-700 ${fadeIn ? "opacity-100" : "opacity-0"}`}
      >
        {/* Eyebrow — editorial minimal */}
        <div className="hero-anim mb-8 flex items-center gap-5">
          <div className="h-px w-16 bg-gradient-to-r from-[var(--theme-hero-eyebrow,hsl(42,90%,52%))]/60 to-transparent" />
          <span className="section-eyebrow tracking-cinematic" style={{ color: liveTheme["--theme-hero-eyebrow"], opacity: 0.8 }}>
            {eyebrowText}
          </span>
        </div>

        {/* Headline — Cormorant Garamond cinematic */}
        <h1 className="hero-anim font-headline font-light text-warm-white text-balance max-w-[820px] tracking-display mb-2" style={{ fontSize: "clamp(3.5rem, 8.5vw, 9rem)", lineHeight: 1.02, letterSpacing: "-0.03em" }}>
          Crafting Spaces
        </h1>
        <h1 className="hero-anim font-headline text-balance max-w-[820px] mb-8" style={{ fontSize: "clamp(3.5rem, 8.5vw, 9rem)", lineHeight: 1.02, letterSpacing: "-0.03em", fontWeight: 300 }}>
          <span className="text-gradient-gold italic">with a Cinematic</span>
        </h1>
        <h1 className="hero-anim font-headline font-light text-warm-white text-balance max-w-[820px] mb-10" style={{ fontSize: "clamp(3.5rem, 8.5vw, 9rem)", lineHeight: 1.02, letterSpacing: "-0.03em" }}>
          Touch.
        </h1>

        {/* Sub — clean Outfit */}
        <p className="hero-anim font-sans font-light text-gray-300/85 max-w-lg leading-relaxed mb-12 tracking-wide" style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)" }}>
          Aménagement Monzon — where architectural precision meets
          cinematic storytelling. Every project, a masterpiece.
        </p>

        {/* CTA row — minimal architectural */}
        <div className="hero-anim flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            onClick={() => scrollToSection("portfolio")}
            className="btn-primary group"
          >
            Explore Our Work
            <ArrowDown size={14} weight="regular" className="rotate-[-90deg] transition-transform duration-500 group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="btn-ghost"
          >
            Get in Touch
          </button>
        </div>

        {/* Stats strip — editorial numbers */}
        <div className="hero-anim mt-14 flex flex-wrap items-stretch gap-0 border-t border-white/[0.08]">
          {STATS.map((s, i) => (
            <div key={i} className={`flex flex-col gap-1 pt-6 pr-10 ${i < STATS.length - 1 ? "border-r border-white/[0.07] mr-10" : ""}`}>
              <span className="stat-number text-warm-white" style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}>{s.value}</span>
              <span className="font-sans font-light text-gray-500 uppercase tracking-[0.14em]" style={{ fontSize: "0.68rem" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Video controls ── */}
      <button
        onClick={toggleVideo}
        className="absolute bottom-[8vh] left-8 z-30 glass w-9 h-9 rounded-full flex items-center justify-center border border-white/10 hover:border-gold/40 transition-all cursor-pointer focus:outline-none"
        aria-label={videoPaused ? "Play video" : "Pause video"}
        style={{ opacity: 1 - scrollPct * 3 }}
      >
        {videoPaused
          ? <Play size={14} weight="fill" className="text-white ml-0.5" />
          : <Pause size={14} weight="fill" className="text-white" />
        }
      </button>

      {/* ── Scroll cue ── */}
      <button
        onClick={() => scrollToSection("services")}
        className="absolute bottom-[8vh] right-8 z-30 flex flex-col items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xl p-2"
        aria-label="Scroll to services"
        style={{ opacity: 1 - scrollPct * 3 }}
      >
        <span className="font-mono text-[10px] text-gray-400 tracking-widest uppercase rotate-90 origin-center translate-x-3">
          Scroll
        </span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-gold/60 to-transparent" />
      </button>
    </section>
  );
}
