import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Check,
  ShoppingBag,
  ShoppingCart,
  X,
  ArrowUpRight,
  Plus,
  Minus,
} from "@phosphor-icons/react";
export default function StorePage() {
  return (
    <>
      {/* ...todo el contenido de la tienda... */}
    </>
  );
}

/* ───────────────────────────────────────────────
   FALLBACK DATA
─────────────────────────────────────────────── */
const FALLBACK_STORE = [
  {
    id: "f1",
    image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_4.png",
    name: "Premium Tool Set",
    price: "$120",
    category: "Tools",
    description:
      "Professional-grade tool kit for residential and commercial use. Includes 48-piece set with carrying case.",
    stock: "12",
  },
  {
    id: "f2",
    image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png",
    name: "Brand Accessory Kit",
    price: "$65",
    category: "Accessories",
    description:
      "Monzon-branded accessories: hard hat, tape measure, level, and safety glasses.",
    stock: "25",
  },
  {
    id: "f3",
    image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png",
    name: "Site Gloves Pro",
    price: "$28",
    category: "Tools",
    description:
      "Heavy-duty cut-resistant work gloves with grip coating.",
    stock: "50",
  },
  {
    id: "f4",
    image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png",
    name: "Blueprint Notebook",
    price: "$22",
    category: "Accessories",
    description:
      "Grid-pattern professional notebook with Monzon branding. Water-resistant cover.",
    stock: "100",
  },
  {
    id: "f5",
    image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_2.png",
    name: "Digital Project Guide",
    price: "$39",
    category: "Digital",
    description:
      "Complete PDF guide to managing residential renovation projects from start to finish.",
    stock: "Unlimited",
  },
];

const FALLBACK_COLLECTION = [
  {
    id: "c1",
    image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_2.png",
    name: "Monzon Signature Tee",
    price: "$45",
    category: "Clothing",
    description:
      "Premium 100% cotton tee with embroidered Monzon signature logo.",
    variants:
      '{"sizes":["S","M","L","XL","XXL"],"colors":["Black","White","Charcoal","Cream"]}',
    stock: "30",
  },
  {
    id: "c2",
    image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png",
    name: "Field Workwear Jacket",
    price: "$155",
    category: "Jackets",
    description: "Insulated work jacket with Monzon branding.",
    variants:
      '{"sizes":["S","M","L","XL","XXL"],"colors":["Charcoal","Black","Navy"]}',
    stock: "15",
  },
  {
    id: "c3",
    image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_2.png",
    name: "Monzon Cap",
    price: "$35",
    category: "Hats",
    description: "Structured snapback with embroidered gold M logo.",
    variants:
      '{"sizes":["One Size"],"colors":["Black","Charcoal","White"]}',
    stock: "40",
  },
  {
    id: "c4",
    image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_4.png",
    name: "SM Signature Hoodie",
    price: "$89",
    category: "Hoodies",
    description: "Heavyweight fleece hoodie with embroidered logo.",
    variants:
      '{"sizes":["S","M","L","XL","XXL"],"colors":["Black","Charcoal"]}',
    stock: "20",
  },
  {
    id: "c5",
    image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png",
    name: "Limited Edition Varsity",
    price: "$199",
    category: "Limited Edition",
    description: "Limited run varsity jacket with custom patches.",
    variants:
      '{"sizes":["S","M","L","XL"],"colors":["Black & Gold"]}',
    stock: "8",
  },
  {
    id: "c6",
    image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png",
    name: "Logo Pin Set",
    price: "$19",
    category: "Collectibles",
    description: "Set of 3 enamel lapel pins.",
    variants:
      '{"sizes":["One Size"],"colors":["Gold","Silver","Black"]}',
    stock: "75",
  },
];

type CartEntry = {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
  variant?: string;
};

