import { Helmet } from "react-helmet-async";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import PlaceholderPanel from "@/components/PlaceholderPanel";
import { ArrowUpRight, Article } from "@phosphor-icons/react";
import { useQuery } from "@animaapp/playground-react-sdk";

const FALLBACK_POSTS = [
  { id: "b1", title: "5 Trends in Modern Construction (2024)",   thumbnail: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png", publishedDate: new Date("2024-03-01"), content: "" },
  { id: "b2", title: "Why Pavé Driveways Elevate Property Value", thumbnail: "https://c.animaapp.com/mmslviois4xSNv/img/ai_2.png", publishedDate: new Date("2024-02-15"), content: "" },
  { id: "b3", title: "Sustainable Landscaping in Urban Settings",  thumbnail: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png", publishedDate: new Date("2024-02-01"), content: "" },
  { id: "b4", title: "The Monzon Design Process Explained",       thumbnail: "https://c.animaapp.com/mmslviois4xSNv/img/ai_4.png", publishedDate: new Date("2024-01-20"), content: "" },
  { id: "b5", title: "Before & After: A Complete Home Renovation", thumbnail: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png", publishedDate: new Date("2024-01-10"), content: "" },
  { id: "b6", title: "Top Materials for Outdoor Living Spaces",   thumbnail: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png", publishedDate: new Date("2024-01-05"), content: "" },
];

export default function BlogPage() {
  const { data: posts, isPending } = useQuery("BlogPost", { orderBy: { publishedDate: "desc" } });
  const items = (posts && posts.length > 0) ? posts : FALLBACK_POSTS;

  return (
    <>
      <Helmet>
        <title>Blog – Aménagement Monzon</title>
        <meta name="description" content="Industry insights, project reveals, and design inspiration from the Aménagement Monzon team." />
      </Helmet>
      <PageShell>
        <PageHero eyebrow="Insights" title="Our Blog" subtitle="Industry knowledge, project reveals, and design inspiration from the Aménagement Monzon team." />

        <section className="py-16 bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">

            {/* Search placeholder */}
            <div className="mb-10">
              <PlaceholderPanel title="Blog Search & Filters" description="Full-text search, category filters, and tags — ready for implementation." height="h-20" icon={<Article size={20} weight="regular" className="text-gray-400" />} />
            </div>

            {isPending ? (
              <div className="flex items-center justify-center py-24">
                <span className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((post) => (
                  <article key={post.id} className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden card-cinematic hover:border-gray-300 hover:shadow-xl hover:shadow-black/5 cursor-pointer">
                    <div className="relative overflow-hidden aspect-video">
                      <img src={post.thumbnail} alt={post.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="flex flex-col gap-3 p-6">
                      <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">
                        {new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" }).format(new Date(post.publishedDate))}
                      </p>
                      <h2 className="font-headline font-bold text-base text-charcoal leading-snug group-hover:text-gold transition-colors duration-200">
                        {post.title}
                      </h2>
                      {post.content && (
                        <p className="font-sans text-sm text-gray-500 line-clamp-2">{post.content}</p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gold mt-auto pt-2">
                        Read More <ArrowUpRight size={12} weight="bold" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination placeholder */}
            <div className="mt-12">
              <PlaceholderPanel title="Pagination" description="Page navigation placeholder." height="h-16" />
            </div>
          </div>
        </section>
      </PageShell>
    </>
  );
}
