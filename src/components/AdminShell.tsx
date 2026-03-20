import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  House, Gear, Images, FileText, Users,
  UploadSimple, Eye, PencilSimple, Trash,
  ChartBar, ShoppingBag, Megaphone, LockKey,
  Bell, ArrowUpRight, Dot, Briefcase, CurrencyDollar,
  UserCircle, Cube, Robot, TrendUp, FunnelSimple,
  Clock, Calculator, Monitor, Video, Palette,
  ShieldCheck, UserGear, Plug, BellRinging, DeviceMobile,
  X, CheckCircle, Spinner, Star, Buildings, Play,
} from "@phosphor-icons/react";
import { useQuery, useMutation } from "@/lib/anima-supabase-adapter";
import { useAppAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePWA } from "@/hooks/usePWA";
import BillingPanel from "@/admin/BillingPanel";
import EconomicDashboardPanel from "@/admin/EconomicDashboardPanel";
import ExpenseIncomePanel from "@/admin/ExpenseIncomePanel";
import EmployeeHoursPanel from "@/admin/EmployeeHoursPanel";
import ProfitabilityPanel from "@/admin/ProfitabilityPanel";
import LeadManagementPanel from "@/admin/LeadManagementPanel";
import AdminAIChat from "@/admin/AdminAIChat";
import ThemeManagerPanel from "@/admin/ThemeManagerPanel";
import AppearanceBasePanel from "@/admin/AppearanceBasePanel";
import VideoManagerPanel from "@/admin/VideoManagerPanel";
import RoleManagerPanel from "@/admin/RoleManagerPanel";
import UserManagerPanel from "@/admin/UserManagerPanel";
import PWASettingsPanel from "@/admin/PWASettingsPanel";
import IntegrationsPanel from "@/admin/IntegrationsPanel";
import NotificationCenterPanel from "@/admin/NotificationCenterPanel";
import NotificationSettingsPanel from "@/admin/NotificationSettingsPanel";
import ReviewsPanel from "@/admin/ReviewsPanel";
import MetricsPanel from "@/admin/MetricsPanel";
import LogoManagerPanel from "@/admin/LogoManagerPanel";
import CompanyProfilePanel from "@/admin/CompanyProfilePanel";
import AcademyManagerPanel from "@/admin/AcademyManagerPanel";
import ServiceShopPanel from "@/admin/ServiceShopPanel";
import StoreManagerPanel from "@/admin/StoreManagerPanel";
import SplashManagerPanel from "@/admin/SplashManagerPanel";
import CommunityManagerPanel from "@/admin/CommunityManagerPanel";
import AnalyticsPanel from "@/admin/AnalyticsPanel";
import MessagingPanel from "@/admin/MessagingPanel";
import CalendarPanel from "@/admin/CalendarPanel";

const SIDEBAR_ITEMS = [
  { id: "dashboard",            label: "Dashboard",             icon: ChartBar,       group: "core"       },
  { id: "projects",             label: "Projects",              icon: Briefcase,      group: "core"       },
  { id: "clients",              label: "Clients",               icon: Users,          group: "core"       },
  { id: "employees",            label: "Employees",             icon: UserCircle,     group: "core"       },
  { id: "media",                label: "Media Manager",         icon: Images,         group: "core"       },
  { id: "store",                label: "Store",                 icon: ShoppingBag,    group: "core"       },
  { id: "community",            label: "Community",             icon: Megaphone,      group: "core"       },
  { id: "billing",              label: "Billing",               icon: CurrencyDollar, group: "finance"    },
  { id: "economics",            label: "Economic Dashboard",    icon: TrendUp,        group: "finance"    },
  { id: "expenses",             label: "Expenses & Income",     icon: ChartBar,       group: "finance"    },
  { id: "leads",                label: "Lead Management",       icon: FunnelSimple,   group: "finance"    },
  { id: "hours",                label: "Employee Hours",        icon: Clock,          group: "finance"    },
  { id: "profitability",        label: "Profitability",         icon: Calculator,     group: "finance"    },
  { id: "ai-admin",             label: "AI Economic Analyst",   icon: Robot,          group: "ai"         },
  { id: "theme",                label: "Theme Manager",         icon: Palette,        group: "appearance" },
  { id: "appearance-base",      label: "Appearance Base",       icon: Monitor,        group: "appearance" },
  { id: "splash-manager",       label: "Splash Screen",         icon: Play,           group: "appearance" },
  { id: "video-manager",        label: "Video Manager",         icon: Video,          group: "appearance" },
  { id: "reviews",              label: "Reviews",               icon: Star,           group: "content"    },
  { id: "metrics",              label: "Metrics Editor",        icon: TrendUp,        group: "content"    },
  { id: "logo-manager",         label: "Logo Manager",          icon: Images,         group: "content"    },
  { id: "company-profile",      label: "Company Identity",      icon: Buildings,      group: "content"    },
  { id: "academy-manager",      label: "Academy Manager",       icon: FileText,       group: "content"    },
  { id: "service-shop",         label: "Service Shop",          icon: Briefcase,      group: "content"    },
  { id: "analytics",            label: "Analytics",             icon: ChartBar,       group: "core"       },
  { id: "calendar",             label: "Calendar",              icon: Clock,          group: "core"       },
  { id: "messaging",            label: "Messaging Hub",         icon: Bell,           group: "core"       },
  { id: "roles",                label: "Role Manager",          icon: ShieldCheck,    group: "settings"   },
  { id: "users",                label: "User Manager",          icon: UserGear,       group: "settings"   },
  { id: "integrations",         label: "Integrations",          icon: Plug,           group: "settings"   },
  { id: "notifications-center", label: "Notifications",         icon: BellRinging,    group: "settings"   },
  { id: "notifications-settings", label: "Notif. Settings",    icon: Bell,           group: "settings"   },
  { id: "pwa",                  label: "PWA Settings",          icon: DeviceMobile,   group: "settings"   },
  { id: "settings",             label: "Settings",              icon: Gear,           group: "settings"   },
];

