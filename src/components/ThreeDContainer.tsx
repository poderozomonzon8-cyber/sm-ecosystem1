import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

/* ─── Minimal 3-D math helpers ──────────────────────────── */
type Vec3 = [number, number, number];
type Vec2 = [number, number];

function rotX(v: Vec3, a: number): Vec3 {
  const [x, y, z] = v;
  return [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
}
function rotY(v: Vec3, a: number): Vec3 {
  const [x, y, z] = v;
  return [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
}
function rotZ(v: Vec3, a: number): Vec3 {
  const [x, y, z] = v;
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z];
}
function project(v: Vec3, fov = 5, cx = 0, cy = 0, scale = 1): Vec2 {
  const z = fov / (fov + v[2]);
  return [cx + v[0] * z * scale, cy + v[1] * z * scale];
}

/* ── Paver grid (Hardscape) ─────────────────────────────── */
function buildPaveGrid(rows: number, cols: number, gapRatio = 0.12): Vec3[][] {
  const faces: Vec3[][] = [];
  const tw = 1 / cols, th = 1 / rows;
  const gx = tw * gapRatio, gy = th * gapRatio;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x0 = -0.5 + c * tw + gx, z0 = -0.5 + r * th + gy;
      const x1 = x0 + tw - gx * 2,   z1 = z0 + th - gy * 2;
      const h  = 0.04 + Math.random() * 0.03;
      faces.push([
        [x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1],
        [x0, -h, z0], [x1, -h, z0], [x1, 0, z0], [x0, 0, z0],
        [x0, 0, z1], [x1, 0, z1], [x1, -h, z1], [x0, -h, z1],
        [x0, -h, z0], [x0, -h, z1], [x0, 0, z1], [x0, 0, z0],
        [x1, 0, z0], [x1, 0, z1], [x1, -h, z1], [x1, -h, z0],
      ]);
    }
  }
  return faces;
}

/* ── Box wireframe edges ─────────────────────────────────── */
function buildBox(w: number, h: number, d: number): [Vec3, Vec3][] {
  const x = w / 2, y = h / 2, z = d / 2;
  const v: Vec3[] = [
    [-x,-y,-z],[x,-y,-z],[x,y,-z],[-x,y,-z],
    [-x,-y, z],[x,-y, z],[x,y, z],[-x,y, z],
  ];
  return [
    [v[0],v[1]],[v[1],v[2]],[v[2],v[3]],[v[3],v[0]],
    [v[4],v[5]],[v[5],v[6]],[v[6],v[7]],[v[7],v[4]],
    [v[0],v[4]],[v[1],v[5]],[v[2],v[6]],[v[3],v[7]],
  ];
}

/* ─── Blueprint floorplan lines ─────────────────────────── */
function buildFloorplan(): [Vec3, Vec3][] {
  return [
    [[-0.42,-0.04,-0.42],[0.42,-0.04,-0.42]],
    [[0.42,-0.04,-0.42],[0.42,-0.04,0.42]],
    [[0.42,-0.04,0.42],[-0.42,-0.04,0.42]],
    [[-0.42,-0.04,0.42],[-0.42,-0.04,-0.42]],
    [[-0.42,-0.04,0],[0,-0.04,0]],
    [[0,-0.04,-0.42],[0,-0.04,0.42]],
    [[0,-0.04,0],[0.42,-0.04,0]],
    [[-0.10,-0.04,-0.42],[-0.10,-0.04,-0.10]],
    [[0.15,-0.04,0],[0.15,-0.04,0.42]],
  ];
}

/* ─── Wrench shape verts (maintenance badge ring) ────── */
function buildBadgeRing(r: number, sides: number): [Vec3, Vec3][] {
  const edges: [Vec3, Vec3][] = [];
  for (let i = 0; i < sides; i++) {
    const a0 = (i / sides) * Math.PI * 2;
    const a1 = ((i + 1) / sides) * Math.PI * 2;
    const p0: Vec3 = [r * Math.cos(a0), 0, r * Math.sin(a0)];
    const p1: Vec3 = [r * Math.cos(a1), 0, r * Math.sin(a1)];
    edges.push([p0, p1]);
  }
  return edges;
}

