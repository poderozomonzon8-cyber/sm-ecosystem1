import { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import {
  Plus, Trash, X, Check, CurrencyDollar, ArrowUpRight,
  ArrowDownRight, Tag, MagnifyingGlass, CaretDown, Invoice,
} from "@phosphor-icons/react";

const EXPENSE_CATEGORIES = ["material","labor","subcontractor","equipment","fuel","vehicle","other"];
const INCOME_SERVICE_TYPES = ["Construction","Renovation","Landscaping","Maintenance","Design","Consulting","Other"];
const PAYMENT_METHODS = ["card","cash","transfer","cheque","other"];

const CAT_COLORS: Record<string, string> = {
  material: "bg-blue-100 text-blue-700",
  labor: "bg-emerald-100 text-emerald-700",
  subcontractor: "bg-amber-100 text-amber-700",
  equipment: "bg-purple-100 text-purple-700",
  fuel: "bg-red-100 text-red-700",
  vehicle: "bg-pink-100 text-pink-700",
  other: "bg-gray-100 text-gray-600",
};

/* ── Add Expense Modal ── */
function AddExpenseModal({ onClose, onCreate }: { onClose: () => void; onCreate: (d: any) => void }) {
  const { data: projects } = useQuery("Project");
  const { data: employees } = useQuery("Employee");
  const [form, setForm] = useState({
    category: "material", description: "", amount: "", date: new Date().toISOString().slice(0,10),
    projectId: "", projectName: "", employeeId: "", employeeName: "",
    vendor: "", notes: "", tags: "", paymentMethod: "card", receiptUrl: "",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const handleSubmit = () => {
    if (!form.description || !form.amount) return;
    onCreate({ ...form, date: new Date(form.date) });
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-headline font-bold text-base text-charcoal">Add Expense</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 cursor-pointer"><X size={14} weight="bold" /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Category *</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer focus:outline-none focus:border-charcoal capitalize">
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Amount ($) *</label>
              <input type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="0.00"
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Description *</label>
            <input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What was purchased…"
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Date</label>
              <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Payment Method</label>
              <select value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer focus:outline-none focus:border-charcoal capitalize">
                {PAYMENT_METHODS.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Project</label>
              <select value={form.projectId}
                onChange={(e) => {
                  const p = projects?.find(pr => pr.id === e.target.value);
                  set("projectId", e.target.value);
                  if (p) set("projectName", p.title);
                }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer focus:outline-none focus:border-charcoal">
                <option value="">— Select —</option>
                {projects?.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Employee</label>
              <select value={form.employeeId}
                onChange={(e) => {
                  const emp = employees?.find(em => em.id === e.target.value);
                  set("employeeId", e.target.value);
                  if (emp) set("employeeName", `${emp.firstName} ${emp.lastName}`);
                }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer focus:outline-none focus:border-charcoal">
                <option value="">— Select —</option>
                {employees?.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Vendor</label>
            <input value={form.vendor} onChange={(e) => set("vendor", e.target.value)} placeholder="Supplier / vendor name"
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Tags</label>
            <input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="urgent, warranty, monthly…"
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Notes</label>
            <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal resize-none" />
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3 justify-end sticky bottom-0 bg-white border-t border-gray-100 pt-4">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-sans text-gray-500 border border-gray-200 rounded-xl cursor-pointer hover:border-charcoal">Cancel</button>
          <button onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white text-sm font-sans font-semibold rounded-xl hover:bg-gray-800 cursor-pointer">
            <Check size={14} weight="bold" /> Save Expense
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Add Income Modal ── */
function AddIncomeModal({ onClose, onCreate }: { onClose: () => void; onCreate: (d: any) => void }) {
  const { data: projects } = useQuery("Project");
  const { data: clients  } = useQuery("Client");
  const [form, setForm] = useState({
    description: "", amount: "", date: new Date().toISOString().slice(0,10),
    projectId: "", projectName: "", serviceType: "Construction",
    clientId: "", clientName: "", invoiceId: "", paymentMethod: "transfer", notes: "",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const handleSubmit = () => {
    if (!form.description || !form.amount) return;
    onCreate({ ...form, date: new Date(form.date) });
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-headline font-bold text-base text-charcoal">Record Income</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 cursor-pointer"><X size={14} weight="bold" /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Description *</label>
              <input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Payment for…"
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Amount ($) *</label>
              <input type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="0.00"
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Date</label>
              <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Service Type</label>
              <select value={form.serviceType} onChange={(e) => set("serviceType", e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer focus:outline-none focus:border-charcoal">
                {INCOME_SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Payment Method</label>
              <select value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer focus:outline-none focus:border-charcoal capitalize">
                {PAYMENT_METHODS.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
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
                <option value="">— Select —</option>
                {projects?.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Client</label>
              <select value={form.clientId}
                onChange={(e) => {
                  const c = clients?.find(cl => cl.id === e.target.value);
                  set("clientId", e.target.value);
                  if (c) set("clientName", c.contactPerson);
                }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer focus:outline-none focus:border-charcoal">
                <option value="">— Select —</option>
                {clients?.map((c) => <option key={c.id} value={c.id}>{c.contactPerson}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Invoice Reference</label>
            <input value={form.invoiceId} onChange={(e) => set("invoiceId", e.target.value)} placeholder="INV-0001"
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Notes</label>
            <textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal resize-none" />
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3 justify-end sticky bottom-0 bg-white border-t border-gray-100 pt-4">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-sans text-gray-500 border border-gray-200 rounded-xl cursor-pointer hover:border-charcoal">Cancel</button>
          <button onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-sans font-semibold rounded-xl hover:bg-emerald-700 cursor-pointer">
            <Check size={14} weight="bold" /> Save Income
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExpenseIncomePanel() {
  const [activeTab,     setActiveTab]     = useState<"expenses" | "income">("expenses");
  const [showExpModal,  setShowExpModal]  = useState(false);
  const [showIncModal,  setShowIncModal]  = useState(false);
  const [catFilter,     setCatFilter]     = useState("all");
  const [search,        setSearch]        = useState("");

  const { data: expenses, isPending: loadingExp } = useQuery("Expense",  { orderBy: { date: "desc" } });
  const { data: incomes,  isPending: loadingInc } = useQuery("Income",   { orderBy: { date: "desc" } });
  const { create: createExp, remove: removeExp } = useMutation("Expense");
  const { create: createInc, remove: removeInc } = useMutation("Income");

  const safeExp = expenses ?? [];
  const safeInc = incomes  ?? [];

  const totalExp = safeExp.reduce((a, e) => a + parseFloat(e.amount || "0"), 0);
  const totalInc = safeInc.reduce((a, i) => a + parseFloat(i.amount || "0"), 0);
  const net      = totalInc - totalExp;

  const filteredExp = safeExp.filter((e) =>
    (catFilter === "all" || e.category === catFilter) &&
    (!search || e.description?.toLowerCase().includes(search.toLowerCase()) || e.vendor?.toLowerCase().includes(search.toLowerCase()))
  );
  const filteredInc = safeInc.filter((i) =>
    (!search || i.description?.toLowerCase().includes(search.toLowerCase()) || i.clientName?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-headline font-bold text-2xl text-charcoal">Expenses & Income</h1>
            <p className="font-sans text-sm text-gray-500 mt-1">Track all business expenses and income by project, category, and employee.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowExpModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 text-sm font-sans font-semibold rounded-xl hover:bg-red-100 cursor-pointer">
              <ArrowDownRight size={14} weight="bold" /> Add Expense
            </button>
            <button onClick={() => setShowIncModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-sm font-sans font-semibold rounded-xl hover:bg-emerald-100 cursor-pointer">
              <ArrowUpRight size={14} weight="bold" /> Record Income
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="font-headline font-bold text-xl text-emerald-600">${totalInc.toLocaleString("en-CA", {minimumFractionDigits:2})}</p>
            <p className="font-sans text-xs text-gray-400 mt-0.5">Total Income</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="font-headline font-bold text-xl text-red-500">${totalExp.toLocaleString("en-CA", {minimumFractionDigits:2})}</p>
            <p className="font-sans text-xs text-gray-400 mt-0.5">Total Expenses</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className={`font-headline font-bold text-xl ${net >= 0 ? "text-charcoal" : "text-red-500"}`}>${net.toLocaleString("en-CA", {minimumFractionDigits:2})}</p>
            <p className="font-sans text-xs text-gray-400 mt-0.5">Net Balance</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 mb-5">
          {(["expenses","income"] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-3 text-sm font-sans font-medium border-b-2 transition-colors cursor-pointer capitalize ${activeTab === t ? "border-charcoal text-charcoal" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              {t === "expenses" ? `Expenses (${safeExp.length})` : `Income (${safeInc.length})`}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 pb-2">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
              <MagnifyingGlass size={13} weight="regular" className="text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
                className="text-xs font-sans focus:outline-none w-32 bg-transparent text-charcoal" />
            </div>
          </div>
        </div>

        {activeTab === "expenses" && (
          <>
            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {["all", ...EXPENSE_CATEGORIES].map((c) => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`px-3 py-1.5 text-[11px] font-mono rounded-xl border capitalize transition-all cursor-pointer ${catFilter === c ? "bg-charcoal text-white border-charcoal" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"}`}>
                  {c}
                </button>
              ))}
            </div>

            {loadingExp ? <div className="flex items-center justify-center py-12"><span className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div> :
            filteredExp.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-gray-200">
                <ArrowDownRight size={28} weight="regular" className="text-gray-300 mb-2" />
                <p className="font-sans text-sm text-gray-400">No expenses yet. Click "Add Expense" to get started.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-[auto_1fr_100px_100px_100px_80px_60px] gap-0 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                  {["Cat","Description","Project","Employee","Date","Amount",""].map((h) => (
                    <span key={h} className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">{h}</span>
                  ))}
                </div>
                {filteredExp.map((e) => (
                  <div key={e.id} className="grid grid-cols-[auto_1fr_100px_100px_100px_80px_60px] gap-0 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 items-center group">
                    <span className={`mr-3 px-2 py-0.5 text-[9px] font-mono rounded-full capitalize ${CAT_COLORS[e.category] ?? "bg-gray-100 text-gray-600"}`}>{e.category}</span>
                    <div className="min-w-0">
                      <p className="font-sans text-xs font-medium text-charcoal truncate">{e.description}</p>
                      {e.vendor && <p className="font-mono text-[10px] text-gray-400">{e.vendor}</p>}
                    </div>
                    <span className="font-sans text-xs text-gray-500 truncate">{e.projectName || "—"}</span>
                    <span className="font-sans text-xs text-gray-500 truncate">{e.employeeName || "—"}</span>
                    <span className="font-mono text-xs text-gray-400">{e.date ? new Date(e.date).toLocaleDateString("en-CA") : "—"}</span>
                    <span className="font-mono text-xs font-semibold text-red-500">-${parseFloat(e.amount || "0").toFixed(2)}</span>
                    <button onClick={() => removeExp(e.id)}
                      className="w-7 h-7 rounded-lg bg-gray-100 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-600 group/del transition-all cursor-pointer">
                      <Trash size={11} weight="regular" className="text-gray-400 group-hover/del:text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "income" && (
          <>
            {loadingInc ? <div className="flex items-center justify-center py-12"><span className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div> :
            filteredInc.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-gray-200">
                <ArrowUpRight size={28} weight="regular" className="text-gray-300 mb-2" />
                <p className="font-sans text-sm text-gray-400">No income entries yet. Click "Record Income" to begin.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-[1fr_100px_120px_100px_80px_60px] gap-0 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                  {["Description","Service","Client","Date","Amount",""].map((h) => (
                    <span key={h} className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">{h}</span>
                  ))}
                </div>
                {filteredInc.map((i) => (
                  <div key={i.id} className="grid grid-cols-[1fr_100px_120px_100px_80px_60px] gap-0 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 items-center group">
                    <div className="min-w-0">
                      <p className="font-sans text-xs font-medium text-charcoal truncate">{i.description}</p>
                      {i.projectName && <p className="font-mono text-[10px] text-gray-400">{i.projectName}</p>}
                    </div>
                    <span className="font-sans text-xs text-gray-500 truncate">{i.serviceType || "—"}</span>
                    <span className="font-sans text-xs text-gray-500 truncate">{i.clientName || "—"}</span>
                    <span className="font-mono text-xs text-gray-400">{i.date ? new Date(i.date).toLocaleDateString("en-CA") : "—"}</span>
                    <span className="font-mono text-xs font-semibold text-emerald-600">+${parseFloat(i.amount || "0").toFixed(2)}</span>
                    <button onClick={() => removeInc(i.id)}
                      className="w-7 h-7 rounded-lg bg-gray-100 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-600 group/del transition-all cursor-pointer">
                      <Trash size={11} weight="regular" className="text-gray-400 group-hover/del:text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showExpModal && <AddExpenseModal onClose={() => setShowExpModal(false)} onCreate={async (d) => { await createExp(d); setShowExpModal(false); }} />}
      {showIncModal && <AddIncomeModal  onClose={() => setShowIncModal(false)} onCreate={async (d) => { await createInc(d); setShowIncModal(false); }} />}
    </>
  );
}
