import { useState, useMemo } from "react";
import { useQuery } from "@animaapp/playground-react-sdk";
import {
  Briefcase, TrendUp, TrendDown, CurrencyDollar, Clock,
  Hammer, Stack, Users, ArrowUpRight, CaretDown,
} from "@phosphor-icons/react";

export default function ProfitabilityPanel() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const { data: projects  } = useQuery("Project");
  const { data: incomes   } = useQuery("Income");
  const { data: expenses  } = useQuery("Expense");
  const { data: hours     } = useQuery("HourEntry");

  const safeProj = projects ?? [];
  const safeInc  = incomes  ?? [];
  const safeExp  = expenses ?? [];
  const safeHrs  = hours    ?? [];

  const projectData = useMemo(() => safeProj.map((p) => {
    const projInc = safeInc.filter(i => i.projectId === p.id);
    const projExp = safeExp.filter(e => e.projectId === p.id);
    const projHrs = safeHrs.filter(h => h.projectId === p.id);

    const income       = projInc.reduce((a, i) => a + parseFloat(i.amount || "0"), 0);
    const totalExp     = projExp.reduce((a, e) => a + parseFloat(e.amount || "0"), 0);
    const laborExp     = projExp.filter(e => e.category === "labor").reduce((a, e) => a + parseFloat(e.amount || "0"), 0);
    const materialExp  = projExp.filter(e => e.category === "material").reduce((a, e) => a + parseFloat(e.amount || "0"), 0);
    const subExp       = projExp.filter(e => e.category === "subcontractor").reduce((a, e) => a + parseFloat(e.amount || "0"), 0);
    const laborHrCost  = projHrs.reduce((a, h) => a + parseFloat(h.totalCost || "0"), 0);
    const totalHours   = projHrs.reduce((a, h) => a + parseFloat(h.hours || "0"), 0);
    const netProfit    = income - totalExp;
    const margin       = income > 0 ? (netProfit / income) * 100 : 0;

    return {
      ...p,
      income, totalExp, laborExp, materialExp, subExp,
      laborHrCost, totalHours, netProfit, margin,
      expTimeline: projExp.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      incTimeline: projInc.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    };
  }).sort((a, b) => b.netProfit - a.netProfit), [safeProj, safeInc, safeExp, safeHrs]);

  const selected = projectData.find(p => p.id === selectedProject);
  const fmt = (n: number) => `$${n.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-headline font-bold text-2xl text-charcoal">Project Profitability</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">Per-project cost vs. revenue, margin analysis, and labor breakdown.</p>
      </div>

      {/* Overall summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Income",   value: fmt(projectData.reduce((a, p) => a+p.income, 0)),    color: "text-emerald-600" },
          { label: "Total Expenses", value: fmt(projectData.reduce((a, p) => a+p.totalExp, 0)),  color: "text-red-500" },
          { label: "Net Profit",     value: fmt(projectData.reduce((a, p) => a+p.netProfit, 0)), color: "text-charcoal" },
          { label: "Avg. Margin",    value: projectData.length > 0 ? `${(projectData.reduce((a,p) => a+p.margin, 0) / projectData.length).toFixed(1)}%` : "—", color: "text-blue-600" },
        ].map((c) => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className={`font-headline font-bold text-xl ${c.color}`}>{c.value}</p>
            <p className="font-sans text-xs text-gray-400 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Project list */}
        <div className={`${selected ? "w-80 flex-shrink-0" : "flex-1"}`}>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Profitability Ranking</p>
            </div>
            {projectData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <Briefcase size={28} weight="regular" className="text-gray-300 mb-2" />
                <p className="font-sans text-sm text-gray-400">No project data yet. Add projects and link income/expense entries.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {projectData.map((p, i) => (
                  <button key={p.id} onClick={() => setSelectedProject(selectedProject === p.id ? null : p.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 text-left transition-colors cursor-pointer ${selectedProject === p.id ? "bg-gray-50 border-l-2 border-charcoal" : ""}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-100 text-gray-600" : "bg-gray-50 text-gray-400"}`}>
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-sans text-xs font-medium text-charcoal truncate">{p.title}</p>
                        <p className="font-mono text-[10px] text-gray-400">{p.category}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className={`font-mono text-xs font-semibold ${p.netProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {p.netProfit >= 0 ? "+" : ""}{fmt(p.netProfit)}
                      </p>
                      <p className={`font-mono text-[10px] ${p.margin >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                        {p.margin.toFixed(1)}%
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Project detail */}
        {selected && (
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-headline font-bold text-lg text-charcoal">{selected.title}</h2>
                  <p className="font-sans text-xs text-gray-400">{selected.category} · {selected.year}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-mono rounded-full font-semibold ${selected.margin >= 20 ? "bg-emerald-100 text-emerald-700" : selected.margin >= 0 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"}`}>
                  {selected.margin.toFixed(1)}% margin
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  ["Income",      fmt(selected.income),     "text-emerald-600"],
                  ["Expenses",    fmt(selected.totalExp),   "text-red-500"],
                  ["Net Profit",  fmt(selected.netProfit),  selected.netProfit >= 0 ? "text-charcoal" : "text-red-500"],
                ].map(([l, v, c]) => (
                  <div key={l as string}>
                    <p className={`font-headline font-bold text-lg ${c as string}`}>{v as string}</p>
                    <p className="font-sans text-xs text-gray-400">{l as string}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost breakdown */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="font-headline font-semibold text-sm text-charcoal mb-4">Cost Breakdown</p>
              <div className="flex flex-col gap-3">
                {[
                  ["Labour (logged)", selected.laborExp + selected.laborHrCost, "bg-emerald-400"],
                  ["Materials",       selected.materialExp,                     "bg-blue-400"],
                  ["Subcontractors",  selected.subExp,                          "bg-amber-400"],
                  ["Other",           selected.totalExp - selected.laborExp - selected.materialExp - selected.subExp, "bg-gray-300"],
                ].map(([l, v, c]) => {
                  const pct = selected.totalExp > 0 ? (v as number) / selected.totalExp * 100 : 0;
                  return (
                    <div key={l as string}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-sans text-xs text-gray-600">{l as string}</span>
                        <span className="font-mono text-xs text-charcoal">{fmt(v as number)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${c as string}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <Clock size={13} weight="regular" className="text-gray-400" />
                <span className="font-sans text-xs text-gray-500">Total hours logged:</span>
                <span className="font-mono text-xs font-semibold text-charcoal">{selected.totalHours.toFixed(1)}h</span>
              </div>
            </div>

            {/* Income timeline */}
            {selected.incTimeline.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <p className="font-headline font-semibold text-sm text-charcoal mb-3">Income Timeline</p>
                <div className="flex flex-col gap-2">
                  {selected.incTimeline.map((i) => (
                    <div key={i.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                        <span className="font-sans text-gray-600">{i.description}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-mono text-gray-400">{i.date ? new Date(i.date).toLocaleDateString("en-CA") : "—"}</span>
                        <span className="font-mono font-semibold text-emerald-600">+${parseFloat(i.amount||"0").toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expense timeline */}
            {selected.expTimeline.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <p className="font-headline font-semibold text-sm text-charcoal mb-3">Expense Timeline</p>
                <div className="flex flex-col gap-2">
                  {selected.expTimeline.map((e) => (
                    <div key={e.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                        <span className="font-sans text-gray-600 capitalize">[{e.category}] {e.description}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-mono text-gray-400">{e.date ? new Date(e.date).toLocaleDateString("en-CA") : "—"}</span>
                        <span className="font-mono font-semibold text-red-500">-${parseFloat(e.amount||"0").toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
