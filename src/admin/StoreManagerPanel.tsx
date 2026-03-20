import { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { Plus, Trash, PencilSimple, Star, Eye, EyeSlash, ShoppingBag, X, Check, Tag, Package } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* ── Sub-tab IDs ── */
type StoreTab = "products" | "collection" | "orders" | "discounts";

/* ── Products (SM Store) ── */
const STORE_CATS = ["Tools", "Equipment", "Accessories", "Digital", "Other"];
const EMPTY_PRODUCT = { name: "", description: "", price: "", category: "Tools", image: "", variants: "", stock: "Unlimited" };

function ProductsTab() {
  const { data: products, isPending } = useQuery("Product", { orderBy: { createdAt: "desc" } });
  const { create, update, remove, isPending: isMutating } = useMutation("Product");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) { await update(editing, form); setEditing(null); }
    else { await create(form); }
    setForm({ ...EMPTY_PRODUCT }); setShowForm(false);
  };

  const handleEdit = (p: any) => {
    setEditing(p.id);
    setForm({ name: p.name, description: p.description ?? "", price: p.price, category: p.category, image: p.image, variants: p.variants ?? "", stock: p.stock ?? "Unlimited" });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-sans text-sm text-gray-500">{products?.length ?? 0} products in SM Store</p>
        <button onClick={() => { setShowForm(p => !p); setEditing(null); setForm({ ...EMPTY_PRODUCT }); }} className="flex items-center gap-2 px-4 py-2 bg-gold text-charcoal text-xs font-sans font-semibold rounded-xl hover:bg-gold-dark cursor-pointer">
          <Plus size={13} weight="bold" /> Add Product
        </button>
      </div>

      {showForm && (
        <Card className="mb-4 bg-white border-gray-200 shadow-sm">
          <CardHeader><CardTitle className="font-headline text-base text-charcoal">{editing ? "Edit Product" : "New Product"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Name *</label><input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" /></div>
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Price *</label><input required value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="$0.00" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" /></div>
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Category</label><select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none">{STORE_CATS.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Stock</label><input value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} placeholder="Unlimited" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" /></div>
              <div className="md:col-span-2"><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Description</label><textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none resize-none" /></div>
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Image URL</label><input type="url" value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" /></div>
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Variants JSON</label><input value={form.variants} onChange={e => setForm(p => ({ ...p, variants: e.target.value }))} placeholder='{"sizes":["S","M","L"]}' className="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-xl focus:outline-none" /></div>
              <div className="flex gap-2 md:col-span-2">
                <button type="submit" disabled={isMutating} className="px-5 py-2 bg-charcoal text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-gray-800 disabled:opacity-50">{editing ? "Update" : "Save"}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-400">Cancel</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isPending ? <div className="flex justify-center py-12"><span className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div> :
      !products || products.length === 0 ? <div className="flex items-center justify-center py-14 rounded-2xl border-2 border-dashed border-gray-200"><p className="font-sans text-sm text-gray-400">No products yet.</p></div> : (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {products.map(p => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <Package size={18} className="text-gray-400 m-auto mt-[11px]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-charcoal truncate">{p.name}</p>
                    <p className="font-mono text-[10px] text-gray-400">{p.category} · {p.stock ?? "Unlimited"} in stock</p>
                  </div>
                  <span className="font-headline font-semibold text-sm text-charcoal">{p.price}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(p)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-charcoal group transition-colors"><PencilSimple size={12} className="text-gray-500 group-hover:text-white" /></button>
                    <button onClick={() => remove(p.id)} disabled={isMutating} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-red-600 group transition-colors disabled:opacity-50"><Trash size={12} className="text-gray-500 group-hover:text-white" /></button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ── Collection Products (SM Collection) ── */
const COLL_CATS = ["Clothing", "Hats", "Hoodies", "Jackets", "Limited Edition", "Collectibles"];
const EMPTY_COLL = { name: "", description: "", price: "", category: "Clothing", imageUrl: "", variants: "{}", stock: "Unlimited", status: "active", featured: "no", sortOrder: "0", tags: "" };

function CollectionTab() {
  const { data: items, isPending } = useQuery("CollectionProduct", { orderBy: { sortOrder: "asc" } });
  const { create, update, remove, isPending: isMutating } = useMutation("CollectionProduct");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_COLL });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) { await update(editing, form); setEditing(null); }
    else { await create(form); }
    setForm({ ...EMPTY_COLL }); setShowForm(false);
  };

  const handleEdit = (item: any) => {
    setEditing(item.id);
    setForm({ name: item.name, description: item.description, price: item.price, category: item.category, imageUrl: item.imageUrl, variants: item.variants, stock: item.stock, status: item.status, featured: item.featured, sortOrder: item.sortOrder ?? "0", tags: item.tags ?? "" });
    setShowForm(true);
  };

  const toggleFeatured = (id: string, f: string) => update(id, { featured: f === "yes" ? "no" : "yes" });
  const toggleStatus   = (id: string, s: string) => update(id, { status: s === "active" ? "inactive" : "active" });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-sans text-sm text-gray-500">{items?.length ?? 0} items in SM Collection</p>
        <button onClick={() => { setShowForm(p => !p); setEditing(null); setForm({ ...EMPTY_COLL }); }} className="flex items-center gap-2 px-4 py-2 bg-gold text-charcoal text-xs font-sans font-semibold rounded-xl hover:bg-gold-dark cursor-pointer">
          <Plus size={13} weight="bold" /> Add Item
        </button>
      </div>

      {showForm && (
        <Card className="mb-4 bg-white border-gray-200 shadow-sm">
          <CardHeader><CardTitle className="font-headline text-base text-charcoal">{editing ? "Edit Item" : "New Collection Item"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Name *</label><input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" /></div>
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Price *</label><input required value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="$0.00" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" /></div>
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Category</label><select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none">{COLL_CATS.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Stock</label><input value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} placeholder="Unlimited" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" /></div>
              <div className="md:col-span-2"><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Description *</label><textarea required rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none resize-none" /></div>
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Image URL</label><input type="url" value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" /></div>
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Variants JSON</label><input value={form.variants} onChange={e => setForm(p => ({ ...p, variants: e.target.value }))} placeholder='{"sizes":["S","M"],"colors":["Black"]}' className="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-xl focus:outline-none" /></div>
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Tags</label><input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="summer, new, sale" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" /></div>
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Sort Order</label><input type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" /></div>
              <div className="flex items-center gap-4 md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.featured === "yes"} onChange={e => setForm(p => ({ ...p, featured: e.target.checked ? "yes" : "no" }))} /><span className="font-sans text-xs text-gray-600">Featured</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.status === "active"} onChange={e => setForm(p => ({ ...p, status: e.target.checked ? "active" : "inactive" }))} /><span className="font-sans text-xs text-gray-600">Active / Visible</span></label>
                <button type="submit" disabled={isMutating} className="ml-auto px-5 py-2 bg-charcoal text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-gray-800 disabled:opacity-50">{editing ? "Update" : "Save"}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-400">Cancel</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isPending ? <div className="flex justify-center py-12"><span className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div> :
      !items || items.length === 0 ? <div className="flex items-center justify-center py-14 rounded-2xl border-2 border-dashed border-gray-200"><p className="font-sans text-sm text-gray-400">No collection items yet. Add your first one.</p></div> : (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" alt="" /> : <ShoppingBag size={18} className="text-gray-400 m-auto mt-[11px]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-sans text-sm font-medium text-charcoal truncate">{item.name}</p>
                      {item.featured === "yes" && <span className="px-1.5 py-0.5 bg-gold/10 text-gold text-[9px] font-mono rounded-full">Featured</span>}
                      <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded-full ${item.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.status}</span>
                    </div>
                    <p className="font-mono text-[10px] text-gray-400">{item.category} · {item.stock} · {item.price}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleFeatured(item.id, item.featured)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gold/20 transition-colors"><Star size={12} weight={item.featured === "yes" ? "fill" : "regular"} className={item.featured === "yes" ? "text-gold" : "text-gray-400"} /></button>
                    <button onClick={() => toggleStatus(item.id, item.status)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">{item.status === "active" ? <EyeSlash size={12} className="text-gray-500" /> : <Eye size={12} className="text-gray-500" />}</button>
                    <button onClick={() => handleEdit(item)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-charcoal group transition-colors"><PencilSimple size={12} className="text-gray-500 group-hover:text-white" /></button>
                    <button onClick={() => remove(item.id)} disabled={isMutating} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-red-600 group transition-colors disabled:opacity-50"><Trash size={12} className="text-gray-500 group-hover:text-white" /></button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ── Orders ── */
const ORDER_STATUSES = ["pending","confirmed","shipped","delivered","cancelled","refunded"];
const STATUS_COLOR: Record<string, string> = { pending:"bg-amber-100 text-amber-700", confirmed:"bg-blue-100 text-blue-700", shipped:"bg-indigo-100 text-indigo-700", delivered:"bg-green-100 text-green-700", cancelled:"bg-red-100 text-red-700", refunded:"bg-gray-100 text-gray-500" };

function OrdersTab() {
  const { data: orders, isPending } = useQuery("Order", { orderBy: { createdAt: "desc" } });
  const { update, remove, isPending: isMutating } = useMutation("Order");
  const [selected, setSelected] = useState<string | null>(null);

  const selectedOrder = orders?.find(o => o.id === selected);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-sans text-sm text-gray-500">{orders?.length ?? 0} orders</p>
        <div className="flex gap-2">
          {["all",...ORDER_STATUSES].map(s => (
            <span key={s} className="px-2 py-1 text-[10px] font-mono text-gray-400 bg-white border border-gray-200 rounded-xl">{s}</span>
          ))}
        </div>
      </div>

      {isPending ? <div className="flex justify-center py-12"><span className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div> :
      !orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 rounded-2xl border-2 border-dashed border-gray-200">
          <Package size={28} className="text-gray-300 mb-2" />
          <p className="font-sans text-sm text-gray-400">No orders yet. They'll appear here after customers check out.</p>
        </div>
      ) : (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {orders.map(o => (
                <div key={o.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(o.id === selected ? null : o.id)}>
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div>
                      <p className="font-mono text-xs font-semibold text-charcoal">#{o.orderNumber}</p>
                      <p className="font-sans text-[10px] text-gray-400">{o.customerName} · {o.customerEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-headline font-semibold text-sm text-charcoal">${parseFloat(o.total || "0").toFixed(2)}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full ${STATUS_COLOR[o.status] || "bg-gray-100 text-gray-500"}`}>{o.status}</span>
                    <select value={o.status} onChange={e => { e.stopPropagation(); update(o.id, { status: e.target.value }); }} className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white cursor-pointer focus:outline-none" onClick={e => e.stopPropagation()}>
                      {ORDER_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                    <button onClick={e => { e.stopPropagation(); remove(o.id); }} disabled={isMutating} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-red-600 group transition-colors disabled:opacity-50"><Trash size={11} className="text-gray-400 group-hover:text-white" /></button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-headline font-bold text-base text-charcoal">Order #{selectedOrder.orderNumber}</h3>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200"><X size={14} /></button>
            </div>
            <div className="p-5 flex flex-col gap-3 text-sm">
              <div><span className="font-mono text-[10px] text-gray-400 block">Customer</span><span className="font-sans text-charcoal">{selectedOrder.customerName}</span></div>
              <div><span className="font-mono text-[10px] text-gray-400 block">Email</span><span className="font-sans text-charcoal">{selectedOrder.customerEmail}</span></div>
              <div><span className="font-mono text-[10px] text-gray-400 block">Ship To</span><span className="font-sans text-charcoal text-xs">{selectedOrder.shippingAddress}</span></div>
              <div><span className="font-mono text-[10px] text-gray-400 block">Source</span><span className="font-sans text-charcoal capitalize">{selectedOrder.source}</span></div>
              <div><span className="font-mono text-[10px] text-gray-400 block">Items</span><pre className="font-mono text-xs text-gray-600 bg-gray-50 rounded-xl p-3 whitespace-pre-wrap break-all">{JSON.stringify(JSON.parse(selectedOrder.items || "[]"), null, 2)}</pre></div>
              <div className="flex justify-between font-headline font-bold text-base text-charcoal border-t border-gray-100 pt-3"><span>Total</span><span>${parseFloat(selectedOrder.total || "0").toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Discount Codes ── */
const EMPTY_DISCOUNT = { code: "", type: "percentage", value: "", minOrderAmount: "0", maxUses: "100", usedCount: "0", status: "active", description: "", applicableTo: "all" };

function DiscountsTab() {
  const { data: codes, isPending } = useQuery("DiscountCode", { orderBy: { createdAt: "desc" } });
  const { create, update, remove, isPending: isMutating } = useMutation("DiscountCode");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_DISCOUNT });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create(form);
    setForm({ ...EMPTY_DISCOUNT }); setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-sans text-sm text-gray-500">{codes?.length ?? 0} discount codes</p>
        <button onClick={() => setShowForm(p => !p)} className="flex items-center gap-2 px-4 py-2 bg-gold text-charcoal text-xs font-sans font-semibold rounded-xl hover:bg-gold-dark cursor-pointer">
          <Plus size={13} weight="bold" /> Add Code
        </button>
      </div>

      {showForm && (
        <Card className="mb-4 bg-white border-gray-200 shadow-sm">
          <CardHeader><CardTitle className="font-headline text-base text-charcoal">New Discount Code</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Code *</label><input required value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="WELCOME20" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none font-mono" /></div>
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Type</label><select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none"><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option></select></div>
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Value *</label><input required value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder={form.type === "percentage" ? "20" : "10.00"} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" /></div>
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Min. Order</label><input value={form.minOrderAmount} onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value }))} placeholder="0" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" /></div>
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Max Uses</label><input value={form.maxUses} onChange={e => setForm(p => ({ ...p, maxUses: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" /></div>
              <div><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Applies To</label><select value={form.applicableTo} onChange={e => setForm(p => ({ ...p, applicableTo: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none"><option value="all">All</option><option value="store">Store Only</option><option value="collection">Collection Only</option></select></div>
              <div className="md:col-span-3"><label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Description</label><input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Internal note" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" /></div>
              <div className="flex gap-2 md:col-span-3">
                <button type="submit" disabled={isMutating} className="px-5 py-2 bg-charcoal text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-gray-800 disabled:opacity-50">Create Code</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-400">Cancel</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isPending ? <div className="flex justify-center py-12"><span className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div> :
      !codes || codes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 rounded-2xl border-2 border-dashed border-gray-200">
          <Tag size={28} className="text-gray-300 mb-2" />
          <p className="font-sans text-sm text-gray-400">No discount codes yet.</p>
        </div>
      ) : (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {codes.map(c => (
                <div key={c.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center"><Tag size={15} weight="fill" className="text-gold" /></div>
                    <div>
                      <p className="font-mono text-sm font-bold text-charcoal">{c.code}</p>
                      <p className="font-sans text-[10px] text-gray-400">{c.type === "percentage" ? `${c.value}% off` : `$${c.value} off`} · min ${c.minOrderAmount} · {c.usedCount}/{c.maxUses} used · {c.applicableTo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{c.status}</span>
                    <button onClick={() => update(c.id, { status: c.status === "active" ? "inactive" : "active" })} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200">{c.status === "active" ? <EyeSlash size={12} className="text-gray-500" /> : <Eye size={12} className="text-gray-500" />}</button>
                    <button onClick={() => remove(c.id)} disabled={isMutating} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-red-600 group transition-colors disabled:opacity-50"><Trash size={12} className="text-gray-500 group-hover:text-white" /></button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ══════════════ MAIN ══════════════ */
export default function StoreManagerPanel() {
  const [tab, setTab] = useState<StoreTab>("products");

  const TABS: { id: StoreTab; label: string }[] = [
    { id: "products",   label: "SM Store Products" },
    { id: "collection", label: "SM Collection"     },
    { id: "orders",     label: "Orders"            },
    { id: "discounts",  label: "Discount Codes"    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-headline font-bold text-2xl text-charcoal">Store Manager</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">Manage SM Store products, SM Collection merchandise, orders, and discount codes.</p>
      </div>

      <div className="flex gap-0 border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-sans font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${tab === t.id ? "border-charcoal text-charcoal" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "products"   && <ProductsTab />}
      {tab === "collection" && <CollectionTab />}
      {tab === "orders"     && <OrdersTab />}
      {tab === "discounts"  && <DiscountsTab />}
    </div>
  );
}
