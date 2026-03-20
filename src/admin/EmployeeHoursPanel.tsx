import { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import {
  Plus, Trash, X, Check, Clock, User, Briefcase,
  MagnifyingGlass, PencilSimple, CalendarBlank,
} from "@phosphor-icons/react";

function AddHourModal({ onClose, onCreate }: { onClose: () => void; onCreate: (d: any) => void }) {
  const { data: projects  } = useQuery("Project");
  const { data: employees } = useQuery("Employee");
  const [form, setForm] = useState({
    employeeId: "", employeeName: "", projectId: "", projectName: "",
    date: new Date().toISOString().slice(0,10), hours: "8", costPerHour: "35.00",
    notes: "", approved: "no",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const totalCost = (parseFloat(form.hours) || 0) * (parseFloat(form.costPerHour) || 0);

  const handleSubmit = () => {
    if (!form.employeeId || !form.hours) return;
    onCreate({
      ...form,
      totalCost: totalCost.toFixed(2),
      date: new Date(form.date),
    });
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-headline font-bold text-base text-charcoal">Log Hours</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 cursor-pointer"><X size={14} weight="bold" /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Employee *</label>
            <select value={form.employeeId}
              onChange={(e) => {
                const emp = employees?.find(em => em.id === e.target.value);
                set("employeeId", e.target.value);
                if (emp) set("employeeName", `${emp.firstName} ${emp.lastName}`);
              }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer focus:outline-none focus:border-charcoal">
              <option value="">— Select employee —</option>
              {employees?.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Project</label>
            <select value={form.projectId}
              onChange={(e) => {
                const p = projects?.find(pr => pr.id === e.target.value);
                set("projectId", e.target.value);
                if (p) set("projectName", p.title);
              }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer focus:outline-none focus:border-charcoal">
              <option value="">— Select project —</option>
              {projects?.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1 col-span-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Date</label>
              <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Hours *</label>
              <input type="number" step="0.5" value={form.hours} onChange={(e) => set("hours", e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">$/hr</label>
              <input type="number" value={form.costPerHour} onChange={(e) => set("costPerHour", e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-sans text-gray-500">Total Labor Cost</span>
            <span className="font-mono text-sm font-semibold text-charcoal">${totalCost.toFixed(2)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Notes</label>
            <textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)}
              placeholder="Work performed, location, etc."
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal resize-none" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="approved" checked={form.approved === "yes"} onChange={(e) => set("approved", e.target.checked ? "yes" : "no")} className="rounded cursor-pointer" />
            <label htmlFor="approved" className="text-sm font-sans text-gray-600 cursor-pointer">Mark as approved</label>
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3 justify-end border-t border-gray-100 pt-4">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-sans text-gray-500 border border-gray-200 rounded-xl cursor-pointer hover:border-charcoal">Cancel</button>
          <button onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white text-sm font-sans font-semibold rounded-xl hover:bg-gray-800 cursor-pointer">
            <Check size={14} weight="bold" /> Save Entry
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeHoursPanel() {
  const [showModal, setShowModal] = useState(false);
  const [search,    setSearch]    = useState("");
  const [viewMode,  setViewMode]  = useState<"list" | "byEmployee" | "byProject">("list");

  const { data: entries, isPending } = useQuery("HourEntry", { orderBy: { date: "desc" } });
  const { create, remove, update, isPending: isMutating } = useMutation("HourEntry");

  const safe = entries ?? [];
  const totalHours    = safe.reduce((a, e) => a + parseFloat(e.hours || "0"), 0);
  const totalCost     = safe.reduce((a, e) => a + parseFloat(e.totalCost || "0"), 0);
  const pendingApproval = safe.filter(e => e.approved !== "yes").length;

  const filtered = safe.filter((e) =>
    !search ||
    e.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
    e.projectName?.toLowerCase().includes(search.toLowerCase())
  );

  /* Group by employee */
  const byEmployee: Record<string, { hours: number; cost: number; entries: typeof safe }> = {};
  safe.forEach((e) => {
    if (!byEmployee[e.employeeName]) byEmployee[e.employeeName] = { hours: 0, cost: 0, entries: [] };
    byEmployee[e.employeeName].hours += parseFloat(e.hours || "0");
    byEmployee[e.employeeName].cost  += parseFloat(e.totalCost || "0");
    byEmployee[e.employeeName].entries.push(e);
  });

  /* Group by project */
  const byProject: Record<string, { hours: number; cost: number; entries: typeof safe }> = {};
  safe.forEach((e) => {
    const key = e.projectName || "Unassigned";
    if (!byProject[key]) byProject[key] = { hours: 0, cost: 0, entries: [] };
    byProject[key].hours += parseFloat(e.hours || "0");
    byProject[key].cost  += parseFloat(e.totalCost || "0");
    byProject[key].entries.push(e);
  });

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-headline font-bold text-2xl text-charcoal">Employee Hours</h1>
            <p className="font-sans text-sm text-gray-500 mt-1">Time tracking by employee, project, and day with cost calculation.</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-charcoal text-white text-sm font-sans font-semibold rounded-xl hover:bg-gray-800 cursor-pointer">
            <Plus size={14} weight="bold" /> Log Hours
          </button>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Hours",        value: `${totalHours.toFixed(1)}h` },
            { label: "Total Labor Cost",   value: `$${totalCost.toLocaleString("en-CA", {minimumFractionDigits:2})}` },
            { label: "Avg. $/hour",        value: totalHours > 0 ? `$${(totalCost/totalHours).toFixed(2)}` : "—" },
            { label: "Pending Approval",   value: String(pendingApproval) },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="font-headline font-bold text-xl text-charcoal">{s.value}</p>
              <p className="font-sans text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* View mode + search */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {([["list","List"],["byEmployee","By Employee"],["byProject","By Project"]] as const).map(([m, l]) => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 text-[11px] font-mono rounded-lg transition-all cursor-pointer ${viewMode === m ? "bg-white shadow-sm text-charcoal" : "text-gray-400 hover:text-gray-600"}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <MagnifyingGlass size={13} weight="regular" className="text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee or project…"
              className="text-xs font-sans focus:outline-none w-44 bg-transparent text-charcoal" />
          </div>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center py-12"><span className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
        ) : safe.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-gray-200">
            <Clock size={32} weight="regular" className="text-gray-300 mb-3" />
            <p className="font-sans text-sm text-gray-400">No hour entries yet. Click "Log Hours" to start tracking.</p>
          </div>
        ) : viewMode === "list" ? (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-[1fr_120px_100px_80px_80px_80px_80px_48px] gap-0 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              {["Employee","Project","Date","Hours","$/hr","Total","Status",""].map((h) => (
                <span key={h} className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">{h}</span>
              ))}
            </div>
            {filtered.map((e) => (
              <div key={e.id} className="grid grid-cols-[1fr_120px_100px_80px_80px_80px_80px_48px] gap-0 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 items-center group">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-[10px] font-semibold text-gray-500">{(e.employeeName || "?")[0]}</span>
                  </div>
                  <span className="font-sans text-xs font-medium text-charcoal truncate">{e.employeeName || "—"}</span>
                </div>
                <span className="font-sans text-xs text-gray-500 truncate">{e.projectName || "—"}</span>
                <span className="font-mono text-xs text-gray-400">{e.date ? new Date(e.date).toLocaleDateString("en-CA") : "—"}</span>
                <span className="font-mono text-xs font-semibold text-charcoal">{e.hours}h</span>
                <span className="font-mono text-xs text-gray-500">${e.costPerHour}</span>
                <span className="font-mono text-xs font-semibold text-charcoal">${parseFloat(e.totalCost || "0").toFixed(2)}</span>
                <div>
                  <button onClick={() => update(e.id, { approved: e.approved === "yes" ? "no" : "yes" })}
                    className={`px-2 py-0.5 text-[9px] font-mono rounded-full cursor-pointer transition-colors ${e.approved === "yes" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-amber-100 text-amber-600 hover:bg-amber-200"}`}>
                    {e.approved === "yes" ? "approved" : "pending"}
                  </button>
                </div>
                <button onClick={() => remove(e.id)} disabled={isMutating}
                  className="w-7 h-7 rounded-lg bg-gray-100 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-600 group/del transition-all cursor-pointer">
                  <Trash size={11} weight="regular" className="text-gray-400 group-hover/del:text-white" />
                </button>
              </div>
            ))}
          </div>
        ) : viewMode === "byEmployee" ? (
          <div className="flex flex-col gap-4">
            {Object.entries(byEmployee).map(([emp, data]) => (
              <div key={emp} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="font-mono text-xs font-bold text-gray-600">{emp[0]}</span>
                    </div>
                    <span className="font-sans font-semibold text-sm text-charcoal">{emp}</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="font-mono text-xs font-semibold text-charcoal">{data.hours.toFixed(1)}h</p>
                      <p className="font-sans text-[10px] text-gray-400">hours</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs font-semibold text-charcoal">${data.cost.toFixed(2)}</p>
                      <p className="font-sans text-[10px] text-gray-400">labor cost</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {data.entries.map((e) => (
                    <div key={e.id} className="flex items-center justify-between px-5 py-2.5">
                      <span className="font-sans text-xs text-gray-500">{e.date ? new Date(e.date).toLocaleDateString("en-CA") : "—"} · {e.projectName || "—"}</span>
                      <span className="font-mono text-xs text-charcoal">{e.hours}h · ${e.totalCost}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {Object.entries(byProject).map(([proj, data]) => (
              <div key={proj} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} weight="regular" className="text-gray-400" />
                    <span className="font-sans font-semibold text-sm text-charcoal">{proj}</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="font-mono text-xs font-semibold text-charcoal">{data.hours.toFixed(1)}h</p>
                      <p className="font-sans text-[10px] text-gray-400">hours</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs font-semibold text-charcoal">${data.cost.toFixed(2)}</p>
                      <p className="font-sans text-[10px] text-gray-400">labor cost</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {data.entries.map((e) => (
                    <div key={e.id} className="flex items-center justify-between px-5 py-2.5">
                      <span className="font-sans text-xs text-gray-500">{e.date ? new Date(e.date).toLocaleDateString("en-CA") : "—"} · {e.employeeName || "—"}</span>
                      <span className="font-mono text-xs text-charcoal">{e.hours}h · ${e.totalCost}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showModal && <AddHourModal onClose={() => setShowModal(false)} onCreate={async (d) => { await create(d); setShowModal(false); }} />}
    </>
  );
}
