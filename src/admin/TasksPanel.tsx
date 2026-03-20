import { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import {
  Plus, Trash, Check, X, MagnifyingGlass, ArrowRight,
  CaretDown, ListChecks, Warning, Clock, CheckCircle,
} from "@phosphor-icons/react";

const STATUS_OPTIONS  = ["open", "in-progress", "done", "blocked"] as const;
const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"] as const;

const STATUS_COLORS: Record<string, string> = {
  "open":       "bg-gray-100 text-gray-600",
  "in-progress":"bg-blue-100 text-blue-700",
  "done":       "bg-emerald-100 text-emerald-700",
  "blocked":    "bg-red-100 text-red-600",
};
const PRIORITY_COLORS: Record<string, string> = {
  low:    "bg-gray-50 text-gray-400 border-gray-200",
  medium: "bg-amber-50 text-amber-600 border-amber-200",
  high:   "bg-orange-50 text-orange-600 border-orange-200",
  urgent: "bg-red-50 text-red-600 border-red-200",
};

function TaskModal({ onClose, onCreate, projects, employees }: {
  onClose: () => void;
  onCreate: (d: any) => void;
  projects: any[];
  employees: any[];
}) {
  const [form, setForm] = useState({
    title: "", description: "", projectId: "", projectName: "", status: "open", priority: "medium",
    assignedEmployeeId: "", assignedEmployeeName: "", notes: "", tags: "",
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const submit = () => {
    if (!form.title) return;
    onCreate(form);
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-headline font-bold text-base text-charcoal">New Task</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer"><X size={14} weight="bold" /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Task Title *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g., Install foundation footings"
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Project</label>
              <select value={form.projectId}
                onChange={e => {
                  const p = projects.find(pr => pr.id === e.target.value);
                  set("projectId", e.target.value);
                  if (p) set("projectName", p.title);
                }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer focus:outline-none">
                <option value="">— None —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Assign To</label>
              <select value={form.assignedEmployeeId}
                onChange={e => {
                  const em = employees.find(x => x.id === e.target.value);
                  set("assignedEmployeeId", e.target.value);
                  if (em) set("assignedEmployeeName", `${em.firstName} ${em.lastName}`);
                }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer focus:outline-none">
                <option value="">— Unassigned —</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer focus:outline-none">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Priority</label>
              <select value={form.priority} onChange={e => set("priority", e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer focus:outline-none">
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Description</label>
            <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none resize-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Tags (comma separated)</label>
            <input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="concrete,framing,electrical"
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3 justify-end border-t border-gray-100 pt-4">
          <button onClick={onClose} className="px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl cursor-pointer">Cancel</button>
          <button onClick={submit} disabled={!form.title}
            className="flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white text-sm font-semibold rounded-xl cursor-pointer disabled:opacity-50">
            <Check size={13} weight="bold" /> Create Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPanel() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const { data: tasks, isPending } = useQuery("ProjectTask", { orderBy: { createdAt: "desc" } });
  const { data: projects } = useQuery("Project");
  const { data: employees } = useQuery("Employee");
  const { create, update, remove, isPending: isMutating } = useMutation("ProjectTask");

  const safeProjects  = projects  ?? [];
  const safeEmployees = employees ?? [];
  const safeTasks = tasks ?? [];

  const filtered = safeTasks.filter(t =>
    (statusFilter === "all" || t.status === statusFilter) &&
    (priorityFilter === "all" || t.priority === priorityFilter) &&
    (!search || t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.projectName?.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedEmployeeName?.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = {
    open:        safeTasks.filter(t => t.status === "open").length,
    inProgress:  safeTasks.filter(t => t.status === "in-progress").length,
    done:        safeTasks.filter(t => t.status === "done").length,
    blocked:     safeTasks.filter(t => t.status === "blocked").length,
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-headline font-bold text-2xl text-charcoal">Tasks</h1>
            <p className="font-sans text-sm text-gray-500 mt-1">Project tasks, assignments, and progress tracking.</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-charcoal text-white text-sm font-semibold rounded-xl hover:bg-gray-800 cursor-pointer">
            <Plus size={14} weight="bold" /> New Task
          </button>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Open",        count: counts.open,       icon: ListChecks,    color: "text-gray-600",    bg: "bg-gray-50"    },
            { label: "In Progress", count: counts.inProgress, icon: Clock,         color: "text-blue-600",    bg: "bg-blue-50"    },
            { label: "Done",        count: counts.done,       icon: CheckCircle,   color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Blocked",     count: counts.blocked,    icon: Warning,       color: "text-red-600",     bg: "bg-red-50"     },
          ].map(({ label, count, icon: Icon, color, bg }) => (
            <button key={label}
              onClick={() => setStatusFilter(statusFilter === label.toLowerCase().replace(" ", "-") ? "all" : label.toLowerCase().replace(" ", "-"))}
              className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm text-left hover:border-gray-300 transition-colors cursor-pointer">
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-2`}>
                <Icon size={15} weight="regular" className={color} />
              </div>
              <p className="font-headline font-bold text-xl text-charcoal">{count}</p>
              <p className="font-sans text-xs text-gray-400 mt-0.5">{label}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex flex-wrap gap-2">
            {["all", ...STATUS_OPTIONS].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-mono rounded-xl border transition-all cursor-pointer capitalize ${statusFilter === s ? "bg-charcoal text-white border-charcoal" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"}`}>
                {s === "all" ? "All" : s.replace("-", " ")}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 ml-2">
            {["all", ...PRIORITY_OPTIONS].map(p => (
              <button key={p} onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1.5 text-xs font-mono rounded-xl border transition-all cursor-pointer capitalize ${priorityFilter === p ? "border-gold bg-gold/10 text-gold" : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"}`}>
                {p === "all" ? "Any Priority" : p}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <MagnifyingGlass size={13} weight="regular" className="text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…"
              className="text-xs font-sans focus:outline-none w-32 bg-transparent text-charcoal" />
          </div>
        </div>

        {/* Task list */}
        {isPending ? (
          <div className="flex justify-center py-12"><span className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-gray-200">
            <ListChecks size={28} weight="regular" className="text-gray-300 mb-2" />
            <p className="font-sans text-sm text-gray-400">No tasks found. Create your first task above.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 grid grid-cols-[1fr_120px_100px_100px_80px_80px_48px] gap-0">
              {["Task", "Project", "Assigned", "Priority", "Status", "Due", ""].map(h => (
                <span key={h} className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">{h}</span>
              ))}
            </div>
            {filtered.map(task => (
              <div key={task.id} className="grid grid-cols-[1fr_120px_100px_100px_80px_80px_48px] gap-0 px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors items-center group">
                <div className="min-w-0 flex items-center gap-2.5">
                  <button
                    onClick={() => update(task.id, { status: task.status === "done" ? "open" : "done" })}
                    disabled={isMutating}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${task.status === "done" ? "bg-emerald-500 border-emerald-500" : "border-gray-300 hover:border-emerald-400"}`}>
                    {task.status === "done" && <Check size={9} weight="bold" className="text-white" />}
                  </button>
                  <div className="min-w-0">
                    <p className={`font-sans text-xs font-medium text-charcoal truncate ${task.status === "done" ? "line-through text-gray-400" : ""}`}>{task.title}</p>
                    {task.description && <p className="font-sans text-[10px] text-gray-400 truncate">{task.description}</p>}
                  </div>
                </div>
                <span className="font-sans text-xs text-gray-500 truncate">{task.projectName || "—"}</span>
                <span className="font-sans text-xs text-gray-500 truncate">{task.assignedEmployeeName?.split(" ")[0] || "—"}</span>
                <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full border w-fit capitalize ${PRIORITY_COLORS[task.priority ?? "medium"]}`}>{task.priority ?? "medium"}</span>
                <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full w-fit capitalize ${STATUS_COLORS[task.status ?? "open"]}`}>{(task.status ?? "open").replace("-", " ")}</span>
                <span className="font-mono text-[10px] text-gray-400">{task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-CA") : "—"}</span>
                <button onClick={() => remove(task.id)} disabled={isMutating}
                  className="w-7 h-7 rounded-lg bg-gray-100 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer">
                  <Trash size={10} weight="regular" className="text-gray-400 group-hover:text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <TaskModal
          onClose={() => setShowModal(false)}
          onCreate={async d => { await create(d); setShowModal(false); }}
          projects={safeProjects}
          employees={safeEmployees}
        />
      )}
    </>
  );
}
