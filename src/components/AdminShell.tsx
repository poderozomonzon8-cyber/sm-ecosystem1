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
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useAppAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
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

function DashboardPanel({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [p, c, e, m] = await Promise.all([
        supabase.from("Project").select("*").order("createdAt", { ascending: false }).limit(5),
        supabase.from("Client").select("*").order("createdAt", { ascending: false }).limit(5),
        supabase.from("Employee").select("*").order("createdAt", { ascending: false }).limit(5),
        supabase.from("MediaAsset").select("*").order("createdAt", { ascending: false }).limit(5),
      ]);

      if (!p.error && p.data) setProjects(p.data);
      if (!c.error && c.data) setClients(c.data);
      if (!e.error && e.data) setEmployees(e.data);
      if (!m.error && m.data) setMediaAssets(m.data);
    }

    load();
  }, []);

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
    </div>
  );
}
