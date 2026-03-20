import { useState, useMemo } from "react";
import { useQuery } from "@animaapp/playground-react-sdk";
import {
  TrendUp, TrendDown, CurrencyDollar, Clock, Briefcase,
  ChartBar, ChartLine, ChartPieSlice, Users, ArrowUpRight,
  ArrowDownRight, Funnel,
} from "@phosphor-icons/react";

/* ── Lightweight pure-SVG bar chart ── */
function BarChart({ data, color = "#1a1a2e", height = 120, label }: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  label?: string;
}) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-xs text-gray-300 font-mono">No data</div>;
  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 100 / data.length;
  return (
    <div>
      {label && <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-2">{label}</p>}
      <div className="relative" style={{ height }}>
        <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
          {data.map((d, i) => {
            const barH = (d.value / max) * (height - 20);
            const x = i * w + w * 0.1;
            const barW = w * 0.8;
            return (
              <g key={i}>
                <rect x={`${x}%`} y={height - barH - 5} width={`${barW}%`} height={barH}
                  fill={color} rx="2" opacity="0.85" />
              </g>
            );
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex">
          {data.map((d, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-[9px] font-mono text-gray-400">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Lightweight line/area chart ── */
function LineChart({ data, color = "#1a1a2e", fill = false, height = 100 }: {
  data: { label: string; value: number }[];
  color?: string;
  fill?: boolean;
  height?: number;
}) {
  if (!data || data.length < 2) return <div className="flex items-center justify-center h-full text-xs text-gray-300 font-mono">No data</div>;
  const max = Math.max(...data.map((d) => d.value), 1);
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - (d.value / max) * (height - 10) - 5;
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  const fillPath = `M${pts[0]} L${pts.join(" L")} L100,${height} L0,${height} Z`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      {fill && <path d={fillPath} fill={color} opacity="0.08" />}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = height - (d.value / max) * (height - 10) - 5;
        return <circle key={i} cx={x} cy={y} r="1.5" fill={color} vectorEffect="non-scaling-stroke" />;
      })}
    </svg>
  );
}

/* ── Donut chart ── */
function DonutChart({ segments, size = 120 }: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let cumulative = 0;
  const r = 38; const cx = 50; const cy = 50;
  const arcs = segments.map((s) => {
    const pct    = s.value / total;
    const start  = cumulative;
    cumulative  += pct;
    const startA = start * 2 * Math.PI - Math.PI / 2;
    const endA   = cumulative * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startA); const y1 = cy + r * Math.sin(startA);
    const x2 = cx + r * Math.cos(endA);   const y2 = cy + r * Math.sin(endA);
    const large = pct > 0.5 ? 1 : 0;
    return { ...s, d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`, pct };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} stroke="white" strokeWidth="0.5" />)}
      <circle cx={cx} cy={cy} r="22" fill="white" />
    </svg>
  );
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function EconomicDashboardPanel() {
  const [dateFilter, setDateFilter] = useState<"ytd" | "q1" | "q2" | "q3" | "q4">("ytd");
  const [projectFilter, setProjectFilter] = useState("all");

  const { data: incomes   } = useQuery("Income",  { orderBy: { date: "asc" } });
  const { data: expenses  } = useQuery("Expense", { orderBy: { date: "asc" } });
  const { data: hours     } = useQuery("HourEntry");
  const { data: projects  } = useQuery("Project");
  const { data: billingDocs } = useQuery("BillingDocument");

  const safeInc  = incomes  ?? [];
  const safeExp  = expenses ?? [];
  const safeHrs  = hours    ?? [];
  const safeProj = projects ?? [];
  const safeDocs = billingDocs ?? [];

  /* Monthly income / expense arrays */
  const monthlyIncome = useMemo(() => MONTHS.map((m, i) => ({
    label: m,
    value: safeInc.filter((e) => new Date(e.date).getMonth() === i).reduce((a, e) => a + parseFloat(e.amount || "0"), 0),
  })), [safeInc]);

  const monthlyExpenses = useMemo(() => MONTHS.map((m, i) => ({
    label: m,
    value: safeExp.filter((e) => new Date(e.date).getMonth() === i).reduce((a, e) => a + parseFloat(e.amount || "0"), 0),
  })), [safeExp]);

  const monthlyProfit = useMemo(() => MONTHS.map((m, i) => ({
    label: m,
    value: monthlyIncome[i].value - monthlyExpenses[i].value,
  })), [monthlyIncome, monthlyExpenses]);

  const totalIncome   = safeInc.reduce((a, e) => a + parseFloat(e.amount || "0"), 0);
  const totalExpenses = safeExp.reduce((a, e) => a + parseFloat(e.amount || "0"), 0);
  const netProfit     = totalIncome - totalExpenses;
  const totalHours    = safeHrs.reduce((a, h) => a + parseFloat(h.hours || "0"), 0);
  const avgCostPerHr  = totalHours > 0 ? safeHrs.reduce((a, h) => a + parseFloat(h.totalCost || "0"), 0) / totalHours : 0;

  /* Expense breakdown by category */
  const expCatBreakdown = useMemo(() => {
    const cats: Record<string, number> = {};
    safeExp.forEach((e) => { cats[e.category] = (cats[e.category] || 0) + parseFloat(e.amount || "0"); });
    return Object.entries(cats).map(([label, value]) => ({ label, value }));
  }, [safeExp]);

  const catColors: Record<string, string> = {
    material: "#3b82f6", labor: "#10b981", subcontractor: "#f59e0b",
    equipment: "#8b5cf6", fuel: "#ef4444", vehicle: "#ec4899", other: "#6b7280",
  };

  const donutSegments = expCatBreakdown.map((c) => ({ ...c, color: catColors[c.label] ?? "#aaa" }));

  /* Project profitability */
  const projProfitability = useMemo(() => {
    return safeProj.slice(0, 8).map((p) => {
      const inc = safeInc.filter((i) => i.projectId === p.id).reduce((a, i) => a + parseFloat(i.amount || "0"), 0);
      const exp = safeExp.filter((e) => e.projectId === p.id).reduce((a, e) => a + parseFloat(e.amount || "0"), 0);
      return { name: p.title, income: inc, expenses: exp, profit: inc - exp, margin: inc > 0 ? ((inc - exp) / inc * 100) : 0 };
    }).sort((a, b) => b.profit - a.profit);
  }, [safeProj, safeInc, safeExp]);

  /* Employee hours */
  const empHours = useMemo(() => {
    const map: Record<string, number> = {};
    safeHrs.forEach((h) => { map[h.employeeName] = (map[h.employeeName] || 0) + parseFloat(h.hours || "0"); });
    return Object.entries(map).map(([label, value]) => ({ label: label.split(" ")[0], value })).slice(0, 6);
  }, [safeHrs]);

  /* Invoiced vs paid */
  const invoiced = safeDocs.filter(d => d.type === "invoice").reduce((a, d) => a + parseFloat(d.total || "0"), 0);
  const paid     = safeDocs.filter(d => d.type === "invoice" && d.status === "paid").reduce((a, d) => a + parseFloat(d.total || "0"), 0);

  const fmt = (n: number) => n.toLocaleString("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 0 });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">Economic Dashboard</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">Real-time financial analytics, margins, and project performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Funnel size={13} weight="regular" className="text-gray-400" />
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(["ytd","q1","q2","q3","q4"] as const).map((f) => (
              <button key={f} onClick={() => setDateFilter(f)}
                className={`px-3 py-1.5 text-[11px] font-mono rounded-lg transition-all cursor-pointer uppercase ${dateFilter === f ? "bg-white shadow-sm text-charcoal" : "text-gray-400 hover:text-gray-600"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Income",       value: fmt(totalIncome),   icon: TrendUp,       color: "text-emerald-600", bg: "bg-emerald-50",    trend: "+12%" },
          { label: "Total Expenses",     value: fmt(totalExpenses), icon: TrendDown,     color: "text-red-500",     bg: "bg-red-50",        trend: "+4.2%" },
          { label: "Net Profit",         value: fmt(netProfit),     icon: CurrencyDollar,color: netProfit >= 0 ? "text-charcoal" : "text-red-500", bg: "bg-gray-50", trend: "" },
          { label: "Total Hours Worked", value: `${totalHours.toFixed(0)}h`, icon: Clock, color: "text-blue-600", bg: "bg-blue-50",        trend: "" },
        ].map((c) => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
              <c.icon size={16} weight="regular" className={c.color} />
            </div>
            <p className="font-headline font-bold text-xl text-charcoal leading-none">{c.value}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="font-sans text-xs text-gray-400">{c.label}</p>
              {c.trend && <span className="font-mono text-[9px] text-emerald-500">{c.trend}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Avg. Cost / Hour",     value: `${fmt(avgCostPerHr)}/h` },
          { label: "Invoiced",             value: fmt(invoiced) },
          { label: "Collected",            value: fmt(paid) },
          { label: "Collection Rate",      value: invoiced > 0 ? `${(paid / invoiced * 100).toFixed(1)}%` : "—" },
        ].map((c) => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <p className="font-headline font-bold text-lg text-charcoal">{c.value}</p>
            <p className="font-sans text-xs text-gray-400 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="font-headline font-semibold text-sm text-charcoal mb-4">Income vs. Expenses (Monthly)</p>
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="text-[10px] font-mono text-gray-400">Income</span>
              </div>
              <BarChart data={monthlyIncome} color="#10b981" height={80} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="text-[10px] font-mono text-gray-400">Expenses</span>
              </div>
              <BarChart data={monthlyExpenses} color="#f87171" height={80} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="font-headline font-semibold text-sm text-charcoal mb-4">Expense Breakdown</p>
          {donutSegments.length > 0 ? (
            <div className="flex flex-col items-center gap-3">
              <DonutChart segments={donutSegments} size={120} />
              <div className="w-full flex flex-col gap-1.5">
                {donutSegments.map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="font-sans text-[11px] text-gray-600 capitalize">{s.label}</span>
                    </div>
                    <span className="font-mono text-[11px] text-gray-500">{fmt(s.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="flex items-center justify-center h-40 text-xs text-gray-300 font-mono">No expense data</div>}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="font-headline font-semibold text-sm text-charcoal mb-4">Monthly Profit</p>
          <LineChart data={monthlyProfit} color="#1a1a2e" fill height={100} />
          <div className="flex mt-2 gap-0">
            {monthlyProfit.map((m) => (
              <div key={m.label} className="flex-1 text-center">
                <span className="text-[9px] font-mono text-gray-400">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="font-headline font-semibold text-sm text-charcoal mb-4">Hours Worked by Employee</p>
          {empHours.length > 0 ? (
            <BarChart data={empHours} color="#3b82f6" height={100} />
          ) : <div className="flex items-center justify-center h-28 text-xs text-gray-300 font-mono">No hour entries</div>}
        </div>
      </div>

      {/* Project Profitability Ranking */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-5">
        <p className="font-headline font-semibold text-sm text-charcoal mb-4">Project Profitability Ranking</p>
        {projProfitability.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-xs text-gray-300 font-mono">No project data linked</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {["#","Project","Income","Expenses","Net Profit","Margin","Bar"].map((h) => (
                    <th key={h} className="text-left font-mono text-[10px] text-gray-400 uppercase tracking-widest pb-2 pr-4 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projProfitability.map((p, i) => (
                  <tr key={p.name} className="border-t border-gray-50">
                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-400">{i + 1}</td>
                    <td className="py-2.5 pr-4 font-sans text-xs font-medium text-charcoal max-w-[140px] truncate">{p.name}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-emerald-600">{fmt(p.income)}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-red-400">{fmt(p.expenses)}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs font-semibold text-charcoal">{fmt(p.profit)}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs">
                      <span className={p.margin >= 0 ? "text-emerald-600" : "text-red-500"}>{p.margin.toFixed(1)}%</span>
                    </td>
                    <td className="py-2.5 w-32">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${p.margin >= 0 ? "bg-emerald-400" : "bg-red-400"}`}
                          style={{ width: `${Math.min(Math.abs(p.margin), 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Materials vs Labour */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="font-headline font-semibold text-sm text-charcoal mb-4">Materials vs. Labour</p>
          {(() => {
            const mat  = safeExp.filter(e => e.category === "material").reduce((a, e) => a + parseFloat(e.amount || "0"), 0);
            const lab  = safeExp.filter(e => e.category === "labor").reduce((a, e) => a + parseFloat(e.amount || "0"), 0);
            const sub  = safeExp.filter(e => e.category === "subcontractor").reduce((a, e) => a + parseFloat(e.amount || "0"), 0);
            const tot  = mat + lab + sub || 1;
            return (
              <div className="flex flex-col gap-3">
                {[["Materials",fmt(mat),mat/tot,"#3b82f6"],["Labour",fmt(lab),lab/tot,"#10b981"],["Subcontractors",fmt(sub),sub/tot,"#f59e0b"]].map(([l, v, pct, c]) => (
                  <div key={l as string}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-sans text-xs text-gray-600">{l as string}</span>
                      <span className="font-mono text-xs text-charcoal">{v as string}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(pct as number) * 100}%`, background: c as string }} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="font-headline font-semibold text-sm text-charcoal mb-4">Invoice Collection Status</p>
          {invoiced > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <DonutChart segments={[
                  { label: "Paid",    value: paid,             color: "#10b981" },
                  { label: "Pending", value: invoiced - paid,  color: "#f59e0b" },
                ]} size={100} />
                <div className="flex flex-col gap-2">
                  {[["Collected", fmt(paid), "#10b981"],["Pending", fmt(invoiced - paid), "#f59e0b"]].map(([l,v,c]) => (
                    <div key={l as string} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c as string }} />
                      <span className="font-sans text-xs text-gray-600">{l as string}</span>
                      <span className="font-mono text-xs text-charcoal">{v as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : <div className="flex items-center justify-center h-28 text-xs text-gray-300 font-mono">No invoice data yet</div>}
        </div>
      </div>
    </div>
  );
}
