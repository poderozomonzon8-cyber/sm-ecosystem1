import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import ContactSection from "@/components/ContactSection";
import ReviewsSection from "@/components/ReviewsSection";
import ThreeDContainer from "@/components/ThreeDContainer";
import { useQuery } from "@animaapp/playground-react-sdk";
import { ArrowUpRight, Check, Shield, Certificate, Scales, WarningDiamond } from "@phosphor-icons/react";

/* ─── CASE STUDIES ─── */
const CASE_STUDIES = [
  {
    title: "Laurentian Full-Home Renovation",
    scope: ["Structural reinforcement", "Complete interior gut", "Custom kitchen & bath", "Engineered hardwood floors"],
    budget: "$280K – $350K",
    duration: "14 weeks",
    before: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_2.png",
    after:  "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_4.png",
    category: "Full Renovation",
    year: "2024",
  },
  {
    title: "Outremont Second-Floor Addition",
    scope: ["Structural planning & permits", "Second-floor framing", "2 bedrooms + ensuite", "Roofline integration"],
    budget: "$190K – $240K",
    duration: "10 weeks",
    before: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_3.png",
    after:  "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_5.png",
    category: "Addition",
    year: "2024",
  },
  {
    title: "Plateau Open-Concept Kitchen",
    scope: ["Load-bearing wall removal", "Custom island & cabinetry", "Quartz countertops", "Concealed LED system"],
    budget: "$75K – $95K",
    duration: "6 weeks",
    before: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_4.png",
    after:  "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_2.png",
    category: "Interior",
    year: "2023",
  },
  {
    title: "NDG Basement Conversion",
    scope: ["Waterproofing & insulation", "Framing + electrical", "Home theatre alcove", "Polished concrete floors"],
    budget: "$60K – $80K",
    duration: "5 weeks",
    before: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_5.png",
    after:  "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_3.png",
    category: "Basement",
    year: "2023",
  },
];

/* ─── PROCESS TIMELINE ─── */
const PROCESS_STEPS = [
  { num: "01", title: "Discovery Call",      duration: "Day 1",      desc: "Understanding scope, timeline, and budget. We walk the site with you." },
  { num: "02", title: "Design & Blueprint",  duration: "Week 1–2",   desc: "Full CAD drawings, material selections, and permit filing if required." },
  { num: "03", title: "Permit Approval",     duration: "Week 2–4",   desc: "We handle city submissions and follow up until permits are granted." },
  { num: "04", title: "Site Preparation",    duration: "Week 4–5",   desc: "Demolition, structural work, and pre-installation preparations." },
  { num: "05", title: "Construction Phase",  duration: "Weeks 5–12", desc: "Full build managed by our site foreman with daily progress photos." },
  { num: "06", title: "Handover & Warranty", duration: "Final Week",  desc: "Final walkthrough, deficiency list, and 2-year workmanship warranty." },
];

/* ─── CERTIFICATIONS ─── */
const CERTS = [
  { icon: <Certificate size={28} weight="duotone" />, label: "RBQ Licenced",        desc: "Licence #5870-2345-01" },
  { icon: <Shield size={28} weight="duotone" />,       label: "Fully Insured",       desc: "$2M liability coverage" },
  { icon: <Scales size={28} weight="duotone" />,       label: "CCQ Compliant",       desc: "Certified union labour" },
  { icon: <WarningDiamond size={28} weight="duotone" />,label: "APCHQ Member",       desc: "Association member 2019–" },
];

