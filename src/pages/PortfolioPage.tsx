import { useState } from "react";
import { Helmet } from "react-helmet-async";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import ThreeDContainer from "@/components/ThreeDContainer";
import { ArrowUpRight, Play } from "@phosphor-icons/react";
import { useQuery } from "@animaapp/playground-react-sdk";

const FILTERS = ["All", "Construction", "Renovation", "Landscaping", "Maintenance"];

const FALLBACK = [
  { src: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png", alt: "Urban Construction",     title: "Urban Construction",      category: "Construction", year: "2024", size: "tall"   },
  { src: "https://c.animaapp.com/mmslviois4xSNv/img/ai_4.png", alt: "Modern Home Renovation",  title: "Modern Home Renovation",  category: "Renovation",   year: "2024", size: "wide"   },
  { src: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png", alt: "Community Landscaping",   title: "Community Landscaping",   category: "Landscaping",  year: "2023", size: "normal" },
  { src: "https://c.animaapp.com/mmslviois4xSNv/img/ai_2.png", alt: "Luxury Pavé Driveway",    title: "Luxury Pavé Driveway",    category: "Landscaping",  year: "2024", size: "normal" },
  { src: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png", alt: "Commercial Build",        title: "Commercial Build",        category: "Construction", year: "2023", size: "normal" },
  { src: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png", alt: "Terrace Garden",          title: "Terrace Garden",          category: "Landscaping",  year: "2024", size: "wide"   },
  { src: "https://c.animaapp.com/mmslviois4xSNv/img/ai_4.png", alt: "Rooftop Renovation",      title: "Rooftop Renovation",      category: "Renovation",   year: "2023", size: "normal" },
  { src: "https://c.animaapp.com/mmslviois4xSNv/img/ai_2.png", alt: "Industrial Conversion",   title: "Industrial Conversion",   category: "Construction", year: "2024", size: "normal" },
  { src: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png", alt: "Estate Grounds",          title: "Estate Grounds",          category: "Landscaping",  year: "2024", size: "tall"   },
];

export default function PortfolioPage() {
  const [filter, setFilter] = useState("All");

  const { data: projects, isPending } = useQuery("Project", { orderBy: { createdAt: "desc" } });

  const items = (projects && projects.length > 0) ? projects : FALLBACK;
  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);

  return (
    <>
      <Helmet>
        <title>Portfolio – Aménagement Monzon</title>
        <meta name="description" content="Browse our portfolio of 250+ construction, renovation, and landscaping projects." />
      </Helmet>
      <PageShell>
        <PageHero eyebrow="Showcase" title="Portfolio & Gallery" subtitle="Browse our complete collection of projects — each one a testament to precision and craftsmanship." />

        <section className="py-16 bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">

            <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Filter portfolio">
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={["px-4 py-2 text-xs font-mono font-medium rounded-xl border transition-all duration-200 focus:outline-none cursor-pointer", f === filter ? "bg-charcoal text-gold border-charcoal" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"].join(" ")}>
                  {f}
                </button>
              ))}
            </div>

            {isPending ? (
              <div className="flex items-center justify-center py-24">
                <span className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {filtered.map((item, i) => (
                  <div key={item.title + i}
                    className={["relative overflow-hidden rounded-2xl group cursor-pointer", item.size === "tall" ? "row-span-2" : "", item.size === "wide" ? "col-span-2" : ""].join(" ")}
                    style={{ minHeight: item.size === "tall" ? "480px" : item.size === "wide" ? "260px" : "240px" }}>
                    <img src={item.src} alt={item.alt} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="glass px-3 py-1.5 text-[10px] font-mono text-gold/90 rounded-full">{item.category}</span>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 scale-75 group-hover:scale-100">
                      <Play size={18} weight="fill" className="text-warm-white translate-x-0.5" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
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
          </div>
        </section>

        {/* Optional 3D showcase */}
        <ThreeDContainer />
      </PageShell>
    </>
  );
}
