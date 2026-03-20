import { useState } from "react";
import { Helmet } from "react-helmet-async";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import { useQuery } from "@animaapp/playground-react-sdk";
import { BookOpen, UsersFour, Wrench, CalendarBlank, Clock, CurrencyDollar, ArrowUpRight, CaretRight } from "@phosphor-icons/react";

const FALLBACK_ITEMS = [
  { id: "a1", type: "course", title: "Construction Fundamentals", description: "Master the core principles of residential construction — from foundation to finish. Ideal for aspiring contractors, homeowners, and project managers.", price: "$299", duration: "6 weeks", instructor: "Silviol Monzon", status: "published", thumbnailUrl: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png", tags: "beginner,construction" },
  { id: "a2", type: "coaching", title: "1-on-1 Business Coaching", description: "Private coaching sessions tailored to contractors and tradespeople looking to grow their construction business, improve systems, and scale revenue.", price: "$150/hr", duration: "Flexible", instructor: "Silviol Monzon", status: "published", thumbnailUrl: "https://c.animaapp.com/mmslviois4xSNv/img/ai_2.png", tags: "business,coaching" },
  { id: "a3", type: "workshop", title: "Landscaping Design Workshop", description: "A hands-on full-day workshop covering design principles, plant selection, drainage planning, and seasonal care for residential properties.", price: "$149", duration: "1 day", instructor: "Landscaping Team", status: "published", thumbnailUrl: "https://c.animaapp.com/mmslviois4xSNv/img/ai_4.png", tags: "landscaping,design" },
  { id: "a4", type: "event", title: "Monzon Open House 2025", description: "Tour our active construction sites, meet the team, see live demos, and network with industry professionals at our annual open house event.", price: "Free", duration: "Half day", instructor: "Full Team", status: "published", thumbnailUrl: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png", tags: "event,networking" },
  { id: "a5", type: "course", title: "Advanced Renovation Techniques", description: "Deep-dive into high-end renovation finishes, material selection, budget management, and project coordination for experienced professionals.", price: "$499", duration: "8 weeks", instructor: "Senior Team", status: "published", thumbnailUrl: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png", tags: "advanced,renovation" },
  { id: "a6", type: "workshop", title: "Snow Removal & Winter Prep", description: "Essential skills for residential and commercial property maintenance during Quebec winters — equipment, contracts, and safety protocols.", price: "$89", duration: "3 hours", instructor: "Ops Manager", status: "published", thumbnailUrl: "https://c.animaapp.com/mmslviois4xSNv/img/ai_2.png", tags: "seasonal,maintenance" },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  course:   <BookOpen size={16} weight="fill" />,
  coaching: <UsersFour size={16} weight="fill" />,
  workshop: <Wrench size={16} weight="fill" />,
  event:    <CalendarBlank size={16} weight="fill" />,
};

const TYPE_COLORS: Record<string, string> = {
  course:   "bg-blue-100 text-blue-700",
  coaching: "bg-purple-100 text-purple-700",
  workshop: "bg-amber-100 text-amber-700",
  event:    "bg-green-100 text-green-700",
};

const FILTERS = ["All", "course", "coaching", "workshop", "event"];
const FILTER_LABELS: Record<string, string> = { All: "All", course: "Courses", coaching: "Coaching", workshop: "Workshops", event: "Events" };

export default function AcademyPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const { data: items } = useQuery("AcademyItem", { where: { status: "published" } });
  const list = (items && items.length > 0) ? items : FALLBACK_ITEMS;
  const filtered = activeFilter === "All" ? list : list.filter(i => i.type === activeFilter);

  return (
    <>
      <Helmet>
        <title>Academy – Aménagement Monzon</title>
        <meta name="description" content="Courses, coaching, workshops, and events from Aménagement Monzon." />
      </Helmet>
      <PageShell>
        <PageHero eyebrow="Learn & Grow" title="Monzon Academy" subtitle="We're not just builders — we're educators. Gain skills, get coaching, and grow in the trades industry." />

        {/* Stats banner */}
        <section className="py-10 bg-charcoal border-b border-white/5">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Active Programs",   value: "12+"  },
                { label: "Students Enrolled", value: "340+" },
                { label: "Expert Instructors",value: "8"    },
                { label: "Success Rate",      value: "97%"  },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="font-headline font-bold text-3xl text-gold">{s.value}</p>
                  <p className="font-sans text-xs text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <div className="flex flex-wrap gap-2 mb-10">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={["px-4 py-2 text-xs font-mono rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none", f === activeFilter ? "bg-charcoal text-gold border-charcoal" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"].join(" ")}>
                  {FILTER_LABELS[f]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(item => (
                <div key={item.id} className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gold/30 hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
                  <div className="relative aspect-video overflow-hidden">
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-gradient-1 flex items-center justify-center">
                        <span className="text-4xl opacity-30">{TYPE_ICONS[item.type]}</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono rounded-full ${TYPE_COLORS[item.type] || "bg-gray-100 text-gray-600"}`}>
                        {TYPE_ICONS[item.type]} {item.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 p-5">
                    <h3 className="font-headline font-bold text-base text-charcoal mb-2">{item.title}</h3>
                    <p className="font-sans text-sm text-gray-500 leading-relaxed flex-1 mb-4">{item.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                      {item.duration && <span className="flex items-center gap-1"><Clock size={12} />{item.duration}</span>}
                      {item.instructor && <span className="flex items-center gap-1"><UsersFour size={12} />{item.instructor}</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-headline font-bold text-lg text-charcoal">{item.price}</span>
                      <button className="flex items-center gap-1.5 px-4 py-2 bg-charcoal text-gold text-xs font-sans font-semibold rounded-xl hover:bg-gold hover:text-charcoal transition-all duration-300 cursor-pointer">
                        Enroll <ArrowUpRight size={13} weight="bold" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-24">
                <BookOpen size={36} weight="regular" className="text-gray-300 mx-auto mb-4" />
                <p className="font-sans text-sm text-gray-400">No items in this category yet.</p>
              </div>
            )}

          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-charcoal">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10 text-center">
            <h2 className="font-headline font-bold text-fluid-xl text-warm-white mb-4">Ready to level up?</h2>
            <p className="font-sans text-sm text-gray-400 max-w-md mx-auto mb-8">Join hundreds of students who have advanced their skills and grown their businesses with Monzon Academy.</p>
            <a href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-charcoal font-sans font-semibold text-sm rounded-xl hover:bg-gold-dark transition-all shadow-lg shadow-gold/20">
              Get in Touch <ArrowUpRight size={14} weight="bold" />
            </a>
          </div>
        </section>
      </PageShell>
    </>
  );
}
