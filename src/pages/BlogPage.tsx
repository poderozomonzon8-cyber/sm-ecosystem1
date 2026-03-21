import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import PlaceholderPanel from "@/components/PlaceholderPanel";

import { ArrowUpRight, Article } from "@phosphor-icons/react";

/* ─────────────────────────────────────────────
   FALLBACK POSTS (until Supabase Blog is ready)
────────────────────────────────────────────── */
const FALLBACK_POSTS = [
  {
    id: "b1",
    title: "5 Trends in Modern Construction (2024)",
    thumbnail: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png",
    publishedDate: "2024-03-01",
    content: "",
    category: "Construction",
  },
  {
    id: "b2",
    title: "Why Pavé Driveways Elevate Property Value",
    thumbnail: "https://c.animaapp.com/mmslviois4xSNv/img/ai_2.png",
    publishedDate: "2024-02-15",
    content: "",
    category: "Hardscape",
  },
  {
    id: "b3",
    title: "Sustainable Landscaping in Urban Settings",
    thumbnail: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png",
    publishedDate: "2024-02-01",
    content: "",
    category: "Landscaping",
  },
  {
    id: "b4",
    title: "The Monzon Design Process Explained",
    thumbnail: "https://c.animaapp.com/mmslviois4xSNv/img/ai_4.png",
    publishedDate: "2024-01-20",
    content: "",
    category: "Design",
  },
  {
    id: "b5",
    title: "Before & After: A Complete Home Renovation",
    thumbnail: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png",
    publishedDate: "2024-01-10",
    content: "",
    category: "Renovation",
  },
  {
    id: "b6",
    title: "Top Materials for Outdoor Living Spaces",
    thumbnail: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png",
    publishedDate: "2024-01-05",
    content: "",
    category: "Materials",
  },
];

const CATEGORIES = ["All", "Construction", "Hardscape", "Landscaping", "Design", "Renovation", "Materials"];

export default function BlogPage() {
  const posts = FALLBACK_POSTS;
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const featured = posts[0];

  return (
    <>
      <Helmet>
        <title>Blog – Aménagement Monzon</title>
        <meta
          name="description"
          content="Industry insights, project reveals, and design inspiration from the Aménagement Monzon team."
        />
      </Helmet>

      <PageShell>
        <PageHero
          eyebrow="Insights"
          title="Our Blog"
          subtitle="Industry knowledge, project reveals, and design inspiration from the Aménagement Monzon team."
        />

        {/* Featured Post */}
        <section className="py-16 bg-white">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <motion.div
              className="group grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-gray-50 rounded-3xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all"
              whileHover={{ scale: 1.01 }}
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={featured.thumbnail}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-10">
                <p className="font-mono text-[11px] text-gray-400 uppercase tracking-widest mb-2">
                  Featured •{" "}
                  {new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" }).format(
                    new Date(featured.publishedDate)
                  )}
                </p>

                <h2 className="font-headline font-bold text-2xl text-charcoal mb-4 group-hover:text-gold transition-colors">
                  {featured.title}
                </h2>

                <p className="font-sans text-sm text-gray-500 mb-6">
                  A closer look at the trends shaping the future of construction and
                  design in 2024.
                </p>

                <button className="flex items-center gap-2 px-5 py-3 bg-charcoal text-gold rounded-xl text-xs font-semibold hover:bg-gold hover:text-charcoal transition-all">
                  Read Article <ArrowUpRight size={14} weight="bold" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search + Filters */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <div className="mb-10">
              <PlaceholderPanel
                title="Blog Search & Filters"
                description="Full-text search, category filters, and tags — ready for implementation."
                height="h-20"
                icon={<Article size={20} weight="regular" className="text-gray-400" />}
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-10">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={[
                    "px-4 py-2 text-xs font-mono rounded-xl border transition-all",
                    activeCategory === cat
                      ? "bg-charcoal text-gold border-charcoal"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400",
                  ].join(" ")}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <motion.article
                  key={post.id}
                  className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gold/30 hover:shadow-xl transition-all cursor-pointer"
                  whileHover={{ y: -6, scale: 1.02 }}
                >
                  <div className="relative overflow-hidden aspect-video">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-col gap-3 p-6">
                    <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">
                      {new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" }).format(
                        new Date(post.publishedDate)
                      )}
                    </p>

                    <h2 className="font-headline font-bold text-base text-charcoal leading-snug group-hover:text-gold transition-colors">
                      {post.title}
                    </h2>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gold mt-auto pt-2">
                      Read More <ArrowUpRight size={12} weight="bold" />
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12">
              <PlaceholderPanel
                title="Pagination"
                description="Page navigation placeholder."
                height="h-16"
              />
            </div>
          </div>
        </section>
      </PageShell>
    </>
  );
}