import { useState } from "react";
import { Helmet } from "react-helmet-async";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { Check, ShoppingCart, Repeat, Buildings, Leaf, Snowflake, Sun, Lightning, House, ArrowUpRight, Star } from "@phosphor-icons/react";
import { useAppAuth } from "@/contexts/AuthContext";

const FALLBACK_SERVICES = [
  { id: "s1", name: "Exterior Maintenance Package", description: "Complete exterior upkeep including pressure washing, gutter cleaning, window cleaning, and façade inspection.", category: "exterior", price: "From $199", priceType: "monthly", subscriptionAvailable: "yes", features: '["Pressure washing","Gutter cleaning","Window cleaning","Façade inspection","Monthly report"]', status: "active", popular: "yes" },
  { id: "s2", name: "Interior Maintenance Plan", description: "Scheduled interior checks and maintenance covering HVAC filters, plumbing, electrical testing, and appliance inspection.", category: "interior", price: "From $149", priceType: "monthly", subscriptionAvailable: "yes", features: '["HVAC filter replacement","Plumbing checks","Electrical safety test","Appliance inspection","Priority scheduling"]', status: "active", popular: "no" },
  { id: "s3", name: "Landscaping Care", description: "Weekly or bi-weekly lawn maintenance, hedge trimming, flower bed care, and seasonal planting services.", category: "landscaping", price: "From $89", priceType: "monthly", subscriptionAvailable: "yes", features: '["Lawn mowing","Hedge trimming","Weed control","Seasonal planting","Fertilization"]', status: "active", popular: "yes" },
  { id: "s4", name: "Snow Removal Service", description: "Reliable residential and commercial snow removal, salting, and ice management for Montreal winters.", category: "snow-removal", price: "From $299", priceType: "monthly", subscriptionAvailable: "yes", features: '["24/7 on-call response","Driveway & walkway clearing","Salting & de-icing","Roof snow removal available","Seasonal contract options"]', status: "active", popular: "yes" },
  { id: "s5", name: "Seasonal Transition Package", description: "Spring and fall property walkthroughs with preparation services: spring cleanup, fall winterization, deck sealing, and more.", category: "seasonal", price: "$449", priceType: "fixed", subscriptionAvailable: "no", features: '["Spring property cleanup","Deck sealing & staining","Winter weatherization","Tree & shrub pruning","Drainage inspection"]', status: "active", popular: "no" },
  { id: "s6", name: "Emergency Response Service", description: "24/7 emergency property services for burst pipes, storm damage, flooding, and urgent structural concerns.", category: "emergency", price: "On Estimate", priceType: "custom", subscriptionAvailable: "no", features: '["24/7 availability","Emergency dispatch","Water damage response","Temporary repairs","Insurance documentation"]', status: "active", popular: "no" },
];

const SUBSCRIPTIONS = [
  { id: "sub1", name: "Monthly Plan", desc: "Pay month-to-month, cancel anytime. Full access to all scheduled services.", price: "From $149/mo", badge: "Flexible", color: "border-gray-200" },
  { id: "sub2", name: "Quarterly Plan", desc: "Commit to 3 months and save 10% on all services. Ideal for seasonal needs.", price: "From $405/qtr", badge: "Save 10%", color: "border-gold/40" },
  { id: "sub3", name: "Annual Plan", desc: "Best value. Full year coverage with priority scheduling and 20% savings.", price: "From $1,430/yr", badge: "Best Value", color: "border-gold/60 bg-gold/3" },
  { id: "sub4", name: "Custom Plan", desc: "Tailored service bundles for commercial properties and special requirements.", price: "On Request", badge: "Enterprise", color: "border-charcoal/20" },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  exterior:     <Buildings size={18} weight="fill" />,
  interior:     <House size={18} weight="fill" />,
  landscaping:  <Leaf size={18} weight="fill" />,
  "snow-removal": <Snowflake size={18} weight="fill" />,
  seasonal:     <Sun size={18} weight="fill" />,
  emergency:    <Lightning size={18} weight="fill" />,
};

const CATS = [
  { key: "all",          label: "All Services"  },
  { key: "exterior",     label: "Exterior"      },
  { key: "interior",     label: "Interior"      },
  { key: "landscaping",  label: "Landscaping"   },
  { key: "snow-removal", label: "Snow Removal"  },
  { key: "seasonal",     label: "Seasonal"      },
  { key: "emergency",    label: "Emergency"     },
];

