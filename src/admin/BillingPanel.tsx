import { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import {
  FileText, Invoice, Receipt, Clipboard, ArrowCounterClockwise,
  Plus, Eye, PencilSimple, Trash, MagnifyingGlass, ArrowUpRight,
  EnvelopeSimple, X, Check, DotsThree, Download, CaretDown,
  ArrowLeft, Buildings, User, CalendarBlank, Money,
  Signature, Stamp, TextT, Rows, SquaresFour, List,
} from "@phosphor-icons/react";

type DocType = "estimate" | "invoice" | "receipt" | "work-order" | "credit-note";
type LineItem = { id: string; description: string; qty: string; unit: string; unitPrice: string; tax: string; total: string };

const DOC_TYPES: { id: DocType; label: string; icon: React.ElementType; color: string }[] = [
  { id: "estimate",    label: "Estimates",    icon: FileText,           color: "bg-blue-50 text-blue-600 border-blue-200"   },
  { id: "invoice",     label: "Invoices",     icon: Invoice,            color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { id: "receipt",     label: "Receipts",     icon: Receipt,            color: "bg-purple-50 text-purple-600 border-purple-200" },
  { id: "work-order",  label: "Work Orders",  icon: Clipboard,          color: "bg-amber-50 text-amber-600 border-amber-200" },
  { id: "credit-note", label: "Credit Notes", icon: ArrowCounterClockwise, color: "bg-red-50 text-red-600 border-red-200" },
];

const STATUS_STYLES: Record<string, string> = {
  draft:      "bg-gray-100 text-gray-500",
  sent:       "bg-blue-100 text-blue-600",
  delivered:  "bg-indigo-100 text-indigo-600",
  opened:     "bg-purple-100 text-purple-600",
  viewed:     "bg-violet-100 text-violet-600",
  downloaded: "bg-amber-100 text-amber-600",
  approved:   "bg-teal-100 text-teal-600",
  paid:       "bg-emerald-100 text-emerald-600",
  cancelled:  "bg-red-100 text-red-600",
};

const EMPTY_LINE: LineItem = { id: "", description: "", qty: "1", unit: "hrs", unitPrice: "0.00", tax: "15", total: "0.00" };

const COMPANY_DEFAULT = {
  name: "Aménagement Monzon",
  address: "123 Rue Principale, Montréal, QC H2X 1A1",
  phone: "+1 (514) 123-4567",
  email: "info@amenagement-monzon.com",
  website: "www.amenagement-monzon.com",
  taxNumber: "TPS/TVQ: —",
};

function calcLine(item: LineItem): LineItem {
  const qty   = parseFloat(item.qty)       || 0;
  const price = parseFloat(item.unitPrice) || 0;
  return { ...item, total: (qty * price).toFixed(2) };
}

function calcTotals(items: LineItem[], taxRate: number, discountRate: number) {
  const sub      = items.reduce((a, i) => a + parseFloat(i.total || "0"), 0);
  const disc     = sub * (discountRate / 100);
  const taxable  = sub - disc;
  const tax      = taxable * (taxRate / 100);
  const total    = taxable + tax;
  return { subtotal: sub.toFixed(2), discountAmount: disc.toFixed(2), taxAmount: tax.toFixed(2), total: total.toFixed(2) };
}

/* ── Document Visual Editor ── */
function DocumentEditor({
  doc,
  onSave,
  onCancel,
}: {
  doc: Partial<ReturnType<typeof buildNewDoc>>;
  onSave: (d: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm]             = useState<any>({ ...doc });
  const [items, setItems]           = useState<LineItem[]>(
    doc.lineItems ? JSON.parse(doc.lineItems as string) : [{ ...EMPTY_LINE, id: "1" }]
  );
  const [company, setCompany]       = useState<typeof COMPANY_DEFAULT>(
    doc.companyInfo ? JSON.parse(doc.companyInfo as string) : { ...COMPANY_DEFAULT }
  );
  const [taxRate, setTaxRate]       = useState(parseFloat(doc.taxRate as string) || 15);
  const [discountRate, setDiscountRate] = useState(parseFloat(doc.discountRate as string) || 0);
  const [previewMode, setPreviewMode]   = useState<"edit" | "preview">("edit");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [section, setSection]       = useState<"source" | "company" | "client" | "items" | "terms" | "style">("source");

  // Live data for smart linking
  const { data: allClients  } = useQuery("Client",   { orderBy: { contactPerson: "asc" } });
  const { data: allProjects } = useQuery("Project",  { orderBy: { createdAt: "desc" }   });
  const { data: allOrders   } = useQuery("Order",    { orderBy: { createdAt: "desc" }   });
  const { data: allServices } = useQuery("ServiceProduct", { orderBy: { createdAt: "desc" } });

  const totals = calcTotals(items, taxRate, discountRate);

  const setField = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const setCompanyField = (k: string, v: string) => setCompany((p) => ({ ...p, [k]: v }));

  const addLine = () => setItems((p) => [...p, { ...EMPTY_LINE, id: String(Date.now()) }]);
  const removeLine = (id: string) => setItems((p) => p.filter((i) => i.id !== id));
  const updateLine = (id: string, k: keyof LineItem, v: string) =>
    setItems((p) => p.map((i) => {
      if (i.id !== id) return i;
      const updated = { ...i, [k]: v };
      return calcLine(updated);
    }));

  const handleSave = () => {
    const t = calcTotals(items, taxRate, discountRate);
    onSave({
      ...form,
      lineItems:      JSON.stringify(items),
      companyInfo:    JSON.stringify(company),
      subtotal:       t.subtotal,
      taxRate:        String(taxRate),
      taxAmount:      t.taxAmount,
      discountRate:   String(discountRate),
      discountAmount: t.discountAmount,
      total:          t.total,
      billingSource:  form.billingSource || "project",
    });
  };

  // When a client is selected, auto-fill their address
  const handleClientSelect = (clientId: string) => {
    const c = allClients?.find((cl) => cl.id === clientId);
    if (!c) return;
    setField("clientId", clientId);
    setField("clientName", c.contactPerson);
    setField("clientEmail", c.email);
    setField("clientAddress", [c.address, c.city].filter(Boolean).join(", "));
  };

  // When a project is selected, auto-fill project name + address
  const handleProjectSelect = (projectId: string) => {
    const p = allProjects?.find((pr) => pr.id === projectId);
    if (!p) return;
    setField("projectId", projectId);
    setField("projectName", p.title);
    if (p.address) setField("clientAddress", p.address);
  };

  // When a store order is selected, populate line items from it
  const handleOrderSelect = (orderId: string) => {
    const o = allOrders?.find((or) => or.id === orderId);
    if (!o) return;
    setField("clientName", o.customerName);
    setField("clientEmail", o.customerEmail);
    if (o.shippingAddress) setField("clientAddress", o.shippingAddress);
    try {
      const orderItems = JSON.parse(o.items);
      const newLines: LineItem[] = orderItems.map((oi: any, idx: number) => ({
        id: String(idx + 1), description: oi.name || "Item", qty: String(oi.qty || 1), unit: "unit",
        unitPrice: String(oi.price?.replace(/[^0-9.]/g, "") || "0"), tax: "15",
        total: ((parseFloat(String(oi.qty || 1)) * parseFloat(String(oi.price?.replace(/[^0-9.]/g, "") || "0"))).toFixed(2)),
      }));
      if (newLines.length > 0) setItems(newLines);
    } catch {}
  };

  // When a service is selected, populate a line item from it
  const handleServiceSelect = (serviceId: string) => {
    const s = allServices?.find((sv) => sv.id === serviceId);
    if (!s) return;
    const priceNum = s.price.replace(/[^0-9.]/g, "") || "0";
    const newLine: LineItem = { id: String(Date.now()), description: s.name, qty: "1", unit: s.priceType === "monthly" ? "month" : "unit", unitPrice: priceNum, tax: "15", total: priceNum };
    setItems((p) => [...p, newLine]);
  };

  const typeLabel = DOC_TYPES.find((d) => d.id === form.type)?.label ?? "Document";

  return (
    <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col overflow-hidden">

      {/* Editor top bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-5 h-14 flex items-center gap-4">
        <button onClick={onCancel} className="flex items-center gap-1.5 text-sm font-sans text-gray-500 hover:text-charcoal transition-colors cursor-pointer">
          <ArrowLeft size={15} weight="bold" /> Back
        </button>
        <div className="h-5 w-px bg-gray-200" />
        <span className="font-headline font-bold text-sm text-charcoal">{typeLabel} Editor</span>
        {form.documentNumber && <span className="font-mono text-xs text-gray-400">#{form.documentNumber}</span>}
        <div className="flex-1" />

        {/* Preview toggles */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(["edit","preview"] as const).map((m) => (
            <button key={m} onClick={() => setPreviewMode(m)}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${previewMode === m ? "bg-white shadow-sm text-charcoal" : "text-gray-400 hover:text-gray-600"}`}>
              {m === "edit" ? "Edit" : "Preview"}
            </button>
          ))}
        </div>
        {previewMode === "preview" && (
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(["desktop","mobile"] as const).map((d) => (
              <button key={d} onClick={() => setPreviewDevice(d)}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${previewDevice === d ? "bg-white shadow-sm text-charcoal" : "text-gray-400 hover:text-gray-600"}`}>
                {d === "desktop" ? "🖥 Desktop" : "📱 Mobile"}
              </button>
            ))}
          </div>
        )}

        <button onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-charcoal text-white text-xs font-mono rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
          <Check size={13} weight="bold" /> Save
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Left panel — editor controls */}
        {previewMode === "edit" && (
          <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            {/* Section tabs */}
            <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
              {([
                ["source",  "Source",  Money],
                ["items",   "Items",   Rows],
                ["company", "Company", Buildings],
                ["client",  "Client",  User],
                ["terms",   "Terms",   Stamp],
                ["style",   "Style",   TextT],
              ] as const).map(([id, label, Icon]) => (
                <button key={id} onClick={() => setSection(id as any)}
                  className={`flex items-center gap-1.5 px-2 py-3 text-[10px] font-mono border-b-2 whitespace-nowrap transition-colors cursor-pointer flex-1 justify-center ${section === id ? "border-charcoal text-charcoal" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                  <Icon size={11} weight={section === id ? "fill" : "regular"} /> {label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

              {section === "source" && (
                <div className="flex flex-col gap-4">
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Billing Source Type</p>
                  {[
                    { id: "project",      label: "Project Work",     desc: "Construction, renovation, landscaping, or other field work tied to a project" },
                    { id: "service",      label: "One-Time Service",  desc: "Individual service visit or consultation not tied to a long-term project" },
                    { id: "store",        label: "Store Purchase",    desc: "Products sold through the SM Store or SM Collection" },
                    { id: "subscription", label: "Subscription Plan", desc: "Recurring maintenance, service plan, or subscription package" },
                  ].map((src) => (
                    <button key={src.id} onClick={() => setField("billingSource", src.id)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${form.billingSource === src.id ? "border-charcoal bg-charcoal/5" : "border-gray-200 hover:border-gray-400"}`}>
                      <p className="font-mono text-xs font-semibold text-charcoal capitalize">{src.label}</p>
                      <p className="font-sans text-[10px] text-gray-400 mt-0.5">{src.desc}</p>
                    </button>
                  ))}

                  <div className="border-t border-gray-100 pt-3 flex flex-col gap-3">
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Link to Client</p>
                    <select value={form.clientId ?? ""} onChange={(e) => handleClientSelect(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-sans border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal bg-white cursor-pointer">
                      <option value="">— Select client (auto-fills address) —</option>
                      {(allClients ?? []).map((c) => <option key={c.id} value={c.id}>{c.contactPerson}{c.companyName ? ` (${c.companyName})` : ""}</option>)}
                    </select>

                    {(form.billingSource === "project" || !form.billingSource) && (
                      <>
                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Link to Project</p>
                        <select value={form.projectId ?? ""} onChange={(e) => handleProjectSelect(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-sans border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal bg-white cursor-pointer">
                          <option value="">— Select project (auto-fills address) —</option>
                          {(allProjects ?? []).map((p) => (
                            <option key={p.id} value={p.id}>{p.title}{p.address ? ` — ${p.address}` : ""}</option>
                          ))}
                        </select>
                      </>
                    )}

                    {form.billingSource === "store" && (
                      <>
                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Import from Store Order</p>
                        <select onChange={(e) => handleOrderSelect(e.target.value)} defaultValue=""
                          className="w-full px-3 py-2 text-xs font-sans border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal bg-white cursor-pointer">
                          <option value="">— Select order (auto-fills items) —</option>
                          {(allOrders ?? []).map((o) => <option key={o.id} value={o.id}>#{o.orderNumber} — {o.customerName} — ${o.total?.toFixed(2)}</option>)}
                        </select>
                      </>
                    )}

                    {form.billingSource === "subscription" && (
                      <>
                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Add Service / Subscription Plan Line</p>
                        <select onChange={(e) => handleServiceSelect(e.target.value)} defaultValue=""
                          className="w-full px-3 py-2 text-xs font-sans border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal bg-white cursor-pointer">
                          <option value="">— Select service plan (adds line item) —</option>
                          {(allServices ?? []).map((s) => <option key={s.id} value={s.id}>{s.name} — {s.price} / {s.priceType}</option>)}
                        </select>
                      </>
                    )}
                  </div>

                  {/* Show linked project address preview */}
                  {form.clientAddress && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                      <p className="text-[9px] font-mono text-blue-500 uppercase tracking-widest mb-0.5">Address auto-filled</p>
                      <p className="text-xs font-sans text-blue-700">{form.clientAddress}</p>
                    </div>
                  )}
                </div>
              )}

              {section === "company" && (
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Company Info</p>
                  {(["name","address","phone","email","website","taxNumber"] as const).map((f) => (
                    <div key={f} className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-gray-400 capitalize">{f}</label>
                      <input value={company[f]} onChange={(e) => setCompanyField(f, e.target.value)}
                        className="w-full px-3 py-2 text-xs font-sans border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal" />
                    </div>
                  ))}
                </div>
              )}

              {section === "client" && (
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Client Info</p>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400">Quick-fill from Client</label>
                    <select value={form.clientId ?? ""} onChange={(e) => handleClientSelect(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-sans border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal bg-white cursor-pointer">
                      <option value="">— Select client —</option>
                      {(allClients ?? []).map((c) => <option key={c.id} value={c.id}>{c.contactPerson}{c.companyName ? ` (${c.companyName})` : ""}</option>)}
                    </select>
                  </div>
                  {[
                    ["clientName",    "Client Name"],
                    ["clientEmail",   "Client Email"],
                    ["clientAddress", "Client Address / Site Address"],
                    ["projectName",   "Project Name"],
                  ].map(([k, label]) => (
                    <div key={k} className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-gray-400">{label}</label>
                      <input value={form[k] ?? ""} onChange={(e) => setField(k, e.target.value)}
                        className="w-full px-3 py-2 text-xs font-sans border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal" />
                    </div>
                  ))}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400">Issue Date</label>
                    <input type="date" value={form.issueDate ? new Date(form.issueDate).toISOString().slice(0,10) : ""}
                      onChange={(e) => setField("issueDate", new Date(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-sans border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400">Due Date</label>
                    <input type="date" value={form.dueDate ? new Date(form.dueDate).toISOString().slice(0,10) : ""}
                      onChange={(e) => setField("dueDate", new Date(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-sans border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal" />
                  </div>
                </div>
              )}

              {section === "items" && (
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Line Items</p>
                  {items.map((item, idx) => (
                    <div key={item.id} className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-gray-400">Item {idx + 1}</span>
                        <button onClick={() => removeLine(item.id)} className="w-5 h-5 rounded hover:bg-red-50 flex items-center justify-center cursor-pointer">
                          <X size={10} weight="bold" className="text-red-400" />
                        </button>
                      </div>
                      <input placeholder="Description" value={item.description}
                        onChange={(e) => updateLine(item.id, "description", e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal" />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[9px] font-mono text-gray-400">Qty</label>
                          <input type="number" value={item.qty} onChange={(e) => updateLine(item.id, "qty", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal" />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-gray-400">Unit</label>
                          <input value={item.unit} onChange={(e) => updateLine(item.id, "unit", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal" />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-gray-400">Price</label>
                          <input type="number" value={item.unitPrice} onChange={(e) => updateLine(item.id, "unitPrice", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-gray-400">Total</span>
                        <span className="text-charcoal font-semibold">${item.total}</span>
                      </div>
                    </div>
                  ))}
                  <button onClick={addLine}
                    className="flex items-center gap-1.5 w-full py-2 border border-dashed border-gray-300 rounded-xl text-xs font-mono text-gray-400 hover:border-charcoal hover:text-charcoal justify-center transition-colors cursor-pointer">
                    <Plus size={10} weight="bold" /> Add Line
                  </button>
                  <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono text-gray-400">Tax Rate (%)</label>
                      <input type="number" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-lg text-right focus:outline-none focus:border-charcoal" />
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono text-gray-400">Discount (%)</label>
                      <input type="number" value={discountRate} onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-lg text-right focus:outline-none focus:border-charcoal" />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5 mt-1">
                      {[["Subtotal", `$${totals.subtotal}`], ["Discount", `-$${totals.discountAmount}`], ["Tax", `+$${totals.taxAmount}`]].map(([l, v]) => (
                        <div key={l} className="flex justify-between text-[10px] font-mono text-gray-500"><span>{l}</span><span>{v}</span></div>
                      ))}
                      <div className="border-t border-gray-200 mt-1 pt-1.5 flex justify-between font-mono font-semibold text-xs text-charcoal">
                        <span>Total</span><span>${totals.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {section === "terms" && (
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Payment & Terms</p>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400">Payment Terms</label>
                    <select value={form.paymentTerms ?? "Net 30"} onChange={(e) => setField("paymentTerms", e.target.value)}
                      className="w-full px-3 py-2 text-xs font-sans border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal bg-white cursor-pointer">
                      {["Due on receipt","Net 7","Net 15","Net 30","Net 45","Net 60","50% deposit","Custom"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400">Notes</label>
                    <textarea value={form.notes ?? ""} onChange={(e) => setField("notes", e.target.value)} rows={4}
                      placeholder="Thank you for your business..."
                      className="w-full px-3 py-2 text-xs font-sans border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal resize-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400">Document #</label>
                    <input value={form.documentNumber ?? ""} onChange={(e) => setField("documentNumber", e.target.value)}
                      className="w-full px-3 py-2 text-xs font-sans border border-gray-200 rounded-lg focus:outline-none focus:border-charcoal" />
                  </div>
                </div>
              )}

              {section === "style" && (
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Template Style</p>
                  {[
                    { id: "classic",  label: "Classic",  desc: "Clean, professional black & white" },
                    { id: "modern",   label: "Modern",   desc: "Bold header, accent color strip" },
                    { id: "minimal",  label: "Minimal",  desc: "Sparse layout, large whitespace" },
                    { id: "branded",  label: "Branded",  desc: "Full Monzon branding treatment" },
                  ].map((tpl) => (
                    <button key={tpl.id} onClick={() => setField("template", tpl.id)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${form.template === tpl.id ? "border-charcoal bg-charcoal/5" : "border-gray-200 hover:border-gray-400"}`}>
                      <p className="font-mono text-xs font-semibold text-charcoal">{tpl.label}</p>
                      <p className="font-sans text-[10px] text-gray-400 mt-0.5">{tpl.desc}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right panel — live document preview */}
        <div className={`flex-1 overflow-auto bg-gray-200 flex items-start justify-center p-8 ${previewMode === "preview" && previewDevice === "mobile" ? "items-start" : ""}`}>
          <div className={`bg-white shadow-2xl ${previewMode === "preview" && previewDevice === "mobile" ? "w-[375px]" : "w-full max-w-3xl"}`}
            style={{ minHeight: "1100px", fontFamily: "sans-serif" }}>
            <DocumentPreview
              company={company}
              form={form}
              items={items}
              totals={totals}
              taxRate={taxRate}
              discountRate={discountRate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Live document preview renderer ── */
function DocumentPreview({ company, form, items, totals, taxRate, discountRate }: {
  company: typeof COMPANY_DEFAULT;
  form: any;
  items: LineItem[];
  totals: ReturnType<typeof calcTotals>;
  taxRate: number;
  discountRate: number;
}) {
  const typeLabel = DOC_TYPES.find((d) => d.id === form.type)?.label.toUpperCase() ?? "DOCUMENT";
  const tmpl = form.template ?? "classic";
  const accentClass = tmpl === "branded" ? "bg-charcoal text-white" : tmpl === "modern" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800";

  return (
    <div className="p-10 text-sm" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: "#1a1a2e" }}>
      {/* Header */}
      <div className={`flex justify-between items-start mb-10 pb-8 border-b-2 ${tmpl === "minimal" ? "border-gray-200" : "border-gray-800"}`}>
        <div>
          <div className="text-xl font-bold tracking-tight" style={{ letterSpacing: "-0.02em" }}>{company.name}</div>
          <div className="text-xs text-gray-500 mt-1 leading-relaxed">
            {company.address}<br />
            {company.phone} · {company.email}<br />
            {company.website}<br />
            {company.taxNumber}
          </div>
        </div>
        <div className="text-right">
          <div className={`inline-block px-4 py-2 text-xs font-bold tracking-widest uppercase rounded ${accentClass}`}>
            {typeLabel}
          </div>
          <div className="text-2xl font-bold mt-2 tracking-tight" style={{ letterSpacing: "-0.03em" }}>
            #{form.documentNumber || "0001"}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Issued: {form.issueDate ? new Date(form.issueDate).toLocaleDateString("en-CA") : "—"}<br />
            Due: {form.dueDate ? new Date(form.dueDate).toLocaleDateString("en-CA") : "—"}
          </div>
        </div>
      </div>

      {/* Client info */}
      <div className="flex gap-12 mb-10">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Billed To</div>
          <div className="font-semibold">{form.clientName || "Client Name"}</div>
          <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{form.clientAddress || "Client Address"}</div>
          <div className="text-xs text-gray-500">{form.clientEmail || "client@email.com"}</div>
        </div>
        {form.projectName && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Project</div>
            <div className="font-semibold">{form.projectName}</div>
          </div>
        )}
      </div>

      {/* Line items table */}
      <table className="w-full mb-6" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: tmpl === "minimal" ? "#f8f8f8" : "#1a1a2e", color: tmpl === "minimal" ? "#666" : "#fff" }}>
            <th className="text-left text-[10px] font-bold uppercase tracking-widest px-3 py-2.5">Description</th>
            <th className="text-center text-[10px] font-bold uppercase tracking-widest px-3 py-2.5" style={{ width: 60 }}>Qty</th>
            <th className="text-center text-[10px] font-bold uppercase tracking-widest px-3 py-2.5" style={{ width: 50 }}>Unit</th>
            <th className="text-right text-[10px] font-bold uppercase tracking-widest px-3 py-2.5" style={{ width: 90 }}>Price</th>
            <th className="text-right text-[10px] font-bold uppercase tracking-widest px-3 py-2.5" style={{ width: 90 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id} style={{ background: idx % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #eee" }}>
              <td className="px-3 py-2.5 text-xs">{item.description || "—"}</td>
              <td className="px-3 py-2.5 text-xs text-center">{item.qty}</td>
              <td className="px-3 py-2.5 text-xs text-center text-gray-400">{item.unit}</td>
              <td className="px-3 py-2.5 text-xs text-right">${parseFloat(item.unitPrice).toFixed(2)}</td>
              <td className="px-3 py-2.5 text-xs text-right font-semibold">${item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-64">
          <div className="flex justify-between py-1.5 text-xs border-b border-gray-100">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-semibold">${totals.subtotal}</span>
          </div>
          {discountRate > 0 && (
            <div className="flex justify-between py-1.5 text-xs border-b border-gray-100">
              <span className="text-gray-500">Discount ({discountRate}%)</span>
              <span className="text-red-500">-${totals.discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between py-1.5 text-xs border-b border-gray-100">
            <span className="text-gray-500">Tax ({taxRate}%)</span>
            <span>${totals.taxAmount}</span>
          </div>
          <div className="flex justify-between py-2.5 text-sm font-bold border-t-2 border-gray-800 mt-1">
            <span>Total Due</span>
            <span>${totals.total}</span>
          </div>
        </div>
      </div>

      {/* Notes + Payment Terms */}
      {(form.notes || form.paymentTerms) && (
        <div className="border-t border-gray-200 pt-6 flex gap-8">
          {form.paymentTerms && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Payment Terms</div>
              <div className="text-xs text-gray-600">{form.paymentTerms}</div>
            </div>
          )}
          {form.notes && (
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Notes</div>
              <div className="text-xs text-gray-600 leading-relaxed">{form.notes}</div>
            </div>
          )}
        </div>
      )}

      {/* Signature block */}
      <div className="mt-12 flex gap-12">
        {["Authorized Signature", "Client Signature"].map((lbl) => (
          <div key={lbl} style={{ flex: 1 }}>
            <div style={{ height: 48, borderBottom: "1px solid #ccc" }} />
            <div className="text-[10px] text-gray-400 mt-1">{lbl}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-10 pt-4 border-t border-gray-100 text-[10px] text-gray-400 text-center">
        {company.name} · {company.address} · {company.phone} · {company.website}
      </div>
    </div>
  );
}

function buildNewDoc(type: DocType, count: number, source: "project" | "service" | "store" | "subscription" = "project") {
  const now = new Date();
  const due = new Date(now); due.setDate(due.getDate() + 30);
  const prefix = { estimate: "EST", invoice: "INV", receipt: "REC", "work-order": "WO", "credit-note": "CN" }[type];
  return {
    type,
    status: "draft",
    billingSource: source,
    documentNumber: `${prefix}-${String(count + 1).padStart(4, "0")}`,
    clientId: "", clientName: "", clientEmail: "", clientAddress: "",
    projectId: "", projectName: "",
    issueDate: now, dueDate: due,
    lineItems: JSON.stringify([{ ...EMPTY_LINE, id: "1" }]),
    subtotal: "0.00", taxRate: "15", taxAmount: "0.00",
    discountRate: "0", discountAmount: "0.00", total: "0.00",
    notes: "Thank you for your business. Payment is due as per agreed terms.",
    paymentTerms: "Net 30",
    companyInfo: JSON.stringify(COMPANY_DEFAULT),
    template: "classic",
    sentAt: undefined, paidAt: undefined,
    emailLog: "[]", versionHistory: "[]",
  };
}

/* ── Email sender modal ── */
function SendEmailModal({ doc, onClose, onSend }: { doc: any; onClose: () => void; onSend: (msg: string) => void }) {
  const [message, setMessage] = useState(`Dear ${doc.clientName || "Client"},\n\nPlease find attached your ${doc.type} #${doc.documentNumber}.\n\nDo not hesitate to contact us for any questions.\n\nBest regards,\nAménagement Monzon`);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-headline font-bold text-base text-charcoal">Send via Email</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 cursor-pointer"><X size={14} weight="bold" /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">To</label>
            <input value={doc.clientEmail || ""} readOnly className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Subject</label>
            <input defaultValue={`${(doc.type ?? "").replace("-"," ").replace(/\b\w/g, (c: string) => c.toUpperCase())} #${doc.documentNumber} — Aménagement Monzon`}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Message</label>
            <textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal resize-none" />
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
            <FileText size={14} weight="regular" className="text-gray-400 flex-shrink-0" />
            <span>PDF automatically attached: <strong className="text-charcoal">{doc.documentNumber}.pdf</strong></span>
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-sans text-gray-500 border border-gray-200 rounded-xl hover:border-charcoal cursor-pointer">Cancel</button>
          <button onClick={() => onSend(message)}
            className="flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white text-sm font-sans font-semibold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer">
            <EnvelopeSimple size={15} weight="bold" /> Send Email
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Document detail / history view ── */
function DocumentDetail({ doc, onClose, onEdit }: { doc: any; onClose: () => void; onEdit: () => void }) {
  const [showSendModal, setShowSendModal] = useState(false);
  const { update } = useMutation("BillingDocument");

  const emailLog: any[] = (() => { try { return JSON.parse(doc.emailLog || "[]"); } catch { return []; } })();
  const versionHistory: any[] = (() => { try { return JSON.parse(doc.versionHistory || "[]"); } catch { return []; } })();

  const statusTimeline = [
    { label: "Created",    done: true,                                           date: new Date(doc.createdAt).toLocaleDateString() },
    { label: "Sent",       done: doc.status !== "draft",                         date: doc.sentAt ? new Date(doc.sentAt).toLocaleDateString() : "—" },
    { label: "Opened",     done: ["opened","viewed","downloaded","paid"].includes(doc.status), date: "—" },
    { label: "Approved",   done: ["approved","paid"].includes(doc.status),       date: "—" },
    { label: "Paid",       done: doc.status === "paid",                          date: doc.paidAt ? new Date(doc.paidAt).toLocaleDateString() : "—" },
  ];

  const handleSendEmail = async (msg: string) => {
    const log = [...emailLog, { event: "sent", timestamp: new Date().toISOString(), message: msg }];
    await update(doc.id, { status: "sent", sentAt: new Date(), emailLog: JSON.stringify(log) });
    setShowSendModal(false);
  };

  const markPaid = () => update(doc.id, { status: "paid", paidAt: new Date() });

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="text-gray-400 hover:text-charcoal cursor-pointer"><ArrowLeft size={16} weight="bold" /></button>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-base text-charcoal">{DOC_TYPES.find(d => d.id === doc.type)?.label} #{doc.documentNumber}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full ${STATUS_STYLES[doc.status] || "bg-gray-100 text-gray-500"}`}>{doc.status}</span>
                </div>
                <p className="font-sans text-xs text-gray-400">{doc.clientName} · ${doc.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg hover:border-charcoal cursor-pointer">
                <PencilSimple size={12} weight="bold" /> Edit
              </button>
              <button onClick={() => setShowSendModal(true)} disabled={!doc.clientEmail}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer disabled:opacity-40">
                <EnvelopeSimple size={12} weight="bold" /> Send
              </button>
              {doc.status !== "paid" && (
                <button onClick={markPaid} className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 cursor-pointer">
                  <Check size={12} weight="bold" /> Mark Paid
                </button>
              )}
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 cursor-pointer"><X size={14} weight="bold" /></button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Document preview */}
            <div className="flex-1 overflow-auto p-6 bg-gray-100">
              <div className="bg-white shadow-lg max-w-2xl mx-auto">
                <DocumentPreview
                  company={doc.companyInfo ? JSON.parse(doc.companyInfo) : COMPANY_DEFAULT}
                  form={doc}
                  items={doc.lineItems ? JSON.parse(doc.lineItems) : []}
                  totals={calcTotals(doc.lineItems ? JSON.parse(doc.lineItems) : [], parseFloat(doc.taxRate || "15"), parseFloat(doc.discountRate || "0"))}
                  taxRate={parseFloat(doc.taxRate || "15")}
                  discountRate={parseFloat(doc.discountRate || "0")}
                />
              </div>
            </div>

            {/* Right sidebar — timeline + history */}
            <div className="w-64 flex-shrink-0 border-l border-gray-100 overflow-y-auto">
              <div className="p-4">
                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3">Status Timeline</p>
                <div className="flex flex-col gap-0">
                  {statusTimeline.map((s, i) => (
                    <div key={s.label} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${s.done ? "bg-emerald-500 border-emerald-500" : "bg-white border-gray-300"}`}>
                          {s.done && <Check size={8} weight="bold" className="text-white m-auto mt-[3px]" />}
                        </div>
                        {i < statusTimeline.length - 1 && <div className={`w-0.5 h-5 ${s.done ? "bg-emerald-200" : "bg-gray-100"}`} />}
                      </div>
                      <div className="pb-4">
                        <p className={`text-xs font-sans font-medium ${s.done ? "text-charcoal" : "text-gray-400"}`}>{s.label}</p>
                        <p className="text-[10px] font-mono text-gray-400">{s.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {emailLog.length > 0 && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3">Email Log</p>
                  {emailLog.map((e: any, i: number) => (
                    <div key={i} className="flex flex-col gap-0.5 mb-3">
                      <span className="text-[10px] font-mono text-blue-600 capitalize">{e.event}</span>
                      <span className="text-[10px] text-gray-400">{new Date(e.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {versionHistory.length > 0 && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3">Version History</p>
                  {versionHistory.map((v: any, i: number) => (
                    <div key={i} className="flex flex-col gap-0.5 mb-3">
                      <span className="text-xs font-sans font-medium text-charcoal">v{i + 1}</span>
                      <span className="text-[10px] text-gray-400">{new Date(v.savedAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showSendModal && <SendEmailModal doc={doc} onClose={() => setShowSendModal(false)} onSend={handleSendEmail} />}
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN BILLING PANEL
   ══════════════════════════════════════════════════════════ */
export default function BillingPanel() {
  const [activeType, setActiveType] = useState<DocType | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "project" | "service" | "store" | "subscription">("all");
  const [editorDoc,  setEditorDoc]  = useState<any | null>(null);
  const [detailDoc,  setDetailDoc]  = useState<any | null>(null);
  const [isNewDoc,   setIsNewDoc]   = useState(false);
  const [search,     setSearch]     = useState("");

  const { data: docs, isPending } = useQuery("BillingDocument", { orderBy: { createdAt: "desc" } });
  const { create, update, remove, isPending: isMutating } = useMutation("BillingDocument");

  const allDocs = docs ?? [];
  const filtered = allDocs.filter((d) =>
    (activeType === "all" || d.type === activeType) &&
    (sourceFilter === "all" || (d as any).billingSource === sourceFilter) &&
    (!search || d.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      d.documentNumber?.toLowerCase().includes(search.toLowerCase()))
  );

  const totals = {
    invoiced: allDocs.filter(d => d.type === "invoice").reduce((a, d) => a + parseFloat(d.total || "0"), 0),
    paid:     allDocs.filter(d => d.type === "invoice" && d.status === "paid").reduce((a, d) => a + parseFloat(d.total || "0"), 0),
    pending:  allDocs.filter(d => d.type === "invoice" && d.status !== "paid" && d.status !== "draft" && d.status !== "cancelled").reduce((a, d) => a + parseFloat(d.total || "0"), 0),
    drafts:   allDocs.filter(d => d.status === "draft").length,
  };

  const handleCreate = (type: DocType) => {
    setEditorDoc(buildNewDoc(type, allDocs.filter((d) => d.type === type).length));
    setIsNewDoc(true);
  };

  const handleSave = async (data: any) => {
    const history = editorDoc?.versionHistory ? JSON.parse(editorDoc.versionHistory) : [];
    history.push({ savedAt: new Date().toISOString() });
    const payload = { ...data, versionHistory: JSON.stringify(history) };
    if (isNewDoc) {
      await create(payload);
    } else {
      await update(editorDoc.id, payload);
    }
    setEditorDoc(null);
    setIsNewDoc(false);
  };

  if (editorDoc) {
    return <DocumentEditor doc={editorDoc} onSave={handleSave} onCancel={() => { setEditorDoc(null); setIsNewDoc(false); }} />;
  }

  return (
    <>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-headline font-bold text-2xl text-charcoal">Billing</h1>
            <p className="font-sans text-sm text-gray-500 mt-1">Estimates, invoices, receipts, work orders, and credit notes.</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Source filter */}
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as any)}
              className="px-3 py-2.5 text-xs font-mono border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-charcoal cursor-pointer text-gray-600">
              <option value="all">All Sources</option>
              <option value="project">Project Work</option>
              <option value="service">One-Time Service</option>
              <option value="store">Store Purchase</option>
              <option value="subscription">Subscription</option>
            </select>
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-charcoal text-white text-sm font-sans font-semibold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer">
                <Plus size={14} weight="bold" /> New Document <CaretDown size={11} weight="bold" />
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-20 hidden group-hover:block w-48">
                {DOC_TYPES.map((t) => (
                  <button key={t.id} onClick={() => handleCreate(t.id)}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-sans text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
                    <t.icon size={14} weight="regular" /> {t.label.slice(0, -1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Invoiced", value: `$${totals.invoiced.toLocaleString("en-CA", {minimumFractionDigits: 2})}`, color: "text-charcoal" },
            { label: "Collected",      value: `$${totals.paid.toLocaleString("en-CA", {minimumFractionDigits: 2})}`,     color: "text-emerald-600" },
            { label: "Outstanding",    value: `$${totals.pending.toLocaleString("en-CA", {minimumFractionDigits: 2})}`,  color: "text-amber-600" },
            { label: "Drafts",         value: String(totals.drafts),                                                     color: "text-gray-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className={`font-headline font-bold text-xl ${s.color}`}>{s.value}</p>
              <p className="font-sans text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Type filter + search */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveType("all")}
              className={`px-3 py-1.5 text-xs font-mono rounded-xl border transition-all cursor-pointer ${activeType === "all" ? "bg-charcoal text-white border-charcoal" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"}`}>
              All
            </button>
            {DOC_TYPES.map((t) => (
              <button key={t.id} onClick={() => setActiveType(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-xl border transition-all cursor-pointer ${activeType === t.id ? "bg-charcoal text-white border-charcoal" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"}`}>
                <t.icon size={11} weight="regular" /> {t.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <MagnifyingGlass size={13} weight="regular" className="text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
              className="text-xs font-sans text-charcoal focus:outline-none w-32 bg-transparent" />
          </div>
        </div>

        {/* Document list */}
        {isPending ? (
          <div className="flex items-center justify-center py-16"><span className="w-7 h-7 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-gray-200">
            <FileText size={32} weight="regular" className="text-gray-300 mb-3" />
            <p className="font-sans text-sm text-gray-400">No documents yet. Create your first one above.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-[1fr_120px_120px_100px_80px_80px] gap-0 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              {["Document","Client","Project","Date","Total","Status"].map((h) => (
                <span key={h} className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">{h}</span>
              ))}
            </div>
            {filtered.map((doc) => {
              const typeInfo = DOC_TYPES.find((t) => t.id === doc.type);
              return (
                <div key={doc.id} className="grid grid-cols-[1fr_120px_120px_100px_80px_80px] gap-0 px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors items-center group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${typeInfo?.color ?? ""}`}>
                      {typeInfo && <typeInfo.icon size={12} weight="regular" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-semibold text-charcoal truncate">#{doc.documentNumber}</p>
                      <p className="font-sans text-[10px] text-gray-400 capitalize">{doc.type?.replace("-", " ")}</p>
                    </div>
                  </div>
                  <span className="font-sans text-xs text-gray-600 truncate">{doc.clientName || "—"}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-sans text-xs text-gray-400 truncate">{doc.projectName || "—"}</span>
                    {(doc as any).billingSource && (doc as any).billingSource !== "project" && <span className="font-mono text-[9px] text-blue-500 capitalize">{(doc as any).billingSource}</span>}
                  </div>
                  <span className="font-mono text-xs text-gray-500">{doc.issueDate ? new Date(doc.issueDate).toLocaleDateString("en-CA") : "—"}</span>
                  <span className="font-mono text-xs font-semibold text-charcoal">${parseFloat(doc.total || "0").toFixed(2)}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full capitalize ${STATUS_STYLES[doc.status] || "bg-gray-100 text-gray-500"}`}>{doc.status}</span>
                    <button onClick={() => setDetailDoc(doc)} className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-charcoal hover:text-white transition-all cursor-pointer">
                      <Eye size={10} weight="bold" className="text-gray-500 group-hover:text-white" />
                    </button>
                    <button onClick={() => { setEditorDoc(doc); setIsNewDoc(false); }}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-charcoal hover:text-white transition-all cursor-pointer">
                      <PencilSimple size={10} weight="bold" className="text-gray-500 group-hover:text-white" />
                    </button>
                    <button onClick={() => remove(doc.id)} disabled={isMutating}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all cursor-pointer">
                      <Trash size={10} weight="bold" className="text-gray-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {detailDoc && (
        <DocumentDetail
          doc={detailDoc}
          onClose={() => setDetailDoc(null)}
          onEdit={() => { setEditorDoc(detailDoc); setIsNewDoc(false); setDetailDoc(null); }}
        />
      )}
    </>
  );
}
