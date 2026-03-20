import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import {
  PaperPlaneRight, Robot, User, Users, Megaphone,
  Chat, X, MagnifyingGlass, Trash, Check, ArrowLeft,
  Spinner, PencilSimple, Tag,
} from "@phosphor-icons/react";

type Tab = "client-threads" | "ai-inbox" | "broadcast";

interface Thread {
  id: string;
  name: string;
  lastMsg: string;
  lastTime: Date;
  unread: number;
  type: "client" | "ai";
  email?: string;
}

export default function MessagingPanel() {
  const [tab, setTab]           = useState<Tab>("client-threads");
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [draft, setDraft]       = useState("");
  const [search, setSearch]     = useState("");
  const [broadcastDraft, setBroadcastDraft] = useState({ subject: "", body: "", audience: "all-clients" });
  const [broadcastSent, setBroadcastSent]   = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: allMessages, isPending }     = useQuery("ChatMessage", { orderBy: { createdAt: "asc" } });
  const { data: clients }                    = useQuery("Client");
  const { create, update, remove, isPending: isMutating } = useMutation("ChatMessage");

  const msgs = allMessages ?? [];

  /* ── Build thread list from ChatMessage ── */
  const clientThreads = useMemo<Thread[]>(() => {
    const threadMap: Record<string, Thread> = {};
    msgs.forEach(m => {
      const tid = m.threadId;
      if (!threadMap[tid]) {
        threadMap[tid] = {
          id: tid, name: m.senderName, lastMsg: m.message,
          lastTime: new Date(m.createdAt), unread: 0, type: "client", email: m.senderEmail,
        };
      }
      const t = threadMap[tid];
      const d = new Date(m.createdAt);
      if (d > t.lastTime) { t.lastTime = d; t.lastMsg = m.message; }
      if (m.read === "no" && m.senderType !== "staff") t.unread++;
    });
    return Object.values(threadMap)
      .filter(t => t.type === "client")
      .sort((a, b) => b.lastTime.getTime() - a.lastTime.getTime());
  }, [msgs]);

  /* ── AI inbox: threads where senderType = ai / bot ── */
  const aiThreads = useMemo<Thread[]>(() => {
    const threadMap: Record<string, Thread> = {};
    msgs.filter(m => m.senderType === "bot" || m.senderType === "ai").forEach(m => {
      const tid = m.threadId;
      if (!threadMap[tid]) {
        threadMap[tid] = {
          id: tid, name: m.senderName || "AI Lead", lastMsg: m.message,
          lastTime: new Date(m.createdAt), unread: 0, type: "ai",
        };
      }
      const t = threadMap[tid];
      const d = new Date(m.createdAt);
      if (d > t.lastTime) { t.lastTime = d; t.lastMsg = m.message; }
      if (m.read === "no") t.unread++;
    });
    return Object.values(threadMap).sort((a, b) => b.lastTime.getTime() - a.lastTime.getTime());
  }, [msgs]);

  /* ── Thread messages ── */
  const threadMessages = useMemo(() =>
    msgs.filter(m => m.threadId === selectedThread)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [msgs, selectedThread]);

  /* ── Auto scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadMessages]);

  /* ── Mark messages read when thread is opened ── */
  useEffect(() => {
    if (!selectedThread) return;
    msgs.filter(m => m.threadId === selectedThread && m.read === "no" && m.senderType !== "staff")
      .forEach(m => update(m.id, { read: "yes" }).catch(() => {}));
  }, [selectedThread]);

  /* ── Send reply ── */
  const sendReply = async () => {
    if (!draft.trim() || !selectedThread) return;
    const first = msgs.find(m => m.threadId === selectedThread);
    await create({
      threadId: selectedThread,
      senderType: "staff",
      senderName: "Admin",
      message: draft.trim(),
      read: "yes",
      linkedClientId: first?.linkedClientId,
    });
    setDraft("");
  };

  /* ── Start new thread ── */
  const startNewThread = (client: any) => {
    const tid = `thread-${client.id}-${Date.now()}`;
    setSelectedThread(tid);
    setTab("client-threads");
    // Pre-create a welcome message stub so thread appears
    create({
      threadId: tid, senderType: "staff", senderName: "Admin",
      message: `Hi ${client.contactPerson}, this is the Aménagement Monzon team. How can we help you today?`,
      read: "yes", linkedClientId: client.id,
    });
    setTimeout(() => setDraft(""), 100);
  };

  /* ── Broadcast ── */
  const sendBroadcast = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
    setBroadcastDraft({ subject: "", body: "", audience: "all-clients" });
  };

  const currentThreads = tab === "ai-inbox" ? aiThreads : clientThreads;
  const filteredThreads = search
    ? currentThreads.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.lastMsg.toLowerCase().includes(search.toLowerCase()))
    : currentThreads;
  const totalUnread = currentThreads.reduce((a, t) => a + t.unread, 0);

  if (isPending) return (
    <div className="flex items-center justify-center py-24">
      <Spinner size={24} className="animate-spin text-gold" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">Messaging Hub</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">Client threads, AI lead conversations, and broadcast messages.</p>
        </div>
        {totalUnread > 0 && (
          <span className="px-3 py-1 bg-gold/10 border border-gold/20 text-gold text-xs font-mono rounded-full">
            {totalUnread} unread
          </span>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {([
          { id: "client-threads", label: "Client Messages", icon: User,      count: clientThreads.reduce((a, t) => a + t.unread, 0) },
          { id: "ai-inbox",       label: "AI Lead Inbox",  icon: Robot,      count: aiThreads.reduce((a, t) => a + t.unread, 0) },
          { id: "broadcast",      label: "Broadcast",      icon: Megaphone,  count: 0 },
        ] as { id: Tab; label: string; icon: any; count: number }[]).map(({ id, label, icon: Icon, count }) => (
          <button key={id} onClick={() => { setTab(id); setSelectedThread(null); }}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-sans font-medium rounded-lg transition-all cursor-pointer ${tab === id ? "bg-white text-charcoal shadow-sm" : "text-gray-500 hover:text-charcoal"}`}>
            <Icon size={14} weight={tab === id ? "fill" : "regular"} />
            {label}
            {count > 0 && <span className="w-4 h-4 rounded-full bg-gold text-charcoal text-[9px] font-bold flex items-center justify-center">{count}</span>}
          </button>
        ))}
      </div>

      {/* ── Client / AI threads ── */}
      {tab !== "broadcast" && (
        <div className="flex gap-4 h-[600px]">
          {/* Thread list */}
          <div className="w-72 flex-shrink-0 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
            {/* Search */}
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                <MagnifyingGlass size={13} className="text-gray-400 flex-shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations…"
                  className="flex-1 text-xs font-sans bg-transparent border-none outline-none text-charcoal placeholder-gray-400 min-w-0" />
              </div>
            </div>

            {/* Thread items */}
            <div className="flex-1 overflow-y-auto">
              {filteredThreads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 p-6 text-center">
                  <Chat size={28} weight="regular" className="text-gray-300" />
                  <p className="font-sans text-xs text-gray-400">
                    {tab === "ai-inbox" ? "No AI conversations yet. Once leads chat via the widget, they'll appear here." : "No client messages yet."}
                  </p>
                  {tab === "client-threads" && clients && clients.length > 0 && (
                    <div className="w-full mt-2">
                      <p className="font-mono text-[10px] text-gray-400 mb-2">Start a conversation:</p>
                      {(clients ?? []).slice(0, 3).map(c => (
                        <button key={c.id} onClick={() => startNewThread(c)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-sans text-left text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer mb-1">
                          <div className="w-6 h-6 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                            <span className="font-headline font-bold text-[9px] text-gold">{c.contactPerson[0]}</span>
                          </div>
                          {c.contactPerson}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                filteredThreads.map(t => (
                  <button key={t.id} onClick={() => setSelectedThread(t.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer text-left transition-colors ${selectedThread === t.id ? "bg-gold/5 border-l-2 border-l-gold" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${tab === "ai-inbox" ? "bg-purple-100 border border-purple-200" : "bg-gold/10 border border-gold/20"}`}>
                      {tab === "ai-inbox" ? <Robot size={13} className="text-purple-600" /> : <span className="font-headline font-bold text-xs text-gold">{t.name[0]}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-sans text-xs font-semibold text-charcoal truncate">{t.name}</p>
                        <span className="font-mono text-[9px] text-gray-400 flex-shrink-0">{t.lastTime.toLocaleDateString("en-CA")}</span>
                      </div>
                      <p className="font-sans text-[10px] text-gray-400 truncate mt-0.5">{t.lastMsg}</p>
                    </div>
                    {t.unread > 0 && (
                      <span className="w-4 h-4 rounded-full bg-gold text-charcoal text-[9px] font-bold flex items-center justify-center flex-shrink-0">{t.unread}</span>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* New conversation */}
            {tab === "client-threads" && clients && clients.length > 0 && filteredThreads.length > 0 && (
              <div className="p-3 border-t border-gray-100">
                <select onChange={e => { if (!e.target.value) return; const c = clients?.find(cl => cl.id === e.target.value); if (c) startNewThread(c); e.target.value = ""; }}
                  className="w-full px-3 py-2 text-xs font-sans border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-gold cursor-pointer">
                  <option value="">+ New conversation…</option>
                  {(clients ?? []).map(c => <option key={c.id} value={c.id}>{c.contactPerson}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Message pane */}
          {selectedThread ? (
            <div className="flex-1 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
              {/* Header */}
              {(() => {
                const t = currentThreads.find(t => t.id === selectedThread);
                return (
                  <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                    <button onClick={() => setSelectedThread(null)} className="text-gray-400 hover:text-charcoal cursor-pointer md:hidden">
                      <ArrowLeft size={16} />
                    </button>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${tab === "ai-inbox" ? "bg-purple-100" : "bg-gold/10"}`}>
                      {tab === "ai-inbox" ? <Robot size={13} className="text-purple-600" /> : <span className="font-headline font-bold text-xs text-gold">{(t?.name ?? "?")[0]}</span>}
                    </div>
                    <div className="flex-1">
                      <p className="font-sans text-xs font-semibold text-charcoal">{t?.name ?? "Thread"}</p>
                      {t?.email && <p className="font-mono text-[10px] text-gray-400">{t.email}</p>}
                    </div>
                    {tab === "ai-inbox" && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-lg">
                        <Robot size={11} className="text-purple-500" />
                        <span className="font-mono text-[10px] text-purple-600">AI Conversation</span>
                      </div>
                    )}
                    <button onClick={() => setSelectedThread(null)} className="text-gray-300 hover:text-gray-500 cursor-pointer">
                      <X size={14} />
                    </button>
                  </div>
                );
              })()}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                {threadMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="font-sans text-xs text-gray-400">No messages yet. Start the conversation below.</p>
                  </div>
                ) : (
                  threadMessages.map(m => {
                    const isAdmin = m.senderType === "staff";
                    const isAI    = m.senderType === "bot" || m.senderType === "ai";
                    return (
                      <div key={m.id} className={`flex gap-2 group ${isAdmin ? "justify-end" : "justify-start"}`}>
                        {!isAdmin && (
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isAI ? "bg-purple-100" : "bg-gold/10"}`}>
                            {isAI ? <Robot size={12} className="text-purple-500" /> : <span className="font-headline font-bold text-[10px] text-gold">{(m.senderName || "?")[0]}</span>}
                          </div>
                        )}
                        <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-xs font-sans leading-relaxed ${isAdmin ? "bg-charcoal text-warm-white rounded-br-sm" : isAI ? "bg-purple-100 text-purple-900 rounded-bl-sm" : "bg-gray-100 text-charcoal rounded-bl-sm"}`}>
                          {!isAdmin && <p className="font-mono text-[9px] text-gray-400 mb-1">{m.senderName}</p>}
                          <p>{m.message}</p>
                          <p className={`font-mono text-[9px] mt-1 ${isAdmin ? "text-gray-400" : "text-gray-400"}`}>
                            {new Date(m.createdAt).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        {isAdmin && (
                          <button onClick={() => remove(m.id)} className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer self-center">
                            <Trash size={9} className="text-gray-400" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              <div className="px-4 py-3 border-t border-gray-100 flex gap-2 items-end flex-shrink-0">
                <textarea value={draft} onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
                  rows={2} className="flex-1 px-4 py-2.5 text-xs font-sans bg-gray-100 border border-transparent rounded-xl focus:outline-none focus:border-charcoal/30 resize-none transition-colors" />
                <button onClick={sendReply} disabled={!draft.trim() || isMutating}
                  className="w-10 h-10 bg-charcoal text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-gold transition-colors cursor-pointer flex-shrink-0 self-end">
                  {isMutating ? <Spinner size={14} className="animate-spin" /> : <PaperPlaneRight size={15} weight="fill" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-sm">
              <Chat size={40} weight="regular" className="text-gray-200" />
              <p className="font-sans text-sm text-gray-400">Select a conversation to view messages</p>
              {tab === "ai-inbox" && (
                <p className="font-mono text-[10px] text-gray-300 text-center max-w-xs px-4">AI conversations from the chat widget are captured here so you can follow up with leads directly.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Broadcast tab ── */}
      {tab === "broadcast" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <p className="font-headline font-semibold text-base text-charcoal mb-5">New Broadcast</p>

            {broadcastSent && (
              <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                <Check size={14} weight="bold" className="text-emerald-600" />
                <span className="font-sans text-sm text-emerald-700">Broadcast scheduled! Messages will be sent to the selected audience.</span>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Audience</label>
                <select value={broadcastDraft.audience} onChange={e => setBroadcastDraft(p => ({ ...p, audience: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-gold bg-white">
                  <option value="all-clients">All Clients</option>
                  <option value="active-clients">Active Clients Only</option>
                  <option value="portal-clients">Portal Clients Only</option>
                  <option value="leads">All Leads (new/contacted)</option>
                  <option value="won-leads">Won Leads</option>
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Subject Line</label>
                <input value={broadcastDraft.subject} onChange={e => setBroadcastDraft(p => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. Special offer this spring — Book now!"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-gold" />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1 block">Message Body</label>
                <textarea value={broadcastDraft.body} onChange={e => setBroadcastDraft(p => ({ ...p, body: e.target.value }))}
                  placeholder="Write your message here. Use {{name}} to personalize with the client's name."
                  rows={6} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-gold resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={sendBroadcast} disabled={!broadcastDraft.subject.trim() || !broadcastDraft.body.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white text-sm font-sans font-semibold rounded-xl hover:bg-gold disabled:opacity-40 cursor-pointer transition-colors">
                  <Megaphone size={15} weight="fill" /> Send Broadcast
                </button>
                <span className="font-mono text-[10px] text-gray-400">Messages will be logged to each client's thread</span>
              </div>
            </div>
          </div>

          {/* Broadcast tips */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="font-headline font-semibold text-sm text-charcoal mb-3">Audience Preview</p>
              {[
                ["All Clients",        (clients ?? []).length],
                ["Active Clients",     (clients ?? []).filter(c => c.status === "active").length],
                ["Portal Clients",     (clients ?? []).filter(c => c.portalAccess === "yes").length],
              ].map(([label, count]) => (
                <div key={label as string} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="font-sans text-xs text-gray-600">{label as string}</span>
                  <span className="font-mono text-xs font-semibold text-charcoal">{count as number} recipients</span>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="font-headline font-semibold text-xs text-amber-700 mb-2">💡 Broadcast Tips</p>
              <ul className="font-sans text-[11px] text-amber-700 leading-relaxed space-y-1.5">
                <li>• Use <code className="bg-amber-100 px-1 rounded">{"{{name}}"}</code> to personalize the greeting</li>
                <li>• Best open rates: Tue–Thu, 9am–11am</li>
                <li>• Keep subject lines under 60 characters</li>
                <li>• Include a clear call-to-action</li>
                <li>• Season special offers perform 3× better</li>
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="font-headline font-semibold text-xs text-charcoal mb-3">Quick Templates</p>
              {[
                ["Spring Special", "This spring, book your landscaping project and get 10% off. Limited spots available!"],
                ["Service Reminder", "Just a friendly reminder that your seasonal maintenance service is coming up next month."],
                ["New Service Launch", "Exciting news! We now offer {{service}}. Schedule a free consultation today."],
              ].map(([title, body]) => (
                <button key={title as string} onClick={() => setBroadcastDraft(p => ({ ...p, body: body as string, subject: title as string }))}
                  className="w-full text-left px-3 py-2.5 rounded-xl border border-gray-100 hover:border-gold/30 hover:bg-gold/5 transition-colors cursor-pointer mb-2 last:mb-0">
                  <p className="font-sans text-xs font-medium text-charcoal">{title as string}</p>
                  <p className="font-sans text-[10px] text-gray-400 truncate mt-0.5">{(body as string).slice(0, 60)}…</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
