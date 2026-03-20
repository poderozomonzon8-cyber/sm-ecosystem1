import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Play } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { useQuery } from "@/lib/anima-supabase-adapter";

const FILTERS = ["All","Construction","Renovation","Landscaping","Maintenance"];

const FALLBACK_ITEMS = [
  { src: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png", alt: "construction team working on site",      title: "Urban Construction",    category: "Construction", year: "2024", size: "tall"   },
  { src: "https://c.animaapp.com/mmslviois4xSNv/img/ai_4.png", alt: "modern renovated home exterior",          title: "Modern Home Renovation", category: "Renovation",   year: "2024", size: "wide"   },
  { src: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png", alt: "landscaping crew community interaction",  title: "Community Landscaping",  category: "Landscaping",  year: "2023", size: "normal" },
  { src: "https://c.animaapp.com/mmslviois4xSNv/img/ai_2.png", alt: "abstract metallic dark gradient render",  title: "Luxury Pavé Driveway",   category: "Landscaping",  year: "2024", size: "normal" },
  { src: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png", alt: "construction team working on site",      title: "Commercial Build",       category: "Construction", year: "2023", size: "normal" },
  { src: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png", alt: "landscaping crew community interaction", title: "Terrace Garden",         category: "Landscaping",  year: "2024", size: "wide"   },
];

export default function PortfolioSection() {
  const [filter, setFilter] = useState("All");
  const containerRef        = useRef<HTMLDivElement>(null);

  const { data: projects, isPending } = useQuery("Project", { orderBy: { createdAt: "desc" }, limit: 12 });

  const items = (projects && projects.length > 0)
    ? projects.map((p) => ({ src: p.src, alt: p.alt, title: p.title, category: p.category, year: p.year, size: p.size }))
    : FALLBACK_ITEMS;

  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);

  useEffect(() => {
    const els = containerRef.current?.querySelectorAll<HTMLElement>(".portfolio-item");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el    = entry.target as HTMLElement;
          const delay = parseInt(el.dataset.delay || "0", 10);
          setTimeout(() => {
            el.style.opacity   = "1";
            el.style.transform = "translateY(0) scale(1)";
          }, delay);
          obs.unobserve(el);
        });
      },
      { threshold: 0.08 }
    );
    els.forEach((el) => {
      el.style.opacity    = "0";
      el.style.transform  = "translateY(32px) scale(0.97)";
      el.style.transition = "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)";
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, [filter, isPending]);

  return (
    <section id="portfolio" className="py-28 bg-gray-50" aria-label="Portfolio">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
          <div>
            <span className="section-eyebrow text-gold block mb-4">
              <span className="inline-block w-6 h-px bg-gold/60 mr-3 align-middle" />
              Showcase
            </span>
            <h2 className="font-headline font-bold text-fluid-2xl text-charcoal leading-[1.1]">Featured Projects</h2>
          </div>
          <Link to="/portfolio"
            className="flex items-center gap-2 px-6 py-3 bg-charcoal text-warm-white font-sans font-medium text-sm rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold self-start group">
            View All Projects
            <ArrowUpRight size={15} weight="bold" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Filter portfolio by category">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={["px-4 py-2 text-xs font-mono font-medium rounded-xl border transition-all duration-200 focus:outline-none cursor-pointer", f === filter ? "bg-charcoal text-gold border-charcoal" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-charcoal"].join(" ")}>
              {f}
            </button>
          ))}
        </div>

        {isPending ? (
          <div className="flex items-center justify-center py-24">
            <span className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : (
          <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {filtered.map((item, i) => (
              <div key={item.title + i} data-delay={String(i * 80)}
                className={["portfolio-item relative overflow-hidden rounded-2xl group cursor-pointer", item.size === "tall" ? "row-span-2" : "", item.size === "wide" ? "col-span-2" : ""].join(" ")}
                style={{ minHeight: item.size === "tall" ? "480px" : item.size === "wide" ? "260px" : "240px" }}>
                <img src={item.src} alt={item.alt} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="glass px-3 py-1.5 text-[10px] font-mono text-gold/90 rounded-full">{item.category}</span>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 scale-75 group-hover:scale-100">
                  <Play size={18} weight="fill" className="text-warm-white translate-x-0.5" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-400 ease-out">
                  <span className="font-mono text-[10px] text-gold/70 uppercase tracking-wider">{item.year}</span>
                  <h3 className="font-headline font-bold text-lg text-warm-white mt-1 leading-tight">{item.title}</h3>
                  <div className="mt-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-75">
                    <span className="font-sans text-xs text-gray-300">View Case Study</span>
                    <ArrowUpRight size={12} weight="bold" className="text-gold" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-14 flex items-center justify-center">
          <div className="flex items-center gap-6 px-8 py-5 glass-light rounded-2xl border border-gray-200">
            <p className="font-sans text-sm text-gray-500">
              Want to see more? We have <strong className="text-charcoal font-semibold">250+ completed projects</strong>.
            </p>
            <Link to="/portfolio"
              className="flex items-center gap-1.5 text-xs font-semibold font-sans text-gold hover:text-gold-dark transition-colors duration-200 whitespace-nowrap">
              Full Gallery <ArrowUpRight size={12} weight="bold" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