/* ─── Wrench silhouette lines ───────────────────────────── */
function buildWrench(): [Vec3, Vec3][] {
  return [
    [[-0.05, 0.30, 0], [-0.05,-0.30, 0]],
    [[ 0.05, 0.30, 0], [ 0.05,-0.30, 0]],
    [[-0.05,-0.30, 0], [ 0.05,-0.30, 0]],
    [[-0.12, 0.30, 0], [-0.12, 0.16, 0]],
    [[ 0.12, 0.30, 0], [ 0.12, 0.16, 0]],
    [[-0.12, 0.30, 0], [ 0.12, 0.30, 0]],
    [[-0.12, 0.16, 0], [-0.05, 0.16, 0]],
    [[ 0.12, 0.16, 0], [ 0.05, 0.16, 0]],
  ];
}

/* ─── Particle type ─────────────────────────────────────── */
type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  r: number; a: number; va: number;
  shape: "circle" | "square" | "line";
  angle: number; vangle: number;
};

function makeParticle(W: number, H: number, count: number, theme: "paver"|"blueprint"|"badge"|"default", sizeBase: number, speedMult: number): Particle {
  const shapes: Particle["shape"][] = theme === "blueprint" ? ["square","line","circle"] : theme === "badge" ? ["circle","circle","square"] : ["circle","square","circle"];
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4 * speedMult,
    vy: (-Math.random() * 0.6 - 0.1) * speedMult,
    r: (sizeBase * 0.4 + Math.random() * sizeBase * 0.8),
    a: Math.random() * 0.7,
    va: (Math.random() - 0.5) * 0.006,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    angle: Math.random() * Math.PI * 2,
    vangle: (Math.random() - 0.5) * 0.04,
  };
}

/* ═══════════════════════════════════════════════════════════
   MAIN 3D CONTAINER — Theme-aware canvas renderer
   ═══════════════════════════════════════════════════════════ */
