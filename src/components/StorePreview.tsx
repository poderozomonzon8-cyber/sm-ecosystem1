import { useEffect, useRef, useState } from "react";
import { ShoppingBag, ArrowUpRight, Check } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface Product {
  image: string;
  name: string;
  price: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  index: number;
}

const FALLBACK_PRODUCTS: Product[] = [
  { image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_2.png", name: "Monzon Signature Tee",   price: "$45",  category: "Apparel" },
  { image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_4.png", name: "Premium Tool Set",       price: "$120", category: "Tools" },
  { image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png", name: "Brand Accessory Kit",    price: "$65",  category: "Accessories" },
  { image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png", name: "Field Workwear Jacket",  price: "$155", category: "Apparel" },
];

function ProductCard({ product, index }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setTimeout(() => el.classList.add("visible"), index * 120 + 200);
      obs.unobserve(el);
    }, { threshold: 0.1 });

    el.classList.add("stagger-child");
    obs.observe(el);

    return () => obs.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="group relative flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden card-cinematic hover:border-gray-300 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute top-3 left-3">
          <span className="glass-dark px-2.5 py-1 text-[10px] font-mono text-gold/90 rounded-full tracking-wider">
            {product.category}
          </span>
        </div>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
          <span className="font-sans text-xs text-warm-white font-medium tracking-wider uppercase">
            Quick View
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between p-5 gap-4">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h3 className="font-headline font-bold text-[15px] text-charcoal leading-snug truncate">
            {product.name}
          </h3>
          <p className="font-sans text-sm font-semibold text-gold">{product.price}</p>
        </div>

        <button
          onClick={() => {
            if (!added) {
              setAdded(true);
              setTimeout(() => setAdded(false), 2200);
            }
          }}
          className={[
            "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-400 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold",
            added ? "bg-green-500 scale-110 shadow-lg shadow-green-500/30" : "bg-charcoal hover:bg-secondary hover:scale-105",
          ].join(" ")}
        >
          {added ? (
            <Check size={16} weight="bold" className="text-white" />
          ) : (
            <ArrowUpRight size={16} weight="bold" className="text-warm-white" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function StorePreview() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("Product")
          .select("*")
          .limit(4);

        if (error) throw error;

        setProducts((data as Product[]) || []);
      } catch (err) {
        console.warn("StorePreview load error:", err);
      } finally {
        setIsPending(false);
      }
    };

    loadProducts();
  }, []);

  const items: Product[] = products.length > 0 ? products : FALLBACK_PRODUCTS;

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      el.classList.add("visible");
      obs.unobserve(el);
    }, { threshold: 0.1 });

    el.classList.add("stagger-child");
    obs.observe(el);

    return () => obs.disconnect();
  }, []);

  return (
    <section id="store" className="py-32 bg-gray-50 overflow-hidden relative" aria-label="SM Store">
      {/* Cinematic glow */}
      <div className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,160,23,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-screen-xl mx-auto px-6 md:px-10 relative">

        {/* Header */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div>
            <span className="section-eyebrow text-gold block mb-4">
              <span className="inline-block w-6 h-px bg-gold/60 mr-3 align-middle" />
              Merchandise
            </span>

            <h2 className="font-headline font-bold text-fluid-2xl text-charcoal leading-[1.1]">
              SM Store
            </h2>

            <p className="font-sans text-sm text-gray-500 mt-4 max-w-md leading-relaxed">
              Wear the brand. Carry the craft.  
              <span className="text-charcoal font-semibold">  
                Exclusive merchandise designed for those who appreciate quality in every detail.
              </span>
            </p>
          </div>

          <Link
            to="/store"
            className="flex items-center gap-2 px-6 py-3.5 bg-gold text-charcoal font-sans font-semibold text-sm rounded-xl transition-all duration-300 hover:bg-gold-dark hover:shadow-xl hover:shadow-gold/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold self-start group"
          >
            <ShoppingBag size={16} weight="bold" />
            Visit Full Store
            <ArrowUpRight size={14} weight="bold"
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        {/* Products */}
        {isPending ? (
          <div className="flex items-center justify-center py-20">
            <span className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {items.map((product, i) => (
              <ProductCard key={product.name} product={product} index={i} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-gradient-1 border border-white/5 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-black/5">
          <div>
            <p className="font-headline font-bold text-lg text-warm-white">
              Free Shipping on Orders Over $100
            </p>
            <p className="font-sans text-sm text-gray-300 mt-1">
              All orders ship within 3–5 business days across Canada.
            </p>
          </div>

          <Link
            to="/store"
            className="flex items-center gap-2 px-6 py-3 glass text-warm-white font-sans font-medium text-sm rounded-xl border border-white/10 hover:border-gold/40 transition-all duration-300 whitespace-nowrap"
          >
            Shop Now
            <ArrowUpRight size={14} weight="bold" className="text-gold" />
          </Link>
        </div>
      </div>
    </section>
  );
}