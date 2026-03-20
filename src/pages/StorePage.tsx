import { useState } from "react";
import { Helmet } from "react-helmet-async";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import { Check, ShoppingBag, ShoppingCart, X, ArrowUpRight, Tag, Star, Plus, Minus } from "@phosphor-icons/react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { useAppAuth } from "@/contexts/AuthContext";

/* ── Fallback products ── */
const FALLBACK_STORE = [
  { id: "f1", image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_4.png", name: "Premium Tool Set", price: "$120", category: "Tools", description: "Professional-grade tool kit for residential and commercial use. Includes 48-piece set with carrying case.", stock: "12" },
  { id: "f2", image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png", name: "Brand Accessory Kit", price: "$65", category: "Accessories", description: "Monzon-branded accessories: hard hat, tape measure, level, and safety glasses.", stock: "25" },
  { id: "f3", image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png", name: "Site Gloves Pro", price: "$28", category: "Tools", description: "Heavy-duty cut-resistant work gloves with grip coating.", stock: "50" },
  { id: "f4", image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png", name: "Blueprint Notebook", price: "$22", category: "Accessories", description: "Grid-pattern professional notebook with Monzon branding. Water-resistant cover.", stock: "100" },
  { id: "f5", image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_2.png", name: "Digital Project Guide", price: "$39", category: "Digital", description: "Complete PDF guide to managing residential renovation projects from start to finish.", stock: "Unlimited" },
];

const FALLBACK_COLLECTION = [
  { id: "c1", image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_2.png", name: "Monzon Signature Tee", price: "$45", category: "Clothing", description: "Premium 100% cotton tee with embroidered Monzon signature logo. Available in multiple colors.", variants: '{"sizes":["S","M","L","XL","XXL"],"colors":["Black","White","Charcoal","Cream"]}', stock: "30" },
  { id: "c2", image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png", name: "Field Workwear Jacket", price: "$155", category: "Jackets", description: "Insulated work jacket with Monzon branding. Wind and water resistant. Built for the job site.", variants: '{"sizes":["S","M","L","XL","XXL"],"colors":["Charcoal","Black","Navy"]}', stock: "15" },
  { id: "c3", image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_2.png", name: "Monzon Cap", price: "$35", category: "Hats", description: "Structured snapback with embroidered gold M logo. Adjustable fit.", variants: '{"sizes":["One Size"],"colors":["Black","Charcoal","White"]}', stock: "40" },
  { id: "c4", image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_4.png", name: "SM Signature Hoodie", price: "$89", category: "Hoodies", description: "Heavyweight fleece hoodie with embroidered logo on chest and sleeve. Oversized fit.", variants: '{"sizes":["S","M","L","XL","XXL"],"colors":["Black","Charcoal"]}', stock: "20" },
  { id: "c5", image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png", name: "Limited Edition Varsity", price: "$199", category: "Limited Edition", description: "Limited run varsity jacket with custom patches and premium wool body. Only 50 made.", variants: '{"sizes":["S","M","L","XL"],"colors":["Black & Gold"]}', stock: "8" },
  { id: "c6", image: "https://c.animaapp.com/mmslviois4xSNv/img/ai_5.png", name: "Logo Pin Set", price: "$19", category: "Collectibles", description: "Set of 3 enamel lapel pins with Monzon logos and limited series artwork.", variants: '{"sizes":["One Size"],"colors":["Gold","Silver","Black"]}', stock: "75" },
];

type CartEntry = { id: string; name: string; price: string; image: string; quantity: number; variant?: string };

function ProductCard({ product, onAdd }: { product: any; onAdd: (id: string, name: string, price: string, image: string, variant?: string) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  const variants = (() => { try { return JSON.parse(product.variants || "{}"); } catch { return {}; } })();
  const hasVariants = (variants.sizes?.length > 0) || (variants.colors?.length > 0);

  const handleAdd = () => {
    const variantStr = [selectedSize, selectedColor].filter(Boolean).join(" / ");
    onAdd(product.id, product.name, product.price, product.image, variantStr || undefined);
    setJustAdded(true);
    setTimeout(() => { setJustAdded(false); setShowModal(false); }, 1500);
  };

  return (
    <>
      <div className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden card-cinematic hover:border-gray-300 hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
        <div className="relative overflow-hidden aspect-[4/3]">
          <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute top-3 left-3">
            <span className="glass-dark px-2.5 py-1 text-[10px] font-mono text-gold/90 rounded-full">{product.category}</span>
          </div>
          {product.stock === "8" || (product.category === "Limited Edition") && (
            <div className="absolute top-3 right-3">
              <span className="bg-red-500 text-white px-2 py-0.5 text-[9px] font-mono rounded-full">Limited</span>
            </div>
          )}
          <button onClick={() => hasVariants ? setShowModal(true) : handleAdd()}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="font-sans text-xs text-warm-white font-medium tracking-wider uppercase bg-white/20 backdrop-blur px-4 py-2 rounded-xl">
              {hasVariants ? "Select Options" : "Quick Add"}
            </span>
          </button>
        </div>
        <div className="flex items-center justify-between p-5 gap-4">
          <div className="min-w-0">
            <h3 className="font-headline font-bold text-[15px] text-charcoal leading-snug">{product.name}</h3>
            <p className="font-sans text-sm font-semibold text-gold mt-0.5">{product.price}</p>
          </div>
          <button onClick={() => hasVariants ? setShowModal(true) : handleAdd()}
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer focus:outline-none ${justAdded ? "bg-green-500 scale-110" : "bg-charcoal hover:scale-105"}`}>
            {justAdded ? <Check size={16} weight="bold" className="text-white" /> : <ShoppingBag size={16} weight="bold" className="text-warm-white" />}
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img src={product.image} alt={product.name} className="w-full aspect-video object-cover" />
              <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                <X size={16} weight="bold" className="text-charcoal" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="font-headline font-bold text-xl text-charcoal mb-1">{product.name}</h3>
              <p className="font-sans text-sm text-gray-500 mb-4">{product.description}</p>
              {variants.colors?.length > 0 && (
                <div className="mb-4">
                  <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wider mb-2">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.colors.map((c: string) => (
                      <button key={c} onClick={() => setSelectedColor(c)} className={`px-3 py-1.5 text-xs font-sans rounded-lg border-2 cursor-pointer transition-all ${selectedColor === c ? "border-charcoal bg-charcoal text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}>{c}</button>
                    ))}
                  </div>
                </div>
              )}
              {variants.sizes?.length > 0 && (
                <div className="mb-5">
                  <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wider mb-2">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.sizes.map((s: string) => (
                      <button key={s} onClick={() => setSelectedSize(s)} className={`px-3 py-1.5 text-xs font-sans rounded-lg border-2 cursor-pointer transition-all ${selectedSize === s ? "border-charcoal bg-charcoal text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-headline font-bold text-2xl text-charcoal">{product.price}</span>
                <button onClick={handleAdd} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-sans font-semibold text-sm cursor-pointer transition-all ${justAdded ? "bg-green-500 text-white" : "bg-charcoal text-gold hover:bg-gold hover:text-charcoal"}`}>
                  {justAdded ? <><Check size={15} weight="bold" /> Added!</> : <><ShoppingBag size={15} weight="bold" /> Add to Cart</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CartDrawer({ cart, onRemove, onUpdateQty, onClose }: { cart: CartEntry[]; onRemove: (id: string) => void; onUpdateQty: (id: string, qty: number) => void; onClose: () => void }) {
  const total = cart.reduce((sum, item) => {
    const p = parseFloat(item.price.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(p) ? 0 : p * item.quantity);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-headline font-bold text-lg text-charcoal">Your Cart ({cart.length})</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"><X size={16} weight="bold" className="text-charcoal" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart size={40} weight="regular" className="text-gray-300 mb-3" />
              <p className="font-sans text-sm text-gray-400">Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={`${item.id}-${item.variant}`} className="flex gap-3">
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium text-charcoal truncate">{item.name}</p>
                  {item.variant && <p className="font-mono text-[10px] text-gray-400">{item.variant}</p>}
                  <p className="font-sans text-sm text-gold font-semibold">{item.price}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => onUpdateQty(item.id, item.quantity - 1)} className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200"><Minus size={10} weight="bold" /></button>
                    <span className="font-mono text-xs w-4 text-center">{item.quantity}</span>
                    <button onClick={() => onUpdateQty(item.id, item.quantity + 1)} className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200"><Plus size={10} weight="bold" /></button>
                  </div>
                </div>
                <button onClick={() => onRemove(item.id)} className="self-start w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer transition-colors"><X size={12} className="text-gray-400 hover:text-red-500" /></button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="font-sans text-sm text-gray-600">Subtotal</span>
              <span className="font-headline font-bold text-lg text-charcoal">${total.toFixed(2)}</span>
            </div>
            <button className="w-full px-5 py-3.5 bg-charcoal text-gold font-sans font-semibold text-sm rounded-xl hover:bg-gold hover:text-charcoal transition-all cursor-pointer flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowUpRight size={14} weight="bold" />
            </button>
            <p className="text-center font-mono text-[10px] text-gray-400 mt-2">Checkout integration placeholder</p>
          </div>
        )}
      </div>
    </div>
  );
}

const STORE_CATS  = ["All", "Tools", "Equipment", "Accessories", "Digital"];
const COLLECTION_CATS = ["All", "Clothing", "Hats", "Hoodies", "Jackets", "Limited Edition", "Collectibles"];

export default function StorePage() {
  const [tab, setTab] = useState<"store"|"collection">("store");
  const [storeCat, setStoreCat] = useState("All");
  const [collectionCat, setCollectionCat] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartEntry[]>([]);

  const { data: products } = useQuery("Product");
  const storeItems = (products && products.length > 0) ? products : FALLBACK_STORE;

  const collectionItems = FALLBACK_COLLECTION;

  const filteredStore = storeCat === "All" ? storeItems : storeItems.filter(p => p.category === storeCat);
  const filteredCollection = collectionCat === "All" ? collectionItems : collectionItems.filter(p => p.category === collectionCat);

  const addToCart = (id: string, name: string, price: string, image: string, variant?: string) => {
    setCart(prev => {
      const key = `${id}-${variant ?? ""}`;
      const existing = prev.find(i => `${i.id}-${i.variant ?? ""}` === key);
      if (existing) return prev.map(i => `${i.id}-${i.variant ?? ""}` === key ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id, name, price, image, quantity: 1, variant }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <Helmet>
        <title>SM Store & Collection – Aménagement Monzon</title>
        <meta name="description" content="Shop SM Store tools and accessories, or browse the exclusive SM Collection brand merchandise." />
      </Helmet>
      <PageShell>
        <PageHero eyebrow="Shop" title="SM Store & Collection" subtitle="Professional tools for the job. Exclusive brand merchandise for the lifestyle. Two worlds, one standard of excellence." />

        {/* Tab switcher */}
        <section className="py-4 bg-white border-b border-gray-100 sticky top-[72px] z-30">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10 flex items-center justify-between gap-4">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              <button onClick={() => setTab("store")} className={`px-5 py-2 text-sm font-sans font-medium rounded-lg transition-all cursor-pointer ${tab === "store" ? "bg-white text-charcoal shadow-sm" : "text-gray-400"}`}>SM Store</button>
              <button onClick={() => setTab("collection")} className={`px-5 py-2 text-sm font-sans font-medium rounded-lg transition-all cursor-pointer ${tab === "collection" ? "bg-white text-charcoal shadow-sm" : "text-gray-400"}`}>SM Collection</button>
            </div>
            <button onClick={() => setCartOpen(true)} className="flex items-center gap-2 px-4 py-2.5 glass-light border border-gray-200 rounded-xl text-sm font-medium text-charcoal hover:border-charcoal transition-all duration-200 cursor-pointer">
              <ShoppingCart size={16} />
              Cart {cartCount > 0 && <span className="w-5 h-5 rounded-full bg-gold text-charcoal text-[10px] font-bold flex items-center justify-center">{cartCount}</span>}
            </button>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">

            {tab === "store" && (
              <>
                <div className="flex flex-wrap gap-2 mb-10">
                  {STORE_CATS.map(c => (
                    <button key={c} onClick={() => setStoreCat(c)} className={["px-4 py-2 text-xs font-mono rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none", c === storeCat ? "bg-charcoal text-gold border-charcoal" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"].join(" ")}>{c}</button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {filteredStore.map(product => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}
                </div>
              </>
            )}

            {tab === "collection" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-headline font-bold text-xl text-charcoal">SM Collection</h2>
                    <p className="font-sans text-sm text-gray-500 mt-1">Wear the craft. Limited runs. Exclusive drops.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-10">
                  {COLLECTION_CATS.map(c => (
                    <button key={c} onClick={() => setCollectionCat(c)} className={["px-4 py-2 text-xs font-mono rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none", c === collectionCat ? "bg-charcoal text-gold border-charcoal" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"].join(" ")}>{c}</button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCollection.map(product => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}
                </div>
              </>
            )}
          </div>
        </section>
      </PageShell>

      {cartOpen && <CartDrawer cart={cart} onRemove={removeFromCart} onUpdateQty={updateQty} onClose={() => setCartOpen(false)} />}
    </>
  );
}