export default function MaintenancePage() {
  const [cat, setCat] = useState("all");
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"services"|"subscriptions">("services");
  const { user } = useAppAuth();

  const { data: services } = useQuery("ServiceProduct", { where: { status: "active" } });
  const list = (services && services.length > 0) ? services : FALLBACK_SERVICES;
  const filtered = cat === "all" ? list : list.filter(s => s.category === cat);

  const handleAdd = (id: string) => {
    setAdded(prev => { const n = new Set(prev); n.add(id); return n; });
    setTimeout(() => setAdded(prev => { const n = new Set(prev); n.delete(id); return n; }), 2000);
  };

  return (
    <>
      <Helmet>
        <title>Maintenance Services – Aménagement Monzon</title>
        <meta name="description" content="Residential and commercial maintenance service packages and subscriptions." />
      </Helmet>
      <PageShell>
        <PageHero eyebrow="Service Marketplace" title="Maintenance Services" subtitle="Recurring and one-time maintenance plans for residential and commercial properties. Subscribe and forget — we handle the rest." />

        {/* Toggle */}
        <section className="py-6 bg-white border-b border-gray-100 sticky top-[72px] z-30">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              <button onClick={() => setView("services")} className={`px-5 py-2 text-sm font-sans font-medium rounded-lg transition-all cursor-pointer ${view === "services" ? "bg-white text-charcoal shadow-sm" : "text-gray-400"}`}>Services</button>
              <button onClick={() => setView("subscriptions")} className={`px-5 py-2 text-sm font-sans font-medium rounded-lg transition-all cursor-pointer ${view === "subscriptions" ? "bg-white text-charcoal shadow-sm" : "text-gray-400"}`}>Subscription Plans</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATS.map(c => (
                <button key={c.key} onClick={() => setCat(c.key)} className={["px-3 py-1.5 text-xs font-mono rounded-xl border transition-all duration-200 cursor-pointer", c.key === cat ? "bg-charcoal text-gold border-charcoal" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"].join(" ")}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {view === "services" && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-screen-xl mx-auto px-6 md:px-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(svc => {
                  const feats = (() => { try { return JSON.parse(svc.features); } catch { return []; } })();
                  const isAdded = added.has(svc.id);
                  return (
                    <div key={svc.id} className={`group flex flex-col bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/5 ${svc.popular === "yes" ? "border-gold/40" : "border-gray-200"}`}>
                      {svc.popular === "yes" && (
                        <div className="px-5 py-2 bg-gold text-charcoal text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <Star size={11} weight="fill" /> Most Popular
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-charcoal/5 flex items-center justify-center flex-shrink-0 text-charcoal">
                            {CATEGORY_ICONS[svc.category] ?? <Buildings size={18} />}
                          </div>
                          <div>
                            <h3 className="font-headline font-bold text-base text-charcoal leading-tight">{svc.name}</h3>
                            <span className="font-mono text-[10px] text-gray-400 capitalize">{svc.category.replace("-", " ")}</span>
                          </div>
                        </div>
                        <p className="font-sans text-sm text-gray-500 leading-relaxed mb-5">{svc.description}</p>
                        {feats.length > 0 && (
                          <ul className="flex flex-col gap-2 mb-5">
                            {feats.map((f: string) => (
                              <li key={f} className="flex items-center gap-2 text-xs font-sans text-gray-600">
                                <Check size={13} weight="bold" className="text-green-500 flex-shrink-0" /> {f}
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <p className="font-headline font-bold text-lg text-charcoal">{svc.price}</p>
                            <p className="font-mono text-[10px] text-gray-400">{svc.priceType}</p>
                          </div>
                          <div className="flex gap-2">
                            {svc.subscriptionAvailable === "yes" && (
                              <button onClick={() => handleAdd(`sub-${svc.id}`)} className={`flex items-center gap-1 px-3 py-2 text-[11px] font-sans rounded-xl border transition-all cursor-pointer ${added.has(`sub-${svc.id}`) ? "bg-green-500 text-white border-green-500" : "border-gold text-gold hover:bg-gold hover:text-charcoal"}`}>
                                <Repeat size={12} /> {added.has(`sub-${svc.id}`) ? "Added!" : "Subscribe"}
                              </button>
                            )}
                            <button onClick={() => handleAdd(svc.id)} className={`flex items-center gap-1 px-3 py-2 text-[11px] font-sans rounded-xl transition-all cursor-pointer ${isAdded ? "bg-green-500 text-white" : "bg-charcoal text-gold hover:bg-gold hover:text-charcoal"}`}>
                              <ShoppingCart size={12} /> {isAdded ? "Added!" : "Add"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {view === "subscriptions" && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-screen-xl mx-auto px-6 md:px-10">
              <div className="text-center mb-12">
                <h2 className="font-headline font-bold text-fluid-xl text-charcoal">Choose Your Subscription</h2>
                <p className="font-sans text-sm text-gray-500 mt-3 max-w-lg mx-auto">All plans include access to our full service catalog. Upgrade or cancel anytime.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {SUBSCRIPTIONS.map(sub => (
                  <div key={sub.id} className={`group flex flex-col p-6 rounded-2xl border-2 relative bg-white hover:shadow-xl hover:shadow-black/5 transition-all duration-300 ${sub.color}`}>
                    <span className="inline-block px-2.5 py-0.5 text-[9px] font-mono bg-gold/10 text-gold rounded-full mb-4 w-fit">{sub.badge}</span>
                    <h3 className="font-headline font-bold text-lg text-charcoal mb-2">{sub.name}</h3>
                    <p className="font-sans text-sm text-gray-500 leading-relaxed flex-1 mb-5">{sub.desc}</p>
                    <div className="border-t border-gray-100 pt-4">
                      <p className="font-headline font-bold text-xl text-charcoal mb-4">{sub.price}</p>
                      <button className="w-full px-4 py-2.5 text-sm font-sans font-semibold bg-charcoal text-gold rounded-xl hover:bg-gold hover:text-charcoal transition-all duration-300 cursor-pointer">
                        Get Started
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12 p-8 bg-charcoal rounded-3xl text-center">
                <p className="font-headline font-bold text-2xl text-warm-white mb-3">Need a custom plan?</p>
                <p className="font-sans text-sm text-gray-400 mb-6">Commercial properties, multi-unit buildings, and specialized needs — we'll build a plan around you.</p>
                <a href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-charcoal font-sans font-semibold text-sm rounded-xl hover:bg-gold-dark transition-all">
                  Request Custom Quote <ArrowUpRight size={14} weight="bold" />
                </a>
              </div>
            </div>
          </section>
        )}
      </PageShell>
    </>
  );
}
