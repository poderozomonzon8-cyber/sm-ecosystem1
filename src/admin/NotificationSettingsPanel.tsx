import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell, EnvelopeSimple, DeviceMobile, CheckCircle,
  Users, ShieldCheck, UserCircle, Briefcase,
} from "@phosphor-icons/react";
import { useNotifications } from "@/contexts/NotificationContext";
import type { NotifType, NotifChannel } from "@/contexts/NotificationContext";

/* ── Types ── */
const NOTIF_TYPES: { type: NotifType; label: string; description: string; audience: string }[] = [
  { type: "lead-new",          label: "New Lead",           description: "A new contact form or AI chat lead captured.",   audience: "admin,manager" },
  { type: "client-new",        label: "New Client",         description: "A new client record created.",                   audience: "admin" },
  { type: "invoice-sent",      label: "Invoice Sent",       description: "An invoice has been sent to a client.",          audience: "admin,accountant,client" },
  { type: "invoice-opened",    label: "Invoice Opened",     description: "Client opened an invoice email.",                audience: "admin,accountant" },
  { type: "estimate-approved", label: "Estimate Approved",  description: "Client approved an estimate.",                   audience: "admin,manager,accountant" },
  { type: "payment-received",  label: "Payment Received",   description: "A payment has been recorded.",                   audience: "admin,accountant,client" },
  { type: "project-updated",   label: "Project Updated",    description: "A project status or milestone changed.",         audience: "admin,manager,employee,client" },
  { type: "hours-submitted",   label: "Hours Submitted",    description: "An employee submitted a time entry.",            audience: "admin,manager" },
  { type: "expense-added",     label: "Expense Added",      description: "A new expense was recorded.",                    audience: "admin,accountant" },
  { type: "system",            label: "System Alerts",      description: "Errors, warnings, and system notifications.",    audience: "admin" },
  { type: "message",           label: "New Message",        description: "Admin-client direct message.",                   audience: "admin,client" },
];

const ROLES = [
  { id: "admin",      label: "Admin",      icon: ShieldCheck   },
  { id: "manager",    label: "Manager",    icon: Briefcase     },
  { id: "employee",   label: "Employee",   icon: UserCircle    },
  { id: "accountant", label: "Accountant", icon: Users         },
  { id: "client",     label: "Client",     icon: UserCircle    },
];

