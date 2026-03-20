import { useState, useRef, useEffect } from "react";
import { Robot, X, PaperPlaneTilt, CaretDown, Spinner } from "@phosphor-icons/react";
import { useMutation } from "@/lib/anima-supabase-adapter";

type Message = {
  id: string;
  role: "user" | "bot";
  text: string;
  ts: number;
};

type LeadInfo = { name?: string; phone?: string; email?: string };

const SUGGESTIONS = [
  "What services do you offer?",
  "How long does a renovation take?",
  "What materials do you use?",
  "How do I start a project?",
];

const BOT_KB: { pattern: RegExp; response: string }[] = [
  { pattern: /price|cost|rate|quote|budget|how much|combien/i, response: "For pricing, each project is unique and depends on scope, materials, and timeline. I'd love to connect you with our team for a personalized estimate — completely free! Could I get your name and contact info?" },
  { pattern: /service|offer|provide|do you/i, response: "We offer **Construction**, **Renovation**, **Landscaping**, **Pavé & Exterior**, **Maintenance**, and **Interior Design**. Which service interests you most?" },
  { pattern: /how long|timeline|duration|délai/i, response: "Timelines vary — a bathroom renovation can take 1–2 weeks, while a full home addition may span 3–6 months. We'll give you a precise timeline during your free consultation." },
  { pattern: /material|stone|wood|pavé|pavement/i, response: "We work with premium materials including natural stone, engineered hardwood, porcelain pavers, concrete, and high-grade metals. All sourced from trusted local suppliers." },
  { pattern: /start|begin|process|how do|étape/i, response: "Easy! The process is: **1. Free Consultation** → **2. Site Visit & Estimate** → **3. Signed Agreement** → **4. Project Kick-off**. Want me to collect your info so our team can reach you?" },
  { pattern: /contact|phone|email|reach|call/i, response: "I'll make sure the team contacts you promptly! What's your **name**?" },
  { pattern: /[A-Za-z]+ [A-Za-z]+/i, response: "" }, // name capture
  { pattern: /portfolio|example|past project|work|réalisation/i, response: "Check out our portfolio at /portfolio — we have over 250 completed projects! From luxury kitchen renos to full commercial pavé systems. Any style catches your eye?" },
  { pattern: /guarantee|warranty|garanti/i, response: "Yes! We provide a **workmanship warranty** on all projects and use materials with manufacturer warranties. Peace of mind is part of the package." },
  { pattern: /hi|hello|bonjour|hey|salut/i, response: "Hello! Welcome to Aménagement Monzon 👋 I'm here to help with any questions about our services, process, or to get you connected with our team. What can I help you with today?" },
  { pattern: /merci|thank|thanks/i, response: "You're very welcome! Is there anything else I can help you with? Our team is also available at info@amenagement-monzon.com" },
];