export default function ConstructionPage() {
  const [activeCase, setActiveCase] = useState(0);
  const cs = CASE_STUDIES[activeCase];

  const { data: projects } = useQuery("Project", { where: { category: { in: ["Construction", "Renovation"] } }, orderBy: { createdAt: "desc" }, limit: 6 });

  return (
    <>
      <Helmet>
        <title>Construction & Renovation – Aménagement Monzon</title>
        <meta name="description" content="Expert construction, renovation, and addition services in Montreal. Blueprint-level precision by Aménagement Monzon." />
      </Helmet>
      <PageShell>

        {/* HERO */}
        <PageHero
          eyebrow="Construction · Renovation · Interior"
          title="Architectural Precision. Every Detail Matters."
          subtitle="Renovations, additions, and interior transformations built with blueprint-level accuracy and craftsmanship that stands the test of time."
        />

        {/* ─── 1. BLUEPRINT GRID INTRO ─── */}
        <section className="py-20 relative overflow-hidden" style={{ background: "var(--theme-section-alt-bg, hsl(220,18%,14%))" }}>
          {/* Blueprint grid overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(200,165,80,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(200,165,80,0.05) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
          <div className="max-w-screen-xl mx-auto px-6 md:px-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { value: "250+", label: "Projects Completed",  note: "Since 2016" },
                { value: "14",   label: "Weeks Avg. Reno Time", note: "Full home" },
                { value: "100%", label: "Permit Success Rate",  note: "City approved" },
              ].map((kpi, i) => (
                <div key={i} className="text-center p-8 rounded-2xl" style={{ border: "1px solid rgba(200,165,80,0.12)", background: "rgba(200,165,80,0.02)" }}>
                  <p className="font-headline font-bold text-white mb-2" style={{ fontSize: "clamp(3rem,6vw,5rem)", color: "var(--theme-accent, hsl(38,70%,58%))" }}>{kpi.value}</p>
                  <p className="font-sans font-semibold text-white text-sm">{kpi.label}</p>
                  <p className="font-mono text-[11px] mt-1" style={{ color: "rgba(200,165,80,0.5)" }}>{kpi.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 2. RENOVATION CASE STUDIES ─── */}
        <section className="py-20 bg-white">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <div className="mb-10">
              <p className="font-mono text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--theme-accent, hsl(38,70%,58%))" }}>Case Studies</p>
              <h2 className="font-headline font-bold text-fluid-xl text-charcoal">Featured Projects</h2>
            </div>
            {/* Selector tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {CASE_STUDIES.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCase(i)}
                  className={`px-4 py-2 text-xs font-mono rounded-xl border transition-all cursor-pointer ${activeCase === i ? "bg-charcoal text-gold border-charcoal" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"}`}
                >
                  {c.category}
                </button>
              ))}
            </div>
            {/* Active case */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Images */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative rounded-xl overflow-hidden" style={{ height: 220 }}>
                  <img src={cs.before} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[10px] font-mono rounded">Before</div>
                </div>
                <div className="relative rounded-xl overflow-hidden" style={{ height: 220 }}>
                  <img src={cs.after} alt="After" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[10px] font-mono rounded">After</div>
                </div>
              </div>
              {/* Details */}
              <div className="flex flex-col gap-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--theme-accent, hsl(38,70%,58%))" }}>{cs.category} · {cs.year}</span>
                  <h3 className="font-headline font-bold text-2xl text-charcoal mt-1">{cs.title}</h3>
                </div>
                <ul className="flex flex-col gap-2">
                  {cs.scope.map((item, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm font-sans text-gray-600">
                      <Check size={14} weight="bold" style={{ color: "var(--theme-accent, hsl(38,70%,58%))", flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-6 pt-2 border-t border-gray-100">
                  <div>
                    <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">Budget</p>
                    <p className="font-headline font-bold text-charcoal text-base mt-0.5">{cs.budget}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">Timeline</p>
                    <p className="font-headline font-bold text-charcoal text-base mt-0.5">{cs.duration}</p>
                  </div>
                </div>
                <a href="/contact" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-sans font-semibold rounded-xl transition-all self-start" style={{ background: "var(--theme-btn-bg, hsl(38,70%,54%))", color: "var(--theme-btn-text, hsl(220,20%,10%))" }}>
                  Start a Similar Project <ArrowUpRight size={14} weight="bold" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. INTERIOR DESIGN SECTION ─── */}
        <section className="py-20" style={{ background: "var(--theme-section-bg, hsl(220,15%,98%))" }}>
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <div className="mb-10">
              <p className="font-mono text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--theme-accent, hsl(38,70%,58%))" }}>Interior Work</p>
              <h2 className="font-headline font-bold text-fluid-xl text-charcoal">Room by Room</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { room: "Kitchen", img: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_4.png", features: ["Custom cabinetry", "Stone countertops", "Open concept"] },
                { room: "Bathroom", img: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_5.png", features: ["Walk-in shower", "Heated floors", "Custom tile"] },
                { room: "Basement", img: "https://c.animaapp.com/mmr3v89y52bO3P/img/ai_2.png", features: ["Waterproofing", "Full finishing", "Home theatre"] },
              ].map((room, i) => (
                <div key={i} className="group flex flex-col overflow-hidden rounded-2xl border" style={{ borderColor: "var(--theme-border, hsl(220,12%,88%))", background: "var(--theme-card-bg, white)" }}>
                  <div className="relative overflow-hidden" style={{ height: 200 }}>
                    <img src={room.img} alt={room.room} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <h3 className="absolute bottom-4 left-4 font-headline font-bold text-xl text-white">{room.room}</h3>
                  </div>
                  <div className="p-5">
                    <ul className="flex flex-col gap-2">
                      {room.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm font-sans text-gray-600">
                          <Check size={12} weight="bold" style={{ color: "var(--theme-accent, hsl(38,70%,58%))", flexShrink: 0 }} /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 4. PROCESS TIMELINE ─── */}
        <section className="py-20 bg-white">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <div className="mb-12 text-center">
              <p className="font-mono text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--theme-accent, hsl(38,70%,58%))" }}>How It Works</p>
              <h2 className="font-headline font-bold text-fluid-xl text-charcoal">Our Process</h2>
              <p className="font-sans text-sm text-gray-500 mt-3 max-w-lg mx-auto">From the first call to the final key handover — a transparent, step-by-step process.</p>
            </div>
            <div className="relative">
              {/* Connector line */}
              <div className="absolute top-8 left-0 right-0 h-[1px] hidden md:block" style={{ background: "linear-gradient(90deg, transparent, var(--theme-accent, hsl(38,70%,58%)), transparent)", opacity: 0.2 }} />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                {PROCESS_STEPS.map((step, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-full border-2 flex items-center justify-center font-mono font-bold text-sm relative z-10 bg-white" style={{ borderColor: "var(--theme-accent, hsl(38,70%,58%))", color: "var(--theme-accent, hsl(38,70%,58%))" }}>
                      {step.num}
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--theme-accent, hsl(38,70%,58%))" }}>{step.duration}</p>
                    <h4 className="font-sans font-semibold text-xs text-charcoal">{step.title}</h4>
                    <p className="font-sans text-[11px] text-gray-400 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 5. CERTIFICATIONS & PERMITS ─── */}
        <section className="py-20" style={{ background: "var(--theme-section-alt-bg, hsl(220,18%,14%))" }}>
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <div className="mb-10 text-center">
              <p className="font-mono text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--theme-accent, hsl(38,70%,58%))" }}>Trust & Compliance</p>
              <h2 className="font-headline font-bold text-fluid-xl text-white">Licences & Certifications</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
              {CERTS.map((cert, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl" style={{ border: "1px solid rgba(200,165,80,0.10)", background: "rgba(200,165,80,0.03)", color: "var(--theme-accent, hsl(38,70%,58%))" }}>
                  {cert.icon}
                  <h4 className="font-sans font-semibold text-sm text-white">{cert.label}</h4>
                  <p className="font-mono text-[10px]" style={{ color: "rgba(200,165,80,0.5)" }}>{cert.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="font-sans text-sm text-gray-400 mb-6 max-w-lg mx-auto">All permits handled in-house. We have a 100% permit approval success rate with the City of Montréal and surrounding municipalities.</p>
              <a href="/contact" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-sans font-semibold rounded-xl transition-all" style={{ background: "var(--theme-btn-bg, hsl(38,70%,54%))", color: "var(--theme-btn-text, hsl(220,20%,10%))" }}>
                Start a Project <ArrowUpRight size={14} weight="bold" />
              </a>
            </div>
          </div>
        </section>

        <ThreeDContainer />
        <ReviewsSection limit={3} />
        <ContactSection />
      </PageShell>
    </>
  );
}