/* ── Toggle ── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${checked ? "bg-gold" : "bg-gray-200"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
}

/* ── Channel Badge ── */
function ChannelToggle({ icon: Icon, label, checked, onChange }: { icon: any; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer focus:outline-none ${checked ? "bg-gold/10 text-gold border-gold/30" : "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300"}`}
    >
      <Icon size={11} weight={checked ? "fill" : "regular"} /> {label}
    </button>
  );
}

/* ═══════════════════ MAIN ═══════════════════ */
export default function NotificationSettingsPanel() {
  const { prefs, setPref, pushEnabled, requestPushPermission } = useNotifications();
  const [saved, setSaved] = useState(false);
  const [activeRole, setActiveRole] = useState("admin");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const channelIcons: Record<string, { icon: any; label: string; channel: NotifChannel }> = {
    inApp: { icon: Bell,            label: "In-App", channel: "in-app" },
    email: { icon: EnvelopeSimple,  label: "Email",  channel: "email"  },
    push:  { icon: DeviceMobile,    label: "Push",   channel: "push"   },
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-bold text-2xl text-charcoal">Notification Settings</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">Configure which roles receive which alerts and via which channels.</p>
      </div>

      {/* Push permission */}
      <div className="mb-6 p-4 rounded-2xl border bg-white border-gray-200 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <DeviceMobile size={18} weight="regular" className="text-amber-500" />
          </div>
          <div>
            <p className="font-sans text-sm font-medium text-charcoal">Browser Push Notifications</p>
            <p className="font-sans text-xs text-gray-400">
              {pushEnabled ? "Push notifications are enabled in this browser." : "Enable push notifications to receive alerts even when the tab is closed."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pushEnabled ? (
            <span className="flex items-center gap-1.5 text-xs text-green-600 font-sans">
              <CheckCircle size={14} weight="fill" /> Enabled
            </span>
          ) : (
            <Button onClick={requestPushPermission} className="bg-amber-500 text-white hover:bg-amber-600 text-xs h-8 px-4 rounded-xl shadow-none font-semibold">
              Enable Push
            </Button>
          )}
        </div>
      </div>

      {/* Role tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {ROLES.map((r) => {
          const Icon = r.icon;
          return (
            <button key={r.id} onClick={() => setActiveRole(r.id)}
              className={`flex items-center gap-1.5 text-xs font-sans font-medium px-3 py-2 rounded-xl border transition-all cursor-pointer focus:outline-none ${activeRole === r.id ? "bg-charcoal text-warm-white border-charcoal" : "bg-white text-gray-500 border-gray-200 hover:border-charcoal"}`}>
              <Icon size={13} weight={activeRole === r.id ? "fill" : "regular"} />
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Notification rows */}
      <Card className="bg-white border-gray-200 shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="font-headline text-sm text-charcoal">
            Notification Rules — <span className="capitalize text-gold">{activeRole}</span>
          </CardTitle>
          <CardDescription className="font-sans text-xs text-gray-400">
            Toggle which alerts this role receives and via which channels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col divide-y divide-gray-100">
            {NOTIF_TYPES.map((n) => {
              const isAudience = n.audience.includes(activeRole);
              return (
                <div key={n.type} className={`py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${!isAudience ? "opacity-40" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-charcoal">{n.label}</p>
                    <p className="font-sans text-xs text-gray-400">{n.description}</p>
                    <p className="font-mono text-[9px] text-gray-300 mt-0.5">Default audience: {n.audience.replace(/,/g, " · ")}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    {Object.entries(channelIcons).map(([key, cfg]) => (
                      <ChannelToggle
                        key={key}
                        icon={cfg.icon}
                        label={cfg.label}
                        checked={!!prefs[n.type]?.[key as "inApp" | "email" | "push"]}
                        onChange={(v) => setPref(n.type, cfg.channel, v)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Global frequency */}
      <Card className="bg-white border-gray-200 shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="font-headline text-sm text-charcoal">Notification Frequency</CardTitle>
          <CardDescription className="font-sans text-xs text-gray-400">Control how often digest emails are sent.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {[
              { label: "Instant (real-time)", id: "instant" },
              { label: "Daily digest (9:00 AM)",  id: "daily" },
              { label: "Weekly summary (Monday)", id: "weekly" },
            ].map((opt) => (
              <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="freq" defaultChecked={opt.id === "instant"}
                  className="w-3.5 h-3.5 accent-gold cursor-pointer" />
                <span className="font-sans text-sm text-gray-600 group-hover:text-charcoal">{opt.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client notification templates */}
      <Card className="bg-white border-gray-200 shadow-sm mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-sm text-charcoal">Client Notification Events</CardTitle>
          <CardDescription className="font-sans text-xs text-gray-400">Events that trigger automatic client emails.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col divide-y divide-gray-100">
            {[
              { label: "Invoice Sent",        desc: "Email sent when invoice is dispatched",      defaultOn: true },
              { label: "Estimate Sent",       desc: "Email sent when estimate is dispatched",     defaultOn: true },
              { label: "Estimate Approved",   desc: "Confirmation email after approval",          defaultOn: true },
              { label: "Payment Received",    desc: "Receipt email after payment recorded",       defaultOn: true },
              { label: "Project Update",      desc: "Status update email when project changes",   defaultOn: false },
              { label: "Message from Admin",  desc: "Email relay for admin → client messages",    defaultOn: true },
            ].map((row) => {
              const [on, setOn] = useState(row.defaultOn);
              return (
                <div key={row.label} className="flex items-center justify-between py-3.5">
                  <div>
                    <p className="font-sans text-sm text-charcoal">{row.label}</p>
                    <p className="font-sans text-xs text-gray-400">{row.desc}</p>
                  </div>
                  <Toggle checked={on} onChange={setOn} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} className="bg-gold text-charcoal hover:bg-gold-dark text-sm h-10 px-6 rounded-xl shadow-none font-semibold">
          Save Notification Settings
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-sans">
            <CheckCircle size={15} weight="fill" /> Settings saved
          </span>
        )}
      </div>
    </div>
  );
}