export function ThreeDContainerBase({ compact = false, title, subtitle }: {
  compact?: boolean;
  title?: string;
  subtitle?: string;
}) {
  const { liveTheme } = useTheme();
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef<number>(0);
  const scrollRef   = useRef(0);
  const mouseRef    = useRef({ x: 0, y: 0 });
  const sectionRef  = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState(false);
  const particlesRef = useRef<Particle[]>([]);

  /* Read theme controls */
  const enabled     = liveTheme["--theme-3d-enabled"]        !== "0";
  const modelHint   = (liveTheme["--theme-3d-model"]         ?? "auto") as string;
  const rotSpeed    = parseFloat(liveTheme["--theme-3d-rotation-speed"] ?? "1.0");
  const density     = parseInt(liveTheme["--theme-particle-density"]    ?? "50");
  const particleSize= parseFloat(liveTheme["--theme-particle-size"]     ?? "1.5");
  const partSpeed   = parseFloat(liveTheme["--theme-particle-speed"]    ?? "1.0");
  const particleCol = liveTheme["--theme-particle-color"]    ?? "rgba(212,160,23,0.6)";
  const accentCol   = liveTheme["--theme-particle-accent"]   ?? "rgba(255,220,100,0.4)";
  const gridCol     = liveTheme["--theme-3d-grid-color"]     ?? "rgba(212,160,23,0.12)";

  /* Resolve model from theme */
  const resolveModel = (): "paver" | "blueprint" | "badge" | "default" => {
    if (modelHint === "paver")     return "paver";
    if (modelHint === "blueprint") return "blueprint";
    if (modelHint === "badge")     return "badge";
    /* auto: derive from active preset */
    const preset = liveTheme["--theme-3d-bg"] ?? "";
    if (preset.includes("140"))  return "paver";       /* hardscape green bg */
    if (preset.includes("220"))  return "blueprint";   /* construction charcoal */
    if (preset.includes("215"))  return "badge";       /* maintenance blue-gray */
    return "default";
  };

  const model = resolveModel();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* Pre-build geometry (stable across renders) */
    const paveFaces   = buildPaveGrid(6, 9, 0.10);
    const archEdges   = buildBox(0.7, 0.5, 0.4);
    const bpBox       = buildBox(0.55, 0.55, 0.55);
    const bpFloor     = buildFloorplan();
    const badgeRing   = buildBadgeRing(0.4, 32);
    const badgeInner  = buildBadgeRing(0.28, 8);
    const wrench      = buildWrench();

    const initParticles = (W: number, H: number) => {
      particlesRef.current = Array.from({ length: Math.max(12, density) }, () =>
        makeParticle(W, H, density, model, particleSize, partSpeed)
      );
    };

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initParticles(canvas.offsetWidth, canvas.offsetHeight);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - r.left) / r.width  - 0.5) * 2,
        y: ((e.clientY - r.top)  / r.height - 0.5) * 2,
      };
    };
    canvas.addEventListener("mousemove", onMouseMove);

    const onTouch = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const r = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.touches[0].clientX - r.left) / r.width  - 0.5) * 2,
        y: ((e.touches[0].clientY - r.top)  / r.height - 0.5) * 2,
      };
    };
    canvas.addEventListener("touchmove", onTouch, { passive: true });

    const onScroll = () => {
      if (!sectionRef.current) return;
      const r   = sectionRef.current.getBoundingClientRect();
      const pct = (-r.top) / r.height;
      scrollRef.current = Math.max(-0.2, Math.min(pct, 1.2));
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let t = 0;

    /* ── DRAW FUNCTIONS ─────────────────────────────── */

    /* Shared transform helper */
    const makeTransform = (rotXAngle: number, rotYAngle: number, cx: number, cy: number, scale: number) =>
      (v: Vec3): Vec2 => {
        let p: Vec3 = [v[0] * 0.95, v[1] * 0.95, v[2] * 0.95];
        p = rotX(p, rotXAngle);
        p = rotY(p, rotYAngle);
        return project(p, 4.5, cx, cy, scale);
      };

    /* ──── Hardscape / Landscape ────────────────────── */
    const drawHardscape = (W: number, H: number, rotXAngle: number, rotYAngle: number) => {
      const cx = W * 0.5, cy = H * 0.52;
      const scale = Math.min(W, H) * 0.55;
      const tf = makeTransform(rotXAngle, rotYAngle, cx, cy, scale);

      /* Glow halo */
      const glowR = scale * 0.72;
      const grad = ctx.createRadialGradient(cx, cy * 0.95, 0, cx, cy * 0.95, glowR);
      grad.addColorStop(0,   accentCol.replace(/[\d.]+\)$/, "0.09)"));
      grad.addColorStop(0.5, accentCol.replace(/[\d.]+\)$/, "0.03)"));
      grad.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      /* Floor shadow */
      const sg = ctx.createLinearGradient(cx - scale * 0.55, cy, cx + scale * 0.55, cy);
      sg.addColorStop(0, "rgba(0,0,0,0)"); sg.addColorStop(0.5, "rgba(0,0,0,0.22)"); sg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sg; ctx.fillRect(cx - scale * 0.55, cy - 10, scale * 1.1, 24);

      /* Pave grid */
      const FACES_PER_STONE = 5;
      for (let s = 0; s < paveFaces.length / FACES_PER_STONE; s++) {
        for (let f = 0; f < FACES_PER_STONE; f++) {
          const face = paveFaces[s * FACES_PER_STONE + f];
          if (!face) continue;
          const pts = face.map(tf);
          const brightness = f === 0 ? 0.18 : 0.06 + f * 0.02;
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
          ctx.closePath();
          /* Earth-tone stone colors */
          ctx.fillStyle = f === 0
            ? `rgba(90,120,60,${brightness + 0.04})`
            : `rgba(60,90,40,${brightness})`;
          ctx.fill();
          ctx.strokeStyle = f === 0 ? particleCol.replace(/[\d.]+\)$/, "0.55)") : "rgba(60,90,40,0.25)";
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      /* Floating stone slab above paver — rotated independently */
      const slabRotY = rotYAngle * 1.3 + t * 0.25 * rotSpeed;
      const slabRotX = 0.3 + Math.sin(t * 0.4) * 0.12;
      const slabVerts: Vec3[] = [
        [-0.30,-0.60,-0.10],[0.30,-0.60,-0.10],[0.30,-0.60,0.10],[-0.30,-0.60,0.10],
        [-0.30,-0.65,-0.10],[0.30,-0.65,-0.10],[0.30,-0.65,0.10],[-0.30,-0.65,0.10],
      ];
      const slabFaces: number[][] = [[0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]];
      const slabColors = ["rgba(100,130,70,0.22)","rgba(70,100,50,0.14)","rgba(80,110,55,0.16)","rgba(80,110,55,0.16)","rgba(80,110,55,0.16)","rgba(80,110,55,0.16)"];
      slabFaces.forEach((fi, idx) => {
        const pts = fi.map(vi => {
          let p: Vec3 = [...slabVerts[vi]] as Vec3;
          p = rotX(p, slabRotX); p = rotY(p, slabRotY);
          return project(p, 4.5, cx, cy, scale);
        });
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        for (let k=1;k<pts.length;k++) ctx.lineTo(pts[k][0], pts[k][1]);
        ctx.closePath();
        ctx.fillStyle = slabColors[idx]; ctx.fill();
        ctx.strokeStyle = particleCol.replace(/[\d.]+\)$/, "0.35)"); ctx.lineWidth = 0.8; ctx.stroke();
      });

      /* Depth shadows under slab */
      const shadowPt = tf([-0.30, -0.66, 0]);
      const shadowGrad2 = ctx.createRadialGradient(shadowPt[0], shadowPt[1] + 12, 0, shadowPt[0], shadowPt[1] + 12, 60);
      shadowGrad2.addColorStop(0, "rgba(0,0,0,0.20)");
      shadowGrad2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shadowGrad2;
      ctx.fillRect(shadowPt[0] - 80, shadowPt[1] - 5, 160, 40);

      /* Arch wireframe (floating above) */
      const archOff: Vec3 = [0, -0.52, 0];
      archEdges.forEach(([a, b]) => {
        const pa: Vec3 = [a[0]+archOff[0], a[1]+archOff[1], a[2]+archOff[2]];
        const pb: Vec3 = [b[0]+archOff[0], b[1]+archOff[1], b[2]+archOff[2]];
        const prA = tf(pa), prB = tf(pb);
        ctx.beginPath(); ctx.moveTo(prA[0], prA[1]); ctx.lineTo(prB[0], prB[1]);
        ctx.strokeStyle = particleCol.replace(/[\d.]+\)$/, "0.45)"); ctx.lineWidth = 1.0; ctx.stroke();
      });

      /* Depth strips */
      for (let d=0;d<3;d++) {
        const depthY = H * (0.3+d*0.2) + Math.sin(t*0.3+d)*8;
        ctx.beginPath(); ctx.moveTo(0, depthY); ctx.lineTo(W, depthY);
        ctx.strokeStyle = particleCol.replace(/[\d.]+\)$/, `${0.03+d*0.01})`); ctx.lineWidth=0.5; ctx.stroke();
      }

      /* Markers */
      const markers: Vec3[] = [[-0.4,-0.55,-0.35],[0.4,-0.55,0.35],[0,-0.55,0]];
      markers.forEach((m, i) => {
        const p2 = tf(m);
        const r2 = 2.5 + Math.sin(t * 1.5 + i) * 0.8;
        ctx.beginPath(); ctx.arc(p2[0], p2[1], r2, 0, Math.PI*2);
        ctx.fillStyle = i===2 ? particleCol : particleCol.replace(/[\d.]+\)$/, "0.5)"); ctx.fill();
        ctx.beginPath(); ctx.arc(p2[0], p2[1], r2*3*(0.7+0.3*Math.sin(t+i)), 0, Math.PI*2);
        ctx.strokeStyle = particleCol.replace(/[\d.]+\)$/, "0.18)"); ctx.lineWidth=0.8; ctx.stroke();
      });
    };

    /* ──── Construction / Renovation ────────────────── */
    const drawBlueprint = (W: number, H: number, rotXAngle: number, rotYAngle: number) => {
      const cx = W * 0.5, cy = H * 0.5;
      const scale = Math.min(W, H) * 0.48;

      /* Blueprint grid background */
      const gridSpacing = 22;
      ctx.strokeStyle = gridCol;
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx < W; gx += gridSpacing) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += gridSpacing) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      /* Metallic frame outer box — rotates at base speed */
      const frameRotY = t * 0.3 * rotSpeed + rotYAngle * 0.4;
      const frameRotX = 0.45 + t * 0.1 * rotSpeed + rotXAngle * 0.3;
      const frameTf = (v: Vec3): Vec2 => {
        let p: Vec3 = [v[0]*0.92, v[1]*0.92, v[2]*0.92];
        p = rotX(p, frameRotX); p = rotY(p, frameRotY);
        return project(p, 4.5, cx, cy, scale);
      };
      /* Metallic lines */
      bpBox.forEach(([a, b]) => {
        const prA = frameTf(a), prB = frameTf(b);
        ctx.beginPath(); ctx.moveTo(prA[0], prA[1]); ctx.lineTo(prB[0], prB[1]);
        ctx.strokeStyle = accentCol.replace(/[\d.]+\)$/, "0.65)"); ctx.lineWidth = 1.4; ctx.stroke();
        /* inner glow */
        ctx.beginPath(); ctx.moveTo(prA[0], prA[1]); ctx.lineTo(prB[0], prB[1]);
        ctx.strokeStyle = accentCol.replace(/[\d.]+\)$/, "0.20)"); ctx.lineWidth = 3.5; ctx.stroke();
      });

      /* Corner vertices (metallic dots) */
      const boxVerts: Vec3[] = [
        [-0.28,-0.28,-0.28],[0.28,-0.28,-0.28],[0.28,0.28,-0.28],[-0.28,0.28,-0.28],
        [-0.28,-0.28,0.28],[0.28,-0.28,0.28],[0.28,0.28,0.28],[-0.28,0.28,0.28],
      ];
      boxVerts.forEach((bv, i) => {
        const p = frameTf(bv);
        ctx.beginPath(); ctx.arc(p[0], p[1], i===0||i===6 ? 3.5 : 2.0, 0, Math.PI*2);
        ctx.fillStyle = accentCol.replace(/[\d.]+\)$/, "0.8)"); ctx.fill();
      });

      /* Rotating floorplan slice — slower spin inside */
      const floorRotY = t * 0.18 * rotSpeed + rotYAngle * 0.6;
      const floorRotX = 0.18 + Math.sin(t * 0.25) * 0.08;
      const floorTf = (v: Vec3): Vec2 => {
        let p: Vec3 = [...v] as Vec3;
        p = rotX(p, floorRotX); p = rotY(p, floorRotY);
        return project(p, 4.5, cx, cy, scale);
      };
      bpFloor.forEach(([a, b]) => {
        const prA = floorTf(a), prB = floorTf(b);
        ctx.beginPath(); ctx.moveTo(prA[0], prA[1]); ctx.lineTo(prB[0], prB[1]);
        ctx.strokeStyle = particleCol.replace(/[\d.]+\)$/, "0.6)"); ctx.lineWidth = 0.9; ctx.stroke();
      });

      /* Annotation tick marks */
      const ticks: Vec3[] = [[0.28,0.28,-0.28],[0.28,-0.28,0.28],[-0.28,0.28,0.28]];
      ticks.forEach((tk, i) => {
        const p = frameTf(tk);
        const size = 5 + Math.sin(t * 1.2 + i) * 1.5;
        ctx.beginPath(); ctx.moveTo(p[0]-size, p[1]); ctx.lineTo(p[0]+size, p[1]);
        ctx.strokeStyle = particleCol.replace(/[\d.]+\)$/, "0.9)"); ctx.lineWidth=1; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(p[0], p[1]-size); ctx.lineTo(p[0], p[1]+size);
        ctx.stroke();
      });

      /* Blueprint micro-lines floating (angular) */
      for (let d=0;d<3;d++) {
        const y2 = H*(0.15+d*0.28) + Math.sin(t*0.2+d)*5;
        ctx.beginPath(); ctx.moveTo(W*0.05, y2); ctx.lineTo(W*0.18, y2);
        ctx.strokeStyle = accentCol.replace(/[\d.]+\)$/, "0.25)"); ctx.lineWidth=0.6; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(W*0.82, y2); ctx.lineTo(W*0.95, y2);
        ctx.strokeStyle = accentCol.replace(/[\d.]+\)$/, "0.25)"); ctx.lineWidth=0.6; ctx.stroke();
      }
    };

    /* ──── Maintenance / Service ─────────────────────── */
    const drawBadge = (W: number, H: number, rotXAngle: number, rotYAngle: number) => {
      const cx = W * 0.5, cy = H * 0.5;
      const scale = Math.min(W, H) * 0.50;

      /* Soft radial bg halo */
      const haloGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.85);
      haloGrad.addColorStop(0,   particleCol.replace(/[\d.]+\)$/, "0.07)"));
      haloGrad.addColorStop(0.5, particleCol.replace(/[\d.]+\)$/, "0.03)"));
      haloGrad.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = haloGrad; ctx.fillRect(0, 0, W, H);

      /* Service badge ring — outer */
      const ringRotY = t * 0.35 * rotSpeed + rotYAngle * 0.5;
      const ringRotX = 0.25 + Math.sin(t * 0.3) * 0.1 + rotXAngle * 0.4;
      const ringTf = (v: Vec3): Vec2 => {
        let p: Vec3 = [...v] as Vec3;
        p = rotX(p, ringRotX); p = rotY(p, ringRotY);
        return project(p, 4.5, cx, cy, scale);
      };
      /* Outer ring gradient */
      badgeRing.forEach(([a, b]) => {
        const prA = ringTf(a), prB = ringTf(b);
        ctx.beginPath(); ctx.moveTo(prA[0], prA[1]); ctx.lineTo(prB[0], prB[1]);
        ctx.strokeStyle = particleCol; ctx.lineWidth = 1.8; ctx.stroke();
      });

      /* Inner ring — counter-rotates */
      const innerRotY = -t * 0.20 * rotSpeed + rotYAngle * 0.7;
      const innerRotX = ringRotX + 0.1;
      const innerTf = (v: Vec3): Vec2 => {
        let p: Vec3 = [...v] as Vec3;
        p = rotX(p, innerRotX); p = rotY(p, innerRotY);
        return project(p, 4.5, cx, cy, scale);
      };
      badgeInner.forEach(([a, b]) => {
        const prA = innerTf(a), prB = innerTf(b);
        ctx.beginPath(); ctx.moveTo(prA[0], prA[1]); ctx.lineTo(prB[0], prB[1]);
        ctx.strokeStyle = accentCol; ctx.lineWidth = 1.2; ctx.stroke();
      });

      /* Wrench icon — rotates with badge */
      const wrenchRotZ = t * 0.5 * rotSpeed + Math.PI / 6;
      const wrenchTf = (v: Vec3): Vec2 => {
        let p: Vec3 = [...v] as Vec3;
        p = rotZ(p, wrenchRotZ);
        return project(p, 4.5, cx, cy, scale);
      };
      wrench.forEach(([a, b]) => {
        const prA = wrenchTf(a), prB = wrenchTf(b);
        ctx.beginPath(); ctx.moveTo(prA[0], prA[1]); ctx.lineTo(prB[0], prB[1]);
        ctx.strokeStyle = particleCol.replace(/[\d.]+\)$/, "0.85)"); ctx.lineWidth = 1.5; ctx.stroke();
      });

      /* Translucent soft shape (broom handle arc decoration) */
      const shapeCx = cx + Math.sin(t * 0.4) * 8;
      const shapeCy = cy + Math.cos(t * 0.4) * 8;
      ctx.beginPath();
      ctx.arc(shapeCx, shapeCy, scale * 0.22, 0, Math.PI * 2);
      ctx.strokeStyle = particleCol.replace(/[\d.]+\)$/, "0.12)"); ctx.lineWidth = 8; ctx.stroke();
      ctx.strokeStyle = accentCol.replace(/[\d.]+\)$/, "0.08)"); ctx.lineWidth = 16; ctx.stroke();

      /* Clean horizontal depth lines */
      for (let d=0;d<4;d++) {
        const y2 = H*(0.2+d*0.2) + Math.sin(t*0.25+d)*4;
        ctx.beginPath(); ctx.moveTo(W*0.06, y2); ctx.lineTo(W*0.25, y2);
        ctx.strokeStyle = particleCol.replace(/[\d.]+\)$/, "0.18)"); ctx.lineWidth=0.7; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(W*0.75, y2); ctx.lineTo(W*0.94, y2);
        ctx.strokeStyle = particleCol.replace(/[\d.]+\)$/, "0.18)"); ctx.lineWidth=0.7; ctx.stroke();
      }
    };

    /* ── Particle draw ─────────────────────────────── */
    const drawParticles = (W: number, H: number) => {
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.a  += p.va; p.angle += p.vangle;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W+10) p.x = -10;
        p.a = Math.max(0.05, Math.min(0.75, p.a));

        const alpha = p.a * 0.6;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        if (p.shape === "circle") {
          ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI*2);
          ctx.fillStyle = model === "blueprint" ? accentCol : particleCol; ctx.fill();
        } else if (p.shape === "square") {
          const sz = p.r * 1.4;
          ctx.fillStyle = particleCol;
          ctx.fillRect(-sz/2, -sz/2, sz, sz);
        } else if (p.shape === "line") {
          /* Blueprint micro-lines */
          const len = p.r * 5;
          ctx.beginPath(); ctx.moveTo(-len/2, 0); ctx.lineTo(len/2, 0);
          ctx.strokeStyle = accentCol; ctx.lineWidth = p.r * 0.6; ctx.stroke();
        }
        ctx.restore();
      });
    };

    /* ── Main animation loop ─────────────────────────── */
    const draw = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);
      t += 0.006;

      const scroll = scrollRef.current;
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      const rotYAngle = t * 0.4 * rotSpeed + scroll * Math.PI * 0.35 + mx * 0.5;
      const rotXAngle = 0.55 + scroll * -0.25 + my * 0.3;

      if (model === "paver" || model === "default") {
        drawHardscape(W, H, rotXAngle, rotYAngle);
      } else if (model === "blueprint") {
        drawBlueprint(W, H, rotXAngle, rotYAngle);
      } else if (model === "badge") {
        drawBadge(W, H, rotXAngle, rotYAngle);
      }

      drawParticles(W, H);
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchmove", onTouch);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled, model, rotSpeed, density, particleSize, partSpeed, particleCol, accentCol, gridCol]);

  /* ── Label helpers ─────────────────────────────────── */
  const labelMap: Record<string, { top: string; bottom: string }> = {
    paver:     { top: "Hardscape Render — Pavé System v2.1",      bottom: "Paver Grid · Stone Slab · Earth Particles" },
    blueprint: { top: "Blueprint Render — Architectural Frame",   bottom: "Blueprint Cube · Floorplan · Gold Particles" },
    badge:     { top: "Service Render — Maintenance Badge v1.0",  bottom: "Service Badge · Wrench Icon · Air Particles" },
    default:   { top: "Architectural Render — Pavé System v2.1",  bottom: "Grid · Scroll to rotate" },
  };
  const labels = labelMap[model] ?? labelMap.default;

  return (
    <section
      id="render"
      ref={sectionRef}
      className={`relative w-full overflow-hidden bg-gradient-1 noise ${compact ? "py-12" : "py-28"}`}
      aria-label="Interactive 3D architectural render"
    >
      {!compact && (
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 mb-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="section-eyebrow text-gold/70 block mb-4">
                <span className="inline-block w-6 h-px bg-gold/60 mr-3 align-middle" />
                {title ?? "Interactive 3D Preview"}
              </span>
              <h2 className="font-headline font-bold text-fluid-2xl text-warm-white leading-[1.1]">
                Precision in<br />Every Dimension
              </h2>
            </div>
            <p className="font-sans text-sm text-gray-400 max-w-xs leading-relaxed md:text-right">
              {subtitle ?? "Scroll or move your cursor to interact — a live preview of the precision we bring to every project."}
            </p>
          </div>
        </div>
      )}
      {compact && title && (
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 mb-6">
          <h3 className="font-headline font-bold text-lg text-warm-white">{title}</h3>
          {subtitle && <p className="font-sans text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div
          className={[
            "canvas-container relative rounded-2xl border overflow-hidden transition-all duration-500",
            hovered ? "border-gold/40 shadow-2xl shadow-gold/10" : "border-white/8",
          ].join(" ")}
          style={{ height: compact ? "clamp(240px, 35vw, 320px)" : "clamp(380px, 55vw, 560px)" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {enabled ? (
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              aria-label="Interactive 3D render"
              role="img"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-1">
              <p className="font-mono text-xs text-gray-500">3D renderer disabled</p>
            </div>
          )}

          {/* Corner brackets */}
          {(["top-3 left-3","top-3 right-3","bottom-3 left-3","bottom-3 right-3"] as const).map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-5 h-5 pointer-events-none`}>
              <div className={`absolute ${i < 2 ? "top-0" : "bottom-0"} left-0 right-0 h-px bg-gold/50`} />
              <div className={`absolute ${i % 2 === 0 ? "left-0" : "right-0"} top-0 bottom-0 w-px bg-gold/50`} />
            </div>
          ))}

          <div className="absolute top-4 left-1/2 -translate-x-1/2 glass px-4 py-1.5 rounded-full pointer-events-none">
            <span className="font-mono text-[10px] text-gold/80 tracking-widest uppercase">{labels.top}</span>
          </div>
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between pointer-events-none">
            <span className="font-mono text-[10px] text-gray-500 tracking-wider">{labels.bottom}</span>
            <span className="font-mono text-[10px] text-gray-500 tracking-wider">Move cursor to interact</span>
          </div>
        </div>
      </div>

      {!compact && <div className="divider-gradient mx-auto max-w-screen-xl mt-16 px-10" />}
    </section>
  );
}

export default function ThreeDContainer() {
  return <ThreeDContainerBase />;
}