/* ── Panel: Dashboard ── */
function DashboardPanel({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const { data: projects    } = useQuery("Project",   { limit: 5 });
  const { data: clients     } = useQuery("Client",    { limit: 5 });
  const { data: employees   } = useQuery("Employee",  { limit: 5 });
  const { data: mediaAssets } = useQuery("MediaAsset",{ limit: 5 });

  const stats = [
    { label: "Active Projects", value: String(projects?.length ?? "—")   },
    { label: "Clients",         value: String(clients?.length ?? "—")     },
    { label: "Employees",       value: String(employees?.length ?? "—")   },
    { label: "Media Files",     value: String(mediaAssets?.length ?? "—") },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-bold text-2xl text-charcoal">Dashboard</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">Welcome back. Here's your site overview.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-5">
              <p className="font-mono text-2xl font-semibold text-charcoal">{s.value}</p>
              <p className="font-sans text-xs text-gray-500 mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader><CardTitle className="font-headline text-base text-charcoal">Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {[["Add Project","projects"],["Add Client","clients"],["Upload Media","media"],["View Analytics","analytics"]].map(([label, tab]) => (
                <button key={label} onClick={() => setActiveTab(tab)}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-sans text-gray-600 bg-gray-50 rounded-xl hover:bg-charcoal hover:text-warm-white transition-all duration-200 cursor-pointer group">
                  {label}
                  <ArrowUpRight size={13} weight="bold" className="text-gray-400 group-hover:text-gold" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader><CardTitle className="font-headline text-base text-charcoal">Recent Contacts</CardTitle></CardHeader>
          <CardContent>
            <ContactsPreview />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ContactsPreview() {
  const { data: submissions, isPending } = useQuery("ContactSubmission", { orderBy: { createdAt: "desc" }, limit: 4 });
  if (isPending) return <div className="flex justify-center py-6"><span className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;
  if (!submissions || submissions.length === 0) return <p className="font-sans text-sm text-gray-400 text-center py-4">No submissions yet.</p>;
  return (
    <div className="flex flex-col gap-3">
      {submissions.map((s) => (
        <div key={s.id} className="flex items-center gap-3 text-sm">
          <Dot size={20} weight="fill" className="text-gold flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-sans text-xs font-medium text-charcoal truncate">{s.name}</p>
            <p className="font-mono text-[10px] text-gray-400">{s.projectType || "General"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Panel: Projects ── */
const EMPTY_PROJ = {
  title: "", category: "Construction", year: String(new Date().getFullYear()),
  src: "", alt: "", size: "normal",
  clientId: "", clientName: "", status: "planning",
  description: "", address: "", budget: "",
  startDate: undefined as Date | undefined, endDate: undefined as Date | undefined,
  notes: "", coverImageUrl: "",
};
type ProjForm = typeof EMPTY_PROJ;

function ProjectsPanel() {
  const { data: projects, isPending, error } = useQuery("Project", { orderBy: { createdAt: "desc" } });
  const { data: clients } = useQuery("Client", { orderBy: { contactPerson: "asc" } });
  const { data: allEmployees } = useQuery("Employee", { orderBy: { firstName: "asc" } });
  const { data: allNotes  } = useQuery("ProjectNote",       { orderBy: { createdAt: "desc" } });
  const { data: allPhotos } = useQuery("ProjectAttachment", { orderBy: { createdAt: "desc" } });
  const { data: allDocs   } = useQuery("BillingDocument",   { orderBy: { createdAt: "desc" } });
  const { data: allExpenses} = useQuery("Expense",          { orderBy: { date: "desc" }      });
  const { data: allIncome }  = useQuery("Income",           { orderBy: { date: "desc" }      });
  const { data: allHours  }  = useQuery("HourEntry",        { orderBy: { date: "desc" }      });
  const { create, update, remove, isPending: isMutating } = useMutation("Project");
  const { create: createNote, remove: removeNote } = useMutation("ProjectNote");
  const { create: createAttachment, remove: removeAttachment } = useMutation("ProjectAttachment");
  const { create: createExpense } = useMutation("Expense");
  const { create: createIncome } = useMutation("Income");
  const { create: createHour } = useMutation("HourEntry");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<null | (ProjForm & { id?: string })>(null);
  const [form, setForm]         = useState<ProjForm>(EMPTY_PROJ);
  const [saved, setSaved]       = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"list" | "detail">("list");
  const [detailTab, setDetailTab]   = useState<"overview" | "notes" | "photos" | "billing" | "team">("overview");
  const [noteDraft, setNoteDraft]   = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  // Quick-add expense modal state
  const [showExpModal, setShowExpModal] = useState(false);
  const [expForm, setExpForm] = useState({ description: "", amount: "", category: "material", vendor: "" });
  // Quick-assign employee modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ employeeId: "", hours: "8", costPerHour: "35", notes: "" });
  // Add-to-bill modal state
  const [showAddToBill, setShowAddToBill] = useState(false);
  const [addToBillDocId, setAddToBillDocId] = useState("");
  const [addToBillType, setAddToBillType] = useState<"income" | "expense" | "labor" | "custom">("income");
  const [addToBillForm, setAddToBillForm] = useState({ description: "", amount: "", qty: "1", unit: "unit" });
  const { update: updateDoc } = useMutation("BillingDocument");

  if (isPending) return <PanelLoader />;
  if (error)     return <PanelError message={error.message} />;

  const selected     = projects?.find((p) => p.id === selectedId);
  const projNotes    = allNotes?.filter((n) => n.projectId === selectedId) ?? [];
  const projPhotos   = allPhotos?.filter((a) => a.projectId === selectedId && a.fileType.startsWith("image")) ?? [];
  const projDocs     = allDocs?.filter((d) => d.projectId === selectedId || (selected && d.clientName === selected.clientName)) ?? [];
  const projHours    = allHours?.filter((h) => h.projectId === selectedId) ?? [];
  const assignedEmpIds = [...new Set(projHours.map((h) => h.employeeId))];
  const totalLabor   = projHours.reduce((s, h) => s + parseFloat(h.totalCost || "0"), 0);
  const projExpenses = allExpenses?.filter((e) => e.projectId === selectedId) ?? [];
  const projIncome   = allIncome?.filter((i) => i.projectId === selectedId) ?? [];
  const totalExpenses = projExpenses.reduce((s, e) => s + parseFloat(e.amount || "0"), 0);
  const totalIncome   = projIncome.reduce((s, i) => s + parseFloat(i.amount || "0"), 0);

  const openAdd  = () => { setEditing(null); setForm(EMPTY_PROJ); setShowForm(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ ...EMPTY_PROJ, ...p }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSave = async () => {
    try {
      const payload: any = {
        title: form.title, category: form.category, year: form.year,
        src: form.src, alt: form.alt || form.title, size: form.size,
        clientId: form.clientId, clientName: form.clientName,
        status: form.status, description: form.description,
        address: form.address, budget: form.budget,
        notes: form.notes, coverImageUrl: form.coverImageUrl,
      };
      if (form.startDate) payload.startDate = form.startDate;
      if (form.endDate)   payload.endDate   = form.endDate;
      if (editing?.id) await update(editing.id, payload);
      else             await create(payload);
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      closeForm();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    if (selectedId === id) { setSelectedId(null); setActiveView("list"); }
  };

  const handleAddNote = async () => {
    if (!noteDraft.trim() || !selectedId || !selected) return;
    await createNote({ projectId: selectedId, projectName: selected.title, content: noteDraft.trim(), authorId: "admin", authorName: "Admin" });
    setNoteDraft("");
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    const reader = new FileReader();
    await new Promise<void>((res) => {
      reader.onload = async (ev) => {
        const url = ev.target?.result as string;
        setForm((p) => ({ ...p, src: url, coverImageUrl: url }));
        if (editing?.id) await update(editing.id, { src: url, coverImageUrl: url });
        res();
      };
      reader.readAsDataURL(file);
    });
    setUploadingCover(false);
  };

  const handleAddToBill = async () => {
    if (!addToBillDocId || !addToBillForm.description || !addToBillForm.amount) return;
    const doc = allDocs?.find((d) => d.id === addToBillDocId);
    if (!doc) return;
    // Parse existing line items
    let lineItems: any[] = [];
    try { lineItems = JSON.parse(doc.lineItems || "[]"); } catch { lineItems = []; }
    // Build new line item
    const qty = parseFloat(addToBillForm.qty) || 1;
    const price = parseFloat(addToBillForm.amount) || 0;
    const newLine = {
      id: String(Date.now()),
      description: addToBillForm.description,
      qty: String(qty),
      unit: addToBillForm.unit || "unit",
      unitPrice: price.toFixed(2),
      tax: "15",
      total: (qty * price).toFixed(2),
    };
    const updatedItems = [...lineItems, newLine];
    // Recalculate totals
    const taxRate = parseFloat((doc as any).taxRate || "15");
    const discountRate = parseFloat((doc as any).discountRate || "0");
    const subtotal = updatedItems.reduce((s: number, i: any) => s + parseFloat(i.total || "0"), 0);
    const disc = subtotal * (discountRate / 100);
    const taxable = subtotal - disc;
    const tax = taxable * (taxRate / 100);
    const total = taxable + tax;
    await updateDoc(doc.id, {
      lineItems: JSON.stringify(updatedItems),
      subtotal: subtotal.toFixed(2),
      taxAmount: tax.toFixed(2),
      discountAmount: disc.toFixed(2),
      total: total.toFixed(2),
    });
    // Also create matching income/expense record if relevant
    if (addToBillType === "income" && selectedId && selected) {
      await createIncome({ description: addToBillForm.description, amount: (qty * price).toFixed(2), date: new Date(), projectId: selectedId, projectName: selected.title });
    } else if (addToBillType === "expense" && selectedId && selected) {
      await createExpense({ category: "other", description: addToBillForm.description, amount: (qty * price).toFixed(2), date: new Date(), projectId: selectedId, projectName: selected.title, paymentMethod: "card" });
    }
    setAddToBillForm({ description: "", amount: "", qty: "1", unit: "unit" });
    setShowAddToBill(false);
  };

  const handleQuickExpense = async () => {
    if (!expForm.description || !expForm.amount || !selectedId || !selected) return;
    await createExpense({ category: expForm.category, description: expForm.description, amount: expForm.amount, date: new Date(), projectId: selectedId, projectName: selected.title, vendor: expForm.vendor, paymentMethod: "card" });
    setExpForm({ description: "", amount: "", category: "material", vendor: "" });
    setShowExpModal(false);
  };

  const handleAssignEmployee = async () => {
    if (!assignForm.employeeId || !selectedId || !selected) return;
    const emp = allEmployees?.find((e) => e.id === assignForm.employeeId);
    if (!emp) return;
    const costPerHour = assignForm.costPerHour || emp.hourlyRate || "35";
    const totalCost = (parseFloat(assignForm.hours) * parseFloat(costPerHour)).toFixed(2);
    await createHour({ employeeId: emp.id, employeeName: `${emp.firstName} ${emp.lastName}`, projectId: selectedId, projectName: selected.title, date: new Date(), hours: assignForm.hours, costPerHour, totalCost, notes: assignForm.notes, approved: "no" });
    setAssignForm({ employeeId: "", hours: "8", costPerHour: "35", notes: "" });
    setShowAssignModal(false);
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || !selectedId || !selected) return;
    setUploadingPhoto(true);
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith("image/")) continue;
      const reader = new FileReader();
      await new Promise<void>((res) => {
        reader.onload = async (ev) => {
          const url = ev.target?.result as string;
          await createAttachment({ projectId: selectedId, projectName: selected.title, fileName: f.name, fileType: "image/jpeg", url, uploadedByName: "Admin" });
          res();
        };
        reader.readAsDataURL(f);
      });
    }
    setUploadingPhoto(false);
  };

  const STATUS_COLORS: Record<string, string> = {
    planning:   "bg-amber-100 text-amber-700",
    active:     "bg-green-100 text-green-700",
    "on-hold":  "bg-orange-100 text-orange-600",
    completed:  "bg-blue-100 text-blue-700",
    cancelled:  "bg-red-100 text-red-600",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">Projects</h1>
          <p className="font-sans text-sm text-gray-500 mt-0.5">Manage portfolio and active construction projects.</p>
        </div>
        <Button onClick={openAdd} className="bg-charcoal text-warm-white hover:bg-charcoal/80 text-xs h-9 px-4 rounded-xl shadow-none flex items-center gap-2">
          <span className="text-base leading-none">+</span> Add Project
        </Button>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-headline font-bold text-base text-charcoal">{editing ? "Edit Project" : "Add Project"}</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-charcoal cursor-pointer focus:outline-none"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              {/* Title */}
              <div className="col-span-2">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Project Title *</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Driveway Renovation – Client Name" className="border-gray-200 rounded-xl text-sm" />
              </div>
              {/* Client linkage */}
              <div className="col-span-2">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Link to Client</Label>
                <select
                  value={form.clientId}
                  onChange={(e) => {
                    const opt = e.target.options[e.target.selectedIndex];
                    setForm((p) => ({ ...p, clientId: e.target.value, clientName: opt.dataset.name || "" }));
                  }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold bg-white"
                >
                  <option value="">— No client linked —</option>
                  {(clients ?? []).map((c) => (
                    <option key={c.id} value={c.id} data-name={c.contactPerson}>{c.contactPerson}{c.companyName ? ` (${c.companyName})` : ""}</option>
                  ))}
                </select>
              </div>
              {/* Category / Status */}
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Category</Label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold bg-white">
                  {["Construction","Renovation","Landscaping","Hardscape","Maintenance","Interior","Structural"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Status</Label>
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold bg-white">
                  {["planning","active","on-hold","completed","cancelled"].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
              {/* Year / Budget */}
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Year</Label>
                <Input value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} className="border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Budget</Label>
                <Input value={form.budget} onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))} placeholder="e.g. $25,000" className="border-gray-200 rounded-xl text-sm" />
              </div>
              {/* Dates */}
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Start Date</Label>
                <Input type="date" value={form.startDate instanceof Date ? form.startDate.toISOString().split("T")[0] : (form.startDate ? String(form.startDate).split("T")[0] : "")}
                  onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value ? new Date(e.target.value) : undefined }))}
                  className="border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">End Date</Label>
                <Input type="date" value={form.endDate instanceof Date ? form.endDate.toISOString().split("T")[0] : (form.endDate ? String(form.endDate).split("T")[0] : "")}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value ? new Date(e.target.value) : undefined }))}
                  className="border-gray-200 rounded-xl text-sm" />
              </div>
              {/* Address */}
              <div className="col-span-2">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Site Address</Label>
                <Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="123 Rue Example, Montréal" className="border-gray-200 rounded-xl text-sm" />
              </div>
              {/* Description */}
              <div className="col-span-2">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Description</Label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold resize-none" />
              </div>
              {/* Cover image — URL or upload */}
              <div className="col-span-2">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Cover Image</Label>
                <div className="flex gap-2">
                  <Input value={form.src} onChange={(e) => setForm((p) => ({ ...p, src: e.target.value, coverImageUrl: e.target.value }))} placeholder="https://… or upload →" className="border-gray-200 rounded-xl text-sm flex-1" />
                  <button type="button" onClick={() => coverFileRef.current?.click()} disabled={uploadingCover}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-sans border border-gray-200 rounded-xl hover:border-charcoal cursor-pointer disabled:opacity-50 whitespace-nowrap">
                    <UploadSimple size={13} /> {uploadingCover ? "..." : "Upload"}
                  </button>
                  <input ref={coverFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleCoverUpload(e.target.files[0]); }} />
                </div>
                {form.src && <img src={form.src} alt="preview" className="mt-2 h-16 w-full object-cover rounded-xl border border-gray-200" />}
              </div>
              {/* Notes */}
              <div className="col-span-2">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Internal Notes</Label>
                <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={2} placeholder="Private notes visible only to admin/staff." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <Button onClick={closeForm} variant="ghost" className="text-gray-400 text-sm">Cancel</Button>
              <div className="flex items-center gap-3">
                {saved && <span className="text-xs text-green-600 font-sans flex items-center gap-1"><CheckCircle size={12} weight="fill" /> Saved</span>}
                <Button onClick={handleSave} disabled={isMutating || !form.title.trim()}
                  className="bg-gold text-charcoal hover:bg-gold-dark text-xs h-9 px-5 rounded-xl shadow-none">
                  {isMutating ? <Spinner size={14} className="animate-spin" /> : editing ? "Save Changes" : "Create Project"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail view */}
      {activeView === "detail" && selected && (
        <div>
          <button onClick={() => { setActiveView("list"); setDetailTab("overview"); }} className="text-xs font-mono text-gray-400 hover:text-charcoal mb-5 flex items-center gap-1 cursor-pointer focus:outline-none">
            ← Back to projects
          </button>
          {/* Hero */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-5">
            {selected.src && (
              <div className="h-48 overflow-hidden relative">
                <img src={selected.src} alt={selected.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <h2 className="font-headline font-bold text-xl text-white">{selected.title}</h2>
                  {selected.clientName && <p className="font-sans text-xs text-white/70 mt-0.5">Client: {selected.clientName}</p>}
                </div>
              </div>
            )}
            {!selected.src && (
              <div className="px-6 pt-5">
                <h2 className="font-headline font-bold text-xl text-charcoal">{selected.title}</h2>
                {selected.clientName && <p className="font-sans text-xs text-gray-400 mt-0.5">Client: {selected.clientName}</p>}
              </div>
            )}
            <div className="px-6 py-4 flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-1 text-[10px] font-mono rounded-full ${STATUS_COLORS[selected.status ?? ""] ?? "bg-gray-100 text-gray-500"}`}>{selected.status ?? "—"}</span>
                <span className="px-2.5 py-1 text-[10px] font-mono rounded-full bg-gray-100 text-gray-500">{selected.category}</span>
                {selected.budget && <span className="px-2.5 py-1 text-[10px] font-mono rounded-full bg-gold/10 text-gold border border-gold/20">{selected.budget}</span>}
                {selected.address && <span className="font-sans text-xs text-gray-400">📍 {selected.address}</span>}
              </div>
              <button onClick={() => openEdit(selected)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-gray-200 rounded-xl hover:border-charcoal transition-colors cursor-pointer focus:outline-none">
                <PencilSimple size={12} /> Edit
              </button>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
            {(["overview","notes","photos","team","billing"] as const).map((tab) => (
              <button key={tab} onClick={() => setDetailTab(tab)}
                className={`px-4 py-1.5 text-xs font-sans font-medium rounded-lg transition-all cursor-pointer capitalize ${detailTab === tab ? "bg-white text-charcoal shadow-sm" : "text-gray-500 hover:text-charcoal"}`}>
                {tab}{tab === "team" && assignedEmpIds.length > 0 ? ` (${assignedEmpIds.length})` : ""}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {detailTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 flex flex-col gap-4">
                {selected.description && (
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader><CardTitle className="font-headline text-sm text-charcoal">Description</CardTitle></CardHeader>
                    <CardContent className="pt-0"><p className="font-sans text-sm text-gray-600 leading-relaxed">{selected.description}</p></CardContent>
                  </Card>
                )}
                {selected.notes && (
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader><CardTitle className="font-headline text-sm text-charcoal">Internal Notes</CardTitle></CardHeader>
                    <CardContent className="pt-0"><p className="font-sans text-sm text-gray-600">{selected.notes}</p></CardContent>
                  </Card>
                )}
              </div>
              <div className="flex flex-col gap-3">
                {[
                  ["Category", selected.category],
                  ["Status", selected.status],
                  ["Year", selected.year],
                  ["Budget", selected.budget],
                  ["Start", selected.startDate ? new Date(selected.startDate).toLocaleDateString("en-CA") : undefined],
                  ["End", selected.endDate ? new Date(selected.endDate).toLocaleDateString("en-CA") : undefined],
                  ["Address", selected.address],
                  ["Client", selected.clientName],
                ].filter(([, v]) => v).map(([l, v]) => (
                  <div key={l as string}>
                    <p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">{l as string}</p>
                    <p className="font-sans text-sm text-charcoal">{v as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes tab */}
          {detailTab === "notes" && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Add an internal note…"
                  rows={2} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold resize-none" />
                <Button onClick={handleAddNote} disabled={!noteDraft.trim()} className="bg-charcoal text-warm-white text-xs px-4 rounded-xl shadow-none self-end h-9">Add</Button>
              </div>
              {projNotes.length === 0 ? (
                <EmptyState label="No notes yet." />
              ) : (
                <div className="flex flex-col gap-3">
                  {projNotes.map((n) => (
                    <div key={n.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-start justify-between gap-3 shadow-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm text-charcoal leading-relaxed">{n.content}</p>
                        <p className="font-mono text-[10px] text-gray-400 mt-1.5">{n.authorName} · {new Date(n.createdAt).toLocaleString("en-CA")}</p>
                      </div>
                      <button onClick={() => removeNote(n.id)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-red-600 group transition-colors cursor-pointer focus:outline-none flex-shrink-0">
                        <Trash size={11} weight="regular" className="text-gray-400 group-hover:text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Photos tab */}
          {detailTab === "photos" && (
            <div className="flex flex-col gap-4">
              <div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
                  onChange={(e) => handlePhotoUpload(e.target.files)} />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-sans bg-charcoal text-warm-white rounded-xl hover:bg-charcoal/80 transition-all cursor-pointer disabled:opacity-50">
                  <UploadSimple size={14} /> {uploadingPhoto ? "Uploading…" : "Upload Photos"}
                </button>
              </div>
              {projPhotos.length === 0 ? (
                <EmptyState label="No photos uploaded yet." />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {projPhotos.map((a) => (
                    <div key={a.id} className="group relative rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50">
                      <img src={a.url} alt={a.fileName} className="w-full h-full object-cover" />
                      <button onClick={() => removeAttachment(a.id)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Trash size={10} weight="bold" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Team tab */}
          {detailTab === "team" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="font-sans text-sm font-semibold text-charcoal">Assigned Employees</p>
                <button onClick={() => setShowAssignModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans bg-charcoal text-warm-white rounded-xl hover:bg-charcoal/80 cursor-pointer">
                  + Assign Employee
                </button>
              </div>
              {assignedEmpIds.length === 0 ? (
                <EmptyState label="No employees assigned yet. Click 'Assign Employee' to log hours and assign staff." />
              ) : (
                <div className="flex flex-col gap-3">
                  {assignedEmpIds.map((empId) => {
                    const emp = allEmployees?.find((e) => e.id === empId);
                    const empProjectHours = projHours.filter((h) => h.employeeId === empId);
                    const totalHrs = empProjectHours.reduce((s, h) => s + parseFloat(h.hours || "0"), 0);
                    const totalCostEmp = empProjectHours.reduce((s, h) => s + parseFloat(h.totalCost || "0"), 0);
                    const name = emp ? `${emp.firstName} ${emp.lastName}` : (empProjectHours[0]?.employeeName ?? "Unknown");
                    return (
                      <div key={empId} className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                              <span className="font-headline font-bold text-xs text-gold">{name[0]}</span>
                            </div>
                            <div>
                              <p className="font-sans font-medium text-sm text-charcoal">{name}</p>
                              {emp && <p className="font-mono text-[10px] text-gray-400">{emp.role}</p>}
                            </div>
                          </div>
                          <div className="flex gap-4 text-right">
                            <div>
                              <p className="font-mono text-sm font-semibold text-charcoal">{totalHrs.toFixed(1)}h</p>
                              <p className="font-sans text-[10px] text-gray-400">hours</p>
                            </div>
                            <div>
                              <p className="font-mono text-sm font-semibold text-charcoal">${totalCostEmp.toFixed(2)}</p>
                              <p className="font-sans text-[10px] text-gray-400">labor cost</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {empProjectHours.slice(0, 4).map((h) => (
                            <div key={h.id} className="flex items-center justify-between text-[10px] font-mono text-gray-400 border-t border-gray-50 pt-1">
                              <span>{new Date(h.date).toLocaleDateString("en-CA")}</span>
                              <span>{h.hours}h @ ${h.costPerHour}/hr</span>
                              <span className={h.approved === "yes" ? "text-emerald-600" : "text-amber-500"}>{h.approved === "yes" ? "approved" : "pending"}</span>
                            </div>
                          ))}
                          {empProjectHours.length > 4 && <p className="text-[10px] font-mono text-gray-400 pt-1">+{empProjectHours.length - 4} more entries</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Labor cost summary */}
              {projHours.length > 0 && (
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <p className="font-sans text-sm text-gray-500">Total Labor Cost for this Project</p>
                    <p className="font-mono text-lg font-bold text-charcoal">${totalLabor.toFixed(2)}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Billing tab */}
          {detailTab === "billing" && (
            <div className="flex flex-col gap-4">
              {/* Quick-add buttons */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-sans text-sm font-semibold text-charcoal">Project Financials</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowExpModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 cursor-pointer">
                    + Add Expense
                  </button>
                  <button
                    onClick={() => {
                      setAddToBillDocId(projDocs[0]?.id ?? "");
                      setAddToBillType("income");
                      setAddToBillForm({ description: "", amount: "", qty: "1", unit: "unit" });
                      setShowAddToBill(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans bg-gold/10 text-amber-700 border border-gold/30 rounded-xl hover:bg-gold/20 cursor-pointer">
                    + Add to Bill
                  </button>
                </div>
              </div>
              {/* Financial summary */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  ["Total Income",   "$" + totalIncome.toFixed(2),   "text-green-600"],
                  ["Total Expenses", "$" + totalExpenses.toFixed(2), "text-red-500"],
                  ["Labor Cost",     "$" + totalLabor.toFixed(2),    "text-amber-600"],
                  ["Net Margin",     "$" + (totalIncome - totalExpenses - totalLabor).toFixed(2), (totalIncome - totalExpenses - totalLabor) >= 0 ? "text-emerald-600" : "text-red-600"],
                ].map(([l, v, cls]) => (
                  <Card key={l as string} className="bg-white border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      <p className={`font-mono text-lg font-bold ${cls as string}`}>{v as string}</p>
                      <p className="font-sans text-[10px] text-gray-400">{l as string}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Documents linked to this project */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader><CardTitle className="font-headline text-sm text-charcoal">Billing Documents</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  {projDocs.length === 0 ? (
                    <p className="font-sans text-xs text-gray-400">No billing documents linked yet. Create one in the Billing panel and set this project's client.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {projDocs.map((d) => (
                        <div key={d.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="font-mono text-xs font-semibold text-charcoal capitalize">{d.type} #{d.documentNumber}</p>
                            <p className="font-sans text-[10px] text-gray-400">{d.clientName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-charcoal">${d.total}</span>
                            <span className="px-2 py-0.5 text-[9px] font-mono rounded-full bg-gray-100 text-gray-500">{d.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Expenses */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader><CardTitle className="font-headline text-sm text-charcoal">Expenses</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  {projExpenses.length === 0 ? (
                    <p className="font-sans text-xs text-gray-400">No expenses logged. Add them from the Expenses & Income panel.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {projExpenses.map((e) => (
                        <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="font-sans text-xs font-medium text-charcoal">{e.description}</p>
                            <p className="font-mono text-[10px] text-gray-400">{e.category} · {new Date(e.date).toLocaleDateString("en-CA")}</p>
                          </div>
                          <span className="font-mono text-xs font-bold text-red-500">-${parseFloat(e.amount).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Income */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader><CardTitle className="font-headline text-sm text-charcoal">Income</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  {projIncome.length === 0 ? (
                    <p className="font-sans text-xs text-gray-400">No income logged. Add them from the Expenses & Income panel.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {projIncome.map((i) => (
                        <div key={i.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="font-sans text-xs font-medium text-charcoal">{i.description}</p>
                            <p className="font-mono text-[10px] text-gray-400">{i.serviceType || "—"} · {new Date(i.date).toLocaleDateString("en-CA")}</p>
                          </div>
                          <span className="font-mono text-xs font-bold text-green-600">+${parseFloat(i.amount).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
      {/* Quick-add expense modal */}
      {showExpModal && selectedId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-headline font-bold text-base text-charcoal">Add Expense / Material</h3>
              <button onClick={() => setShowExpModal(false)} className="text-gray-400 hover:text-charcoal cursor-pointer"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Category</Label>
                  <select value={expForm.category} onChange={(e) => setExpForm((p) => ({ ...p, category: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-gold cursor-pointer">
                    {["material","labor","subcontractor","equipment","fuel","other"].map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Amount ($) *</Label>
                  <Input type="number" value={expForm.amount} onChange={(e) => setExpForm((p) => ({ ...p, amount: e.target.value }))} placeholder="0.00" className="border-gray-200 rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Description *</Label>
                <Input value={expForm.description} onChange={(e) => setExpForm((p) => ({ ...p, description: e.target.value }))} placeholder="What was purchased / work done" className="border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Vendor / Supplier</Label>
                <Input value={expForm.vendor} onChange={(e) => setExpForm((p) => ({ ...p, vendor: e.target.value }))} placeholder="Home Depot, subcontractor name…" className="border-gray-200 rounded-xl text-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <Button onClick={() => setShowExpModal(false)} variant="ghost" className="text-gray-400 text-sm">Cancel</Button>
              <Button onClick={handleQuickExpense} disabled={!expForm.description || !expForm.amount} className="bg-red-500 text-white hover:bg-red-600 text-xs h-9 px-5 rounded-xl shadow-none">
                Save Expense
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Bill modal */}
      {showAddToBill && selectedId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-headline font-bold text-base text-charcoal">Add to Bill</h3>
              <button onClick={() => setShowAddToBill(false)} className="text-gray-400 hover:text-charcoal cursor-pointer"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              {/* Pick billing document */}
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Billing Document *</Label>
                {projDocs.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs font-sans text-amber-700">
                    No billing documents linked to this project yet. Create one in the Billing panel and link it to this project's client.
                  </div>
                ) : (
                  <select
                    value={addToBillDocId}
                    onChange={(e) => setAddToBillDocId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-gold cursor-pointer">
                    <option value="">— Select document —</option>
                    {projDocs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.type} #{d.documentNumber} — {d.clientName} — ${parseFloat(d.total || "0").toFixed(2)} ({d.status})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Add-on type */}
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2 block">Add-on Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { id: "income",  label: "Payment",  color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                    { id: "expense", label: "Expense",  color: "bg-red-50 text-red-600 border-red-200" },
                    { id: "labor",   label: "Labor",    color: "bg-amber-50 text-amber-700 border-amber-200" },
                    { id: "custom",  label: "Custom",   color: "bg-blue-50 text-blue-600 border-blue-200" },
                  ] as const).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setAddToBillType(t.id)}
                      className={`py-2 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${addToBillType === t.id ? t.color + " ring-2 ring-offset-1 ring-gold/40" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick-fill from income/expense shortcuts */}
              {addToBillType === "labor" && assignedEmpIds.length > 0 && (
                <div>
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Quick-fill from Team</Label>
                  <div className="flex flex-wrap gap-2">
                    {assignedEmpIds.map((empId) => {
                      const empH = projHours.filter((h) => h.employeeId === empId);
                      const name = allEmployees?.find((e) => e.id === empId);
                      const hrs = empH.reduce((s, h) => s + parseFloat(h.hours || "0"), 0);
                      const cost = empH.reduce((s, h) => s + parseFloat(h.totalCost || "0"), 0);
                      const displayName = name ? `${name.firstName} ${name.lastName}` : (empH[0]?.employeeName ?? "Unknown");
                      return (
                        <button
                          key={empId}
                          onClick={() => setAddToBillForm({ description: `Labor — ${displayName}`, amount: (cost / (hrs || 1)).toFixed(2), qty: hrs.toFixed(1), unit: "hrs" })}
                          className="px-3 py-1.5 text-xs font-sans bg-gray-50 border border-gray-200 rounded-xl hover:border-charcoal cursor-pointer">
                          {displayName} ({hrs.toFixed(1)}h · ${cost.toFixed(2)})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {addToBillType === "expense" && projExpenses.length > 0 && (
                <div>
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Quick-fill from Expenses</Label>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {projExpenses.slice(0, 8).map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setAddToBillForm({ description: e.description, amount: e.amount, qty: "1", unit: "unit" })}
                        className="px-3 py-1.5 text-xs font-sans bg-gray-50 border border-gray-200 rounded-xl hover:border-charcoal cursor-pointer">
                        {e.description} (${parseFloat(e.amount).toFixed(2)})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Line item fields */}
              <div className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3 bg-gray-50">
                <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">New Line Item</p>
                <div>
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Description *</Label>
                  <Input
                    value={addToBillForm.description}
                    onChange={(e) => setAddToBillForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder={addToBillType === "income" ? "Deposit received, payment…" : addToBillType === "labor" ? "Labor — employee name" : "Description"}
                    className="border-gray-200 rounded-xl text-sm bg-white" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Qty</Label>
                    <Input type="number" step="0.5" value={addToBillForm.qty}
                      onChange={(e) => setAddToBillForm((p) => ({ ...p, qty: e.target.value }))}
                      className="border-gray-200 rounded-xl text-sm bg-white" />
                  </div>
                  <div>
                    <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Unit</Label>
                    <select value={addToBillForm.unit} onChange={(e) => setAddToBillForm((p) => ({ ...p, unit: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-gold cursor-pointer">
                      {["unit","hrs","m²","m³","sqft","visit","month","set"].map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Unit Price ($)</Label>
                    <Input type="number" step="0.01" value={addToBillForm.amount}
                      onChange={(e) => setAddToBillForm((p) => ({ ...p, amount: e.target.value }))}
                      placeholder="0.00" className="border-gray-200 rounded-xl text-sm bg-white" />
                  </div>
                </div>
                {addToBillForm.amount && addToBillForm.qty && (
                  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5">
                    <span className="font-sans text-xs text-gray-500">Line total</span>
                    <span className="font-mono text-sm font-bold text-charcoal">
                      ${(parseFloat(addToBillForm.qty || "1") * parseFloat(addToBillForm.amount || "0")).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <Button onClick={() => setShowAddToBill(false)} variant="ghost" className="text-gray-400 text-sm">Cancel</Button>
              <Button
                onClick={handleAddToBill}
                disabled={!addToBillDocId || !addToBillForm.description || !addToBillForm.amount || projDocs.length === 0}
                className="bg-gold text-charcoal hover:bg-gold-dark text-xs h-9 px-5 rounded-xl shadow-none">
                Add to Bill
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign employee modal */}
      {showAssignModal && selectedId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-headline font-bold text-base text-charcoal">Assign Employee / Log Hours</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-charcoal cursor-pointer"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Employee *</Label>
                <select value={assignForm.employeeId} onChange={(e) => {
                  const emp = allEmployees?.find((em) => em.id === e.target.value);
                  setAssignForm((p) => ({ ...p, employeeId: e.target.value, costPerHour: emp?.hourlyRate || "35" }));
                }} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-gold cursor-pointer">
                  <option value="">— Select employee —</option>
                  {(allEmployees ?? []).map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} — {e.role}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Hours</Label>
                  <Input type="number" step="0.5" value={assignForm.hours} onChange={(e) => setAssignForm((p) => ({ ...p, hours: e.target.value }))} className="border-gray-200 rounded-xl text-sm" />
                </div>
                <div>
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">$/hr</Label>
                  <Input type="number" value={assignForm.costPerHour} onChange={(e) => setAssignForm((p) => ({ ...p, costPerHour: e.target.value }))} className="border-gray-200 rounded-xl text-sm" />
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                <span className="font-mono text-sm font-bold text-charcoal">${(parseFloat(assignForm.hours || "0") * parseFloat(assignForm.costPerHour || "0")).toFixed(2)}</span>
                <span className="font-sans text-xs text-gray-400 ml-2">total labor cost</span>
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Notes</Label>
                <Input value={assignForm.notes} onChange={(e) => setAssignForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Work performed…" className="border-gray-200 rounded-xl text-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <Button onClick={() => setShowAssignModal(false)} variant="ghost" className="text-gray-400 text-sm">Cancel</Button>
              <Button onClick={handleAssignEmployee} disabled={!assignForm.employeeId} className="bg-charcoal text-warm-white hover:bg-charcoal/80 text-xs h-9 px-5 rounded-xl shadow-none">
                Assign & Log Hours
              </Button>
            </div>
          </div>
        </div>
      )}

        </div>
      )}

      {/* List */}
      {activeView === "list" && (
        <>
          {!projects || projects.length === 0 ? (
            <EmptyState label="No projects yet. Click 'Add Project' to get started." />
          ) : (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {projects.map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                      <button onClick={() => { setSelectedId(p.id); setActiveView("detail"); setDetailTab("overview"); }}
                        className="flex items-center gap-4 flex-1 text-left cursor-pointer focus:outline-none min-w-0">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {p.src
                            ? <img src={p.src} alt={p.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Briefcase size={15} className="text-gray-400" /></div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-sans font-medium text-sm text-charcoal truncate">{p.title}</p>
                          <p className="font-mono text-[10px] text-gray-400">{p.category} · {p.year}{p.clientName ? ` · ${p.clientName}` : ""}</p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        {p.status && <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full hidden sm:block ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-500"}`}>{p.status}</span>}
                        <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-charcoal group transition-colors cursor-pointer focus:outline-none">
                          <PencilSimple size={13} weight="regular" className="text-gray-500 group-hover:text-white" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} disabled={isMutating}
                          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-red-600 group transition-colors cursor-pointer focus:outline-none disabled:opacity-50">
                          <Trash size={13} weight="regular" className="text-gray-500 group-hover:text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

/* ── Panel: Clients ── */
const EMPTY_CLIENT = {
  contactPerson: "", companyName: "", status: "active",
  email: "", phone: "", address: "", city: "",
  portalAccess: "no", serviceInterest: "", notes: "",
};
type ClientForm = typeof EMPTY_CLIENT;

function ClientsPanel() {
  const { data: clients, isPending, error } = useQuery("Client", { orderBy: { contactPerson: "asc" } });
  const { data: allProjects } = useQuery("Project", { orderBy: { createdAt: "desc" } });
  const { data: allNotes }    = useQuery("ClientNote", { orderBy: { createdAt: "desc" } });
  const { data: allDocs }     = useQuery("BillingDocument", { orderBy: { createdAt: "desc" } });
  const { data: allOrders }   = useQuery("Order",           { orderBy: { createdAt: "desc" } });
  const { data: allLeads }    = useQuery("Lead",            { orderBy: { createdAt: "desc" } });
  const { data: allMessages } = useQuery("ChatMessage",     { orderBy: { createdAt: "desc" } });
  const { data: allServiceDocs } = useQuery("BillingDocument", { orderBy: { createdAt: "desc" } });
  const { create: createClientNote, remove: removeClientNote } = useMutation("ClientNote");
  const { create, update, remove, isPending: isMutating } = useMutation("Client");

  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<null | (ClientForm & { id?: string })>(null);
  const [form, setForm]             = useState<ClientForm>(EMPTY_CLIENT);
  const [saved, setSaved]           = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"list" | "detail">("list");
  const [clientDetailTab, setClientDetailTab] = useState<"info" | "projects" | "billing" | "store" | "activity" | "notes">("info");
  const [clientNoteDraft, setClientNoteDraft] = useState("");

  if (isPending) return <PanelLoader />;
  if (error)     return <PanelError message={error.message} />;

  const selected       = clients?.find((c) => c.id === selectedId);
  const clientProjects = allProjects?.filter((p) => p.clientId === selectedId) ?? [];
  const clientNotes    = allNotes?.filter((n) => n.clientId === selectedId) ?? [];
  const clientDocsBilling = allDocs?.filter((d) => selected && (d.clientName === selected.contactPerson || d.clientName === selected.companyName)) ?? [];
  const totalBilled    = clientDocsBilling.filter((d) => d.type === "invoice").reduce((s, d) => s + parseFloat(d.total || "0"), 0);
  // Match orders by name/email
  const clientOrders = allOrders?.filter((o) => selected && (o.customerName === selected.contactPerson || o.customerName === selected.companyName || o.customerEmail === selected.email)) ?? [];
  const totalOrderValue = clientOrders.reduce((s, o) => s + (o.total || 0), 0);
  // Match leads by name/email
  const clientLeads = allLeads?.filter((l) => selected && (l.name === selected.contactPerson || l.email === selected.email)) ?? [];
  // Match chat messages by name/email
  const clientMessages = allMessages?.filter((m) => selected && (m.senderName === selected.contactPerson || m.senderEmail === selected.email)) ?? [];
  // Subscription docs (billing type = subscription)
  const clientSubscriptions = (allServiceDocs ?? []).filter((d) => selected && (d.clientName === selected.contactPerson) && (d as any).billingSource === "subscription");

  const openAdd  = () => { setEditing(null); setForm(EMPTY_CLIENT); setShowForm(true); };
  const openEdit = (c: any) => { setEditing(c); setForm({ ...EMPTY_CLIENT, ...c }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (editing?.id) await update(editing.id, payload);
      else             await create(payload);
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      closeForm();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    if (selectedId === id) { setSelectedId(null); setActiveView("list"); }
  };

  const handleAddClientNote = async () => {
    if (!clientNoteDraft.trim() || !selectedId || !selected) return;
    await createClientNote({ clientId: selectedId, clientName: selected.contactPerson, content: clientNoteDraft.trim(), authorName: "Admin" });
    setClientNoteDraft("");
  };

  const statusColor = (s: string) =>
    s === "active" ? "bg-green-100 text-green-700" :
    s === "prospect" ? "bg-amber-100 text-amber-700" :
    s === "vip" ? "bg-purple-100 text-purple-700" :
    "bg-gray-100 text-gray-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">Clients</h1>
          <p className="font-sans text-sm text-gray-500 mt-0.5">Manage client records, projects, and portal access.</p>
        </div>
        <Button onClick={openAdd} className="bg-charcoal text-warm-white hover:bg-charcoal/80 text-xs h-9 px-4 rounded-xl shadow-none flex items-center gap-2">
          <span className="text-base leading-none">+</span> Add Client
        </Button>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-headline font-bold text-base text-charcoal">{editing ? "Edit Client" : "Add Client"}</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-charcoal cursor-pointer focus:outline-none"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              {([
                ["contactPerson", "Contact Person *"],
                ["companyName",   "Company / Household Name"],
                ["email",         "Email"],
                ["phone",         "Phone"],
                ["address",       "Street Address"],
                ["city",          "City"],
                ["serviceInterest","Service Interest"],
              ] as [keyof ClientForm, string][]).map(([field, label]) => (
                <div key={field} className={field === "address" || field === "serviceInterest" ? "col-span-2" : ""}>
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">{label}</Label>
                  <Input value={form[field] as string} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                    className="border-gray-200 rounded-xl text-sm" />
                </div>
              ))}
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Status</Label>
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold bg-white">
                  {["active","prospect","vip","inactive","archived"].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Portal Access</Label>
                <select value={form.portalAccess} onChange={(e) => setForm((p) => ({ ...p, portalAccess: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold bg-white">
                  <option value="yes">Yes – Grant access</option>
                  <option value="no">No – No access</option>
                </select>
              </div>
              <div className="col-span-2">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Internal Notes</Label>
                <textarea value={form.notes || ""} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <Button onClick={closeForm} variant="ghost" className="text-gray-400 text-sm">Cancel</Button>
              <div className="flex items-center gap-3">
                {saved && <span className="text-xs text-green-600 font-sans flex items-center gap-1"><CheckCircle size={12} weight="fill" /> Saved</span>}
                <Button onClick={handleSave} disabled={isMutating || !form.contactPerson.trim()}
                  className="bg-gold text-charcoal hover:bg-gold-dark text-xs h-9 px-5 rounded-xl shadow-none">
                  {isMutating ? <Spinner size={14} className="animate-spin" /> : editing ? "Save Changes" : "Add Client"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail view */}
      {activeView === "detail" && selected && (
        <div>
          <button onClick={() => { setActiveView("list"); setClientDetailTab("info"); }} className="text-xs font-mono text-gray-400 hover:text-charcoal mb-5 flex items-center gap-1 cursor-pointer focus:outline-none">
            ← Back to clients
          </button>
          {/* Header card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-5 flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                <span className="font-headline font-bold text-2xl text-gold">{selected.contactPerson[0]}</span>
              </div>
              <div>
                <h2 className="font-headline font-bold text-xl text-charcoal">{selected.contactPerson}</h2>
                {selected.companyName && <p className="font-sans text-sm text-gray-500">{selected.companyName}</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`px-2.5 py-1 text-[10px] font-mono rounded-full ${statusColor(selected.status)}`}>{selected.status}</span>
                  {selected.portalAccess === "yes" && <span className="px-2.5 py-1 text-[10px] font-mono rounded-full bg-blue-100 text-blue-600">Portal Access</span>}
                  {selected.serviceInterest && <span className="px-2.5 py-1 text-[10px] font-mono rounded-full bg-gray-100 text-gray-500">{selected.serviceInterest}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-charcoal">${totalBilled.toFixed(0)} billed</span>
              <button onClick={() => openEdit(selected)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-gray-200 rounded-xl hover:border-charcoal transition-colors cursor-pointer focus:outline-none">
                <PencilSimple size={12} /> Edit
              </button>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
            {(["info","projects","billing","store","activity","notes"] as const).map((tab) => (
              <button key={tab} onClick={() => setClientDetailTab(tab)}
                className={`px-4 py-1.5 text-xs font-sans font-medium rounded-lg transition-all cursor-pointer capitalize ${clientDetailTab === tab ? "bg-white text-charcoal shadow-sm" : "text-gray-500 hover:text-charcoal"}`}>
                {tab}{tab === "store" && clientOrders.length > 0 ? ` (${clientOrders.length})` : ""}{tab === "activity" && (clientLeads.length + clientMessages.length) > 0 ? ` (${clientLeads.length + clientMessages.length})` : ""}
              </button>
            ))}
          </div>

          {/* Info tab */}
          {clientDetailTab === "info" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader><CardTitle className="font-headline text-sm text-charcoal">Contact Details</CardTitle></CardHeader>
                <CardContent className="pt-0 flex flex-col gap-3">
                  {[
                    ["Email",   selected.email],
                    ["Phone",   selected.phone],
                    ["Address", selected.address],
                    ["City",    selected.city],
                  ].filter(([, v]) => v).map(([l, v]) => (
                    <div key={l as string}>
                      <p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">{l as string}</p>
                      <p className="font-sans text-sm text-charcoal">{v as string}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              {selected.notes && (
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader><CardTitle className="font-headline text-sm text-charcoal">Internal Notes</CardTitle></CardHeader>
                  <CardContent className="pt-0"><p className="font-sans text-sm text-gray-600 leading-relaxed">{selected.notes}</p></CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Projects tab */}
          {clientDetailTab === "projects" && (
            <div className="flex flex-col gap-3">
              {clientProjects.length === 0 ? (
                <EmptyState label="No projects linked to this client yet. Create a project and select this client." />
              ) : (
                clientProjects.map((p) => (
                  <div key={p.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      {p.src && <img src={p.src} alt={p.title} className="w-10 h-10 rounded-lg object-cover" />}
                      <div>
                        <p className="font-sans font-medium text-sm text-charcoal">{p.title}</p>
                        <p className="font-mono text-[10px] text-gray-400">{p.category} · {p.year}{p.budget ? ` · ${p.budget}` : ""}</p>
                      </div>
                    </div>
                    {p.status && <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-gray-100 text-gray-500">{p.status}</span>}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Billing tab */}
          {clientDetailTab === "billing" && (
            <div className="flex flex-col gap-3">
              {clientDocsBilling.length === 0 ? (
                <EmptyState label="No billing documents for this client yet." />
              ) : (
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardContent className="p-0">
                    {clientDocsBilling.map((d) => (
                      <div key={d.id} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="font-mono text-xs font-semibold text-charcoal capitalize">{d.type} #{d.documentNumber}</p>
                          <p className="font-sans text-[10px] text-gray-400">{new Date(d.createdAt).toLocaleDateString("en-CA")}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-charcoal">${d.total}</span>
                          <span className="px-2 py-0.5 text-[9px] font-mono rounded-full bg-gray-100 text-gray-500">{d.status}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Store tab */}
          {clientDetailTab === "store" && (
            <div className="flex flex-col gap-4">
              {/* Orders summary */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-white border-gray-200 shadow-sm"><CardContent className="p-4">
                  <p className="font-mono text-lg font-bold text-charcoal">{clientOrders.length}</p>
                  <p className="font-sans text-[10px] text-gray-400">Store Orders</p>
                </CardContent></Card>
                <Card className="bg-white border-gray-200 shadow-sm"><CardContent className="p-4">
                  <p className="font-mono text-lg font-bold text-emerald-600">${totalOrderValue.toFixed(2)}</p>
                  <p className="font-sans text-[10px] text-gray-400">Total Spent (Store)</p>
                </CardContent></Card>
                <Card className="bg-white border-gray-200 shadow-sm"><CardContent className="p-4">
                  <p className="font-mono text-lg font-bold text-blue-600">{clientSubscriptions.length}</p>
                  <p className="font-sans text-[10px] text-gray-400">Active Subscriptions</p>
                </CardContent></Card>
              </div>

              {/* Orders list */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader><CardTitle className="font-headline text-sm text-charcoal">Store Orders</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  {clientOrders.length === 0 ? (
                    <p className="font-sans text-xs text-gray-400">No store orders found for this client.</p>
                  ) : clientOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-mono text-xs font-semibold text-charcoal">#{o.orderNumber}</p>
                        <p className="font-sans text-[10px] text-gray-400">{new Date(o.createdAt).toLocaleDateString("en-CA")} · {o.source || "store"}</p>
                        <p className="font-sans text-[10px] text-gray-500 mt-0.5">{(() => { try { return JSON.parse(o.items).map((i: any) => i.name).join(", "); } catch { return o.items?.slice(0, 60) ?? "—"; } })()}</p>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        <span className="font-mono text-xs font-bold text-charcoal">${o.total?.toFixed(2)}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full ${o.status === "paid" || o.status === "fulfilled" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-600"}`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Subscriptions */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader><CardTitle className="font-headline text-sm text-charcoal">Subscriptions / Service Plans</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  {clientSubscriptions.length === 0 ? (
                    <p className="font-sans text-xs text-gray-400">No subscription billing documents for this client.</p>
                  ) : clientSubscriptions.map((d) => (
                    <div key={d.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-mono text-xs font-semibold text-charcoal">{d.type} #{d.documentNumber}</p>
                        <p className="font-sans text-[10px] text-gray-400">{new Date(d.createdAt).toLocaleDateString("en-CA")}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-charcoal">${d.total}</span>
                        <span className="px-2 py-0.5 text-[9px] font-mono rounded-full bg-blue-100 text-blue-600">{d.status}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Activity tab */}
          {clientDetailTab === "activity" && (
            <div className="flex flex-col gap-4">
              {/* Leads from this client */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader><CardTitle className="font-headline text-sm text-charcoal flex items-center gap-2">Leads / CRM <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{clientLeads.length}</span></CardTitle></CardHeader>
                <CardContent className="pt-0">
                  {clientLeads.length === 0 ? (
                    <p className="font-sans text-xs text-gray-400">No leads linked to this client yet.</p>
                  ) : clientLeads.map((l) => (
                    <div key={l.id} className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-sans text-xs font-medium text-charcoal">{l.serviceInterest || "General Inquiry"}</p>
                        <p className="font-sans text-[10px] text-gray-400">{l.source || "web"} · {new Date(l.createdAt).toLocaleDateString("en-CA")}</p>
                        {l.message && <p className="font-sans text-[10px] text-gray-500 mt-0.5 italic">"{l.message.slice(0, 80)}{l.message.length > 80 ? "…" : ""}"</p>}
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full flex-shrink-0 ml-2 ${l.status === "won" ? "bg-emerald-100 text-emerald-700" : l.status === "new" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>{l.status}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Chat messages from this client */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader><CardTitle className="font-headline text-sm text-charcoal flex items-center gap-2">AI Chat / Portal Messages <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{clientMessages.length}</span></CardTitle></CardHeader>
                <CardContent className="pt-0">
                  {clientMessages.length === 0 ? (
                    <p className="font-sans text-xs text-gray-400">No chat messages from this client yet.</p>
                  ) : clientMessages.slice(0, 6).map((m) => (
                    <div key={m.id} className="py-2.5 border-b border-gray-50 last:border-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-mono text-[10px] text-gray-400">{new Date(m.createdAt).toLocaleString("en-CA")}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full ${m.senderType === "client" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>{m.senderType}</span>
                      </div>
                      <p className="font-sans text-xs text-charcoal">{m.message.slice(0, 120)}{m.message.length > 120 ? "…" : ""}</p>
                    </div>
                  ))}
                  {clientMessages.length > 6 && <p className="font-mono text-[10px] text-gray-400 pt-2">+{clientMessages.length - 6} more messages</p>}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notes tab */}
          {clientDetailTab === "notes" && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <textarea value={clientNoteDraft} onChange={(e) => setClientNoteDraft(e.target.value)}
                  placeholder="Add a note about this client…"
                  rows={2} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold resize-none" />
                <Button onClick={handleAddClientNote} disabled={!clientNoteDraft.trim()} className="bg-charcoal text-warm-white text-xs px-4 rounded-xl shadow-none self-end h-9">Add</Button>
              </div>
              {clientNotes.length === 0 ? <EmptyState label="No notes yet." /> : (
                <div className="flex flex-col gap-3">
                  {clientNotes.map((n) => (
                    <div key={n.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-start justify-between gap-3 shadow-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm text-charcoal leading-relaxed">{n.content}</p>
                        <p className="font-mono text-[10px] text-gray-400 mt-1.5">{n.authorName} · {new Date(n.createdAt).toLocaleString("en-CA")}</p>
                      </div>
                      <button onClick={() => removeClientNote(n.id)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-red-600 group transition-colors cursor-pointer focus:outline-none flex-shrink-0">
                        <Trash size={11} weight="regular" className="text-gray-400 group-hover:text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* List */}
      {activeView === "list" && (
        <>
          {!clients || clients.length === 0 ? (
            <EmptyState label="No clients yet. Click 'Add Client' to get started." />
          ) : (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {clients.map((c) => (
                    <div key={c.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                      <button onClick={() => { setSelectedId(c.id); setActiveView("detail"); setClientDetailTab("info"); }}
                        className="flex items-center gap-4 flex-1 text-left cursor-pointer focus:outline-none min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                          <span className="font-headline font-bold text-xs text-gold">{c.contactPerson[0]}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-sans font-medium text-sm text-charcoal">{c.contactPerson}</p>
                          <p className="font-mono text-[10px] text-gray-400">{c.companyName || c.email || c.city || "—"}</p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <span className={`px-2.5 py-1 text-[10px] font-mono rounded-full hidden sm:block ${statusColor(c.status)}`}>{c.status}</span>
                        {c.portalAccess === "yes" && <span className="px-2 py-0.5 text-[9px] font-mono rounded-full bg-blue-100 text-blue-500 hidden md:block">Portal</span>}
                        <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-charcoal group transition-colors cursor-pointer focus:outline-none">
                          <PencilSimple size={13} weight="regular" className="text-gray-500 group-hover:text-white" />
                        </button>
                        <button onClick={() => handleDelete(c.id)} disabled={isMutating}
                          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-red-600 group transition-colors cursor-pointer focus:outline-none disabled:opacity-50">
                          <Trash size={13} weight="regular" className="text-gray-500 group-hover:text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

/* ── Panel: Employees ── */
const EMPTY_EMP = {
  firstName: "", lastName: "", role: "", email: "", phone: "",
  address: "", roleLevel: "employee", hourlyRate: "", startDate: new Date(),
  bio: "", portalAccess: false,
};
function EmployeesPanel() {
  const { data: employees, isPending, error } = useQuery("Employee", { orderBy: { lastName: "asc" } });
  const { data: projects } = useQuery("Project");
  const { data: hours }    = useQuery("HourEntry");
  const { create, update, remove, isPending: isMutating } = useMutation("Employee");

  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<null | (typeof EMPTY_EMP & { id?: string })>(null);
  const [form, setForm]           = useState(EMPTY_EMP);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saved, setSaved]         = useState(false);
  const [activeView, setActiveView] = useState<"list"|"detail">("list");

  const openAdd  = () => { setEditing(null); setForm(EMPTY_EMP); setShowForm(true); };
  const openEdit = (e: any) => { setEditing(e); setForm({ ...e, startDate: new Date(e.startDate) }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (editing?.id) await update(editing.id, payload);
      else             await create(payload);
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      closeForm();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    if (selectedId === id) { setSelectedId(null); setActiveView("list"); }
  };

  const selected = employees?.find((e) => e.id === selectedId);
  const empHours = hours?.filter((h) => h.employeeId === selectedId) ?? [];
  const totalHrs = empHours.reduce((s, h) => s + parseFloat(h.hours || "0"), 0);
  const totalCost = empHours.reduce((s, h) => s + parseFloat(h.totalCost || "0"), 0);

  const roleBadge = (level: string) => {
    const map: Record<string, string> = {
      admin: "bg-purple-100 text-purple-700", manager: "bg-blue-100 text-blue-700",
      foreman: "bg-amber-100 text-amber-700", employee: "bg-green-100 text-green-700",
    };
    return map[level] ?? "bg-gray-100 text-gray-500";
  };

  if (isPending) return <PanelLoader />;
  if (error)     return <PanelError message={error.message} />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">Employees</h1>
          <p className="font-sans text-sm text-gray-500 mt-0.5">Staff directory, salaries & project assignments.</p>
        </div>
        <Button onClick={openAdd} className="bg-charcoal text-warm-white hover:bg-charcoal/80 text-xs h-9 px-4 rounded-xl shadow-none flex items-center gap-2">
          <span className="text-base leading-none">+</span> Add Employee
        </Button>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-headline font-bold text-base text-charcoal">{editing ? "Edit Employee" : "Add Employee"}</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-charcoal cursor-pointer focus:outline-none"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              {([
                ["firstName","First Name"],["lastName","Last Name"],
                ["email","Email"],["phone","Phone"],
                ["role","Title / Role"],["roleLevel","Role Level"],
                ["hourlyRate","Hourly Rate ($)"],["address","Address"],
              ] as [keyof typeof form, string][]).map(([field, label]) => (
                <div key={field} className={field === "address" ? "col-span-2" : ""}>
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">{label}</Label>
                  {field === "roleLevel" ? (
                    <select value={form.roleLevel as string}
                      onChange={(e) => setForm((p) => ({ ...p, roleLevel: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold">
                      {["admin","manager","foreman","employee","contractor"].map((r) => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>
                      ))}
                    </select>
                  ) : (
                    <Input value={form[field] as string}
                      onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                      className="border-gray-200 rounded-xl text-sm" />
                  )}
                </div>
              ))}
              <div className="col-span-2">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Start Date</Label>
                <Input type="date" value={form.startDate instanceof Date ? form.startDate.toISOString().split("T")[0] : ""}
                  onChange={(e) => setForm((p) => ({ ...p, startDate: new Date(e.target.value) }))}
                  className="border-gray-200 rounded-xl text-sm" />
              </div>
              <div className="col-span-2">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Bio / Notes</Label>
                <textarea value={form.bio || ""}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold resize-none" />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <input type="checkbox" id="portalAccess" checked={form.portalAccess}
                  onChange={(e) => setForm((p) => ({ ...p, portalAccess: e.target.checked }))}
                  className="w-4 h-4 accent-gold cursor-pointer" />
                <label htmlFor="portalAccess" className="font-sans text-sm text-charcoal cursor-pointer">Grant Portal Access</label>
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <Button onClick={closeForm} variant="ghost" className="text-gray-400 text-sm">Cancel</Button>
              <div className="flex items-center gap-3">
                {saved && <span className="text-xs text-green-600 font-sans flex items-center gap-1"><CheckCircle size={12} weight="fill" /> Saved</span>}
                <Button onClick={handleSave} disabled={isMutating} className="bg-gold text-charcoal hover:bg-gold-dark text-xs h-9 px-5 rounded-xl shadow-none">
                  {isMutating ? <Spinner size={14} className="animate-spin" /> : editing ? "Save Changes" : "Add Employee"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {activeView === "detail" && selected && (
        <div className="mb-6">
          <button onClick={() => setActiveView("list")} className="text-xs font-mono text-gray-400 hover:text-charcoal mb-4 flex items-center gap-1 cursor-pointer focus:outline-none">
            ← Back to list
          </button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Profile card */}
            <Card className="bg-white border-gray-200 shadow-sm col-span-1">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
                  <span className="font-headline font-bold text-2xl text-gold">{selected.firstName[0]}{selected.lastName[0]}</span>
                </div>
                <h2 className="font-headline font-bold text-charcoal">{selected.firstName} {selected.lastName}</h2>
                <p className="font-sans text-xs text-gray-500 mt-0.5">{selected.role}</p>
                <span className={`mt-2 px-2.5 py-1 text-[10px] font-mono rounded-full ${roleBadge(selected.roleLevel)}`}>{selected.roleLevel}</span>
                <div className="w-full mt-5 flex flex-col gap-2 text-left">
                  {[["Email", selected.email],["Phone", selected.phone],["Address", selected.address]].map(([l,v]) => v ? (
                    <div key={l}><p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">{l}</p><p className="font-sans text-xs text-charcoal">{v}</p></div>
                  ) : null)}
                  <div><p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">Hourly Rate</p><p className="font-sans text-xs text-charcoal font-semibold">${selected.hourlyRate}/hr</p></div>
                  <div><p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">Started</p><p className="font-sans text-xs text-charcoal">{new Date(selected.startDate).toLocaleDateString()}</p></div>
                  {selected.portalAccess && <span className="px-2 py-0.5 text-[9px] font-mono bg-blue-50 text-blue-600 rounded-full w-fit">Portal Access</span>}
                </div>
                <button onClick={() => openEdit(selected)} className="mt-5 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-sans border border-gray-200 rounded-xl hover:border-charcoal transition-colors cursor-pointer focus:outline-none">
                  <PencilSimple size={13} /> Edit Profile
                </button>
              </CardContent>
            </Card>
            {/* Stats + hours */}
            <div className="col-span-2 flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3">
                {[["Total Hours", totalHrs.toFixed(1) + " hrs"],["Labor Cost", "$" + totalCost.toFixed(2)],["Logged Entries", empHours.length]].map(([l,v]) => (
                  <Card key={l} className="bg-white border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      <p className="font-mono text-lg font-semibold text-charcoal">{v}</p>
                      <p className="font-sans text-[10px] text-gray-400">{l}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Assigned projects */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader><CardTitle className="font-headline text-sm text-charcoal">Project Assignments</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  {empHours.length === 0 ? (
                    <p className="font-sans text-xs text-gray-400">No hours logged yet.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {Object.entries(empHours.reduce<Record<string,{hrs:number,cost:number}>>((acc,h) => {
                        if (!acc[h.projectName]) acc[h.projectName] = { hrs:0, cost:0 };
                        acc[h.projectName].hrs  += parseFloat(h.hours||"0");
                        acc[h.projectName].cost += parseFloat(h.totalCost||"0");
                        return acc;
                      }, {})).map(([proj, stat]) => (
                        <div key={proj} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <p className="font-sans text-xs text-charcoal">{proj}</p>
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-[10px] text-gray-400">{stat.hrs.toFixed(1)} hrs</span>
                            <span className="font-mono text-[10px] font-semibold text-charcoal">${stat.cost.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              {selected.bio && (
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader><CardTitle className="font-headline text-sm text-charcoal">Bio</CardTitle></CardHeader>
                  <CardContent className="pt-0"><p className="font-sans text-sm text-gray-600">{selected.bio}</p></CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {(activeView === "list" || !selected) && (
        <>
          {!employees || employees.length === 0 ? (
            <EmptyState label="No employees yet. Click 'Add Employee' to get started." />
          ) : (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {employees.map((e) => (
                    <div key={e.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                      <button onClick={() => { setSelectedId(e.id); setActiveView("detail"); }} className="flex items-center gap-4 flex-1 text-left cursor-pointer focus:outline-none min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                          <span className="font-headline font-bold text-xs text-gold">{e.firstName[0]}{e.lastName[0]}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-sans font-medium text-sm text-charcoal">{e.firstName} {e.lastName}</p>
                          <p className="font-mono text-[10px] text-gray-400">{e.role} · {e.email}</p>
                        </div>
                      </button>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <span className={`px-2.5 py-1 text-[10px] font-mono rounded-full hidden sm:block ${roleBadge(e.roleLevel)}`}>{e.roleLevel}</span>
                        {e.hourlyRate && <span className="font-mono text-xs text-gray-500 hidden md:block">${e.hourlyRate}/hr</span>}
                        <button onClick={() => openEdit(e)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-charcoal group transition-colors cursor-pointer focus:outline-none">
                          <PencilSimple size={13} weight="regular" className="text-gray-500 group-hover:text-white" />
                        </button>
                        <button onClick={() => handleDelete(e.id)} disabled={isMutating} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-red-600 group transition-colors cursor-pointer focus:outline-none disabled:opacity-50">
                          <Trash size={13} weight="regular" className="text-gray-500 group-hover:text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

/* ── Panel: Media Manager ── */
function MediaPanel() {
  const { data: assets, isPending, error } = useQuery("MediaAsset", { orderBy: { createdAt: "desc" } });
  const { create, remove, isPending: isMutating } = useMutation("MediaAsset");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filter, setFilter]       = useState("All");
  const [uploading, setUploading] = useState(false);
  const [urlMode, setUrlMode]     = useState(false);
  const [urlInput, setUrlInput]   = useState("");
  const [urlName, setUrlName]     = useState("");
  const [dragOver, setDragOver]   = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const CATEGORIES = ["All", "Image", "Video", "3D", "Texture", "Document", "Other"];

  const guessType = (name: string, mime: string): string => {
    if (mime.startsWith("video/")) return "Video";
    if (mime.startsWith("image/")) return "Image";
    if (/\.(glb|gltf|obj|fbx|stl)$/i.test(name)) return "3D";
    if (/\.(hdr|exr|png|jpg|jpeg|webp|avif)$/i.test(name)) return "Image";
    if (/\.(pdf|doc|docx|xls|xlsx)$/i.test(name)) return "Document";
    return "Other";
  };

  const typeEmoji = (t: string) => {
    const map: Record<string,string> = { Video:"🎬", Image:"🖼", "3D":"🧊", Texture:"🖼", Document:"📄", Other:"📎" };
    return map[t] ?? "📎";
  };

  const processFile = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const dataUrl = ev.target?.result as string;
          const category = guessType(file.name, file.type);
          await create({ fileName: file.name, fileType: category, url: dataUrl, category });
          resolve();
        } catch (e) { reject(e); }
      };
      reader.onerror = () => reject(new Error("FileReader error"));
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      for (let i = 0; i < files.length; i++) {
        await processFile(files[i]);
      }
      setUploadMsg(`${files.length} file${files.length > 1 ? "s" : ""} uploaded`);
      setTimeout(() => setUploadMsg(null), 3000);
    } catch {
      setUploadMsg("Upload failed — try a smaller file.");
    } finally { setUploading(false); }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    await handleFiles(e.dataTransfer.files);
  };

  const handleUrlSave = async () => {
    if (!urlInput.trim()) return;
    const name = urlName.trim() || urlInput.split("/").pop() || "asset";
    const category = guessType(name, "");
    await create({ fileName: name, fileType: category, url: urlInput.trim(), category });
    setUrlInput(""); setUrlName(""); setUrlMode(false);
  };

  const filtered = filter === "All" ? (assets ?? []) : (assets ?? []).filter((a) => a.fileType === filter);

  if (isPending) return <PanelLoader />;
  if (error)     return <PanelError message={error.message} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">Media Manager</h1>
          <p className="font-sans text-sm text-gray-500 mt-0.5">Upload and manage images, videos, 3D assets, and documents.</p>
        </div>
        <button onClick={() => setUrlMode((p) => !p)} className="text-xs font-mono text-gray-400 hover:text-charcoal border border-gray-200 px-3 py-1.5 rounded-lg cursor-pointer focus:outline-none">
          {urlMode ? "← Upload File" : "Add via URL"}
        </button>
      </div>

      {/* URL input mode */}
      {urlMode && (
        <Card className="bg-white border-gray-200 shadow-sm mb-5">
          <CardContent className="p-5 flex flex-col gap-3">
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">File URL</Label>
              <Input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://..." className="border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Display Name (optional)</Label>
              <Input value={urlName} onChange={(e) => setUrlName(e.target.value)} placeholder="hero-video.mp4" className="border-gray-200 rounded-xl text-sm" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUrlSave} disabled={!urlInput.trim() || isMutating} className="bg-gold text-charcoal hover:bg-gold-dark text-xs h-9 px-5 rounded-xl shadow-none">Save URL</Button>
              <Button onClick={() => setUrlMode(false)} variant="ghost" className="text-gray-400 text-xs">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drop zone */}
      {!urlMode && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center mb-5 transition-all cursor-pointer ${dragOver ? "border-gold bg-gold/5" : "border-gray-200 hover:border-gold/40"}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Spinner size={28} weight="regular" className="text-gold animate-spin mx-auto" />
              <p className="font-sans text-sm text-gray-500">Uploading…</p>
            </div>
          ) : (
            <>
              <UploadSimple size={32} weight="regular" className="text-gray-300 mx-auto mb-3" />
              <p className="font-sans text-sm text-gray-500">Drag & drop files here, or <span className="text-gold font-medium">click to browse</span></p>
              <p className="font-mono text-xs text-gray-400 mt-1.5">MP4, WebM, PNG, JPG, GLB, PDF · any size</p>
            </>
          )}
          {uploadMsg && <p className={`mt-2 text-xs font-mono ${uploadMsg.includes("failed") ? "text-red-500" : "text-green-600"}`}>{uploadMsg}</p>}
        </div>
      )}
      <input ref={fileInputRef} type="file" multiple accept="*/*" className="hidden"
        onChange={(e) => handleFiles(e.target.files)} />

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 text-xs font-mono rounded-xl border transition-all cursor-pointer focus:outline-none ${filter === cat ? "bg-charcoal text-warm-white border-charcoal" : "text-gray-500 bg-white border-gray-200 hover:border-charcoal"}`}>
            {cat}
            {cat !== "All" && assets && <span className="ml-1 text-[9px] opacity-50">{assets.filter((a) => a.fileType === cat).length}</span>}
          </button>
        ))}
      </div>

      {/* Asset grid */}
      {filtered.length === 0 ? (
        <EmptyState label={filter === "All" ? "No media assets yet. Upload your first file." : `No ${filter} assets yet.`} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((a) => (
            <div key={a.id} className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              {/* Preview */}
              <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                {a.fileType === "Image" && a.url ? (
                  <img src={a.url} alt={a.fileName} className="w-full h-full object-cover" />
                ) : a.fileType === "Video" && a.url ? (
                  <video src={a.url} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <span className="text-3xl">{typeEmoji(a.fileType)}</span>
                )}
              </div>
              {/* Info + delete */}
              <div className="p-2.5">
                <p className="font-mono text-[10px] text-charcoal truncate">{a.fileName}</p>
                <p className="font-sans text-[9px] text-gray-400">{a.fileType}</p>
              </div>
              <button onClick={() => remove(a.id)} disabled={isMutating}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer focus:outline-none disabled:opacity-50">
                <Trash size={11} weight="bold" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Analytics placeholder ── */

/* ── Settings ── */
function SettingsPanel({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const [saved, setSaved] = useState(false);
  const [formValues, setFormValues] = useState({
    siteTitle: "Aménagement Monzon",
    siteDesc:  "Premium construction, renovation, landscaping, and maintenance services.",
    email:     "silviolmonzon@amenagementmonzon.com",
    phone:     "+1 (514) 123-4567",
    address:   "Montréal, Québec, Canada",
    instagram: "@amenagementmonzon",
    facebook:  "Aménagement Monzon",
  });

  const save = () => {
    localStorage.setItem("monzon_site_settings", JSON.stringify(formValues));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const QUICK_LINKS = [
    { label: "PWA Settings",          tab: "pwa",                    icon: DeviceMobile, desc: "Install, caching, service worker" },
    { label: "Integrations",          tab: "integrations",           icon: Plug,         desc: "Email, AI, media, webhooks, API keys" },
    { label: "Notifications",         tab: "notifications-center",   icon: BellRinging,  desc: "Notification inbox" },
    { label: "Notification Settings", tab: "notifications-settings", icon: Bell,         desc: "Channels, roles, frequency" },
    { label: "Role Manager",          tab: "roles",                  icon: ShieldCheck,  desc: "RBAC and permissions" },
    { label: "User Manager",          tab: "users",                  icon: UserGear,     desc: "User roles and access" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-bold text-2xl text-charcoal">Settings</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">Configure global site settings, metadata, and system modules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Site Identity */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-base text-charcoal">Site Identity</CardTitle>
            <CardDescription className="font-sans text-xs text-gray-400">SEO and branding settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {([
                { id: "siteTitle", label: "Site Title" },
                { id: "siteDesc",  label: "Meta Description" },
                { id: "email",     label: "Admin Email" },
                { id: "phone",     label: "Phone" },
                { id: "address",   label: "Address" },
                { id: "instagram", label: "Instagram Handle" },
                { id: "facebook",  label: "Facebook Page" },
              ] as { id: keyof typeof formValues; label: string }[]).map(({ id, label }) => (
                <div key={id} className="flex flex-col gap-1.5">
                  <Label htmlFor={id} className="font-mono text-[10px] uppercase tracking-widest text-gray-400">{label}</Label>
                  <Input
                    id={id}
                    value={formValues[id]}
                    onChange={(e) => setFormValues((p) => ({ ...p, [id]: e.target.value }))}
                    className="font-sans text-sm border-gray-200 rounded-xl"
                  />
                </div>
              ))}
              <div className="flex items-center gap-3 pt-1">
                <Button onClick={save} className="bg-gold text-charcoal hover:bg-gold-dark font-semibold text-xs h-9 px-5 w-fit rounded-xl shadow-none">
                  Save Changes
                </Button>
                {saved && (
                  <span className="flex items-center gap-1.5 text-xs text-green-600 font-sans">
                    <CheckCircle size={13} weight="fill" /> Saved
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick links to sub-modules */}
        <div className="flex flex-col gap-3">
          <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest px-1">System Modules</p>
          {QUICK_LINKS.map(({ label, tab, icon: Icon, desc }) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-gold/40 hover:shadow-sm transition-all cursor-pointer text-left group focus:outline-none">
              <div className="w-9 h-9 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/10">
                <Icon size={17} weight="regular" className="text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm font-medium text-charcoal">{label}</p>
                <p className="font-sans text-xs text-gray-400">{desc}</p>
              </div>
              <ArrowUpRight size={13} weight="bold" className="text-gray-300 group-hover:text-gold flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Notification Bell Dropdown ── */
function NotificationBell({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const recent = notifications.slice(0, 6);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-warm-white hover:bg-gray-700 transition-colors cursor-pointer relative"
        aria-label="Notifications"
      >
        <Bell size={16} weight="regular" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gold text-charcoal text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-headline font-semibold text-sm text-charcoal">Notifications</p>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[10px] font-mono text-gray-400 hover:text-charcoal cursor-pointer focus:outline-none">
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-charcoal cursor-pointer focus:outline-none">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {recent.length === 0 ? (
              <div className="py-8 text-center">
                <p className="font-sans text-xs text-gray-400">No notifications</p>
              </div>
            ) : (
              recent.map((n) => (
                <div key={n.id} onClick={() => { markRead(n.id); setOpen(false); setActiveTab("notifications-center"); }}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!n.read ? "bg-gold/3" : ""}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.read ? "bg-gray-200" : "bg-gold"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-sans text-xs text-charcoal truncate ${!n.read ? "font-semibold" : ""}`}>{n.title}</p>
                    <p className="font-sans text-[10px] text-gray-400 truncate">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-gray-100">
            <button onClick={() => { setOpen(false); setActiveTab("notifications-center"); }}
              className="w-full text-center text-[10px] font-mono text-gray-400 hover:text-charcoal transition-colors cursor-pointer focus:outline-none">
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── PWA Install Banner ── */
function PWAInstallBanner() {
  const { isInstallable, isUpdating, promptInstall, skipWaiting } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  if (isUpdating) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-white border border-amber-200 rounded-2xl shadow-xl px-4 py-3 max-w-xs">
        <Spinner size={16} className="text-amber-500 animate-spin flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-sans text-xs font-semibold text-charcoal">Update available</p>
          <p className="font-sans text-[10px] text-gray-400">A new version is ready.</p>
        </div>
        <div className="flex gap-1">
          <button onClick={skipWaiting} className="text-[10px] font-mono text-amber-600 hover:text-amber-800 cursor-pointer focus:outline-none">Update</button>
          <button onClick={() => setDismissed(true)} className="text-gray-300 hover:text-gray-500 cursor-pointer focus:outline-none ml-1"><X size={12} /></button>
        </div>
      </div>
    );
  }

  if (isInstallable) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-white border border-gold/30 rounded-2xl shadow-xl px-4 py-3 max-w-xs">
        <DeviceMobile size={18} weight="fill" className="text-gold flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-sans text-xs font-semibold text-charcoal">Install App</p>
          <p className="font-sans text-[10px] text-gray-400">Add to your home screen.</p>
        </div>
        <div className="flex gap-1">
          <button onClick={promptInstall} className="text-[10px] font-mono text-gold hover:text-gold-dark cursor-pointer focus:outline-none">Install</button>
          <button onClick={() => setDismissed(true)} className="text-gray-300 hover:text-gray-500 cursor-pointer focus:outline-none ml-1"><X size={12} /></button>
        </div>
      </div>
    );
  }

  return null;
}

/* ── Shared helpers ── */
const PanelLoader = () => (
  <div className="flex items-center justify-center py-24">
    <span className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
  </div>
);
const PanelError = ({ message }: { message: string }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">Error: {message}</div>
);
const EmptyState = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-gray-200 text-center">
    <p className="font-sans text-sm text-gray-400">{label}</p>
  </div>
);

/* ══════════════════════════════════════════════════════════
   MAIN ADMIN SHELL
   ══════════════════════════════════════════════════════════ */
export default function AdminShell() {
  const [activeTab,   setActiveTab]   = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, isPending: authPending, isAnonymous, isAdmin, isStaff, role, login, logout } = useAppAuth();
  const { unreadCount } = useNotifications();

  // Auth gate
  if (authPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (isAnonymous) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-surface-2 border border-gray-700/60 rounded-3xl p-10 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6">
              <span className="font-headline font-bold text-2xl text-gold">M</span>
            </div>
            <h1 className="font-headline font-bold text-xl text-warm-white mb-2">Admin Panel</h1>
            <p className="font-sans text-sm text-gray-400 mb-8">Sign in to access the Aménagement Monzon admin dashboard.</p>
            <button onClick={() => login()}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gold text-charcoal font-sans font-semibold text-sm rounded-xl hover:bg-gold-dark transition-all cursor-pointer">
              <LockKey size={16} weight="bold" /> Sign In to Admin
            </button>
            <p className="font-sans text-xs text-gray-600 mt-4">Admin email: silviolmonzon@amenagementmonzon.com</p>
          </div>
        </div>
      </div>
    );
  }

  // Non-staff users redirected to portal
  if (!isAdmin && !isStaff) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-surface-2 border border-gray-700/60 rounded-3xl p-10 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-900/30 border border-red-700/30 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={28} weight="regular" className="text-red-400" />
            </div>
            <h1 className="font-headline font-bold text-xl text-warm-white mb-2">Access Restricted</h1>
            <p className="font-sans text-sm text-gray-400 mb-8">Your account ({user?.email}) doesn't have admin or staff access. Contact your administrator.</p>
            <div className="flex flex-col gap-2">
              <a href="/portal" className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gold text-charcoal font-sans font-semibold text-sm rounded-xl hover:bg-gold-dark transition-all cursor-pointer">
                Go to Client Portal
              </a>
              <button onClick={() => logout()} className="w-full px-6 py-3 text-sm font-sans text-gray-400 hover:text-warm-white transition-colors cursor-pointer">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">

      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-charcoal border-b border-gray-700 h-14 flex items-center px-5 gap-4">
        <button onClick={() => setSidebarOpen((p) => !p)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-warm-white hover:bg-gray-700 transition-colors cursor-pointer"
          aria-label="Toggle sidebar">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect y="2" width="16" height="1.5" rx="1" fill="currentColor"/>
            <rect y="7.25" width="16" height="1.5" rx="1" fill="currentColor"/>
            <rect y="12.5" width="16" height="1.5" rx="1" fill="currentColor"/>
          </svg>
        </button>

        <span className="font-headline font-bold text-sm text-warm-white">
          Aménagement<span className="text-gold"> Monzon</span>
          <span className="ml-2 font-mono text-[9px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded tracking-widest uppercase">Admin</span>
        </span>

        <div className="flex-1" />

        <NotificationBell setActiveTab={setActiveTab} />

        <Link to="/" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium bg-surface-2 text-gray-300 rounded-lg border border-gray-700 hover:border-gold/40 hover:text-warm-white transition-all duration-200 focus:outline-none">
          <Eye size={13} weight="regular" /> View Site
        </Link>
        <button onClick={() => logout()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium text-gray-400 rounded-lg border border-gray-700 hover:border-red-500/40 hover:text-red-400 transition-all focus:outline-none cursor-pointer">
          Sign Out
        </button>
      </header>

      <div className="flex pt-14 min-h-screen">

        {/* Sidebar */}
        <aside className={`fixed top-14 bottom-0 left-0 z-40 bg-charcoal border-r border-gray-700/60 flex flex-col transition-all duration-300 ${sidebarOpen ? "w-52" : "w-14"} overflow-hidden`}>
          <nav className="flex-1 py-3 flex flex-col gap-0 px-2 overflow-y-auto" aria-label="Admin navigation">
            {(["core","finance","content","ai","appearance","settings"] as const).map((group) => {
              const items = SIDEBAR_ITEMS.filter((i) => i.group === group);
              const groupLabels: Record<string, string> = { core: "Core", finance: "Finance & Ops", content: "Content & Brand", ai: "AI", appearance: "Appearance", settings: "System" };
              return (
                <div key={group} className="mb-1">
                  {sidebarOpen && (
                    <p className="px-3 pt-3 pb-1 font-mono text-[9px] text-gray-600 uppercase tracking-widest">
                      {groupLabels[group]}
                    </p>
                  )}
                  {!sidebarOpen && <div className="my-1 mx-2 border-t border-gray-700/40" />}
                  <div className="flex flex-col gap-0.5">
                    {items.map(({ id, label, icon: Icon }) => (
                      <button key={id} onClick={() => setActiveTab(id)}
                        className={["flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-medium transition-all duration-200 cursor-pointer focus:outline-none text-left w-full", activeTab === id ? "bg-gold/10 text-gold border border-gold/20" : "text-gray-400 hover:bg-gray-800 hover:text-warm-white border border-transparent"].join(" ")}
                        title={!sidebarOpen ? label : undefined}>
                        <Icon size={17} weight={activeTab === id ? "fill" : "regular"} className="flex-shrink-0" />
                        {sidebarOpen && <span className="truncate">{label}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
          <div className={`border-t border-gray-700/60 p-3 ${sidebarOpen ? "block" : "hidden"}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                <span className="font-headline font-bold text-[11px] text-gold">
                  {user?.name?.[0] ?? "A"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-sans text-xs font-medium text-warm-white truncate">{user?.name ?? "Admin"}</p>
                <p className="font-mono text-[10px] text-gray-500 truncate">{user?.email ?? "admin@monzon.com"}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className={`flex-1 transition-all duration-300 overflow-auto ${sidebarOpen ? "ml-52" : "ml-14"}`}>
          <div className="max-w-5xl mx-auto px-6 py-8">
            {activeTab === "dashboard"  && <DashboardPanel setActiveTab={setActiveTab} />}
            {activeTab === "projects"   && <ProjectsPanel />}
            {activeTab === "clients"    && <ClientsPanel />}
            {activeTab === "employees"  && <EmployeesPanel />}
            {activeTab === "media"      && <MediaPanel />}
            {activeTab === "store"      && <StoreManagerPanel />}
            {activeTab === "billing"       && <BillingPanel />}
            {activeTab === "analytics"  && <AnalyticsPanel />}
            {activeTab === "calendar"   && <CalendarPanel />}
            {activeTab === "messaging"  && <MessagingPanel />}
            {activeTab === "integrations"         && <IntegrationsPanel />}
            {activeTab === "notifications-center" && <NotificationCenterPanel />}
            {activeTab === "notifications-settings" && <NotificationSettingsPanel />}
            {activeTab === "pwa"                  && <PWASettingsPanel />}
            {activeTab === "settings"             && <SettingsPanel setActiveTab={setActiveTab} />}
            {activeTab === "economics"     && <EconomicDashboardPanel />}
            {activeTab === "leads"         && <LeadManagementPanel />}
            {activeTab === "hours"         && <EmployeeHoursPanel />}
            {activeTab === "profitability" && <ProfitabilityPanel />}
            {activeTab === "expenses"      && <ExpenseIncomePanel />}
            {activeTab === "ai-admin"        && <AdminAIChat />}
            {activeTab === "theme"           && <ThemeManagerPanel />}
            {activeTab === "appearance-base" && <AppearanceBasePanel />}
            {activeTab === "video-manager"   && <VideoManagerPanel />}
            {activeTab === "splash-manager"  && <SplashManagerPanel />}
            {activeTab === "roles"           && <RoleManagerPanel />}
            {activeTab === "users"           && <UserManagerPanel />}
            {activeTab === "reviews"         && <ReviewsPanel />}
            {activeTab === "metrics"         && <MetricsPanel />}
            {activeTab === "logo-manager"    && <LogoManagerPanel />}
            {activeTab === "company-profile" && <CompanyProfilePanel />}
            {activeTab === "academy-manager" && <AcademyManagerPanel />}
            {activeTab === "service-shop"    && <ServiceShopPanel />}
            {activeTab === "community" && <CommunityManagerPanel />}
          </div>
        </main>
      </div>
      <PWAInstallBanner />
    </div>
  );
}
