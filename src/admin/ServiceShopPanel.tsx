import { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { Plus, Trash, PencilSimple, Star, Eye, EyeSlash, Check } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CATEGORIES = ["exterior","interior","landscaping","snow-removal","seasonal","emergency"];
const PRICE_TYPES = ["fixed","hourly","monthly","quarterly","annually","custom"];

const EMPTY_FORM = { name: "", description: "", category: "exterior", price: "", priceType: "monthly", subscriptionAvailable: "yes", features: "[]", imageUrl: "", status: "active", popular: "no", sortOrder: "0" };

export default function ServiceShopPanel() {
  const { data: services, isPending } = useQuery("ServiceProduct", { orderBy: { sortOrder: "asc" } });
  const { create, update, remove, isPending: isMutating } = useMutation("ServiceProduct");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [featuresInput, setFeaturesInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const featsArr = featuresInput.split("\n").map(f => f.trim()).filter(Boolean);
    const payload = { ...form, features: JSON.stringify(featsArr) };
    if (editing) { await update(editing, payload); setEditing(null); }
    else { await create(payload); }
    setForm({ ...EMPTY_FORM });
    setFeaturesInput("");
    setShowForm(false);
  };

  const handleEdit = (s: any) => {
    setEditing(s.id);
    setForm({ name: s.name, description: s.description, category: s.category, price: s.price, priceType: s.priceType, subscriptionAvailable: s.subscriptionAvailable, features: s.features, imageUrl: s.imageUrl ?? "", status: s.status, popular: s.popular, sortOrder: s.sortOrder ?? "0" });
    try { setFeaturesInput(JSON.parse(s.features).join("\n")); } catch { setFeaturesInput(""); }
    setShowForm(true);
  };

  const togglePopular = (id: string, pop: string) => update(id, { popular: pop === "yes" ? "no" : "yes" });
  const toggleStatus  = (id: string, st: string)  => update(id, { status: st === "active" ? "inactive" : "active" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">Service Shop Manager</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">Manage maintenance service packages, subscriptions, and pricing.</p>
        </div>
        <button onClick={() => { setShowForm(p => !p); setEditing(null); setForm({ ...EMPTY_FORM }); setFeaturesInput(""); }} className="flex items-center gap-2 px-4 py-2 bg-gold text-charcoal text-xs font-sans font-semibold rounded-xl hover:bg-gold-dark cursor-pointer transition-all">
          <Plus size={13} weight="bold" /> Add Service
        </button>
      </div>

      {showForm && (
        <Card className="mb-6 bg-white border-gray-200 shadow-sm">
          <CardHeader><CardTitle className="font-headline text-base text-charcoal">{editing ? "Edit Service" : "New Service"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Service Name *</label>
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Description *</label>
                <textarea required rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none resize-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Price *</label>
                <input required value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. From $199" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Price Type</label>
                <select value={form.priceType} onChange={e => setForm(p => ({ ...p, priceType: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none">
                  {PRICE_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Features (one per line)</label>
                <textarea rows={4} value={featuresInput} onChange={e => setFeaturesInput(e.target.value)} placeholder={"Pressure washing\nGutter cleaning\nMonthly report"} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none resize-none font-mono" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Image URL</label>
                <input type="url" value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center gap-4 md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.subscriptionAvailable === "yes"} onChange={e => setForm(p => ({ ...p, subscriptionAvailable: e.target.checked ? "yes" : "no" }))} />
                  <span className="font-sans text-xs text-gray-600">Subscription available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.popular === "yes"} onChange={e => setForm(p => ({ ...p, popular: e.target.checked ? "yes" : "no" }))} />
                  <span className="font-sans text-xs text-gray-600">Mark as popular</span>
                </label>
                <button type="submit" disabled={isMutating} className="ml-auto px-5 py-2 bg-charcoal text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-gray-800 disabled:opacity-50">{editing ? "Update" : "Create"}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-400">Cancel</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isPending ? (
        <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
      ) : (!services || services.length === 0) ? (
        <div className="flex items-center justify-center py-16 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="font-sans text-sm text-gray-400">No services yet. Add your first service package.</p>
        </div>
      ) : (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {services.map(s => (
                <div key={s.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.status === "active" ? "bg-green-400" : "bg-gray-300"}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-sans font-medium text-sm text-charcoal">{s.name}</p>
                        {s.popular === "yes" && <span className="font-mono text-[9px] bg-gold/10 text-gold px-1.5 py-0.5 rounded-full">Popular</span>}
                        {s.subscriptionAvailable === "yes" && <span className="font-mono text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">Subscription</span>}
                      </div>
                      <p className="font-mono text-[10px] text-gray-400">{s.category} · {s.priceType} · {s.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => togglePopular(s.id, s.popular)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gold/20 transition-colors">
                      <Star size={13} weight={s.popular === "yes" ? "fill" : "regular"} className={s.popular === "yes" ? "text-gold" : "text-gray-400"} />
                    </button>
                    <button onClick={() => toggleStatus(s.id, s.status)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                      {s.status === "active" ? <Eye size={13} className="text-gray-500" /> : <EyeSlash size={13} className="text-gray-500" />}
                    </button>
                    <button onClick={() => handleEdit(s)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-charcoal group transition-colors">
                      <PencilSimple size={13} className="text-gray-500 group-hover:text-white" />
                    </button>
                    <button onClick={() => remove(s.id)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-red-600 group transition-colors">
                      <Trash size={13} className="text-gray-500 group-hover:text-white" />
                    </button>
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
