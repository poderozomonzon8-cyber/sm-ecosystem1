import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import ContactSection from "@/components/ContactSection";
import ReviewsSection from "@/components/ReviewsSection";
import ThreeDContainer from "@/components/ThreeDContainer";
import { supabase } from "@/lib/supabaseClient";
import { ArrowUpRight, Check, ArrowRight } from "@phosphor-icons/react";
import StorePage from "@/pages/StorePage";

/* ─── MATERIALS ─── */
const MATERIALS = [
  { name: "Bluestone Paver", finish: "Natural Cleft", hex: "#6B7E8A", img: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_3.png" },
  { name: "Limestone Slab", finish: "Honed", hex: "#C8B89A", img: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_4.png" },
  { name: "Granite Aggregate", finish: "Tumbled", hex: "#8A8A7A", img: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_5.png" },
  { name: "Concrete Paver", finish: "Brushed", hex: "#B0A898", img: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_2.png" },
  { name: "Slate Tile", finish: "Split Face", hex: "#5E6E76", img: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_3.png" },
  { name: "Porcelain Tile", finish: "Polished", hex: "#DDD8D0", img: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_4.png" },
];

/* ─── BEFORE/AFTER ─── */
const BEFORE_AFTER = [
  {
    title: "Backyard Patio Transformation",
    before: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_2.png",
    after: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_5.png",
    tag: "Patio · Limestone",
    year: "2024",
  },
  {
    title: "Driveway Pavé Upgrade",
    before: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_3.png",
    after: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_4.png",
    tag: "Driveway · Bluestone",
    year: "2024",
  },
];

/* ─── INSPIRATION ─── */
const INSPIRATION = [
  { title: "Stone Patio", img: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_3.png", tag: "Patio" },
  { title: "Pergola & Fire Pit", img: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_4.png", tag: "Living Space" },
  { title: "Retaining Wall", img: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_5.png", tag: "Structural" },
  { title: "Paver Walkway", img: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_2.png", tag: "Walkway" },
  { title: "Water Feature", img: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_3.png", tag: "Feature" },
  { title: "Garden Border", img: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_4.png", tag: "Landscaping" },
];

/* ─── BEFORE/AFTER SLIDER ─── */
function BeforeAfterSlider({ before, after, title, tag, year }) {
  const [pos, setPos] = useState(50);
  const trackRef = useRef<HTMLDivElement>(null);

  const move = (clientX: number) => {
    if (!trackRef.current) return;
    const { left, width } = trackRef.current.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - left) / width) * 100));
    setPos(pct);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden group" style={{ height: 340 }}>
      <img src={after} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={before} className="absolute inset-0 w-full h-full object-cover" style={{ width: `${10000 / pos}%` }} />
      </div>

      <div
        ref={trackRef}
        className="absolute inset-0 cursor-col-resize"
        onMouseMove={(e) => e.buttons === 1 && move(e.clientX)}
        onTouchMove={(e) => move(e.touches[0].clientX)}
      >
        <div className="absolute top-0 bottom-0 w-[2px] bg-white/90 shadow-lg" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center">
            <span className="text-charcoal text-[10px] font-bold">◀▶</span>
          </div>
        </div>
      </div>

      <div className="absolute top-3 left-3 pointer-events-none">
        <span className="px-2 py-1 bg-black/60 text-white text-[10px] font-mono rounded">Before</span>
      </div>

      <div className="absolute top-3 right-3 pointer-events-none">
        <span className="px-2 py-1 bg-black/60 text-white text-[10px] font-mono rounded">After</span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none">
        <span className="font-mono text-[10px] text-green-400 uppercase tracking-widest">{tag} · {year}</span>
        <p className="font-headline font-bold text-lg text-white mt-1">{title}</p>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   MAIN PAGE
────────────────────────────────────────────── */
export default function HardscapePage() {
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* Supabase direct fetch */
  useEffect(() => {
    async function loadProjects() {
      const { data, error } = await supabase
        .from("Project")
        .select("*")
        .in("category", ["Landscaping", "Hardscape"])
        .order("createdAt", { ascending: false })
        .limit(9);

      if (!error && data && data.length > 0) {
        setGallery(data);
      } else {
        setGallery([
          { src: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_3.png", alt: "Pavé Driveway", title: "Luxury Pavé Driveway", category: "Hardscape", year: "2024", size: "tall" },
          { src: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_4.png", alt: "Patio Terrace", title: "Stone Patio Terrace", category: "Hardscape", year: "2024", size: "wide" },
          { src: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_5.png", alt: "Garden Landscape", title: "Garden Landscape", category: "Landscaping", year: "2023", size: "normal" },
          { src: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_2.png", alt: "Retaining Wall", title: "Retaining Wall Feature", category: "Hardscape", year: "2024", size: "normal" },
          { src: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_3.png", alt: "Outdoor Kitchen", title: "Outdoor Kitchen & Patio", category: "Hardscape", year: "2023", size: "normal" },
          { src: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_5.png", alt: "Living Garden", title: "Living Garden Design", category: "Landscaping", year: "2024", size: "wide" },
        ]);
      }

      setLoading(false);
    }

    loadProjects();
  }, []);

  return (
    <>
      <Helmet>
        <title>Hardscape & Landscape – Aménagement Monzon</title>
        <meta name="description" content="Premium hardscape and landscape design: pavers, patios, retaining walls, outdoor living spaces by Aménagement Monzon." />
      </Helmet>

      <PageShell>
        <PageHero
          eyebrow="Hardscape · Patio · Landscape"
          title="Stone-Crafted Living Spaces"
          subtitle="From premium paver driveways to lush living landscapes — every square foot transformed with natural materials and botanical precision."
        />

        {/* GALLERY */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--theme-accent, #4CAF50)" }}>Project Gallery</p>
                <h2 className="font-headline font-bold text-fluid-xl text-charcoal">Our Hardscape Work</h2>
              </div>
              <a href="/portfolio" className="hidden md:flex items-center gap-2 font-sans text-sm text-gray-500 hover:text-charcoal transition-colors group">
                View All Projects <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {gallery.map((item, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-2xl group cursor-pointer ${item.size === "tall" ? "row-span-2" : ""} ${item.size === "wide" ? "col-span-2" : ""}`}
                  style={{ minHeight: item.size === "tall" ? "480px" : item.size === "wide" ? "260px" : "240px" }}
                >
                  <img src={item.src} alt={item.alt} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 text-[10px] font-mono rounded-full backdrop-blur-sm bg-black/40 text-green-300">{item.category}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="font-mono text-[10px] text-green-400/80 uppercase tracking-wider">{item.year}</span>
                    <h3 className="font-headline font-bold text-base text-white mt-0.5 leading-tight">{item.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MATERIALS */}
        <section className="py-20 bg-white overflow-hidden">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <div className="mb-10">
              <p className="font-mono text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--theme-accent, #4CAF50)" }}>Materials</p>
              <h2 className="font-headline font-bold text-fluid-xl text-charcoal">Premium Finishes & Textures</h2>
              <p className="font-sans text-sm text-gray-500 mt-3 max-w-xl">We source only the finest natural stone, pavers, and aggregate finishes — each one selected for durability, aesthetics, and character.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {MATERIALS.map((mat, i) => (
                <div key={i} className="group flex flex-col gap-3 cursor-pointer">
                  <div className="relative rounded-xl overflow-hidden aspect-square">
                    <img src={mat.img} alt={mat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `${mat.hex}40` }} />
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: mat.hex }} />
                  </div>

                  <div>
                    <p className="font-sans font-semibold text-xs text-charcoal leading-tight">{mat.name}</p>
                    <p className="font-mono text-[10px] text-gray-400 mt-0.5">{mat.finish}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BEFORE / AFTER */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <div className="mb-10">
              <p className="font-mono text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--theme-accent, #4CAF50)" }}>Transformations</p>
              <h2 className="font-headline font-bold text-fluid-xl text-charcoal">Before & After</h2>
              <p className="font-sans text-sm text-gray-500 mt-3 max-w-lg">Drag the handle to reveal the transformation. These are real projects — no renders.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {BEFORE_AFTER.map((ba, i) => (
                <BeforeAfterSlider key={i} {...ba} />
              ))}
            </div>
          </div>
        </section>

        {/* 3D SHOWCASE */}
        <ThreeDContainer />

        {/* INSPIRATION */}
        <section className="py-20 bg-white">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <div className="mb-10">
              <p className="font-mono text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--theme-accent, #4CAF50)" }}>Inspiration</p>
              <h2 className="font-headline font-bold text-fluid-xl text-charcoal">Outdoor Living Ideas</h2>
              <p className="font-sans text-sm text-gray-500 mt-3 max-w-lg">Curated completed projects — from cozy patios to statement retaining walls and custom water features.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {INSPIRATION.map((item, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl cursor-pointer" style={{ height: i % 3 === 1 ? 320 : 240 }}>
                  <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/50 transition-colors duration-400" />
                  <div className="absolute inset-0 flex flex-col items-start justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="font-mono text-[10px] text-green-300 uppercase tracking-widest mb-1">{item.tag}</span>
                    <p className="font-headline font-bold text-base text-white">{item.title}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="font-sans text-xs text-gray-300">View Project</span>
                      <ArrowUpRight size={11} className="text-green-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div