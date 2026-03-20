import { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { Plus, Trash, PencilSimple, Check, FloppyDisk, Eye, EyeSlash } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SECTIONS = [
  { key: "founder",  label: "Founder Profile" },
  { key: "story",    label: "Company Story"   },
  { key: "mission",  label: "Mission"         },
  { key: "vision",   label: "Vision"          },
  { key: "values",   label: "Core Values"     },
  { key: "timeline", label: "Timeline"        },
  { key: "awards",   label: "Awards"          },
  { key: "hero",     label: "Hero Section"    },
];

const EMPTY_FORM = { section: "founder", title: "", subtitle: "", content: "", photoUrl: "", sortOrder: "0", active: "yes" };

export default function CompanyProfilePanel() {
  const { data: profiles, isPending } = useQuery("CompanyProfile", { orderBy: { sortOrder: "asc" } });
  const { create, update, remove, isPending: isMutating } = useMutation("CompanyProfile");
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [saved, setSaved] = useState(false);

  const handleEdit = (p: any) => {
    setEditing(p.id);
    setEditForm({ section: p.section, title: p.title, subtitle: p.subtitle ?? "", content: p.content, photoUrl: p.photoUrl ?? "", sortOrder: p.sortOrder ?? "0", active: p.active });
  };

  const handleSave = async () => {
    if (!editing) return;
    await update(editing, editForm);
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create(newForm);
    setNewForm({ ...EMPTY_FORM });
    setShowNew(false);
  };

  const toggleActive = (id: string, active: string) => update(id, { active: active === "yes" ? "no" : "yes" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">Company Identity</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">Edit your brand story, team heroes, mission, values, awards, and timeline.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-green-600 font-sans flex items-center gap-1"><Check size={12} /> Saved!</span>}
          <button onClick={() => setShowNew(p => !p)} className="flex items-center gap-2 px-4 py-2 bg-gold text-charcoal text-xs font-sans font-semibold rounded-xl hover:bg-gold-dark cursor-pointer transition-all">
            <Plus size={13} weight="bold" /> Add Section
          </button>
        </div>
      </div>

      {showNew && (
        <Card className="mb-6 bg-white border-gray-200 shadow-sm">
          <CardHeader><CardTitle className="font-headline text-base text-charcoal">New Section</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Section Type</label>
                <select value={newForm.section} onChange={e => setNewForm(p => ({ ...p, section: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none">
                  {SECTIONS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Title *</label>
                <input required value={newForm.title} onChange={e => setNewForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Subtitle</label>
                <input value={newForm.subtitle} onChange={e => setNewForm(p => ({ ...p, subtitle: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Photo URL</label>
                <input type="url" value={newForm.photoUrl} onChange={e => setNewForm(p => ({ ...p, photoUrl: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Content *</label>
                <textarea required rows={4} value={newForm.content} onChange={e => setNewForm(p => ({ ...p, content: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none resize-none" />
              </div>
              <div className="flex gap-2 md:col-span-2">
                <button type="submit" disabled={isMutating} className="px-5 py-2 bg-charcoal text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-gray-800 disabled:opacity-50">Create</button>
                <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-400">Cancel</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isPending ? (
        <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
      ) : (!profiles || profiles.length === 0) ? (
        <div className="flex items-center justify-center py-16 rounded-2xl border-2 border-dashed border-gray-200 text-center">
          <div>
            <p className="font-sans text-sm text-gray-400 mb-3">No company profile sections yet.</p>
            <button onClick={() => setShowNew(true)} className="px-4 py-2 bg-charcoal text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-gray-800">Add First Section</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {profiles.map(p => (
            <Card key={p.id} className={`bg-white border-gray-200 shadow-sm ${p.active !== "yes" ? "opacity-60" : ""}`}>
              <CardContent className="p-5">
                {editing === p.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Title</label>
                      <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Subtitle</label>
                      <input value={editForm.subtitle} onChange={e => setEditForm(f => ({ ...f, subtitle: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Photo URL</label>
                      <input type="url" value={editForm.photoUrl} onChange={e => setEditForm(f => ({ ...f, photoUrl: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Content</label>
                      <textarea rows={4} value={editForm.content} onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none resize-none" />
                    </div>
                    <div className="flex gap-2 md:col-span-2">
                      <button onClick={handleSave} disabled={isMutating} className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-green-600 disabled:opacity-50">
                        <FloppyDisk size={12} weight="bold" /> Save
                      </button>
                      <button onClick={() => setEditing(null)} className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-400">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    {p.photoUrl && (
                      <img src={p.photoUrl} alt={p.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded-full">{SECTIONS.find(s => s.key === p.section)?.label ?? p.section}</span>
                        {p.active !== "yes" && <span className="font-mono text-[9px] text-gray-400">Hidden</span>}
                      </div>
                      <h3 className="font-headline font-semibold text-base text-charcoal">{p.title}</h3>
                      {p.subtitle && <p className="font-sans text-xs text-gray-500">{p.subtitle}</p>}
                      <p className="font-sans text-sm text-gray-500 mt-2 line-clamp-2">{p.content}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => toggleActive(p.id, p.active)} title={p.active === "yes" ? "Hide" : "Show"} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                        {p.active === "yes" ? <Eye size={13} className="text-gray-500" /> : <EyeSlash size={13} className="text-gray-500" />}
                      </button>
                      <button onClick={() => handleEdit(p)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-charcoal group transition-colors">
                        <PencilSimple size={13} className="text-gray-500 group-hover:text-white" />
                      </button>
                      <button onClick={() => remove(p.id)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-red-600 group transition-colors">
                        <Trash size={13} className="text-gray-500 group-hover:text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
