import { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { Star, Check, X, Eye, EyeSlash, Trash, Plus, PencilSimple, ChatTeardropText } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <button key={s} onClick={() => onChange?.(s)} className={`${onChange ? "cursor-pointer" : "cursor-default"} transition-colors`} type="button">
          <Star size={15} weight={s <= rating ? "fill" : "regular"} className={s <= rating ? "text-gold" : "text-gray-300"} />
        </button>
      ))}
    </div>
  );
}

const EMPTY_FORM = { clientName: "", clientEmail: "", rating: "5", reviewText: "", serviceType: "", featured: "no", status: "approved", adminResponse: "", photoUrl: "" };

export default function ReviewsPanel() {
  const { data: reviews, isPending } = useQuery("Review", { orderBy: { createdAt: "desc" } });
  const { create, update, remove, isPending: isMutating } = useMutation("Review");
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [responseTarget, setResponseTarget] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  const all = reviews ?? [];
  const filtered = filter === "all" ? all : all.filter(r => r.status === filter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await update(editing, form);
      setEditing(null);
    } else {
      await create(form);
    }
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
  };

  const handleEdit = (r: any) => {
    setEditing(r.id);
    setForm({ clientName: r.clientName, clientEmail: r.clientEmail ?? "", rating: r.rating, reviewText: r.reviewText, serviceType: r.serviceType ?? "", featured: r.featured, status: r.status, adminResponse: r.adminResponse ?? "", photoUrl: r.photoUrl ?? "" });
    setShowForm(true);
  };

  const handleApprove = (id: string) => update(id, { status: "approved" });
  const handleHide    = (id: string) => update(id, { status: "hidden" });
  const handleDelete  = (id: string) => remove(id);
  const handleToggleFeatured = (id: string, current: string) => update(id, { featured: current === "yes" ? "no" : "yes" });

  const handleSendResponse = async (id: string) => {
    await update(id, { adminResponse: responseText });
    setResponseTarget(null);
    setResponseText("");
  };

  const statusBadge = (s: string) => {
    if (s === "approved") return "bg-green-100 text-green-700";
    if (s === "hidden")   return "bg-gray-100 text-gray-500";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">Reviews Manager</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">Moderate, respond to, and feature client reviews.</p>
        </div>
        <button onClick={() => { setShowForm(p => !p); setEditing(null); setForm({ ...EMPTY_FORM }); }}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-charcoal text-xs font-sans font-semibold rounded-xl hover:bg-gold-dark cursor-pointer transition-all">
          <Plus size={13} weight="bold" /> Add Review
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all","pending","approved","hidden"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-mono rounded-xl border transition-all cursor-pointer ${f === filter ? "bg-charcoal text-gold border-charcoal" : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)} {f === "all" ? `(${all.length})` : `(${all.filter(r => r.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="mb-6 bg-white border-gray-200 shadow-sm">
          <CardHeader><CardTitle className="font-headline text-base text-charcoal">{editing ? "Edit Review" : "Add Review"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Client Name *</label>
                <input required value={form.clientName} onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/40" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Client Email</label>
                <input value={form.clientEmail} onChange={e => setForm(p => ({ ...p, clientEmail: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/40" />
              </div>
              <div className="md:col-span-2">
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setForm(p => ({ ...p, rating: String(s) }))} className="cursor-pointer">
                      <Star size={22} weight={s <= parseInt(form.rating) ? "fill" : "regular"} className={s <= parseInt(form.rating) ? "text-gold" : "text-gray-300"} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Review Text *</label>
                <textarea required rows={3} value={form.reviewText} onChange={e => setForm(p => ({ ...p, reviewText: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/40 resize-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Service Type</label>
                <input value={form.serviceType} onChange={e => setForm(p => ({ ...p, serviceType: e.target.value }))} placeholder="e.g. Landscaping" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/40" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/40 bg-white">
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Admin Response (optional)</label>
                <textarea rows={2} value={form.adminResponse} onChange={e => setForm(p => ({ ...p, adminResponse: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/40 resize-none" />
              </div>
              <div className="flex gap-3 items-center md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={form.featured === "yes"} onChange={e => setForm(p => ({ ...p, featured: e.target.checked ? "yes" : "no" }))} className="rounded" />
                  <span className="font-sans text-xs text-gray-600">Feature this review</span>
                </label>
                <button type="submit" disabled={isMutating} className="ml-auto px-5 py-2 bg-charcoal text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {editing ? "Update" : "Save Review"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:border-gray-400 cursor-pointer transition-colors">Cancel</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews list */}
      {isPending ? (
        <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="font-sans text-sm text-gray-400">No reviews in this category yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(r => (
            <Card key={r.id} className={`bg-white border-gray-200 shadow-sm ${r.featured === "yes" ? "border-l-4 border-l-gold" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-headline font-bold text-sm text-gold">{r.clientName[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-sans font-semibold text-sm text-charcoal">{r.clientName}</span>
                        {r.serviceType && <span className="font-mono text-[10px] text-gray-400">· {r.serviceType}</span>}
                        {r.featured === "yes" && <span className="px-1.5 py-0.5 bg-gold/10 text-gold text-[9px] font-mono rounded-full">Featured</span>}
                        <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full ${statusBadge(r.status)}`}>{r.status}</span>
                      </div>
                      <StarRating rating={parseInt(r.rating)} />
                      <p className="font-sans text-sm text-gray-600 mt-2 leading-relaxed">{r.reviewText}</p>
                      {r.adminResponse && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-xl border-l-2 border-charcoal/20">
                          <p className="font-mono text-[10px] text-gray-400 mb-1">Admin Response</p>
                          <p className="font-sans text-xs text-gray-600">{r.adminResponse}</p>
                        </div>
                      )}
                      {responseTarget === r.id && (
                        <div className="mt-3 flex gap-2">
                          <textarea value={responseText} onChange={e => setResponseText(e.target.value)} placeholder="Write a response…" rows={2} className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-charcoal/40" />
                          <div className="flex flex-col gap-1">
                            <button onClick={() => handleSendResponse(r.id)} className="px-3 py-1.5 bg-charcoal text-white text-xs rounded-lg cursor-pointer hover:bg-gray-800">Send</button>
                            <button onClick={() => setResponseTarget(null)} className="px-3 py-1.5 text-xs text-gray-400 border border-gray-200 rounded-lg cursor-pointer">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {r.status === "pending" && (
                      <button onClick={() => handleApprove(r.id)} title="Approve" className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center hover:bg-green-500 group cursor-pointer transition-colors">
                        <Check size={13} weight="bold" className="text-green-600 group-hover:text-white" />
                      </button>
                    )}
                    <button onClick={() => r.status === "hidden" ? handleApprove(r.id) : handleHide(r.id)} title={r.status === "hidden" ? "Show" : "Hide"} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 cursor-pointer transition-colors">
                      {r.status === "hidden" ? <Eye size={13} weight="regular" className="text-gray-500" /> : <EyeSlash size={13} weight="regular" className="text-gray-500" />}
                    </button>
                    <button onClick={() => handleToggleFeatured(r.id, r.featured)} title="Toggle Featured" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gold/20 cursor-pointer transition-colors">
                      <Star size={13} weight={r.featured === "yes" ? "fill" : "regular"} className={r.featured === "yes" ? "text-gold" : "text-gray-400"} />
                    </button>
                    <button onClick={() => { setResponseTarget(r.id); setResponseText(r.adminResponse ?? ""); }} title="Respond" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-blue-50 cursor-pointer transition-colors">
                      <ChatTeardropText size={13} weight="regular" className="text-gray-500 hover:text-blue-500" />
                    </button>
                    <button onClick={() => handleEdit(r)} title="Edit" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-charcoal group cursor-pointer transition-colors">
                      <PencilSimple size={13} weight="regular" className="text-gray-500 group-hover:text-white" />
                    </button>
                    <button onClick={() => handleDelete(r.id)} title="Delete" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-red-600 group cursor-pointer transition-colors">
                      <Trash size={13} weight="regular" className="text-gray-500 group-hover:text-white" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
