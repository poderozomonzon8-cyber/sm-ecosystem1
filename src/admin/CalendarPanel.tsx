import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import {
  CaretLeft, CaretRight, Plus, X, Briefcase, Users,
  CurrencyDollar, Clock, Wrench, Check, Spinner, Trash,
} from "@phosphor-icons/react";

type ViewMode = "month" | "week";
type EventType = "project" | "employee" | "expense" | "service" | "custom";

interface CalItem {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  type: EventType;
  color: string;
  sub?: string;
  allDay?: boolean;
}

const TYPE_COLORS: Record<EventType, string> = {
  project:  "#3b82f6",
  employee: "#10b981",
  expense:  "#ef4444",
  service:  "#8b5cf6",
  custom:   "#D4A853",
};
const TYPE_LABELS: Record<EventType, string> = {
  project: "Project", employee: "Employee Work", expense: "Expense", service: "Service Booking", custom: "Event",
};

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const days: Date[] = [];
  const start = new Date(first);
  start.setDate(start.getDate() - start.getDay());
  while (start <= last || start.getDay() !== 0) {
    days.push(new Date(start));
    start.setDate(start.getDate() + 1);
    if (days.length > 41) break;
  }
  return days;
}

const EMPTY_FORM = {
  title: "", date: new Date().toISOString().split("T")[0],
  endDate: "", type: "custom" as EventType, description: "",
  linkedProjectId: "", linkedEmployeeId: "",
};

