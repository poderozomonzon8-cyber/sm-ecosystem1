import { useEffect, useRef } from "react";
import { InstagramLogo, YoutubeLogo, TiktokLogo, ArrowUpRight, Heart, Eye } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { useQuery } from "@/lib/anima-supabase-adapter";

const FALLBACK_POSTS = [
  { image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png", platform: "Instagram", handle: "@amenagement_monzon", likes: "1.2K", views: "14K" },
  { image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_4.png", platform: "YouTube",   handle: "@AmenagementMonzon",  likes: "3.4K", views: "89K" },
  { image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png", platform: "Instagram", handle: "@amenagement_monzon", likes: "2.1K", views: "22K" },
  { image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_2.png", platform: "TikTok",    handle: "@monzon.builds",      likes: "890",  views: "45K" },
  { image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png", platform: "YouTube",   handle: "@AmenagementMonzon",  likes: "5.6K", views: "112K" },
];

const PlatformIcon = ({ platform }: { platform: string }) => {
  if (platform === "YouTube") return <YoutubeLogo   size={14} weight="fill" className="text-gold" />;
  if (platform === "TikTok")  return <TiktokLogo    size={14} weight="fill" className="text-gold" />;
  return                             <InstagramLogo size={14} weight="fill" className="text-gold" />;
};

export default function CommunitySection() {
  const cardsRef  = useRef<(HTMLElement | null)[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef  = useRef<HTMLDivElement>(null);

  const { data: posts, isPending } = useQuery("CommunityPost", { limit: 5 });

  const items = (posts && posts.length > 0) ? posts : FALLBACK_POSTS;

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el    = entry.target as HTMLElement;
          const delay = parseInt(el.dataset.delay || "0", 10);
          setTimeout(() => el.classList.add("visible"), delay);
          obs.unobserve(el);
        });
      },
      { threshold: 0.09 }
    );
    [headerRef.current, statsRef.current, ...cardsRef.current].forEach((el) => {
      if (el) { el.classList.add("stagger-child"); obs.observe(el); }
    });
    return () => obs.disconnect();
  }, []);

  return (
    <section id="community" className="relative py-28 bg-surface-0 overflow-hidden" aria-label="Community">
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,160,23,0.07) 0%, transparent 70%)" }} aria-hidden="true" />
      <div className="relative max-w-screen-xl mx-auto px-6 md:px-10">

        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14" data-delay="0">
          <div>
            <span className="section-eyebrow text-gold/70 block mb-4">
              <span className="inline-block w-6 h-px bg-gold/60 mr-3 align-middle" />
              Social Media
            </span>
            <h2 className="font-headline font-bold text-fluid-2xl text-warm-white leading-[1.1]">Our Community</h2>
            <p className="font-sans text-sm text-gray-400 mt-4 max-w-md leading-relaxed">Real projects. Real craftsmanship. Follow our cinematic journey across platforms.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {([["Instagram",InstagramLogo],["YouTube",YoutubeLogo],["TikTok",TiktokLogo]] as const).map(([label, Icon]) => (
              <a key={label} href="#"
                className="flex items-center gap-2 px-4 py-2.5 glass border border-white/8 text-gray-300 text-xs font-sans font-medium rounded-xl transition-all duration-300 hover:border-gold/40 hover:text-gold focus:outline-none">
                <Icon size={15} weight="fill" /> {label}
              </a>
            ))}
          </div>
        </div>

        <div ref={statsRef} className="grid grid-cols-3 gap-4 mb-12" data-delay="100">
          {[["48K+","Instagram Followers"],["210K+","YouTube Views"],["95K+","TikTok Plays / Month"]].map(([value, label], i) => (
            <div key={i} className="glass rounded-2xl border border-white/5 p-5 text-center">
              <p className="font-headline font-bold text-2xl text-gold">{value}</p>
              <p className="font-sans text-xs text-gray-400 mt-1 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {isPending ? (
          <div className="flex items-center justify-center py-16">
            <span className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {items.map((post, i) => (
              <article key={i} ref={(el) => { cardsRef.current[i] = el; }} data-delay={String(i * 80 + 200)}
                className={["relative overflow-hidden rounded-2xl group cursor-pointer", i === 1 ? "md:col-span-2 md:row-span-2" : ""].join(" ")}
                style={{ minHeight: i === 1 ? "340px" : "200px" }}>
                <img src={post.image} alt={post.handle} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className="glass-dark flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono text-gray-300">
                    <PlatformIcon platform={post.platform} /> {post.platform}
                  </span>
                </div>
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-gray-300 font-mono">
                    <Heart size={10} weight="fill" className="text-gold/80" />{post.likes}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-300 font-mono">
                    <Eye size={10} weight="regular" className="text-gold/80" />{post.views}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-mono text-[10px] text-gold/80">{post.handle}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-14 text-center">
          <Link to="/community"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-gold text-charcoal font-sans font-semibold text-sm rounded-xl transition-all duration-300 hover:bg-gold-dark hover:shadow-2xl hover:shadow-gold/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold group">
            Join Our Community
            <ArrowUpRight size={15} weight="bold" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
