import { useState } from "react";
import { Helmet } from "react-helmet-async";
import HeaderNav from "@/components/HeaderNav";
import Footer from "@/components/Footer";
import {
  LockKey, FolderOpen, ArrowUpRight, FileText, Invoice,
  Receipt, Clipboard, Check, Download, Eye, Clock,
  ArrowCounterClockwise, X, User, Chat, Briefcase,
  Bell, SignOut, PencilSimple, FloppyDisk, CalendarBlank,
} from "@phosphor-icons/react";
import { useAuth, useQuery, useMutation } from "@animaapp/playground-react-sdk";

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

const DOC_TYPE_ICONS: Record<string, React.ElementType> = {
  estimate: FileText, invoice: Invoice, receipt: Receipt,
  "work-order": Clipboard, "credit-note": ArrowCounterClockwise,
};

function DocumentPreview({ doc, onClose, onApprove }: { doc: any; onClose: () => void; onApprove?: (id: string) => void }) {
  const lineItems = (() => { try { return JSON.parse(doc.lineItems || "[]"); } catch { return []; } })();
  const companyInfo = (() => { try { return JSON.parse(doc.companyInfo || "{}"); } catch { return {}; } })();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="font-headline font-bold text-base text-charcoal capitalize">
              {doc.type?.replace("-"," ")} #{doc.documentNumber}
            </h3>
            <p className="font-sans text-xs text-gray-400">{doc.clientName} · ${doc.total}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full ${STATUS_STYLES[doc.status] || "bg-gray-100 text-gray-500"}`}>{doc.status}</span>
            {doc.type === "estimate" && doc.status === "sent" && onApprove && (
              <button onClick={() => { onApprove(doc.id); onClose(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-600 border border-teal-200 text-xs font-mono rounded-lg hover:bg-teal-100 cursor-pointer">
                <Check size={11} weight="bold" /> Approve Estimate
              </button>
            )}
            <button onClick={() => window.print()} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 cursor-pointer" title="Download / Print">
              <Download size={13} weight="bold" />
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 cursor-pointer"><X size={14} weight="bold" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="bg-white shadow-lg max-w-2xl mx-auto p-10" style={{ fontFamily:"sans-serif", color:"#1a1a2e" }}>
            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-800">
              <div>
                <div className="text-xl font-bold">{companyInfo.name || "Aménagement Monzon"}</div>
                <div className="text-xs text-gray-500 mt-1 leading-relaxed">{companyInfo.address}<br />{companyInfo.phone} · {companyInfo.email}</div>
              </div>
              <div className="text-right">
                <div className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest uppercase bg-gray-800 text-white rounded">{doc.type?.toUpperCase()?.replace("-"," ")}</div>
                <div className="text-2xl font-bold mt-2">#{doc.documentNumber}</div>
                <div className="text-xs text-gray-400 mt-1">Issued: {doc.issueDate ? new Date(doc.issueDate).toLocaleDateString("en-CA") : "—"}<br />Due: {doc.dueDate ? new Date(doc.dueDate).toLocaleDateString("en-CA") : "—"}</div>
              </div>
            </div>
            <div className="mb-8">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Billed To</div>
              <div className="font-semibold">{doc.clientName}</div>
              <div className="text-xs text-gray-500">{doc.clientAddress}</div>
              <div className="text-xs text-gray-500">{doc.clientEmail}</div>
            </div>
            <table className="w-full mb-6 text-sm" style={{ borderCollapse:"collapse" }}>
              <thead><tr style={{ background:"#1a1a2e", color:"#fff" }}>{["Description","Qty","Price","Total"].map(h => <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest px-3 py-2.5">{h}</th>)}</tr></thead>
              <tbody>{lineItems.map((item: any, idx: number) => (<tr key={idx} style={{ borderBottom:"1px solid #eee", background:idx%2===0?"#fff":"#fafafa" }}><td className="px-3 py-2.5 text-xs">{item.description||"—"}</td><td className="px-3 py-2.5 text-xs text-center">{item.qty}</td><td className="px-3 py-2.5 text-xs">${parseFloat(item.unitPrice||"0").toFixed(2)}</td><td className="px-3 py-2.5 text-xs font-semibold">${item.total}</td></tr>))}</tbody>
            </table>
            <div className="flex justify-end mb-8">
              <div className="w-56">
                {[["Subtotal",`$${doc.subtotal}`],["Tax",`$${doc.taxAmount}`]].map(([l,v])=>(<div key={l as string} className="flex justify-between py-1.5 text-xs border-b border-gray-100"><span className="text-gray-500">{l as string}</span><span>{v as string}</span></div>))}
                <div className="flex justify-between py-2.5 font-bold border-t-2 border-gray-800 mt-1"><span>Total</span><span>${doc.total}</span></div>
              </div>
            </div>
            {doc.notes && <div className="text-xs text-gray-500 border-t border-gray-200 pt-4">{doc.notes}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

type Section = "overview" | "projects" | "documents" | "payments" | "history" | "profile" | "messages" | "schedule";

export default function ClientPortalPage() {
  const { user, isPending: authPending, isAnonymous, login, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [docTypeFilter, setDocTypeFilter] = useState<string>("all");
  const [previewDoc,    setPreviewDoc]    = useState<any | null>(null);

  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name ?? "", email: user?.email ?? "" });
  const [messageDraft, setMessageDraft] = useState("");
  const [messages, setMessages]         = useState<{ id: string; text: string; ts: string; from: "client"|"support" }[]>([
    { id: "1", text: "Welcome to the client portal! Our team is available Mon–Fri 8am–5pm. Send us a message below.", ts: "Support", from: "support" },
  ]);
  const { data: calEvents } = useQuery("CalendarEvent", { orderBy: { startDate: "asc" } });

  const { data: docs, isPending: docsLoading } = useQuery("BillingDocument", { orderBy: { createdAt: "desc" } });
  const { data: projects, isPending: projLoading } = useQuery("Project", { orderBy: { createdAt: "desc" } });
  const { update: updateDoc } = useMutation("BillingDocument");

  const safeDocs  = docs ?? [];
  const safeProj  = projects ?? [];

  const myDocs = safeDocs.filter(d =>
    (docTypeFilter === "all" || d.type === docTypeFilter)
  );

  const overviewStats = {
    invoices:  safeDocs.filter(d => d.type === "invoice").length,
    estimates: safeDocs.filter(d => d.type === "estimate").length,
    paid:      safeDocs.filter(d => d.type === "invoice" && d.status === "paid").length,
    pending:   safeDocs.filter(d => d.type === "invoice" && !["paid","cancelled","draft"].includes(d.status)).length,
  };

  const handleApproveEstimate = async (docId: string) => {
    await updateDoc(docId, { status: "approved" }).catch(() => {});
  };

  const sendMessage = () => {
    if (!messageDraft.trim()) return;
    setMessages(prev => [...prev, { id: String(Date.now()), text: messageDraft.trim(), ts: new Date().toLocaleTimeString("en-CA", {hour:"2-digit",minute:"2-digit"}), from: "client" }]);
    setMessageDraft("");
    setTimeout(() => {
      setMessages(prev => [...prev, { id: String(Date.now()+1), text: "Thank you for your message! A team member will respond within 24 hours.", ts: "Support", from: "support" }]);
    }, 1500);
  };

  const NAV_SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: "overview",   label: "Overview",     icon: Briefcase },
    { id: "projects",   label: "My Projects",  icon: FolderOpen },
    { id: "documents",  label: "Documents",    icon: FileText },
    { id: "payments",   label: "Payments",     icon: Receipt },
    { id: "schedule",   label: "My Schedule",  icon: CalendarBlank },
    { id: "history",    label: "Activity",     icon: Clock },
    { id: "messages",   label: "Messages",     icon: Chat },
    { id: "profile",    label: "My Profile",   icon: User },
  ];

  return (
    <>
      <Helmet>
        <title>Client Portal – Aménagement Monzon</title>
      </Helmet>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <HeaderNav />
        <main className="flex-1 pt-[72px]">
          {authPending ? (
            <div className="flex items-center justify-center py-32">
              <span className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : isAnonymous ? (
            /* ── Login Gate ── */
            <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6">
              <div className="w-full max-w-md">
                <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-sm text-center">
                  <div className="w-16 h-16 rounded-2xl bg-charcoal flex items-center justify-center mx-auto mb-6">
                    <LockKey size={32} weight="regular" className="text-gold" />
                  </div>
                  <span className="section-eyebrow text-gold/70 block mb-3">Secure Access</span>
                  <h1 className="font-headline font-bold text-2xl text-charcoal mb-3">Client Portal</h1>
                  <p className="font-sans text-sm text-gray-500 mb-8 leading-relaxed">
                    Sign in to access your invoices, estimates, projects, work orders, payment history, and direct messaging.
                  </p>
                  <button onClick={() => login()}
                    className="flex items-center gap-2 w-full px-6 py-4 bg-gold text-charcoal font-sans font-semibold text-sm rounded-xl hover:bg-gold-dark transition-all cursor-pointer justify-center">
                    <LockKey size={16} weight="bold" /> Sign In to Portal <ArrowUpRight size={15} weight="bold" />
                  </button>
                  <p className="font-sans text-xs text-gray-400 mt-5">
                    Not a client yet?{" "}
                    <a href="/contact" className="text-gold hover:text-gold-dark transition-colors">Request access →</a>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ── Authenticated Portal ── */
            <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8 flex gap-6">

              {/* Sidebar */}
              <aside className="w-56 flex-shrink-0 hidden md:flex flex-col gap-2 sticky top-24 h-fit">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-headline font-bold text-sm text-gold">{user?.name?.[0] ?? "C"}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans text-xs font-semibold text-charcoal truncate">{user?.name ?? "Client"}</p>
                      <p className="font-mono text-[9px] text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveSection(id)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-sans font-medium transition-all cursor-pointer focus:outline-none text-left w-full ${activeSection === id ? "bg-charcoal text-white shadow-sm" : "text-gray-500 hover:bg-white hover:text-charcoal hover:shadow-sm border border-transparent hover:border-gray-200"}`}>
                    <Icon size={16} weight={activeSection === id ? "fill" : "regular"} className="flex-shrink-0" />
                    {label}
                  </button>
                ))}

                <button onClick={() => logout()}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-sans font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer mt-2">
                  <SignOut size={16} weight="regular" className="flex-shrink-0" />
                  Sign Out
                </button>
              </aside>

              {/* Main content */}
              <div className="flex-1 min-w-0">

                {/* Mobile top bar */}
                <div className="md:hidden flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                  {NAV_SECTIONS.map(({ id, label }) => (
                    <button key={id} onClick={() => setActiveSection(id)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${activeSection === id ? "bg-charcoal text-white" : "bg-white text-gray-500 border border-gray-200"}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* ─── Overview ─── */}
                {activeSection === "overview" && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <span className="section-eyebrow text-gold/80 block mb-1">Client Portal</span>
                      <h1 className="font-headline font-bold text-2xl text-charcoal">Welcome back, {user?.name?.split(" ")[0] ?? "Client"} 👋</h1>
                      <p className="font-sans text-sm text-gray-500 mt-1">Here's your project and billing overview.</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        ["Invoices",  overviewStats.invoices,  "bg-blue-50 text-blue-600"],
                        ["Estimates", overviewStats.estimates, "bg-amber-50 text-amber-600"],
                        ["Paid",      overviewStats.paid,      "bg-emerald-50 text-emerald-600"],
                        ["Pending",   overviewStats.pending,   "bg-red-50 text-red-500"],
                      ].map(([label, val, cls]) => (
                        <div key={label as string} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                          <div className={`w-8 h-8 rounded-xl ${cls as string} flex items-center justify-center mb-3 font-headline font-bold text-lg`}>{val as number}</div>
                          <p className="font-sans text-xs text-gray-500">{label as string}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Recent docs */}
                      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="flex justify-between items-center px-5 py-3.5 border-b border-gray-100">
                          <p className="font-headline font-semibold text-sm text-charcoal">Recent Documents</p>
                          <button onClick={() => setActiveSection("documents")} className="font-mono text-[10px] text-gold cursor-pointer">View all</button>
                        </div>
                        {safeDocs.slice(0,4).map(doc => {
                          const Icon = DOC_TYPE_ICONS[doc.type] ?? FileText;
                          return (
                            <button key={doc.id} onClick={() => setPreviewDoc(doc)} className="w-full flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer text-left">
                              <div className="flex items-center gap-3"><div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"><Icon size={12} className="text-gray-500" /></div><div><p className="font-mono text-xs font-semibold text-charcoal">#{doc.documentNumber}</p><p className="font-sans text-[10px] text-gray-400 capitalize">{doc.type?.replace("-"," ")}</p></div></div>
                              <div className="flex items-center gap-2"><span className="font-mono text-xs text-charcoal">${doc.total}</span><span className={`px-2 py-0.5 text-[9px] font-mono rounded-full ${STATUS_STYLES[doc.status]||"bg-gray-100 text-gray-500"}`}>{doc.status}</span></div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Quick actions */}
                      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <p className="font-headline font-semibold text-sm text-charcoal mb-4">Quick Actions</p>
                        <div className="flex flex-col gap-2">
                          {[
                            ["View Projects",        "projects"],
                            ["View All Invoices",    "documents"],
                            ["Approve Estimates",    "documents"],
                            ["Payment History",      "payments"],
                            ["Send a Message",       "messages"],
                          ].map(([label, section]) => (
                            <button key={label as string} onClick={() => setActiveSection(section as Section)}
                              className="flex items-center justify-between w-full px-4 py-2.5 bg-gray-50 rounded-xl hover:bg-charcoal hover:text-warm-white text-sm font-sans text-gray-600 transition-all group cursor-pointer">
                              {label as string}
                              <ArrowUpRight size={13} weight="bold" className="text-gray-400 group-hover:text-gold" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── My Projects ─── */}
                {activeSection === "projects" && (
                  <div className="flex flex-col gap-4">
                    <h2 className="font-headline font-bold text-xl text-charcoal">My Projects</h2>
                    {projLoading ? <div className="flex justify-center py-12"><span className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div> :
                    safeProj.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-gray-200 bg-white">
                        <Briefcase size={28} weight="regular" className="text-gray-300 mb-2" />
                        <p className="font-sans text-sm text-gray-400">No projects found for your account.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {safeProj.map(p => (
                          <div key={p.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {p.src && <div className="h-36 overflow-hidden"><img src={p.src} alt={p.alt || p.title} className="w-full h-full object-cover" /></div>}
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="font-headline font-semibold text-sm text-charcoal">{p.title}</p>
                                <span className={`flex-shrink-0 px-2 py-0.5 text-[9px] font-mono rounded-full ${p.status === "active" ? "bg-emerald-100 text-emerald-600" : p.status === "completed" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>{p.status ?? "Active"}</span>
                              </div>
                              <p className="font-mono text-[10px] text-gray-400">{p.category} · {p.year}</p>
                              {p.description && <p className="font-sans text-xs text-gray-500 mt-2 line-clamp-2">{p.description}</p>}
                              {p.address && <p className="font-mono text-[10px] text-gray-400 mt-1.5">📍 {p.address}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Documents ─── */}
                {activeSection === "documents" && (
                  <div>
                    <h2 className="font-headline font-bold text-xl text-charcoal mb-4">Documents & Invoices</h2>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {["all","estimate","invoice","receipt","work-order","credit-note"].map(t => (
                        <button key={t} onClick={() => setDocTypeFilter(t)}
                          className={`px-3 py-1.5 text-xs font-mono rounded-xl border capitalize transition-all cursor-pointer ${docTypeFilter === t ? "bg-charcoal text-white border-charcoal" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"}`}>
                          {t === "all" ? "All Documents" : t.replace("-"," ")}
                        </button>
                      ))}
                    </div>
                    {docsLoading ? (
                      <div className="flex justify-center py-12"><span className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
                    ) : safeDocs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-gray-200 bg-white">
                        <FolderOpen size={28} weight="regular" className="text-gray-300 mb-2" />
                        <p className="font-sans text-sm text-gray-400">No documents available yet.</p>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        {safeDocs.map(doc => {
                          const Icon = DOC_TYPE_ICONS[doc.type] ?? FileText;
                          return (
                            <div key={doc.id} className="flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group">
                              <div className="flex items-center gap-4">
                                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center"><Icon size={15} weight="regular" className="text-gray-500" /></div>
                                <div>
                                  <p className="font-mono text-sm font-semibold text-charcoal">#{doc.documentNumber}</p>
                                  <p className="font-sans text-xs text-gray-400 capitalize">{doc.type?.replace("-"," ")} · {doc.issueDate ? new Date(doc.issueDate).toLocaleDateString("en-CA") : "—"}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap justify-end">
                                <span className="font-mono text-sm font-semibold text-charcoal">${doc.total}</span>
                                <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full ${STATUS_STYLES[doc.status]||"bg-gray-100 text-gray-500"}`}>{doc.status}</span>
                                {doc.type === "estimate" && doc.status === "sent" && (
                                  <button onClick={() => handleApproveEstimate(doc.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-600 border border-teal-200 text-xs font-mono rounded-lg hover:bg-teal-100 cursor-pointer">
                                    <Check size={11} weight="bold" /> Approve
                                  </button>
                                )}
                                <button onClick={() => setPreviewDoc(doc)}
                                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-charcoal group/btn transition-colors cursor-pointer">
                                  <Eye size={13} weight="regular" className="text-gray-500 group-hover/btn:text-white" />
                                </button>
                                <button onClick={() => window.print()}
                                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-blue-600 group/btn2 transition-colors cursor-pointer">
                                  <Download size={13} weight="regular" className="text-gray-500 group-hover/btn2:text-white" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Payments ─── */}
                {activeSection === "payments" && (
                  <div>
                    <h2 className="font-headline font-bold text-xl text-charcoal mb-4">Payment History</h2>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                        <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">All Payments</p>
                      </div>
                      {safeDocs.filter(d => d.type === "invoice" && d.status === "paid").length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <Clock size={24} weight="regular" className="text-gray-300 mb-2" />
                          <p className="font-sans text-sm text-gray-400">No payments recorded yet.</p>
                        </div>
                      ) : (
                        safeDocs.filter(d => d.type === "invoice" && d.status === "paid").map(doc => (
                          <div key={doc.id} className="flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0">
                            <div>
                              <p className="font-mono text-xs font-semibold text-charcoal">INV #{doc.documentNumber}</p>
                              <p className="font-sans text-xs text-gray-400">Paid: {doc.paidAt ? new Date(doc.paidAt).toLocaleDateString("en-CA") : "—"}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm font-bold text-emerald-600">${doc.total}</span>
                              <button onClick={() => setPreviewDoc(doc)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-charcoal group/btn transition-colors cursor-pointer">
                                <Eye size={13} weight="regular" className="text-gray-500 group-hover/btn:text-white" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* ─── Activity / History ─── */}
                {activeSection === "history" && (
                  <div>
                    <h2 className="font-headline font-bold text-xl text-charcoal mb-4">Activity Log</h2>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                        <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Document Status Activity</p>
                      </div>
                      {safeDocs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <Clock size={24} weight="regular" className="text-gray-300 mb-2" />
                          <p className="font-sans text-sm text-gray-400">No activity yet.</p>
                        </div>
                      ) : (
                        safeDocs.slice(0,20).map(doc => (
                          <div key={doc.id} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${doc.status === "paid" ? "bg-emerald-400" : doc.status === "sent" ? "bg-blue-400" : "bg-gray-300"}`} />
                              <div>
                                <p className="font-sans text-xs font-medium text-charcoal capitalize">{doc.type?.replace("-"," ")} #{doc.documentNumber} — <span className="font-mono">{doc.status}</span></p>
                                <p className="font-mono text-[10px] text-gray-400">{new Date(doc.updatedAt).toLocaleString("en-CA")}</p>
                              </div>
                            </div>
                            <span className="font-mono text-xs text-charcoal">${doc.total}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* ─── Messages ─── */}
                {activeSection === "messages" && (
                  <div>
                    <h2 className="font-headline font-bold text-xl text-charcoal mb-4">Messages</h2>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col" style={{ height: "500px" }}>
                      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center"><span className="font-headline font-bold text-xs text-gold">M</span></div>
                        <div><p className="font-headline font-semibold text-xs text-charcoal">Aménagement Monzon Support</p><div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="font-mono text-[9px] text-gray-400">Team available Mon–Fri</span></div></div>
                      </div>
                      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 scrollbar-hide">
                        {messages.map(msg => (
                          <div key={msg.id} className={`flex gap-2 ${msg.from === "client" ? "justify-end" : "justify-start"}`}>
                            {msg.from === "support" && <div className="w-7 h-7 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0 mt-0.5"><span className="font-headline font-bold text-[10px] text-gold">M</span></div>}
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs font-sans leading-relaxed ${msg.from === "client" ? "bg-charcoal text-warm-white rounded-br-sm" : "bg-gray-100 text-charcoal rounded-bl-sm"}`}>
                              <p>{msg.text}</p>
                              <p className={`font-mono text-[9px] mt-1 ${msg.from === "client" ? "text-gray-400" : "text-gray-400"}`}>{msg.ts}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-3 border-t border-gray-100 flex gap-2 items-center flex-shrink-0">
                        <input type="text" value={messageDraft} onChange={e => setMessageDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
                          placeholder="Type a message…"
                          className="flex-1 px-4 py-2.5 text-xs font-sans bg-gray-100 border border-transparent rounded-xl focus:outline-none focus:border-charcoal/30 transition-colors" />
                        <button onClick={sendMessage} disabled={!messageDraft.trim()}
                          className="px-4 py-2.5 text-xs font-sans font-semibold bg-charcoal text-white rounded-xl disabled:opacity-40 hover:bg-gray-800 cursor-pointer transition-colors">Send</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Schedule ─── */}
                {activeSection === "schedule" && (
                  <div>
                    <h2 className="font-headline font-bold text-xl text-charcoal mb-4">My Schedule</h2>
                    <p className="font-sans text-sm text-gray-500 mb-5">Upcoming project milestones, service visits, and appointments scheduled by your team.</p>
                    {(!calEvents || calEvents.length === 0) ? (
                      <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-gray-200 bg-white">
                        <CalendarBlank size={28} weight="regular" className="text-gray-300 mb-2" />
                        <p className="font-sans text-sm text-gray-400">No scheduled events yet. Your team will add project milestones and service visits here.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {(calEvents ?? []).slice(0, 20).map(ev => {
                          const typeColors: Record<string, string> = {
                            "project": "bg-blue-50 text-blue-700 border-blue-200",
                            "service": "bg-purple-50 text-purple-700 border-purple-200",
                            "site-visit": "bg-amber-50 text-amber-700 border-amber-200",
                            "install": "bg-emerald-50 text-emerald-700 border-emerald-200",
                          };
                          const colorClass = typeColors[ev.type] ?? "bg-gray-50 text-gray-700 border-gray-200";
                          return (
                            <div key={ev.id} className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-charcoal flex flex-col items-center justify-center flex-shrink-0">
                                  <span className="font-headline font-bold text-xs text-gold">{new Date(ev.startDate).getDate()}</span>
                                  <span className="font-mono text-[9px] text-gray-400 uppercase">{new Date(ev.startDate).toLocaleString("en-CA", { month: "short" })}</span>
                                </div>
                                <div>
                                  <p className="font-sans font-semibold text-sm text-charcoal">{ev.title}</p>
                                  {ev.description && <p className="font-sans text-xs text-gray-500 mt-0.5">{ev.description}</p>}
                                  {ev.endDate && (
                                    <p className="font-mono text-[10px] text-gray-400 mt-1">
                                      Until {new Date(ev.endDate).toLocaleDateString("en-CA", { month: "long", day: "numeric" })}
                                    </p>
                                  )}
                                  {ev.linkedProjectName && (
                                    <p className="font-mono text-[10px] text-gray-400 mt-0.5">📁 {ev.linkedProjectName}</p>
                                  )}
                                </div>
                              </div>
                              <span className={`px-2.5 py-1 text-[10px] font-mono rounded-full border flex-shrink-0 capitalize ${colorClass}`}>{ev.type.replace("-"," ")}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Profile ─── */}
                {activeSection === "profile" && (
                  <div>
                    <h2 className="font-headline font-bold text-xl text-charcoal mb-4">My Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                          <p className="font-headline font-semibold text-sm text-charcoal">Account Information</p>
                          <button onClick={() => setEditingProfile(p => !p)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans text-gray-500 bg-gray-100 rounded-xl hover:bg-charcoal hover:text-white transition-all cursor-pointer">
                            <PencilSimple size={12} /> {editingProfile ? "Cancel" : "Edit"}
                          </button>
                        </div>
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Full Name</label>
                            {editingProfile
                              ? <input type="text" value={profileForm.name} onChange={e => setProfileForm(p => ({...p, name: e.target.value}))} className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-sans focus:outline-none focus:border-charcoal/30" />
                              : <p className="font-sans text-sm text-charcoal">{user?.name}</p>}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Email</label>
                            <p className="font-sans text-sm text-charcoal">{user?.email}</p>
                            <p className="font-mono text-[9px] text-gray-400">Email cannot be changed here. Contact support.</p>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Account Type</label>
                            <span className="px-2.5 py-1 w-fit text-xs font-mono rounded-full bg-blue-100 text-blue-600">Client</span>
                          </div>
                          {editingProfile && (
                            <button onClick={() => { setEditingProfile(false); }}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-gold text-charcoal font-sans font-semibold text-xs rounded-xl hover:bg-gold-dark transition-colors cursor-pointer w-fit">
                              <FloppyDisk size={13} /> Save Changes
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <p className="font-headline font-semibold text-sm text-charcoal mb-5">Notifications</p>
                        <div className="flex flex-col gap-3">
                          {[["Email: New Invoices", true],["Email: Estimate Ready", true],["Email: Payment Confirmation", true],["SMS: Project Updates", false]].map(([label, def]) => (
                            <label key={label as string} className="flex items-center justify-between cursor-pointer">
                              <span className="font-sans text-xs text-charcoal">{label as string}</span>
                              <div className={`w-10 h-5 rounded-full relative transition-colors ${def ? "bg-gold" : "bg-gray-200"}`}>
                                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${def ? "translate-x-5" : "translate-x-0.5"}`} />
                              </div>
                            </label>
                          ))}
                        </div>
                        <div className="mt-6 pt-5 border-t border-gray-100">
                          <button onClick={() => logout()} className="flex items-center gap-2 text-red-400 hover:text-red-600 font-sans text-xs transition-colors cursor-pointer">
                            <SignOut size={14} /> Sign out of portal
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>

      {previewDoc && <DocumentPreview doc={previewDoc} onClose={() => setPreviewDoc(null)} onApprove={handleApproveEstimate} />}
    </>
  );
}