/* ───────────────────────────────────────────────
   PRODUCT CARD
─────────────────────────────────────────────── */
function ProductCard({ product, onAdd }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  const variants = (() => {
    try {
      return JSON.parse(product.variants || "{}");
    } catch {
      return {};
    }
  })();

  const hasVariants =
    variants.sizes?.length > 0 || variants.colors?.length > 0;

  const handleAdd = () => {
    const variantStr = [selectedSize, selectedColor]
      .filter(Boolean)
      .join(" / ");

    onAdd(
      product.id,
      product.name,
      product.price,
      product.image,
      variantStr || undefined
    );

    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setShowModal(false);
    }, 1500);
  };

  return (
    <>
      {/* CARD */}
      <div className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden card-cinematic hover:border-gray-300 hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute top-3 left-3">
            <span className="glass-dark px-2.5 py-1 text-[10px] font-mono text-gold/90 rounded-full">
              {product.category}
            </span>
          </div>

          {(product.stock === "8" ||
            product.category === "Limited Edition") && (
            <div className="absolute top-3 right-3">
              <span className="bg-red-500 text-white px-2 py-0.5 text-[9px] font-mono rounded-full">
                Limited
              </span>
            </div>
          )}

          <button
            onClick={() => (hasVariants ? setShowModal(true) : handleAdd())}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          >
            <span className="font-sans text-xs text-warm-white font-medium tracking-wider uppercase bg-white/20 backdrop-blur px-4 py-2 rounded-xl">
              {hasVariants ? "Select Options" : "Quick Add"}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between p-5 gap-4">
          <div className="min-w-0">
            <h3 className="font-headline font-bold text-[15px] text-charcoal leading-snug">
              {product.name}
            </h3>
            <p className="font-sans text-sm font-semibold text-gold mt-0.5">
              {product.price}
            </p>
          </div>

          <button
            onClick={() => (hasVariants ? setShowModal(true) : handleAdd())}
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer focus:outline-none ${
              justAdded
                ? "bg-green-500 scale-110"
                : "bg-charcoal hover:scale-105"
            }`}
          >
            {justAdded ? (
              <Check size={16} weight="bold" className="text-white" />
            ) : (
              <ShoppingBag
                size={16}
                weight="bold"
                className="text-warm-white"
              />
            )}
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-video object-cover"
              />
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer"
              >
                <X size={16} weight="bold" className="text-charcoal" />
              </button>
            </div>

           <div className="p-6">
  <h3 className="font-headline font-bold text-xl text-charcoal mb-1">
    {product.name}
  </h3>

  <p className="font-sans text-sm text-gray-500 mb-4">
    {product.description}
  </p>
</div>

/* ───────────────────────────────────────────────
   MAIN STORE PAGE
─────────────────────────────────────────────── */
const STORE_CATS = ["All", "Tools", "Accessories", "Digital"];
const COLLECTION_CATS = [
  "All",
  "Clothing",
  "Hoodies",
  "Jackets",
  "Hats",
  "Limited Edition",
  "Collectibles",
];
const DIGITAL_CATS = ["All", "Digital"];

export default function StorePage() {
  const [activeTab, setActiveTab] = useState<"store" | "collection" | "digital">(
    "store"
  );

  const [storeItems] = useState(FALLBACK_STORE);
  const [collectionItems] = useState(FALLBACK_COLLECTION);
  const [digitalItems] = useState(
    FALLBACK_STORE.filter((p) => p.category === "Digital")
  );

  const [storeFilter, setStoreFilter] = useState("All");
  const [collectionFilter, setCollectionFilter] = useState("All");
  const [digitalFilter, setDigitalFilter] = useState("All");

  const [cart, setCart] = useState<CartEntry[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ───────────────────────────────────────────────
     CART ACTIONS
  ─────────────────────────────────────────────── */
  const addToCart = (
    id: string,
    name: string,
    price: string,
    image: string,
    variant?: string
  ) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.id === id && i.variant === variant
      );

      if (existing) {
        return prev.map((i) =>
          i.id === id && i.variant === variant
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [
        ...prev,
        { id, name, price, image, quantity: 1, variant },
      ];
    });

    setDrawerOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  };

  /* ───────────────────────────────────────────────
     FILTERED LISTS
  ─────────────────────────────────────────────── */
  const filteredStore = storeItems.filter(
    (p) => storeFilter === "All" || p.category === storeFilter
  );

  const filteredCollection = collectionItems.filter(
    (p) => collectionFilter === "All" || p.category === collectionFilter
  );

  const filteredDigital = digitalItems.filter(
    (p) => digitalFilter === "All" || p.category === digitalFilter
  );

  /* ───────────────────────────────────────────────
     RENDER
  ─────────────────────────────────────────────── */
  return (
    <>
      <Helmet>
        <title>Store – Aménagement Monzon</title>
        <meta
          name="description"
          content="Shop premium tools, branded apparel, digital guides, and exclusive Monzon merchandise."
        />
      </Helmet>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-10">

        {/* ───────────────────────────────────────────────
            TABS
        ─────────────────────────────────────────────── */}
        <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide">
          {[
            ["store", "Tools & Accessories"],
            ["collection", "Apparel Collection"],
            ["digital", "Digital Products"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-5 py-2.5 rounded-xl text-sm font-sans font-medium transition-all whitespace-nowrap ${
                activeTab === key
                  ? "bg-charcoal text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ───────────────────────────────────────────────
            STORE TAB
        ─────────────────────────────────────────────── */}
        {activeTab === "store" && (
          <>
            <div className="flex gap-2 flex-wrap mb-6">
              {STORE_CATS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setStoreFilter(cat)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                    storeFilter === cat
                      ? "bg-charcoal text-white border-charcoal"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStore.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} />
              ))}
            </div>
          </>
        )}

        {/* ───────────────────────────────────────────────
            COLLECTION TAB
        ─────────────────────────────────────────────── */}
        {activeTab === "collection" && (
          <>
            <div className="flex gap-2 flex-wrap mb-6">
              {COLLECTION_CATS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCollectionFilter(cat)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                    collectionFilter === cat
                      ? "bg-charcoal text-white border-charcoal"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollection.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} />
              ))}
            </div>
          </>
        )}

        {/* ───────────────────────────────────────────────
            DIGITAL TAB
        ─────────────────────────────────────────────── */}
        {activeTab === "digital" && (
          <>
            <div className="flex gap-2 flex-wrap mb-6">
              {DIGITAL_CATS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setDigitalFilter(cat)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                    digitalFilter === cat
                      ? "bg-charcoal text-white border-charcoal"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDigital.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* CART DRAWER */}
      {drawerOpen && (
        <CartDrawer
          cart={cart}
          onRemove={removeFromCart}
          onUpdateQty={updateQty}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </>
  );
}