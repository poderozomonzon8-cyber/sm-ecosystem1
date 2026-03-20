import { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { Plus, Trash, PencilSimple, Check, FloppyDisk, UsersThree, Briefcase, TrendUp, Star, Buildings, Clock } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DEFAULT_METRICS = [
  { key: "followers",           label: "Social Followers",    value: "12.4K", icon: "UsersThree",  displayOn: "home,about" },
  { key: "projects_completed",  label: "Projects Completed",  value: "250+",  icon: "Briefcase",   displayOn: "home,services,portfolio,about" },
  { key: "employees",           label: "Team Members",        value: "50+",   icon: "UsersThree",  displayOn: "home,about" },
  { key: "clients",             label: "Happy Clients",       value: "500+",  icon: "Star",        displayOn: "home,services,about" },
  { key: "years_experience",    label: "Years Experience",    value: "10+",   icon: "Clock",       displayOn: "home,about" },
  { key: "satisfaction_rate",   label: "Satisfaction Rate",   value: "100%",  icon: "TrendUp",     displayOn: "home,services" },
];

const ICON_OPTIONS = ["UsersThree","Briefcase","TrendUp","Star","Buildings","Clock","Trophy","Heart","Leaf","Globe"];

const EMPTY_FORM = { key: "", label: "", value: "", icon: "Star", displayOn: "home", sortOrder: "0" };

export default function MetricsPanel() {
  const { data: metrics, isPending } = useQuery("SiteMetric", { orderBy: { sortOrder: "asc" } });
  const { create, update, remove, isPending: isMutating } = useMutation("SiteMetric");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saved, setSaved] = useState(false);

  const displayList = (metrics && metrics.length > 0) ? metrics : DEFAULT_METRICS;

  const startEdit = (m: any) => {
    setEditing(m.id ?? m.key);
    setEditValues({ value: m.value, label: m.label });
  };

  const saveEdit = async (m: any) => {
    if (m.id) await update(m.id, editValues);
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create(form);
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
  };

  const seedDefaults = async () => {
    for (const m of DEFAULT_METRICS) {
      await create({ ...m, sortOrder: String(DEFAULT_METRICS.indexOf(m)) });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">Metrics Editor</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">Manage numbers displayed across the website. Changes update instantly everywhere.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-green-600 font-sans flex items-center gap-1"><Check size={12} /> Saved!</span>}
          <button onClick={() => setShowForm(p => !p)} className="flex items-center gap-2 px-4 py-2 bg-gold text-charcoal text-xs font-sans font-semibold rounded-xl hover:bg-gold-dark cursor-pointer transition-all">
            <Plus size={13} weight="bold" /> Add Metric
          </button>
        </div>
      </div>

      {(!metrics || metrics.length === 0) && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
          <p className="font-sans text-sm text-amber-700">No metrics found. Seed the default metrics to get started.</p>
          <button onClick={seedDefaults} disabled={isMutating} className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-amber-700 transition-colors disabled:opacity-50">
            Seed Defaults
          </button>
        </div>
      )}

      {showForm && (
        <Card className="mb-6 bg-white border-gray-200 shadow-sm">
          <CardHeader><CardTitle className="font-headline text-base text-charcoal">New Metric</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Key (unique)</label>
                <input required value={form.key} onChange={e => setForm(p => ({ ...p, key: e.target.value }))} placeholder="e.g. projects_completed" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Label</label>
                <input required value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="e.g. Projects Completed" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Value</label>
                <input required value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder="e.g. 250+" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Display On</label>
                <input value={form.displayOn} onChange={e => setForm(p => ({ ...p, displayOn: e.target.value }))} placeholder="home,services,portfolio" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div className="flex items-end gap-2">
                <button type="submit" disabled={isMutating} className="flex-1 px-4 py-2 bg-charcoal text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-gray-800 disabled:opacity-50">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-400">Cancel</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayList.map((m: any) => {
          const isEditing = editing === (m.id ?? m.key);
          return (
            <Card key={m.id ?? m.key} className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                    {isEditing ? (
                      <input
                        value={editValues.value}
                        onChange={e => setEditValues(p => ({ ...p, value: e.target.value }))}
                        className="w-full text-center text-lg font-bold text-gold bg-transparent border-none outline-none"
                        style={{ maxWidth: "60px" }}
                      />
                    ) : (
                      <span className="font-headline font-bold text-sm text-gold text-center leading-tight px-1">{m.value}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input value={editValues.label} onChange={e => setEditValues(p => ({ ...p, label: e.target.value }))} className="w-full text-sm font-medium text-charcoal bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none" />
                    ) : (
                      <p className="font-sans font-medium text-sm text-charcoal">{m.label}</p>
                    )}
                    <p className="font-mono text-[10px] text-gray-400 mt-0.5 truncate">{m.displayOn}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {isEditing ? (
                      <>
                        <button onClick={() => saveEdit(m)} className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors">
                          <Check size={13} weight="bold" className="text-white" />
                        </button>
                        <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                          <span className="text-xs text-gray-500">✕</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(m)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-charcoal group transition-colors">
                          <PencilSimple size={13} weight="regular" className="text-gray-500 group-hover:text-white" />
                        </button>
                        {m.id && (
                          <button onClick={() => remove(m.id)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-red-600 group transition-colors">
                            <Trash size={13} weight="regular" className="text-gray-500 group-hover:text-white" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
