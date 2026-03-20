import { useState, useRef, useEffect } from "react";
import { Robot, PaperPlaneTilt, Spinner, ChartBar, TrendUp, CurrencyDollar, Clock } from "@phosphor-icons/react";
import { useQuery } from "@animaapp/playground-react-sdk";

type Message = { id: string; role: "user" | "bot"; text: string };

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

const QUICK_PROMPTS = [
  "What is my total net profit?",
  "Which project is most profitable?",
  "Show expense breakdown",
  "Hours worked this month",
  "Collection rate on invoices",
  "Biggest expense category",
];

export default function AdminAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "init", role: "bot", text: "Hello! 👋 I'm your **Economic AI Assistant**. I have full access to your financial data — income, expenses, hours, projects, and invoices. Ask me anything!" },
  ]);
  const [input, setInput]   = useState("");
  const [typing, setTyping] = useState(false);
  const endRef              = useRef<HTMLDivElement>(null);
  const inputRef            = useRef<HTMLInputElement>(null);

  const { data: incomes   } = useQuery("Income",  { orderBy: { date: "desc" } });
  const { data: expenses  } = useQuery("Expense", { orderBy: { date: "desc" } });
  const { data: hours     } = useQuery("HourEntry");
  const { data: projects  } = useQuery("Project");
  const { data: billing   } = useQuery("BillingDocument");
  const { data: leads     } = useQuery("Lead");

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const getAnswer = (q: string): string => {
    const query = q.toLowerCase();
    const safeInc  = incomes  ?? [];
    const safeExp  = expenses ?? [];
    const safeHrs  = hours    ?? [];
    const safeProj = projects ?? [];
    const safeBill = billing  ?? [];
    const safeLeads = leads   ?? [];

    const fmt = (n: number) => `$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Net profit
    if (/profit|net|revenue|revenu/i.test(query)) {
      const totalInc = safeInc.reduce((a, e) => a + parseFloat(e.amount || "0"), 0);
      const totalExp = safeExp.reduce((a, e) => a + parseFloat(e.amount || "0"), 0);
      const net = totalInc - totalExp;
      const margin = totalInc > 0 ? ((net / totalInc) * 100).toFixed(1) : "0";
      return `Here's your P&L summary:\n\n**Total Income:** ${fmt(totalInc)}\n**Total Expenses:** ${fmt(totalExp)}\n**Net Profit:** ${fmt(net)}\n**Profit Margin:** ${margin}%\n\n${net < 0 ? "⚠️ You're currently operating at a net loss. Review your top expense categories." : "✅ Your business is profitable!"}`;
    }

    // Expense breakdown
    if (/expense|spending|cost|breakdown/i.test(query)) {
      const cats: Record<string, number> = {};
      safeExp.forEach(e => { cats[e.category] = (cats[e.category] || 0) + parseFloat(e.amount || "0"); });
      const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
      const total = safeExp.reduce((a, e) => a + parseFloat(e.amount || "0"), 0);
      if (sorted.length === 0) return "No expense data recorded yet. Add expenses in the Expenses & Income panel.";
      return `**Expense Breakdown** (Total: ${fmt(total)})\n\n${sorted.map(([cat, val]) => `**${cat}:** ${fmt(val)} (${total > 0 ? ((val/total)*100).toFixed(1) : 0}%)`).join("\n")}\n\n💡 Your biggest category is **${sorted[0][0]}** at ${((sorted[0][1]/total)*100).toFixed(1)}% of total expenses.`;
    }

    // Hours
    if (/hour|time|labour|labor|travail/i.test(query)) {
      const totalHrs = safeHrs.reduce((a, h) => a + parseFloat(h.hours || "0"), 0);
      const totalCost = safeHrs.reduce((a, h) => a + parseFloat(h.totalCost || "0"), 0);
      const avgRate = totalHrs > 0 ? totalCost / totalHrs : 0;
      const approved = safeHrs.filter(h => h.approved === "yes").length;
      return `**Labour Hours Summary**\n\n**Total Hours:** ${totalHrs.toFixed(1)}h\n**Total Labour Cost:** ${fmt(totalCost)}\n**Avg Cost/Hour:** ${fmt(avgRate)}\n**Approved Entries:** ${approved} / ${safeHrs.length}\n\n${safeHrs.length === 0 ? "No hour entries yet." : "Hours are tracking normally."}`;
    }

    // Most profitable project
    if (/project|profitab|most|best/i.test(query)) {
      if (safeProj.length === 0) return "No projects found. Add projects through the Projects panel.";
      const profitability = safeProj.map(p => {
        const inc = safeInc.filter(i => i.projectId === p.id).reduce((a, i) => a + parseFloat(i.amount || "0"), 0);
        const exp = safeExp.filter(e => e.projectId === p.id).reduce((a, e) => a + parseFloat(e.amount || "0"), 0);
        return { name: p.title, income: inc, expenses: exp, profit: inc - exp, margin: inc > 0 ? ((inc - exp) / inc * 100) : 0 };
      }).sort((a, b) => b.profit - a.profit);
      return `**Project Profitability Ranking**\n\n${profitability.slice(0, 5).map((p, i) => `**${i+1}. ${p.name}**\nIncome: ${fmt(p.income)} | Costs: ${fmt(p.expenses)} | Profit: ${fmt(p.profit)} | Margin: ${p.margin.toFixed(1)}%`).join("\n\n")}\n\n🏆 **Most profitable:** ${profitability[0].name} with ${fmt(profitability[0].profit)} net profit.`;
    }

    // Invoice / collection
    if (/invoice|collect|paid|payment|billing/i.test(query)) {
      const invoices = safeBill.filter(d => d.type === "invoice");
      const total = invoices.reduce((a, d) => a + parseFloat(d.total || "0"), 0);
      const paid = invoices.filter(d => d.status === "paid").reduce((a, d) => a + parseFloat(d.total || "0"), 0);
      const rate = total > 0 ? ((paid / total) * 100).toFixed(1) : "0";
      return `**Invoice & Collection Report**\n\n**Total Invoiced:** ${fmt(total)}\n**Collected:** ${fmt(paid)}\n**Outstanding:** ${fmt(total - paid)}\n**Collection Rate:** ${rate}%\n\n${parseFloat(rate) < 80 ? "⚠️ Collection rate is below 80%. Consider following up on outstanding invoices." : "✅ Collection rate is healthy!"}`;
    }

    // Leads
    if (/lead|pipeline|prospect|sale/i.test(query)) {
      const byStatus: Record<string, number> = {};
      safeLeads.forEach(l => { byStatus[l.status] = (byStatus[l.status] || 0) + 1; });
      return `**Lead Pipeline Summary**\n\n**Total Leads:** ${safeLeads.length}\n${Object.entries(byStatus).map(([s, c]) => `**${s}:** ${c}`).join("\n")}\n\n💡 Focus on leads in "contacted" and "quoted" stages to accelerate conversions.`;
    }

    return "I can help you analyze **income, expenses, hours, projects, invoices, and leads**. Try asking:\n\n• \"What is my net profit?\"\n• \"Show expense breakdown\"\n• \"Which project is most profitable?\"\n• \"What's my invoice collection rate?\"";
  };

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setMessages(prev => [...prev, { id: String(Date.now()), role: "user", text: q }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const answer = getAnswer(q);
      setMessages(prev => [...prev, { id: String(Date.now() + 1), role: "bot", text: answer }]);
      setTyping(false);
    }, 700 + Math.random() * 500);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-headline font-bold text-2xl text-charcoal">AI Economic Analyst</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">Ask questions about your financial data — income, expenses, projects, and more.</p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: TrendUp, label: "P&L Analysis", color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: ChartBar, label: "Expense Reports", color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Clock, label: "Hours Summary", color: "text-purple-600", bg: "bg-purple-50" },
          { icon: CurrencyDollar, label: "Invoice Status", color: "text-amber-600", bg: "bg-amber-50" },
        ].map(c => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
              <c.icon size={16} weight="regular" className={c.color} />
            </div>
            <p className="font-sans text-xs font-medium text-charcoal">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Chat container */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
          <div className="w-8 h-8 rounded-lg bg-charcoal flex items-center justify-center flex-shrink-0">
            <Robot size={16} weight="fill" className="text-gold" />
          </div>
          <div>
            <p className="font-headline font-semibold text-xs text-charcoal">Monzon Economic AI</p>
            <p className="font-mono text-[9px] text-gray-400">Connected to income, expenses, hours, projects & invoices</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-[9px] text-gray-400">Live data</span>
          </div>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto px-5 py-4 flex flex-col gap-3 scrollbar-hide">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "bot" && (
                <div className="w-6 h-6 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Robot size={10} weight="fill" className="text-gold" />
                </div>
              )}
              <div
                className={[
                  "max-w-[75%] px-4 py-2.5 rounded-2xl text-xs font-sans leading-relaxed",
                  msg.role === "user" ? "bg-charcoal text-warm-white rounded-br-sm" : "bg-gray-100 text-charcoal rounded-bl-sm",
                ].join(" ")}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
              />
            </div>
          ))}
          {typing && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-charcoal flex items-center justify-center">
                <Robot size={10} weight="fill" className="text-gold" />
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick prompts */}
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => send(p)}
              className="px-2.5 py-1 text-[10px] font-sans text-gray-500 bg-gray-100 rounded-full border border-gray-200 hover:border-charcoal hover:text-charcoal transition-all cursor-pointer">
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") send(); }}
            placeholder="Ask about your financial data…"
            className="flex-1 px-4 py-2.5 text-xs font-sans bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/40 transition-colors"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || typing}
            className="w-9 h-9 rounded-xl bg-charcoal flex items-center justify-center disabled:opacity-40 hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none"
          >
            {typing ? <Spinner size={14} weight="bold" className="text-white animate-spin" /> : <PaperPlaneTilt size={14} weight="bold" className="text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}
