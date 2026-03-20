import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { LockKey, ArrowUpRight, CheckCircle } from "@phosphor-icons/react";

const FEATURES = ["Live project tracking","Document access","Direct PM messaging","Photo progress updates"];

export default function ClientPortalBanner() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bannerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      el.classList.add("visible");
      obs.unobserve(el);
    }, { threshold: 0.15 });
    el.classList.add("stagger-child");
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="relative py-20 bg-gradient-1 overflow-hidden noise" aria-label="Client portal access">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 80% at 70% 50%, rgba(212,160,23,0.07) 0%, transparent 70%)" }} aria-hidden="true" />
      <div className="relative max-w-screen-xl mx-auto px-6 md:px-10">
        <div ref={bannerRef}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 rounded-3xl border border-white/6 glass p-10 lg:p-14">
          <div className="flex items-start gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-white/8 flex items-center justify-center">
                <LockKey size={32} weight="regular" className="text-gold" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-surface-1" />
            </div>
            <div>
              <span className="section-eyebrow text-gold/70 block mb-2">Client Access</span>
              <h2 className="font-headline font-bold text-2xl md:text-3xl text-warm-white leading-tight">
                Track Your Project<br className="hidden md:block" /> in Real Time
              </h2>
              <p className="font-sans text-sm text-gray-400 mt-3 max-w-sm leading-relaxed">
                Already a client? Log in to your private portal for live updates, documents, and direct communication with your project manager.
              </p>
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs font-sans text-gray-400">
                    <CheckCircle size={14} weight="regular" className="text-gold/70 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
            <Link to="/portal"
              className="flex items-center gap-2 px-8 py-4 bg-gold text-charcoal font-sans font-semibold text-sm rounded-xl transition-all duration-300 hover:bg-gold-dark hover:shadow-2xl hover:shadow-gold/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold whitespace-nowrap group">
              Access Portal <ArrowUpRight size={15} weight="bold" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link to="/contact"
              className="flex items-center justify-center gap-2 px-8 py-4 glass border border-white/8 text-warm-white font-sans font-medium text-sm rounded-xl transition-all duration-300 hover:border-gold/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold whitespace-nowrap">
              Request Access
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