export default function CalendarPanel() {
  const today = new Date();
  const [view, setView]           = useState<ViewMode>("month");
  const [curDate, setCurDate]     = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [showForm, setShowForm]   = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [form, setForm]           = useState({ ...EMPTY_FORM });
  const [detailEvent, setDetailEvent] = useState<CalItem | null>(null);
  const [filterTypes, setFilterTypes] = useState<Set<EventType>>(new Set(["project","employee","expense","service","custom"]));

  const { data: calEvents }   = useQuery("CalendarEvent", { orderBy: { startDate: "asc" } });
  const { data: projects }    = useQuery("Project",       { orderBy: { startDate: "asc" } });
  const { data: employees }   = useQuery("Employee",      { orderBy: { firstName: "asc" } });
  const { data: hours }       = useQuery("HourEntry",     { orderBy: { date: "asc" } });
  const { data: expenses }    = useQuery("Expense",       { orderBy: { date: "asc" } });
  const { data: calServices } = useQuery("BillingDocument", { orderBy: { createdAt: "asc" } });

  const { create, remove, isPending: isMutating } = useMutation("CalendarEvent");

  /* ── Build unified CalItem array ── */
  const allItems = useMemo<CalItem[]>(() => {
    const items: CalItem[] = [];

    // Project timelines
    (projects ?? []).filter(p => p.startDate).forEach(p => {
      items.push({
        id: `proj-${p.id}`, title: p.title,
        date: new Date(p.startDate!),
        endDate: p.endDate ? new Date(p.endDate!) : undefined,
        type: "project", color: TYPE_COLORS.project,
        sub: p.status ?? "active", allDay: true,
      });
    });

    // Employee work days (from HourEntry)
    (hours ?? []).forEach(h => {
      items.push({
        id: `hour-${h.id}`, title: `${h.employeeName} @ ${h.projectName}`,
        date: new Date(h.date), type: "employee", color: TYPE_COLORS.employee,
        sub: `${h.hours}h · $${h.totalCost}`, allDay: true,
      });
    });

    // Expenses as cost markers
    (expenses ?? []).forEach(e => {
      items.push({
        id: `exp-${e.id}`, title: `${e.category}: ${e.description}`,
        date: new Date(e.date), type: "expense", color: TYPE_COLORS.expense,
        sub: `$${e.amount}${e.vendor ? ` · ${e.vendor}` : ""}`, allDay: true,
      });
    });

    // Service bookings (billing docs = subscription/service)
    (calServices ?? []).filter(d => d.billingSource === "service" || d.billingSource === "subscription").forEach(d => {
      items.push({
        id: `svc-${d.id}`, title: `${d.type}: ${d.clientName}`,
        date: new Date(d.createdAt), type: "service", color: TYPE_COLORS.service,
        sub: `$${d.total} · ${d.status}`, allDay: true,
      });
    });

    // Custom calendar events
    (calEvents ?? []).forEach(e => {
      items.push({
        id: `ev-${e.id}`, title: e.title,
        date: new Date(e.startDate),
        endDate: e.endDate ? new Date(e.endDate) : undefined,
        type: "custom", color: e.color ?? TYPE_COLORS.custom,
        sub: e.description, allDay: e.allDay,
      });
    });

    return items;
  }, [projects, hours, expenses, calServices, calEvents]);

  const visibleItems = useMemo(() => allItems.filter(i => filterTypes.has(i.type)), [allItems, filterTypes]);

  const itemsOnDay = (d: Date) => visibleItems.filter(i => {
    if (sameDay(i.date, d)) return true;
    if (i.endDate && i.allDay) {
      return d >= i.date && d <= i.endDate;
    }
    return false;
  });

  /* ── Month nav ── */
  const monthDays = useMemo(() => getMonthDays(curDate.getFullYear(), curDate.getMonth()), [curDate]);

  const prevMonth = () => setCurDate(new Date(curDate.getFullYear(), curDate.getMonth() - 1, 1));
  const nextMonth = () => setCurDate(new Date(curDate.getFullYear(), curDate.getMonth() + 1, 1));

  /* ── Save event ── */
  const handleSave = async () => {
    if (!form.title.trim() || !form.date) return;
    const proj = (projects ?? []).find(p => p.id === form.linkedProjectId);
    const emp  = (employees ?? []).find(e => e.id === form.linkedEmployeeId);
    await create({
      title: form.title, description: form.description,
      startDate: new Date(form.date),
      endDate: form.endDate ? new Date(form.endDate) : undefined,
      allDay: true, type: form.type,
      linkedProjectId: proj?.id, linkedProjectName: proj?.title,
      linkedEmployeeId: emp?.id, linkedEmployeeName: emp ? `${emp.firstName} ${emp.lastName}` : undefined,
      color: TYPE_COLORS[form.type],
    });
    setForm({ ...EMPTY_FORM }); setShowForm(false);
  };

  const toggleFilter = (t: EventType) => {
    setFilterTypes(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const DAYS_OF_WEEK = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const monthLabel   = curDate.toLocaleString("en-CA", { month: "long", year: "numeric" });

  /* ── Selected-day sidebar ── */
  const selectedDayItems = selectedDay ? itemsOnDay(selectedDay) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">Scheduling Calendar</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">Projects, employee work days, expenses, and service bookings — all in one view.</p>
        </div>
        <button onClick={() => { setShowForm(true); setForm({ ...EMPTY_FORM, date: selectedDay ? selectedDay.toISOString().split("T")[0] : EMPTY_FORM.date }); }}
          className="flex items-center gap-2 px-4 py-2 bg-charcoal text-warm-white text-xs font-sans font-semibold rounded-xl hover:bg-charcoal/80 cursor-pointer transition-all">
          <Plus size={13} weight="bold" /> Add Event
        </button>
      </div>

      {/* ── Type filters ── */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(TYPE_COLORS) as EventType[]).map(type => (
          <button key={type} onClick={() => toggleFilter(type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans rounded-xl border transition-all cursor-pointer ${filterTypes.has(type) ? "text-white border-transparent" : "text-gray-400 border-gray-200 bg-white"}`}
            style={filterTypes.has(type) ? { background: TYPE_COLORS[type], borderColor: TYPE_COLORS[type] } : {}}>
            <span className="w-2 h-2 rounded-full" style={{ background: filterTypes.has(type) ? "rgba(255,255,255,0.8)" : TYPE_COLORS[type] }} />
            {TYPE_LABELS[type]}
          </button>
        ))}
        <button onClick={() => { setCurDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDay(today); }}
          className="ml-auto px-3 py-1.5 text-xs font-mono text-gray-400 border border-gray-200 rounded-xl hover:border-charcoal cursor-pointer bg-white transition-all">
          Today
        </button>
      </div>

      {/* ── Main layout ── */}
      <div className="flex gap-4">
        {/* Calendar grid */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-charcoal group transition-colors cursor-pointer">
              <CaretLeft size={13} weight="bold" className="text-gray-500 group-hover:text-white" />
            </button>
            <p className="font-headline font-bold text-sm text-charcoal">{monthLabel}</p>
            <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-charcoal group transition-colors cursor-pointer">
              <CaretRight size={13} weight="bold" className="text-gray-500 group-hover:text-white" />
            </button>
          </div>

          {/* Day-of-week header */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="py-2 text-center font-mono text-[10px] text-gray-400 uppercase tracking-widest">{d}</div>
            ))}
          </div>

          {/* Grid days */}
          <div className="grid grid-cols-7">
            {monthDays.map((day, idx) => {
              const isCurrentMonth = day.getMonth() === curDate.getMonth();
              const isToday = sameDay(day, today);
              const isSelected = selectedDay && sameDay(day, selectedDay);
              const dayItems = itemsOnDay(day).slice(0, 3);
              const overflow  = itemsOnDay(day).length - 3;
              return (
                <div key={idx} onClick={() => setSelectedDay(day)}
                  className={`border-b border-r border-gray-100 last:border-r-0 min-h-[80px] p-1.5 cursor-pointer transition-colors hover:bg-gray-50 ${!isCurrentMonth ? "bg-gray-50/50" : ""} ${isSelected ? "bg-gold/5 ring-1 ring-inset ring-gold/30" : ""}`}>
                  {/* Day number */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${isToday ? "bg-charcoal text-warm-white font-bold" : ""}`}>
                    <span className={`text-xs font-mono ${!isCurrentMonth ? "text-gray-300" : isToday ? "text-warm-white" : "text-charcoal"}`}>{day.getDate()}</span>
                  </div>
                  {/* Event chips */}
                  <div className="flex flex-col gap-0.5">
                    {dayItems.map(item => (
                      <button key={item.id} onClick={e => { e.stopPropagation(); setDetailEvent(item); }}
                        className="w-full text-left px-1.5 py-0.5 rounded text-[9px] font-sans font-medium truncate text-white cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ background: item.color }}>
                        {item.title}
                      </button>
                    ))}
                    {overflow > 0 && (
                      <span className="font-mono text-[9px] text-gray-400 px-1">+{overflow} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected-day sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-3">
          {/* Day card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="font-headline font-semibold text-sm text-charcoal">
                {selectedDay ? selectedDay.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" }) : "Select a day"}
              </p>
              {selectedDay && (
                <button onClick={() => { setShowForm(true); setForm({ ...EMPTY_FORM, date: selectedDay.toISOString().split("T")[0] }); }}
                  className="flex items-center gap-1 mt-1.5 text-[10px] font-mono text-gold cursor-pointer hover:text-gold-dark">
                  <Plus size={10} weight="bold" /> Add event this day
                </button>
              )}
            </div>
            <div className="p-3 flex flex-col gap-2 max-h-80 overflow-y-auto">
              {!selectedDay ? (
                <p className="font-sans text-xs text-gray-400 text-center py-4">Click a day to see events</p>
              ) : selectedDayItems.length === 0 ? (
                <p className="font-sans text-xs text-gray-400 text-center py-4">No events this day</p>
              ) : (
                selectedDayItems.map(item => (
                  <button key={item.id} onClick={() => setDetailEvent(item)}
                    className="w-full flex items-start gap-2.5 text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer border border-gray-100 transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1" style={{ background: item.color }} />
                    <div className="min-w-0">
                      <p className="font-sans text-[11px] font-medium text-charcoal truncate">{item.title}</p>
                      {item.sub && <p className="font-mono text-[9px] text-gray-400 truncate mt-0.5">{item.sub}</p>}
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full text-white mt-1 inline-block" style={{ background: item.color }}>{TYPE_LABELS[item.type]}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Month summary */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
            <p className="font-headline font-semibold text-xs text-charcoal mb-3">Month Summary</p>
            {(Object.keys(TYPE_COLORS) as EventType[]).map(type => {
              const count = visibleItems.filter(i => i.date.getMonth() === curDate.getMonth() && i.date.getFullYear() === curDate.getFullYear() && i.type === type).length;
              return (
                <div key={type} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[type] }} />
                    <span className="font-sans text-[10px] text-gray-500">{TYPE_LABELS[type]}</span>
                  </div>
                  <span className="font-mono text-[10px] font-semibold text-charcoal">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Add Event Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-headline font-bold text-base text-charcoal">Add Calendar Event</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-charcoal cursor-pointer"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Event Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Site Visit – Client Name"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-gold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Start Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-gold" />
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as EventType }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-gold bg-white">
                  {(Object.keys(TYPE_LABELS) as EventType[]).map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Link to Project</label>
                <select value={form.linkedProjectId} onChange={e => setForm(p => ({ ...p, linkedProjectId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-gold bg-white">
                  <option value="">— None —</option>
                  {(projects ?? []).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Link to Employee</label>
                <select value={form.linkedEmployeeId} onChange={e => setForm(p => ({ ...p, linkedEmployeeId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-gold bg-white">
                  <option value="">— None —</option>
                  {(employees ?? []).map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} — {e.role}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Notes</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-gold resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-sm font-sans cursor-pointer hover:text-charcoal">Cancel</button>
              <button onClick={handleSave} disabled={isMutating || !form.title.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold text-charcoal font-sans font-semibold text-xs rounded-xl hover:bg-gold-dark disabled:opacity-40 cursor-pointer transition-colors">
                {isMutating ? <Spinner size={13} className="animate-spin" /> : <><Check size={13} weight="bold" /> Save Event</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Event Detail Modal ── */}
      {detailEvent && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `2px solid ${detailEvent.color}` }}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ background: detailEvent.color }} />
                <span className="font-mono text-[10px] text-white px-2 py-0.5 rounded-full" style={{ background: detailEvent.color }}>{TYPE_LABELS[detailEvent.type]}</span>
              </div>
              <button onClick={() => setDetailEvent(null)} className="text-gray-400 hover:text-charcoal cursor-pointer"><X size={16} /></button>
            </div>
            <div className="px-6 py-5">
              <h3 className="font-headline font-bold text-base text-charcoal mb-3">{detailEvent.title}</h3>
              <div className="flex flex-col gap-2.5">
                <div>
                  <p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">Date</p>
                  <p className="font-sans text-sm text-charcoal">{detailEvent.date.toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
                {detailEvent.endDate && (
                  <div>
                    <p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">End Date</p>
                    <p className="font-sans text-sm text-charcoal">{detailEvent.endDate.toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                )}
                {detailEvent.sub && (
                  <div>
                    <p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">Details</p>
                    <p className="font-sans text-sm text-charcoal">{detailEvent.sub}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <button onClick={() => setDetailEvent(null)} className="text-gray-400 text-xs font-sans cursor-pointer">Close</button>
              {detailEvent.id.startsWith("ev-") && (
                <button onClick={async () => {
                  const realId = detailEvent.id.replace("ev-","");
                  await remove(realId).catch(() => {});
                  setDetailEvent(null);
                }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 text-xs font-sans rounded-xl border border-red-200 hover:bg-red-100 cursor-pointer">
                  <Trash size={12} weight="bold" /> Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
