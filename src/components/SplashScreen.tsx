import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSplash, SplashButton } from "@/contexts/SplashContext";
import { useTheme } from "@/contexts/ThemeContext";

/* ═══════════════════════════════════════════════════════════
   AMBIENT PARTICLE CANVAS
   Slow-floating gold dust, gentle rise, organic fade
   ═══════════════════════════════════════════════════════════ */
type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  opacity: number;
  life: number; maxLife: number;
  color: string;
};

function useParticleCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  intensity: number,
  active: boolean
) {
  const animRef  = useRef<number>();
  const partsRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COLORS = [
      "rgba(212,160,23,",
      "rgba(240,200,80,",
      "rgba(255,220,120,",
      "rgba(180,140,20,",
    ];

    const count = Math.floor(intensity * 90);
    partsRef.current = Array.from({ length: count }, () => spawnAt(canvas, true));

    function spawnAt(c: HTMLCanvasElement, randomLife = false): Particle {
      const maxLife = 180 + Math.random() * 220;
      return {
        x:       Math.random() * c.width,
        y:       Math.random() * c.height,
        vx:      (Math.random() - 0.5) * 0.25,
        vy:      -(0.12 + Math.random() * 0.28),
        radius:  0.4 + Math.random() * 1.6,
        opacity: 0,
        life:    randomLife ? Math.floor(Math.random() * maxLife) : 0,
        maxLife,
        color:   COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      partsRef.current.forEach((p, i) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        const t = p.life / p.maxLife;
        if (t < 0.12)      p.opacity = t / 0.12;
        else if (t > 0.72) p.opacity = Math.max(0, (1 - t) / 0.28);
        else               p.opacity = 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${(p.opacity * 0.42).toFixed(3)})`;
        ctx.fill();

        if (p.life >= p.maxLife) {
          partsRef.current[i] = spawnAt(canvas);
        }
      });

      animRef.current = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [active, intensity]);
}

/* ═══════════════════════════════════════════════════════════
   PRE-FORMATION SPARK FIELD
   Scattered glowing seeds that collapse inward before the logo draws
   ═══════════════════════════════════════════════════════════ */
function SparkField({ visible, collapsing }: { visible: boolean; collapsing: boolean }) {
  const seeds = Array.from({ length: 36 }, (_, i) => {
    const angle = (i / 36) * Math.PI * 2;
    const r     = 0.28 + Math.random() * 0.18;
    return {
      cx:    50 + Math.cos(angle) * r * 100,
      cy:    50 + Math.sin(angle) * (r * 60),
      size:  1.5 + Math.random() * 2.5,
      delay: i * 0.045,
      dur:   0.7 + Math.random() * 0.5,
    };
  });

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        transition: "opacity 1.2s ease",
        opacity: visible ? 1 : 0,
      }}
    >
      {seeds.map((s, i) => (
        <div
          key={i}
          style={{
            position:     "absolute",
            left:         `${s.cx}%`,
            top:          `${s.cy}%`,
            width:        `${s.size}px`,
            height:       `${s.size}px`,
            borderRadius: "50%",
            background:   "rgba(212,160,23,0.85)",
            boxShadow:    "0 0 8px 2px rgba(212,160,23,0.4), 0 0 2px rgba(255,220,80,0.6)",
            transition:   `opacity ${s.dur}s ease ${s.delay}s, transform ${s.dur * 1.4}s cubic-bezier(0.16,1,0.3,1) ${s.delay * 0.4}s`,
            opacity:      visible && !collapsing ? (0.4 + Math.random() * 0.5) : 0,
            transform:    collapsing
              ? "translate(-50%, -50%) scale(0) translate(var(--tx), var(--ty))"
              : "none",
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCAN LINE  (single horizontal sweep, pure atmosphere)
   ═══════════════════════════════════════════════════════════ */
function ScanLine({ active }: { active: boolean }) {
  return (
    <div
      style={{
        position:   "absolute",
        inset:      0,
        pointerEvents: "none",
        overflow:   "hidden",
        opacity:    active ? 1 : 0,
        transition: "opacity 0.6s ease",
      }}
    >
      <div
        style={{
          position:   "absolute",
          left:       0,
          right:      0,
          height:     "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(212,160,23,0.25) 30%, rgba(212,160,23,0.55) 50%, rgba(212,160,23,0.25) 70%, transparent 100%)",
          animation:  active ? "scanDown 3.2s cubic-bezier(0.37,0,0.63,1) 0.4s forwards" : "none",
          top:        "-2px",
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOGO SVG — FORMATION SEQUENCE
   Three progressive phases:
     "hidden"    → invisible
     "forming"   → stroke draws on with SVG dashoffset animation
     "assembled" → full mark, decorative details fade in
   ═══════════════════════════════════════════════════════════ */
function MonzonLogo({ phase }: {
  phase: "hidden" | "forming" | "assembled";
}) {
  const formed    = phase === "assembled";
  const drawing   = phase === "forming";
  const anyActive = drawing || formed;

  // Stroke dash length estimates for each path
  const M_LEN     = 320;
  const SERIF_LEN = 80;
  const LINE_LEN  = 240;

  const dash = (len: number, visible: boolean, delay = "0s", dur = "2.8s") => ({
    strokeDasharray:  len,
    strokeDashoffset: visible ? 0 : len,
    transition:       `stroke-dashoffset ${dur} cubic-bezier(0.16, 1, 0.3, 1) ${delay}`,
  });

  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        gap:           "clamp(20px, 4vh, 36px)",
        transition:    "opacity 1.2s ease, transform 1.4s cubic-bezier(0.16,1,0.3,1)",
        opacity:       anyActive ? 1 : 0,
        transform:     anyActive ? "translateY(0)" : "translateY(28px)",
      }}
    >
      {/* ── Monogram mark ─────────────────────────────── */}
      <div style={{ position: "relative", filter: formed ? "none" : drawing ? "blur(0.5px)" : "blur(3px)", transition: "filter 1.8s ease" }}>
        {/* Soft glow halo behind the mark */}
        <div
          style={{
            position:     "absolute",
            inset:        "-40px",
            borderRadius: "50%",
            background:   "radial-gradient(ellipse at center, rgba(212,160,23,0.12) 0%, transparent 70%)",
            opacity:      formed ? 1 : 0,
            transition:   "opacity 2s ease 1s",
            pointerEvents:"none",
          }}
        />

        <svg
          viewBox="0 0 160 130"
          width="clamp(80px, 14vw, 128px)"
          height="clamp(66px, 11.5vw, 106px)"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ─ Outer frame (corner marks, drawn first) ─ */}
          {/* Top-left */}
          <path
            d="M6 36 L6 10 L32 10"
            stroke="rgba(212,160,23,0.50)"
            strokeWidth="1.2"
            fill="none"
            style={dash(SERIF_LEN, formed, "2.0s", "0.9s")}
          />
          {/* Top-right */}
          <path
            d="M154 36 L154 10 L128 10"
            stroke="rgba(212,160,23,0.50)"
            strokeWidth="1.2"
            fill="none"
            style={dash(SERIF_LEN, formed, "2.15s", "0.9s")}
          />
          {/* Bottom-left */}
          <path
            d="M6 96 L6 122 L32 122"
            stroke="rgba(212,160,23,0.50)"
            strokeWidth="1.2"
            fill="none"
            style={dash(SERIF_LEN, formed, "2.3s", "0.9s")}
          />
          {/* Bottom-right */}
          <path
            d="M154 96 L154 122 L128 122"
            stroke="rgba(212,160,23,0.50)"
            strokeWidth="1.2"
            fill="none"
            style={dash(SERIF_LEN, formed, "2.45s", "0.9s")}
          />

          {/* ─ Horizontal rules top/bottom ─ */}
          <line
            x1="6" y1="10" x2="154" y2="10"
            stroke="rgba(212,160,23,0.22)"
            strokeWidth="0.6"
            style={dash(LINE_LEN, formed, "1.8s", "1.1s")}
          />
          <line
            x1="6" y1="122" x2="154" y2="122"
            stroke="rgba(212,160,23,0.22)"
            strokeWidth="0.6"
            style={dash(LINE_LEN, formed, "1.8s", "1.1s")}
          />

          {/* ─ Main "M" — the hero stroke ─ */}
          <path
            d="M14 114 L14 24 L80 84 L146 24 L146 114"
            stroke="rgba(212,160,23,0.95)"
            strokeWidth="4"
            strokeLinecap="square"
            strokeLinejoin="miter"
            fill="none"
            style={dash(M_LEN, drawing || formed, "0.2s", "3s")}
          />

          {/* ─ Inner accent diamond (assembles last) ─ */}
          <path
            d="M80 54 L92 66 L80 78 L68 66 Z"
            stroke="rgba(212,160,23,0.30)"
            strokeWidth="0.75"
            fill="none"
            style={{
              opacity:    formed ? 1 : 0,
              transition: "opacity 1.2s ease 2.8s",
            }}
          />

          {/* ─ Center vertical tick ─ */}
          <line
            x1="80" y1="10" x2="80" y2="22"
            stroke="rgba(212,160,23,0.35)"
            strokeWidth="0.8"
            style={{
              opacity:    formed ? 1 : 0,
              transition: "opacity 0.8s ease 2.6s",
            }}
          />
          <line
            x1="80" y1="110" x2="80" y2="122"
            stroke="rgba(212,160,23,0.35)"
            strokeWidth="0.8"
            style={{
              opacity:    formed ? 1 : 0,
              transition: "opacity 0.8s ease 2.6s",
            }}
          />
        </svg>
      </div>

      {/* ── Brand wordmark ─────────────────────────────── */}
      <div
        style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          gap:            "8px",
          transition:     "opacity 1.6s cubic-bezier(0.16,1,0.3,1) 0.6s, transform 1.6s cubic-bezier(0.16,1,0.3,1) 0.6s",
          opacity:        formed ? 1 : 0,
          transform:      formed ? "translateY(0)" : "translateY(20px)",
        }}
      >
        {/* Expanding rule above titles */}
        <div
          style={{
            height:     "1px",
            background: "linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent)",
            transition: "width 1.4s cubic-bezier(0.16,1,0.3,1) 0.8s",
            width:      formed ? "clamp(160px, 30vw, 280px)" : "0px",
            marginBottom: "6px",
          }}
        />

        {/* Eyebrow */}
        <span
          style={{
            fontFamily:    "'JetBrains Mono', monospace",
            fontSize:      "clamp(0.5rem, 1.2vw, 0.62rem)",
            letterSpacing: "0.38em",
            textTransform: "uppercase",
            color:         "rgba(212,160,23,0.60)",
            fontWeight:    400,
          }}
        >
          Est. 2018 · Montréal
        </span>

        {/* Company name — two-line layout */}
        <div style={{ textAlign: "center", lineHeight: 1 }}>
          <div
            style={{
              fontFamily:    "'Cormorant Garamond', Georgia, serif",
              fontSize:      "clamp(1.1rem, 2.8vw, 1.75rem)",
              fontWeight:    300,
              letterSpacing: "0.28em",
              color:         "rgba(250,248,245,0.88)",
              textTransform: "uppercase",
            }}
          >
            Aménagement
          </div>
          <div
            style={{
              fontFamily:    "'Cormorant Garamond', Georgia, serif",
              fontSize:      "clamp(1.65rem, 4.4vw, 2.8rem)",
              fontWeight:    700,
              letterSpacing: "0.10em",
              color:         "rgba(212,160,23,1)",
              textTransform: "uppercase",
              marginTop:     "4px",
            }}
          >
            Monzon
          </div>
        </div>

        {/* Tagline */}
        <span
          style={{
            fontFamily:    "'Outfit', system-ui, sans-serif",
            fontSize:      "clamp(0.48rem, 1vw, 0.58rem)",
            fontWeight:    300,
            letterSpacing: "0.36em",
            color:         "rgba(255,255,255,0.22)",
            textTransform: "uppercase",
            marginTop:     "10px",
            transition:    "opacity 1.4s ease 1.8s",
            opacity:       formed ? 1 : 0,
          }}
        >
          Construction · Aménagement · Entretien
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SERVICE BUTTON
   ═══════════════════════════════════════════════════════════ */
function ServiceButton({
  button,
  index,
  visible,
  onSelect,
}: {
  button:   SplashButton;
  index:    number;
  visible:  boolean;
  onSelect: (btn: SplashButton) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={() => { setPressed(true); onSelect(button); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor:     "pointer",
        outline:    "none",
        border:     "none",
        background: "transparent",
        padding:    0,
        transition: `opacity 1.1s cubic-bezier(0.16,1,0.3,1) ${0.12 + index * 0.2}s, transform 1.1s cubic-bezier(0.16,1,0.3,1) ${0.12 + index * 0.2}s`,
        opacity:    visible ? 1 : 0,
        transform:  visible ? "translateY(0) scale(1)" : "translateY(36px) scale(0.98)",
        flex:       "1 1 0",
        minWidth:   0,
      }}
    >
      <div
        style={{
          position:       "relative",
          padding:        "clamp(16px, 2.8vw, 26px) clamp(22px, 4.5vw, 44px)",
          border:         `1px solid ${hovered ? "rgba(212,160,23,0.60)" : "rgba(255,255,255,0.08)"}`,
          background:     pressed
            ? "rgba(212,160,23,0.12)"
            : hovered
            ? "rgba(212,160,23,0.055)"
            : "rgba(255,255,255,0.018)",
          backdropFilter: "blur(18px)",
          transition:     "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          textAlign:      "left",
          overflow:       "hidden",
        }}
      >
        {/* Left accent bar */}
        <div
          style={{
            position:   "absolute",
            left:       0, top: "20%", bottom: "20%",
            width:      "2px",
            background: "rgba(212,160,23,0.75)",
            borderRadius: "0 2px 2px 0",
            opacity:    hovered ? 1 : 0,
            transition: "opacity 0.35s ease, transform 0.45s cubic-bezier(0.16,1,0.3,1)",
            transform:  hovered ? "scaleY(1)" : "scaleY(0)",
            transformOrigin: "bottom",
          }}
        />

        {/* Shimmer sweep on hover */}
        <div
          style={{
            position:       "absolute",
            inset:          0,
            background:     hovered
              ? "linear-gradient(105deg, transparent 20%, rgba(212,160,23,0.05) 50%, transparent 80%)"
              : "transparent",
            backgroundSize: "200% 100%",
            transition:     "background 0.5s ease",
            pointerEvents:  "none",
          }}
        />

        {/* Index */}
        <span
          style={{
            position:      "absolute",
            top:           "clamp(10px,1.8vw,14px)",
            right:         "clamp(14px,2.8vw,20px)",
            fontFamily:    "'JetBrains Mono', monospace",
            fontSize:      "0.55rem",
            letterSpacing: "0.18em",
            color:         hovered ? "rgba(212,160,23,0.70)" : "rgba(255,255,255,0.14)",
            transition:    "color 0.35s ease",
          }}
        >
          0{index + 1}
        </span>

        {/* Label */}
        <div
          style={{
            fontFamily:    "'Cormorant Garamond', Georgia, serif",
            fontSize:      "clamp(1.05rem, 2.8vw, 1.5rem)",
            fontWeight:    500,
            letterSpacing: "-0.01em",
            color:         hovered ? "rgba(250,248,245,1)" : "rgba(250,248,245,0.82)",
            transition:    "color 0.3s ease",
            lineHeight:    1.15,
            paddingRight:  "clamp(20px, 4vw, 32px)",
          }}
        >
          {button.label}
        </div>

        {/* Sublabel */}
        <div
          style={{
            fontFamily:    "'Outfit', system-ui, sans-serif",
            fontSize:      "0.62rem",
            fontWeight:    300,
            letterSpacing: "0.20em",
            textTransform: "uppercase",
            color:         hovered ? "rgba(212,160,23,0.72)" : "rgba(255,255,255,0.26)",
            transition:    "color 0.3s ease",
            marginTop:     "5px",
          }}
        >
          {button.sublabel}
        </div>

        {/* Arrow (reveal on hover) */}
        <div
          style={{
            position:   "absolute",
            right:      "clamp(14px,3vw,24px)",
            bottom:     "clamp(10px,2vw,18px)",
            opacity:    hovered ? 1 : 0,
            transform:  hovered ? "translateX(0)" : "translateX(-10px)",
            transition: "all 0.38s cubic-bezier(0.16, 1, 0.3, 1)",
            color:      "rgba(212,160,23,0.85)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10H16M11 5L16 10L11 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square"/>
          </svg>
        </div>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARCHITECTURAL GRID OVERLAY  (thin grid lines behind everything)
   ═══════════════════════════════════════════════════════════ */
function ArchitecturalGrid({ visible }: { visible: boolean }) {
  return (
    <div
      style={{
        position:      "absolute",
        inset:         0,
        pointerEvents: "none",
        opacity:       visible ? 0.045 : 0,
        transition:    "opacity 3s ease 1.5s",
        backgroundImage: `
          linear-gradient(rgba(212,160,23,1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(212,160,23,1) 1px, transparent 1px)
        `,
        backgroundSize: "clamp(40px,6vw,80px) clamp(40px,6vw,80px)",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN SPLASH SCREEN
   ═══════════════════════════════════════════════════════════ */

// Phases:
//   idle → sparks → forming → assembled → question → buttons
type Phase = "idle" | "sparks" | "forming" | "assembled" | "question" | "buttons";

export default function SplashScreen() {
  const { settings, dismissSplash } = useSplash();
  const { applyPreset, saveTheme, presets } = useTheme();
  const navigate = useNavigate();

  const [phase,     setPhase]     = useState<Phase>("idle");
  const [isExiting, setIsExiting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const speed = settings.animationSpeed ?? 1;

  useParticleCanvas(canvasRef, settings.particleIntensity ?? 0.65, true);

  // Cinematic sequence timer
  useEffect(() => {
    const t = (ms: number) => Math.round(ms / speed);
    const ids: ReturnType<typeof setTimeout>[] = [];
    ids.push(setTimeout(() => setPhase("sparks"),    t(350)));
    ids.push(setTimeout(() => setPhase("forming"),   t(1050)));
    ids.push(setTimeout(() => setPhase("assembled"), t(4400)));
    ids.push(setTimeout(() => setPhase("question"),  t(6200)));
    ids.push(setTimeout(() => setPhase("buttons"),   t(6850)));
    return () => ids.forEach(clearTimeout);
  }, [speed]);

  const handleSelect = useCallback((button: SplashButton) => {
    const preset = presets.find(p => p.id === button.themePresetId);
    if (preset) { applyPreset(preset); saveTheme(); }
    setIsExiting(true);
    setTimeout(() => {
      dismissSplash();
      navigate(button.destination);
    }, 1000);
  }, [presets, applyPreset, saveTheme, dismissSplash, navigate]);

  const handleSkip = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => dismissSplash(), 800);
  }, [dismissSplash]);

  const BG: Record<string, string> = {
    "default":    "radial-gradient(ellipse 100% 90% at 50% 35%, hsl(222,22%,7%) 0%, hsl(222,26%,4%) 55%, #000 100%)",
    "pure-black": "linear-gradient(160deg, #050505 0%, #000 100%)",
    "charcoal":   "radial-gradient(ellipse 100% 90% at 50% 35%, hsl(220,18%,11%) 0%, hsl(222,24%,6%) 55%, hsl(220,20%,2%) 100%)",
  };

  const isForming   = phase === "forming";
  const isAssembled = phase === "assembled" || phase === "question" || phase === "buttons";
  const logoPhase   = isAssembled ? "assembled" : isForming ? "forming" : "hidden";
  const gridVisible = isAssembled;
  const scanVisible = phase === "sparks" || phase === "forming";

  return (
    <div
      style={{
        position:      "fixed",
        inset:         0,
        zIndex:        9999,
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        justifyContent:"center",
        background:    BG[settings.backgroundStyle ?? "default"],
        transition:    "opacity 1s cubic-bezier(0.16,1,0.3,1)",
        opacity:       isExiting ? 0 : 1,
        pointerEvents: isExiting ? "none" : "all",
        overflow:      "hidden",
      }}
    >
      {/* ── Particle canvas ───────────────────────────── */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />

      {/* ── Architectural grid ────────────────────────── */}
      <ArchitecturalGrid visible={gridVisible} />

      {/* ── Scan line sweep ───────────────────────────── */}
      <ScanLine active={scanVisible} />

      {/* ── Spark field (pre-formation) ───────────────── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <SparkField
          visible={phase === "sparks" || phase === "forming"}
          collapsing={phase === "forming"}
        />
      </div>

      {/* ── Central glow halo ─────────────────────────── */}
      <div
        style={{
          position:      "absolute",
          inset:         0,
          background:    "radial-gradient(ellipse 65% 45% at 50% 50%, rgba(212,160,23,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          transition:    "opacity 3.5s ease",
          opacity:       isAssembled ? 1 : 0,
        }}
      />

      {/* ── Vignette overlay ──────────────────────────── */}
      <div
        style={{
          position:      "absolute",
          inset:         0,
          background:    "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 45%, rgba(0,0,0,0.65) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Main content column ───────────────────────── */}
      <div
        style={{
          position:       "relative",
          zIndex:         2,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          gap:            "clamp(32px, 6vh, 64px)",
          width:          "100%",
          maxWidth:       "1100px",
          padding:        "0 clamp(20px, 5vw, 44px)",
        }}
      >
        {/* Logo formation */}
        <MonzonLogo phase={logoPhase} />

        {/* Question text */}
        <div
          style={{
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            gap:           "6px",
            transition:    "opacity 1.2s cubic-bezier(0.16,1,0.3,1), transform 1.2s cubic-bezier(0.16,1,0.3,1)",
            opacity:       phase === "question" || phase === "buttons" ? 1 : 0,
            transform:     phase === "question" || phase === "buttons" ? "translateY(0)" : "translateY(22px)",
          }}
        >
          <span
            style={{
              fontFamily:    "'JetBrains Mono', monospace",
              fontSize:      "0.56rem",
              letterSpacing: "0.30em",
              textTransform: "uppercase",
              color:         "rgba(212,160,23,0.50)",
            }}
          >
            Bienvenue · Welcome
          </span>
          <h2
            style={{
              fontFamily:    "'Cormorant Garamond', Georgia, serif",
              fontSize:      "clamp(1.35rem, 4.2vw, 2.1rem)",
              fontWeight:    400,
              letterSpacing: "-0.01em",
              color:         "rgba(250,248,245,0.95)",
              textAlign:     "center",
              margin:        0,
              lineHeight:    1.2,
            }}
          >
            {settings.questionText}
          </h2>
          {/* Bilingual sub-question */}
          <p
            style={{
              fontFamily:    "'Outfit', system-ui, sans-serif",
              fontSize:      "clamp(0.62rem, 1.4vw, 0.75rem)",
              fontWeight:    300,
              letterSpacing: "0.04em",
              color:         "rgba(255,255,255,0.32)",
              textAlign:     "center",
              margin:        0,
              marginTop:     "2px",
            }}
          >
            Which are your needs?
          </p>
          {/* Rule */}
          <div
            style={{
              width:      "36px",
              height:     "1px",
              background: "rgba(212,160,23,0.45)",
              marginTop:  "4px",
            }}
          />
        </div>

        {/* Service selection buttons */}
        <div
          style={{
            display:       "flex",
            flexDirection: "row",
            gap:           "clamp(8px, 1.4vw, 16px)",
            width:         "100%",
            alignItems:    "stretch",
          }}
        >
          {settings.buttons.map((btn, i) => (
            <ServiceButton
              key={btn.id}
              button={btn}
              index={i}
              visible={phase === "buttons"}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      {/* ── Left vertical label ───────────────────────── */}
      <div
        style={{
          position:      "absolute",
          left:          "clamp(14px,2.5vw,24px)",
          top:           "50%",
          transform:     "translateY(-50%) rotate(-90deg)",
          fontFamily:    "'JetBrains Mono', monospace",
          fontSize:      "0.52rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color:         "rgba(255,255,255,0.09)",
          whiteSpace:    "nowrap",
          opacity:       isAssembled ? 1 : 0,
          transition:    "opacity 2.5s ease 2s",
          pointerEvents: "none",
        }}
      >
        Montréal · Québec
      </div>

      {/* ── Right vertical label ──────────────────────── */}
      <div
        style={{
          position:      "absolute",
          right:         "clamp(14px,2.5vw,24px)",
          top:           "50%",
          transform:     "translateY(-50%) rotate(90deg)",
          fontFamily:    "'JetBrains Mono', monospace",
          fontSize:      "0.52rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color:         "rgba(255,255,255,0.09)",
          whiteSpace:    "nowrap",
          opacity:       isAssembled ? 1 : 0,
          transition:    "opacity 2.5s ease 2s",
          pointerEvents: "none",
        }}
      >
        Est. 2018
      </div>

      {/* ── Bottom horizontal rule ────────────────────── */}
      <div
        style={{
          position:   "absolute",
          left:       "clamp(40px,8vw,100px)",
          right:      "clamp(40px,8vw,100px)",
          bottom:     "clamp(60px,10vh,88px)",
          height:     "1px",
          background: "linear-gradient(90deg, transparent, rgba(212,160,23,0.15), transparent)",
          opacity:    isAssembled ? 1 : 0,
          transition: "opacity 2s ease 2.2s",
          pointerEvents: "none",
        }}
      />

      {/* ── Skip link ─────────────────────────────────── */}
      <button
        onClick={handleSkip}
        style={{
          position:      "absolute",
          bottom:        "clamp(18px,3.5vh,28px)",
          right:         "clamp(18px,3.5vw,32px)",
          fontFamily:    "'Outfit', system-ui, sans-serif",
          fontSize:      "0.62rem",
          fontWeight:    300,
          letterSpacing: "0.20em",
          textTransform: "uppercase",
          color:         "rgba(255,255,255,0.20)",
          background:    "transparent",
          border:        "none",
          cursor:        "pointer",
          outline:       "none",
          transition:    "color 0.3s ease, opacity 1s ease",
          opacity:       phase === "buttons" ? 1 : 0,
          padding:       "8px 10px",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.52)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.20)")}
      >
        Skip →
      </button>
    </div>
  );
}
