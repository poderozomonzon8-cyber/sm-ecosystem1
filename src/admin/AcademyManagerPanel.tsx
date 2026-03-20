import { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { Plus, Trash, PencilSimple, Check, Eye, EyeSlash, BookOpen, UsersFour, Wrench, CalendarBlank } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TYPES = ["course","coaching","workshop","event"];
const TYPE_LABELS: Record<string, string> = { course: "Course", coaching: "Coaching", workshop: "Workshop", event: "Event" };
const TYPE_ICONS: Record<string, React.ReactNode> = {
  course:   <BookOpen size={15} weight="fill" className="text-blue-500" />,
  coaching: <UsersFour size={15} weight="fill" className="text-purple-500" />,
  workshop: <Wrench size={15} weight="fill" className="text-amber-500" />,
  event:    <CalendarBlank size={15} weight="fill" className="text-green-500" />,
};

const EMPTY_FORM = { type: "course", title: "", description: "", price: "", duration: "", instructor: "", thumbnailUrl: "", status: "draft", maxAttendees: "", tags: "" };

export default function AcademyManagerPanel() {
  const { data: items, isPending } = useQuery("AcademyItem", { orderBy: { createdAt: "desc" } });
  const { create, update, remove, isPending: isMutating } = useMutation("AcademyItem");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const all = items ?? [];
  const filtered = typeFilter === "all" ? all : all.filter(i => i.type === typeFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) { await update(editing, form); setEditing(null); }
    else { await create(form); }
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
  };

  const handleEdit = (item: any) => {
    setEditing(item.id);
    setForm({ type: item.type, title: item.title, description: item.description, price: item.price, duration: item.duration ?? "", instructor: item.instructor ?? "", thumbnailUrl: item.thumbnailUrl ?? "", status: item.status, maxAttendees: item.maxAttendees ?? "", tags: item.tags ?? "" });
    setShowForm(true);
  };

  const toggleStatus = (id: string, status: string) => update(id, { status: status === "published" ? "draft" : "published" });

  const statusBadge = (s: string) => {
    if (s === "published") return "bg-green-100 text-green-700";
    if (s === "archived")  return "bg-gray-100 text-gray-500";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">Academy Manager</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">Create and manage courses, coaching, workshops, and events.</p>
        </div>
        <button onClick={() => { setShowForm(p => !p); setEditing(null); setForm({ ...EMPTY_FORM }); }} className="flex items-center gap-2 px-4 py-2 bg-gold text-charcoal text-xs font-sans font-semibold rounded-xl hover:bg-gold-dark cursor-pointer transition-all">
          <Plus size={13} weight="bold" /> Add Item
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["all",...TYPES].map(f => (
          <button key={f} onClick={() => setTypeFilter(f)} className={`px-3 py-1.5 text-xs font-mono rounded-xl border transition-all cursor-pointer ${f === typeFilter ? "bg-charcoal text-gold border-charcoal" : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"}`}>
            {f === "all" ? `All (${all.length})` : `${TYPE_LABELS[f]} (${all.filter(i => i.type === f).length})`}
          </button>
        ))}
      </div>

      {showForm && (
        <Card className="mb-6 bg-white border-gray-200 shadow-sm">
          <CardHeader><CardTitle className="font-headline text-base text-charcoal">{editing ? "Edit Item" : "New Academy Item"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none">
                  {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Title *</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Description *</label>
                <textarea required rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none resize-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Price *</label>
                <input required value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. $299" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Duration</label>
                <input value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. 6 weeks" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Instructor</label>
                <input value={form.instructor} onChange={e => setForm(p => ({ ...p, instructor: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Thumbnail URL</label>
                <input type="url" value={form.thumbnailUrl} onChange={e => setForm(p => ({ ...p, thumbnailUrl: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Max Attendees</label>
                <input type="number" value={form.maxAttendees} onChange={e => setForm(p => ({ ...p, maxAttendees: e.target.value }))} placeholder="Leave blank for unlimited" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div className="flex gap-2 md:col-span-2 items-center">
                <button type="submit" disabled={isMutating} className="px-5 py-2 bg-charcoal text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-gray-800 disabled:opacity-50">{editing ? "Update" : "Publish"}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-400">Cancel</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isPending ? (
        <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-14 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="font-sans text-sm text-gray-400">No academy items yet. Add your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(item => (
            <Card key={item.id} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                    {TYPE_ICONS[item.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-[9px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{TYPE_LABELS[item.type]}</span>
                      <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full ${statusBadge(item.status)}`}>{item.status}</span>
                    </div>
                    <h3 className="font-headline font-semibold text-base text-charcoal truncate">{item.title}</h3>
                    <p className="font-sans text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="font-headline font-semibold text-charcoal">{item.price}</span>
                      {item.duration && <span>· {item.duration}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button onClick={() => toggleStatus(item.id, item.status)} title="Toggle status" className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                      {item.status === "published" ? <EyeSlash size={12} className="text-gray-500" /> : <Eye size={12} className="text-gray-500" />}
                    </button>
                    <button onClick={() => handleEdit(item)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-charcoal group transition-colors">
                      <PencilSimple size={12} className="text-gray-500 group-hover:text-white" />
                    </button>
                    <button onClick={() => remove(item.id)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-red-600 group transition-colors">
                      <Trash size={12} className="text-gray-500 group-hover:text-white" />
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
