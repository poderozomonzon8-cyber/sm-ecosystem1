import { useMemo } from "react";
import { useQuery } from "@animaapp/playground-react-sdk";
import {
  TrendUp, Users, Funnel, CurrencyDollar, ChartBar,
  Star, Briefcase, Robot, ArrowUpRight, ArrowDownRight,
} from "@phosphor-icons/react";

/* ─── SVG helpers (self-contained) ─── */
function MiniBar({ data, color = "#D4A853", height = 64 }: { data: number[]; color?: string; height?: number }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 100 / data.length;
  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      {data.map((v, i) => {
        const bh = (v / max) * (height - 6);
        return <rect key={i} x={`${i * w + w * 0.12}%`} y={height - bh - 3} width={`${w * 0.76}%`} height={bh} fill={color} rx="1.5" opacity="0.85" />;
      })}
    </svg>
  );
}

function MiniLine({ data, color = "#D4A853", height = 56 }: { data: number[]; color?: string; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - (v / max) * (height - 8) - 4;
    return `${x},${y}`;
  });
  const fillPath = `M${pts[0]} L${pts.join(" L")} L100,${height} L0,${height} Z`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <path d={fillPath} fill={color} opacity="0.10" />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function DonutSmall({ pct, color }: { pct: number; color: string }) {
  const r = 38; const cx = 50; const cy = 50;
  const angle = (pct / 100) * 2 * Math.PI - Math.PI / 2;
  const x = cx + r * Math.cos(angle); const y = cy + r * Math.sin(angle);
  const large = pct > 50 ? 1 : 0;
  return (
    <svg width="80" height="80" viewBox="0 0 100 100">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="12" />
      <path d={`M${cx},${cy - r} A${r},${r} 0 ${large},1 ${x},${y}`} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="24" fill="white" />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="bold" fill={color}>{Math.round(pct)}%</text>
    </svg>
  );
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AnalyticsPanel() {
  const { data: leads }       = useQuery("Lead",              { orderBy: { createdAt: "asc" } });
  const { data: contacts }    = useQuery("ContactSubmission", { orderBy: { createdAt: "asc" } });
  const { data: projects }    = useQuery("Project",           { orderBy: { createdAt: "asc" } });
  const { data: clients }     = useQuery("Client",            { orderBy: { createdAt: "asc" } });
  const { data: income }      = useQuery("Income",            { orderBy: { date: "asc" } });
  const { data: expenses }    = useQuery("Expense",           { orderBy: { date: "asc" } });
  const { data: reviews }     = useQuery("Review",            { orderBy: { createdAt: "asc" } });
  const { data: chatMessages }= useQuery("ChatMessage",       { orderBy: { createdAt: "asc" } });

  const safeLeads   = leads    ?? [];
  const safeConts   = contacts ?? [];
  const safeProj    = projects ?? [];
  const safeClients = clients  ?? [];
  const safeIncome  = income   ?? [];
  const safeExp     = expenses ?? [];
  const safeRevs    = reviews  ?? [];
  const safeMsgs    = chatMessages ?? [];

  /* ── Monthly buckets ── */
  const byMonth = <T extends { createdAt: Date }>(arr: T[]) =>
    MONTHS.map((_, i) => arr.filter(x => new Date(x.createdAt).getMonth() === i).length);

  const monthlyLeads    = useMemo(() => byMonth(safeLeads),   [safeLeads]);
  const monthlyConts    = useMemo(() => byMonth(safeConts),   [safeConts]);
  const monthlyClients  = useMemo(() => byMonth(safeClients), [safeClients]);

  const monthlyRevenue  = useMemo(() => MONTHS.map((_, i) =>
    safeIncome.filter(x => new Date(x.date).getMonth() === i).reduce((a, v) => a + parseFloat(v.amount || "0"), 0)
  ), [safeIncome]);

  /* ── Lead pipeline ── */
  const pipeline = useMemo(() => {
    const stages = ["new","contacted","qualified","won","lost"] as const;
    return stages.map(s => ({ stage: s, count: safeLeads.filter(l => l.status === s).length }));
  }, [safeLeads]);

  const wonLeads  = safeLeads.filter(l => l.status === "won").length;
  const totalLeads = safeLeads.length || 1;
  const convRate  = Math.round((wonLeads / totalLeads) * 100);

  /* ── Lead sources ── */
  const sourceMap = useMemo(() => {
    const m: Record<string, number> = {};
    [...safeLeads, ...safeConts.map(c => ({ source: "web" }))].forEach((l: any) => {
      const s = l.source || "web";
      m[s] = (m[s] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [safeLeads, safeConts]);

  /* ── Service interest breakdown ── */
  const serviceMap = useMemo(() => {
    const m: Record<string, number> = {};
    safeLeads.forEach(l => {
      if (l.serviceInterest) m[l.serviceInterest] = (m[l.serviceInterest] || 0) + 1;
    });
    safeConts.forEach(c => {
      if (c.projectType) m[c.projectType] = (m[c.projectType] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [safeLeads, safeConts]);

  /* ── Reviews ── */
  const avgRating = safeRevs.length
    ? (safeRevs.reduce((a, r) => a + parseFloat(r.rating || "0"), 0) / safeRevs.length).toFixed(1)
    : "—";

  /* ── AI Chat engagement ── */
  const aiMessages = safeMsgs.filter(m => m.senderType === "bot" || m.senderType === "staff").length;
  const clientMsgs  = safeMsgs.filter(m => m.senderType === "client").length;

  const totalRevenue = safeIncome.reduce((a, i) => a + parseFloat(i.amount || "0"), 0);
  const totalExpense = safeExp.reduce((a, e) => a + parseFloat(e.amount || "0"), 0);

  const fmt = (n: number) => n >= 1000 ? `$${(n/1000).toFixed(1)}k` : `$${n.toFixed(0)}`;

  const STAGE_COLORS: Record<string, string> = {
    new: "#3b82f6", contacted: "#f59e0b", qualified: "#8b5cf6", won: "#10b981", lost: "#ef4444",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-headline font-bold text-2xl text-charcoal">Analytics</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">Real-time business intelligence from your live data — leads, revenue, clients, services, and AI engagement.</p>
      </div>

      {/* ── Primary KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Leads",       value: safeLeads.length,    sub: `${wonLeads} won`,             icon: Funnel,        color: "text-blue-600",    bg: "bg-blue-50"    },
          { label: "Active Clients",    value: safeClients.filter(c => c.status === "active").length, sub: `${safeClients.length} total`, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Revenue",     value: fmt(totalRevenue),   sub: `${fmt(totalRevenue - totalExpense)} net`, icon: CurrencyDollar, color: "text-gold", bg: "bg-gold/10" },
          { label: "Avg. Rating",       value: avgRating,           sub: `${safeRevs.length} reviews`,  icon: Star,          color: "text-amber-500",   bg: "bg-amber-50"   },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={16} weight="regular" className={color} />
            </div>
            <p className="font-headline font-bold text-xl text-charcoal leading-none">{value}</p>
            <p className="font-sans text-xs text-gray-400 mt-0.5">{label}</p>
            <p className="font-mono text-[10px] text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Secondary KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Contact Form Subs",  value: safeConts.length },
          { label: "Projects (Active)",  value: safeProj.filter(p => p.status === "active").length },
          { label: "Lead Conv. Rate",    value: `${convRate}%` },
          { label: "AI Chat Messages",   value: clientMsgs },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <p className="font-headline font-bold text-lg text-charcoal">{value}</p>
            <p className="font-sans text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Lead Pipeline + Revenue trend ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Lead funnel */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="font-headline font-semibold text-sm text-charcoal mb-4">Lead Pipeline</p>
          <div className="flex flex-col gap-3">
            {pipeline.map(({ stage, count }) => {
              const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              return (
                <div key={stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-sans text-xs capitalize text-gray-600">{stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-charcoal">{count}</span>
                      <span className="font-mono text-[10px] text-gray-400">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: STAGE_COLORS[stage] }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="font-sans text-xs text-gray-400">Conversion rate</span>
            <DonutSmall pct={convRate} color="#10b981" />
          </div>
        </div>

        {/* Monthly revenue trend */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="font-headline font-semibold text-sm text-charcoal mb-1">Monthly Revenue Trend</p>
          <p className="font-mono text-[10px] text-gray-400 mb-3">Income received per calendar month</p>
          <MiniLine data={monthlyRevenue} color="#D4A853" height={80} />
          <div className="flex mt-1 gap-0">
            {MONTHS.map(m => <div key={m} className="flex-1 text-center"><span className="text-[9px] font-mono text-gray-400">{m}</span></div>)}
          </div>
          {/* Below mini stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-100">
            {[
              ["Leads / month", (safeLeads.length / 12).toFixed(1)],
              ["Contacts / month", (safeConts.length / 12).toFixed(1)],
              ["New clients / month", (safeClients.length / 12).toFixed(1)],
            ].map(([l, v]) => (
              <div key={l}>
                <p className="font-mono text-sm font-bold text-charcoal">{v}</p>
                <p className="font-sans text-[10px] text-gray-400">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Source breakdown + Service interest ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Lead sources */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="font-headline font-semibold text-sm text-charcoal mb-4">Lead Sources</p>
          {sourceMap.length === 0 ? (
            <p className="font-mono text-xs text-gray-300 text-center py-6">No leads yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {sourceMap.map(([source, count]) => {
                const pct = Math.round((count / (safeLeads.length + safeConts.length || 1)) * 100);
                const colors: Record<string,string> = {
                  web: "#3b82f6", chat: "#8b5cf6", referral: "#10b981",
                  "ai-chat": "#D4A853", social: "#ec4899", other: "#6b7280",
                };
                return (
                  <div key={source}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-sans text-xs capitalize text-gray-600">{source}</span>
                      <span className="font-mono text-xs font-semibold text-charcoal">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[source] ?? "#6b7280" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Service interest */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="font-headline font-semibold text-sm text-charcoal mb-4">Service Interest</p>
          {serviceMap.length === 0 ? (
            <p className="font-mono text-xs text-gray-300 text-center py-6">No data yet</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {serviceMap.map(([svc, count], idx) => {
                const total = serviceMap.reduce((a, [, c]) => a + c, 0) || 1;
                const pct = Math.round((count / total) * 100);
                const bgs = ["#D4A853","#3b82f6","#10b981","#8b5cf6","#f59e0b","#ef4444"];
                return (
                  <div key={svc} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: bgs[idx] }} />
                    <span className="font-sans text-xs text-gray-600 flex-1 truncate">{svc}</span>
                    <span className="font-mono text-xs font-semibold text-charcoal">{count}</span>
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: bgs[idx] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Activity timeline + AI chat stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Monthly leads vs contacts bar chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="font-headline font-semibold text-sm text-charcoal mb-1">Lead & Contact Activity</p>
          <p className="font-mono text-[10px] text-gray-400 mb-2">New leads (gold) vs contact-form submissions (blue) per month</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-0"><span className="w-3 h-3 rounded-full bg-gold inline-block" /><span className="text-[10px] font-mono text-gray-400">Leads</span></div>
            <MiniBar data={monthlyLeads} color="#D4A853" height={60} />
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block" /><span className="text-[10px] font-mono text-gray-400">Contact Forms</span></div>
            <MiniBar data={monthlyConts} color="#60a5fa" height={60} />
          </div>
          <div className="flex mt-1 gap-0">
            {MONTHS.map(m => <div key={m} className="flex-1 text-center"><span className="text-[9px] font-mono text-gray-400">{m}</span></div>)}
          </div>
        </div>

        {/* AI & Engagement stats */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <p className="font-headline font-semibold text-sm text-charcoal">AI & Engagement</p>
          {[
            { label: "AI Chat Threads",    value: [...new Set(safeMsgs.map(m => m.threadId))].length, icon: Robot,        color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Total Messages",     value: safeMsgs.length,                                     icon: ChartBar,    color: "text-blue-600",   bg: "bg-blue-50"   },
            { label: "Approved Reviews",   value: safeRevs.filter(r => r.status === "approved").length, icon: Star,       color: "text-amber-500",  bg: "bg-amber-50"  },
            { label: "Active Projects",    value: safeProj.filter(p => p.status === "active").length,  icon: Briefcase,   color: "text-emerald-600",bg: "bg-emerald-50"},
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} weight="regular" className={color} />
              </div>
              <div>
                <p className="font-headline font-bold text-lg text-charcoal leading-none">{value}</p>
                <p className="font-sans text-[10px] text-gray-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Project pipeline ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-5">
        <p className="font-headline font-semibold text-sm text-charcoal mb-4">Project Pipeline</p>
        <div className="grid grid-cols-5 gap-3">
          {(["planning","active","on-hold","completed","cancelled"] as const).map(status => {
            const count = safeProj.filter(p => p.status === status).length;
            const colors: Record<string, string> = {
              planning: "bg-amber-50 text-amber-700 border-amber-200",
              active: "bg-emerald-50 text-emerald-700 border-emerald-200",
              "on-hold": "bg-orange-50 text-orange-600 border-orange-200",
              completed: "bg-blue-50 text-blue-700 border-blue-200",
              cancelled: "bg-red-50 text-red-600 border-red-200",
            };
            return (
              <div key={status} className={`rounded-xl border px-3 py-3 text-center ${colors[status]}`}>
                <p className="font-headline font-bold text-2xl">{count}</p>
                <p className="font-sans text-[10px] capitalize mt-0.5">{status}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Client acquisition trend ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <p className="font-headline font-semibold text-sm text-charcoal mb-2">Client Acquisition (Monthly)</p>
        <MiniBar data={monthlyClients} color="#1a1a2e" height={60} />
        <div className="flex mt-1 gap-0">
          {MONTHS.map(m => <div key={m} className="flex-1 text-center"><span className="text-[9px] font-mono text-gray-400">{m}</span></div>)}
        </div>
      </div>
    </div>
  );
}
