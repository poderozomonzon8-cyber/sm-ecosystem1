interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  dark?: boolean;
}

export default function PageHero({ eyebrow, title, subtitle, dark = false }: PageHeroProps) {
  return (
    <section className={`relative py-24 ${dark ? "bg-gradient-1 noise" : "bg-gray-50"} overflow-hidden`}>
      {dark && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(212,160,23,0.07) 0%, transparent 70%)" }} aria-hidden="true" />
      )}
      <div className="relative max-w-screen-xl mx-auto px-6 md:px-10 text-center">
        {eyebrow && (
          <span className="section-eyebrow text-gold/70 block mb-5">
            <span className="inline-block w-6 h-px bg-gold/60 mr-3 align-middle" />
            {eyebrow}
            <span className="inline-block w-6 h-px bg-gold/60 ml-3 align-middle" />
          </span>
        )}
        <h1 className={`font-headline font-bold text-fluid-2xl leading-[1.1] mb-4 ${dark ? "text-warm-white" : "text-charcoal"}`}>
          {title}
        </h1>
        {subtitle && (
          <p className={`font-sans text-sm max-w-xl mx-auto leading-relaxed ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
