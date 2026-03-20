import { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import {
  Plus, Trash, X, Check, FunnelSimple, MagnifyingGlass,
  EnvelopeSimple, Phone, User, PencilSimple, Chat,
  Robot, CaretDown, ArrowRight,
} from "@phosphor-icons/react";

const PIPELINE_STAGES = [
  { id: "new",         label: "New Lead",    color: "bg-blue-100 text-blue-700 border-blue-200"     },
  { id: "contacted",   label: "Contacted",   color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: "quoted",      label: "Quoted",      color: "bg-amber-100 text-amber-700 border-amber-200"   },
  { id: "negotiating", label: "Negotiating", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { id: "won",         label: "Won",         color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { id: "lost",        label: "Lost",        color: "bg-red-100 text-red-700 border-red-200"           },
];

const SOURCE_LABELS: Record<string, string> = {
  "contact-form": "Contact Form",
  "ai-chat":      "AI Chat",
  "referral":     "Referral",
  "social":       "Social Media",
  "other":        "Other",
};

function AddLeadModal({ onClose, onCreate }: { onClose: () => void; onCreate: (d: any) => void }) {
  const { data: employees } = useQuery("Employee");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", message: "", source: "contact-form",
    status: "new", assignedTo: "", assignedEmployeeId: "",
    notes: "", budget: "", serviceInterest: "",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const handleSubmit = () => {
    if (!form.name) return;
    onCreate(form);
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-headline font-bold text-base text-charcoal">Add Lead</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 cursor-pointer"><X size={14} weight="bold" /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Full Name *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jean Dupont"
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Email</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Phone</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Lead Source</label>
              <select value={form.source} onChange={(e) => set("source", e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer focus:outline-none focus:border-charcoal">
                {Object.entries(SOURCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Service Interest</label>
              <input value={form.serviceInterest} onChange={(e) => set("serviceInterest", e.target.value)} placeholder="Construction, Landscaping…"
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Budget</label>
              <input value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="$10,000–$50,000"
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Assign To</label>
              <select value={form.assignedEmployeeId}
                onChange={(e) => {
                  const emp = employees?.find(em => em.id === e.target.value);
                  set("assignedEmployeeId", e.target.value);
                  if (emp) set("assignedTo", `${emp.firstName} ${emp.lastName}`);
                }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer focus:outline-none focus:border-charcoal">
                <option value="">— Unassigned —</option>
                {employees?.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Message / Details</label>
            <textarea rows={3} value={form.message} onChange={(e) => set("message", e.target.value)}
              placeholder="Client's initial message or request…"
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal resize-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Internal Notes</label>
            <textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal resize-none" />
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3 justify-end sticky bottom-0 bg-white border-t border-gray-100 pt-4">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-sans text-gray-500 border border-gray-200 rounded-xl cursor-pointer hover:border-charcoal">Cancel</button>
          <button onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white text-sm font-sans font-semibold rounded-xl hover:bg-gray-800 cursor-pointer">
            <Check size={14} weight="bold" /> Save Lead
          </button>
        </div>
      </div>
    </div>
  );
}

function LeadDetailModal({ lead, onClose, onUpdate }: { lead: any; onClose: () => void; onUpdate: (id: string, data: any) => void }) {
  const { data: employees } = useQuery("Employee");
  const [notes, setNotes] = useState(lead.notes || "");
  const [editingNotes, setEditingNotes] = useState(false);

  const handleSaveNotes = () => {
    onUpdate(lead.id, { notes });
    setEditingNotes(false);
  };
  const handleMarkContacted = () => {
    onUpdate(lead.id, { status: "contacted", lastContactedAt: new Date() });
  };

  const stageInfo = PIPELINE_STAGES.find(s => s.id === lead.status);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h3 className="font-headline font-bold text-base text-charcoal">{lead.name}</h3>
            <p className="font-sans text-xs text-gray-400">{lead.serviceInterest || "General inquiry"} · {SOURCE_LABELS[lead.source] || lead.source}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-[10px] font-mono rounded-full border ${stageInfo?.color ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
              {stageInfo?.label ?? lead.status}
            </span>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 cursor-pointer"><X size={14} weight="bold" /></button>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Contact info */}
          <div className="grid grid-cols-2 gap-3">
            {lead.email && (
              <a href={`mailto:${lead.email}`} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl text-xs font-sans text-charcoal hover:bg-gray-100 cursor-pointer">
                <EnvelopeSimple size={13} weight="regular" className="text-gray-400" /> {lead.email}
              </a>
            )}
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl text-xs font-sans text-charcoal hover:bg-gray-100 cursor-pointer">
                <Phone size={13} weight="regular" className="text-gray-400" /> {lead.phone}
              </a>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {lead.budget && (
              <div><p className="font-mono text-[10px] text-gray-400 mb-0.5 uppercase tracking-widest">Budget</p><p className="font-sans text-charcoal">{lead.budget}</p></div>
            )}
            {lead.assignedTo && (
              <div><p className="font-mono text-[10px] text-gray-400 mb-0.5 uppercase tracking-widest">Assigned To</p><p className="font-sans text-charcoal">{lead.assignedTo}</p></div>
            )}
            <div><p className="font-mono text-[10px] text-gray-400 mb-0.5 uppercase tracking-widest">Created</p><p className="font-sans text-charcoal">{new Date(lead.createdAt).toLocaleDateString("en-CA")}</p></div>
            {lead.lastContactedAt && (
              <div><p className="font-mono text-[10px] text-gray-400 mb-0.5 uppercase tracking-widest">Last Contact</p><p className="font-sans text-charcoal">{new Date(lead.lastContactedAt).toLocaleDateString("en-CA")}</p></div>
            )}
          </div>

          {/* Message */}
          {lead.message && (
            <div>
              <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-1.5">Message</p>
              <p className="font-sans text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed">{lead.message}</p>
            </div>
          )}

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Internal Notes</p>
              <button onClick={() => setEditingNotes(!editingNotes)} className="text-[10px] font-mono text-gold hover:text-gold-dark cursor-pointer">
                {editingNotes ? "Cancel" : "Edit"}
              </button>
            </div>
            {editingNotes ? (
              <div className="flex flex-col gap-2">
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal resize-none" />
                <button onClick={handleSaveNotes}
                  className="self-end flex items-center gap-1 px-3 py-1.5 bg-charcoal text-white text-xs font-mono rounded-lg cursor-pointer">
                  <Check size={11} weight="bold" /> Save
                </button>
              </div>
            ) : (
              <p className="font-sans text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3 min-h-[60px]">
                {notes || "No notes yet."}
              </p>
            )}
          </div>

          {/* Pipeline stage change */}
          <div>
            <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-2">Move Stage</p>
            <div className="flex flex-wrap gap-2">
              {PIPELINE_STAGES.map((s) => (
                <button key={s.id} onClick={() => onUpdate(lead.id, { status: s.id })}
                  className={`px-3 py-1.5 text-[11px] font-mono rounded-xl border transition-all cursor-pointer ${lead.status === s.id ? s.color : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-2 justify-end border-t border-gray-100 pt-4">
          {lead.status === "new" && (
            <button onClick={handleMarkContacted}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-50 text-purple-600 border border-purple-200 text-sm font-sans font-semibold rounded-xl hover:bg-purple-100 cursor-pointer">
              <Phone size={13} weight="bold" /> Mark Contacted
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-sans text-gray-500 border border-gray-200 rounded-xl cursor-pointer hover:border-charcoal">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function LeadManagementPanel() {
  const [showModal,   setShowModal]   = useState(false);
  const [detailLead,  setDetailLead]  = useState<any | null>(null);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [search,      setSearch]      = useState("");
  const [view,        setView]        = useState<"kanban" | "list">("list");

  const { data: leads, isPending } = useQuery("Lead", { orderBy: { createdAt: "desc" } });
  const { create, update, remove, isPending: isMutating } = useMutation("Lead");

  const safe = leads ?? [];

  const filtered = safe.filter((l) =>
    (stageFilter === "all" || l.status === stageFilter) &&
    (!search || l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.serviceInterest?.toLowerCase().includes(search.toLowerCase()))
  );

  const stageCounts = PIPELINE_STAGES.reduce((acc, s) => {
    acc[s.id] = safe.filter(l => l.status === s.id).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-headline font-bold text-2xl text-charcoal">Lead Management</h1>
            <p className="font-sans text-sm text-gray-500 mt-1">Pipeline from first contact to signed contract.</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-charcoal text-white text-sm font-sans font-semibold rounded-xl hover:bg-gray-800 cursor-pointer">
            <Plus size={14} weight="bold" /> Add Lead
          </button>
        </div>

        {/* Pipeline summary */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {PIPELINE_STAGES.map((s) => (
            <button key={s.id} onClick={() => setStageFilter(stageFilter === s.id ? "all" : s.id)}
              className={`px-3 py-3 rounded-2xl border text-center transition-all cursor-pointer ${stageFilter === s.id ? s.color : "bg-white border-gray-200 hover:border-gray-400"}`}>
              <p className="font-headline font-bold text-lg text-charcoal">{stageCounts[s.id] ?? 0}</p>
              <p className="font-sans text-[11px] text-gray-500">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(["list","kanban"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 text-[11px] font-mono rounded-lg transition-all cursor-pointer capitalize ${view === v ? "bg-white shadow-sm text-charcoal" : "text-gray-400 hover:text-gray-600"}`}>
                {v}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <MagnifyingGlass size={13} weight="regular" className="text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads…"
              className="text-xs font-sans focus:outline-none w-36 bg-transparent text-charcoal" />
          </div>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center py-12"><span className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
        ) : view === "kanban" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {PIPELINE_STAGES.map((stage) => {
              const stageLeads = safe.filter(l => l.status === stage.id);
              return (
                <div key={stage.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div className={`px-3 py-2.5 border-b ${stage.color.replace("text-","").replace(/bg-\S+/,"bg-gray-50")} border-gray-100 flex items-center justify-between`}>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">{stage.label}</span>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${stage.color}`}>{stageLeads.length}</span>
                  </div>
                  <div className="p-2 flex flex-col gap-2 min-h-[120px]">
                    {stageLeads.map((l) => (
                      <button key={l.id} onClick={() => setDetailLead(l)}
                        className="w-full text-left p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <p className="font-sans text-xs font-medium text-charcoal truncate">{l.name}</p>
                        <p className="font-mono text-[9px] text-gray-400 mt-0.5 truncate">{l.serviceInterest || l.source}</p>
                        {l.budget && <p className="font-mono text-[9px] text-emerald-600">{l.budget}</p>}
                      </button>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="flex-1 flex items-center justify-center">
                        <FunnelSimple size={14} weight="regular" className="text-gray-200" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-gray-200">
            <FunnelSimple size={28} weight="regular" className="text-gray-300 mb-2" />
            <p className="font-sans text-sm text-gray-400">No leads yet. Add your first lead above.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-[1fr_120px_100px_100px_100px_80px_48px] gap-0 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              {["Name","Service","Budget","Source","Assigned","Status",""].map((h) => (
                <span key={h} className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">{h}</span>
              ))}
            </div>
            {filtered.map((lead) => {
              const stageInfo = PIPELINE_STAGES.find(s => s.id === lead.status);
              return (
                <div key={lead.id} className="grid grid-cols-[1fr_120px_100px_100px_100px_80px_48px] gap-0 px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 items-center group transition-colors">
                  <div className="min-w-0">
                    <p className="font-sans text-xs font-medium text-charcoal truncate">{lead.name}</p>
                    <div className="flex items-center gap-1.5">
                      {lead.email && <p className="font-mono text-[10px] text-gray-400 truncate">{lead.email}</p>}
                    </div>
                  </div>
                  <span className="font-sans text-xs text-gray-500 truncate">{lead.serviceInterest || "—"}</span>
                  <span className="font-sans text-xs text-gray-500 truncate">{lead.budget || "—"}</span>
                  <span className="font-mono text-[10px] text-gray-400">{SOURCE_LABELS[lead.source] || lead.source}</span>
                  <span className="font-sans text-xs text-gray-500 truncate">{lead.assignedTo || "—"}</span>
                  <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full border w-fit ${stageInfo?.color ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
                    {stageInfo?.label ?? lead.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setDetailLead(lead)}
                      className="w-7 h-7 rounded-lg bg-gray-100 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-charcoal transition-all cursor-pointer group/btn">
                      <ArrowRight size={10} weight="bold" className="text-gray-400 group-hover/btn:text-white" />
                    </button>
                    <button onClick={() => remove(lead.id)} disabled={isMutating}
                      className="w-7 h-7 rounded-lg bg-gray-100 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer group/del">
                      <Trash size={10} weight="regular" className="text-gray-400 group-hover/del:text-white" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showModal && <AddLeadModal onClose={() => setShowModal(false)} onCreate={async (d) => { await create(d); setShowModal(false); }} />}
      {detailLead && <LeadDetailModal lead={detailLead} onClose={() => setDetailLead(null)} onUpdate={async (id, data) => { await update(id, data); setDetailLead(null); }} />}
    </>
  );
}