function getBotResponse(text: string, leadInfo: LeadInfo, pendingField: string | null): { reply: string; newPendingField: string | null; leadUpdate: Partial<LeadInfo> } {
  const lower = text.trim().toLowerCase();
  let leadUpdate: Partial<LeadInfo> = {};
  let newPendingField: string | null = null;

  // Handle pending lead collection
  if (pendingField === "name") {
    leadUpdate.name = text.trim();
    return { reply: `Nice to meet you, **${text.trim()}**! What's the best **phone number** to reach you?`, newPendingField: "phone", leadUpdate };
  }
  if (pendingField === "phone") {
    leadUpdate.phone = text.trim();
    return { reply: "Perfect! And your **email address**?", newPendingField: "email", leadUpdate };
  }
  if (pendingField === "email") {
    leadUpdate.email = text.trim();
    return { reply: `Excellent! I've passed your info to our team — expect a call within **24 hours**! In the meantime, is there anything else you'd like to know about our services?`, newPendingField: null, leadUpdate };
  }

  // Check for buying intent triggers
  const buyingIntentPhrases = /ready|let's go|book|schedule|start|interested|want to|would like|I'd like|set up|appointment|meeting/i;
  if (buyingIntentPhrases.test(text) && !leadInfo.name) {
    return { reply: "Fantastic! I'd love to connect you with our team. First, could I get your **full name**?", newPendingField: "name", leadUpdate };
  }

  // Knowledge base matching
  for (const { pattern, response } of BOT_KB) {
    if (pattern.test(text) && response) {
      // Check if we should collect info after response
      if (/Could I get your name|collect your info/i.test(response) && !leadInfo.name) {
        return { reply: response, newPendingField: "name", leadUpdate };
      }
      return { reply: response, newPendingField: null, leadUpdate };
    }
  }

  return {
    reply: "Good question! Our team would be best suited to answer that in detail. Would you like me to connect you with them? I just need your **name** and **contact info**.",
    newPendingField: leadInfo.name ? null : "name",
    leadUpdate,
  };
}

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "init", role: "bot", text: "Hello! 👋 I'm **Monzon AI**. I can answer questions about our services, process, and materials. How can I help you today?", ts: Date.now() },
  ]);
  const [input, setInput]           = useState("");
  const [typing, setTyping]         = useState(false);
  const [leadInfo, setLeadInfo]     = useState<LeadInfo>({});
  const [pendingField, setPendingField] = useState<string | null>(null);
  const [leadSent, setLeadSent]     = useState(false);
  const messagesEndRef              = useRef<HTMLDivElement>(null);
  const inputRef                    = useRef<HTMLInputElement>(null);

  const { create: createLead } = useMutation("Lead");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // Auto-send lead when we have all info
  useEffect(() => {
    if (leadInfo.name && leadInfo.email && !leadSent) {
      setLeadSent(true);
      createLead({
        name: leadInfo.name,
        email: leadInfo.email ?? "",
        phone: leadInfo.phone ?? "",
        message: "Lead captured via AI Chat widget",
        source: "ai-chat",
        status: "new",
        assignedTo: "",
        assignedEmployeeId: "",
        notes: `Chat session lead. Name: ${leadInfo.name}, Phone: ${leadInfo.phone ?? "not provided"}`,
        budget: "",
        serviceInterest: "",
      }).catch(() => {});
    }
  }, [leadInfo, leadSent, createLead]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: String(Date.now()), role: "user", text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    const { reply, newPendingField, leadUpdate } = getBotResponse(text, leadInfo, pendingField);

    if (Object.keys(leadUpdate).length > 0) {
      setLeadInfo(prev => ({ ...prev, ...leadUpdate }));
    }
    setPendingField(newPendingField);

    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, {
        id: String(Date.now() + 1),
        role: "bot",
        text: reply,
        ts: Date.now(),
      }]);
    }, 900 + Math.random() * 600);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") send();
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-[9000] flex flex-col items-end gap-3">
        {!open && (
          <div className="flex items-center gap-2 bg-charcoal text-warm-white px-3 py-2 rounded-full text-xs font-sans shadow-xl animate-fade-up pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Chat with Monzon AI
          </div>
        )}
        <button
          onClick={() => setOpen(p => !p)}
          className="w-14 h-14 rounded-full bg-charcoal border border-gold/30 shadow-2xl shadow-black/40 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:border-gold/60 cursor-pointer focus:outline-none"
          aria-label={open ? "Close AI chat" : "Open AI chat"}
        >
          {open
            ? <X size={22} weight="bold" className="text-warm-white" />
            : <Robot size={24} weight="fill" className="text-gold" />
          }
        </button>
      </div>

      {/* Chat window */}
      <div
        className={[
          "fixed bottom-24 right-6 z-[8999] w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl shadow-black/30 border border-gray-200 flex flex-col overflow-hidden transition-all duration-400",
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none",
        ].join(" ")}
        style={{ maxHeight: "520px" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 bg-charcoal border-b border-gray-700 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
            <Robot size={16} weight="fill" className="text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-headline font-bold text-xs text-warm-white">Monzon AI</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-mono text-[9px] text-gray-400">Online · 24/7</span>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-300 cursor-pointer focus:outline-none">
            <CaretDown size={16} weight="bold" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 scrollbar-hide">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "bot" && (
                <div className="w-6 h-6 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Robot size={11} weight="fill" className="text-gold" />
                </div>
              )}
              <div
                className={[
                  "max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs font-sans leading-relaxed",
                  msg.role === "user"
                    ? "bg-charcoal text-warm-white rounded-br-sm"
                    : "bg-gray-100 text-charcoal rounded-bl-sm",
                ].join(" ")}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
              />
            </div>
          ))}

          {typing && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0">
                <Robot size={11} weight="fill" className="text-gold" />
              </div>
              <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                {[0,1,2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion chips */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 50); }}
                className="px-2.5 py-1 text-[10px] font-sans text-gray-500 bg-gray-100 rounded-full border border-gray-200 hover:border-charcoal hover:text-charcoal transition-all cursor-pointer">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-3 py-3 border-t border-gray-100 flex gap-2 items-center flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={pendingField ? `Type your ${pendingField}…` : "Ask anything…"}
            className="flex-1 px-3.5 py-2.5 text-xs font-sans bg-gray-100 border border-transparent rounded-xl focus:outline-none focus:border-charcoal/30 transition-colors"
          />
          <button
            onClick={send}
            disabled={!input.trim() || typing}
            className="w-9 h-9 rounded-xl bg-charcoal flex items-center justify-center disabled:opacity-40 hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none flex-shrink-0"
          >
            {typing
              ? <Spinner size={14} weight="bold" className="text-white animate-spin" />
              : <PaperPlaneTilt size={14} weight="bold" className="text-white" />
            }
          </button>
        </div>
        <p className="text-center font-mono text-[9px] text-gray-400 py-1.5 border-t border-gray-50">
          Powered by Monzon AI · Never shares pricing
        </p>
      </div>
    </>
  );
}
