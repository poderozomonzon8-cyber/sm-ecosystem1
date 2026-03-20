import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell, BellSlash, CheckCircle, Trash, FunnelSimple,
  FadersHorizontal, EnvelopeOpen, Dot, ArrowClockwise,
} from "@phosphor-icons/react";
import { useNotifications } from "@/contexts/NotificationContext";
import type { NotifType } from "@/contexts/NotificationContext";

const TYPE_META: Record<NotifType, { label: string; color: string }> = {
  "lead-new":          { label: "New Lead",           color: "bg-amber-100 text-amber-700"  },
  "client-new":        { label: "New Client",         color: "bg-blue-100 text-blue-700"    },
  "invoice-sent":      { label: "Invoice Sent",       color: "bg-indigo-100 text-indigo-700"},
  "invoice-opened":    { label: "Invoice Opened",     color: "bg-cyan-100 text-cyan-700"    },
  "estimate-approved": { label: "Estimate Approved",  color: "bg-green-100 text-green-700"  },
  "payment-received":  { label: "Payment Received",   color: "bg-emerald-100 text-emerald-700"},
  "project-updated":   { label: "Project Update",     color: "bg-purple-100 text-purple-700"},
  "hours-submitted":   { label: "Hours Submitted",    color: "bg-orange-100 text-orange-700"},
  "expense-added":     { label: "Expense Added",      color: "bg-red-100 text-red-700"      },
  "system":            { label: "System",             color: "bg-gray-100 text-gray-600"    },
  "message":           { label: "Message",            color: "bg-pink-100 text-pink-700"    },
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60)   return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function NotificationCenterPanel() {
  const { notifications, unreadCount, markRead, markAllRead, remove, clearAll, push } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread" | NotifType>("all");

  const filtered = notifications.filter((n) => {
    if (filter === "all")    return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const testNotif = () => {
    push({
      type: "lead-new",
      title: "New Lead Received",
      message: "Jean-Pierre Dumont submitted a landscaping enquiry.",
      linkedEntityType: "Lead",
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-bold text-2xl text-charcoal">Notification Center</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">All in-app notifications for admin and staff.</p>
      </div>

      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-mono font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
              <Dot size={14} weight="fill" className="text-amber-500" /> {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={testNotif} variant="outline" className="text-xs h-8 px-3 rounded-xl border-gray-200 shadow-none gap-1.5">
            <Bell size={12} /> Test Notification
          </Button>
          <Button onClick={markAllRead} variant="outline" className="text-xs h-8 px-3 rounded-xl border-gray-200 shadow-none gap-1.5">
            <EnvelopeOpen size={12} /> Mark All Read
          </Button>
          <Button onClick={clearAll} variant="outline" className="text-xs h-8 px-3 rounded-xl border-red-200 text-red-500 hover:bg-red-50 shadow-none gap-1.5">
            <Trash size={12} /> Clear All
          </Button>
        </div>
      </div>

      {/* Type filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "unread", ...Object.keys(TYPE_META)] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`text-[10px] font-mono px-2.5 py-1 rounded-full border transition-all cursor-pointer focus:outline-none ${filter === f ? "bg-charcoal text-warm-white border-charcoal" : "bg-white text-gray-500 border-gray-200 hover:border-charcoal"}`}
          >
            {f === "all" ? "All" : f === "unread" ? "Unread" : TYPE_META[f as NotifType]?.label ?? f}
          </button>
        ))}
      </div>

      {/* List */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BellSlash size={32} weight="regular" className="text-gray-300 mb-3" />
              <p className="font-sans text-sm text-gray-400">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((n) => {
                const meta = TYPE_META[n.type] ?? TYPE_META.system;
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${!n.read ? "bg-gold/3" : ""}`}
                  >
                    {/* Unread dot */}
                    <div className="flex-shrink-0 mt-1">
                      {!n.read ? (
                        <span className="w-2 h-2 rounded-full bg-gold block" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-transparent border border-gray-200 block" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`font-sans text-sm font-medium text-charcoal ${!n.read ? "font-semibold" : ""}`}>
                          {n.title}
                        </p>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${meta.color}`}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-gray-500 truncate">{n.message}</p>
                      <p className="font-mono text-[10px] text-gray-400 mt-1">{timeAgo(n.timestamp)}</p>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                      className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-300 transition-colors cursor-pointer focus:outline-none"
                    >
                      <Trash size={12} weight="regular" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
