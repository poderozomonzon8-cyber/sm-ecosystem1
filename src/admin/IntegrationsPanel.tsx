import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  EnvelopeSimple, Robot, Video, Cube, Image,
  Link as LinkIcon, Key, ToggleRight, CheckCircle,
  Plug, Globe, ArrowRight, GitFork,
} from "@phosphor-icons/react";

/* ── Types ── */
interface IntegrationConfig {
  id: string;
  label: string;
  description: string;
  icon: any;
  color: string;
  fields: { key: string; label: string; placeholder: string; type?: string }[];
  enabled: boolean;
  badge?: string;
}

/* ── Toggle Switch ── */
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

/* ── Integration Section Card ── */
function IntegrationCard({
  config,
  values,
  onChange,
  onToggle,
  onSave,
  saved,
}: {
  config: IntegrationConfig;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onToggle: () => void;
  onSave: () => void;
  saved: boolean;
}) {
  const Icon = config.icon;
  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${config.color}`}>
              <Icon size={18} weight="regular" />
            </div>
            <div>
              <CardTitle className="font-headline text-sm text-charcoal flex items-center gap-2">
                {config.label}
                {config.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 uppercase tracking-wider">{config.badge}</span>
                )}
              </CardTitle>
              <CardDescription className="font-sans text-xs text-gray-400">{config.description}</CardDescription>
            </div>
          </div>
          <Toggle checked={config.enabled} onChange={onToggle} />
        </div>
      </CardHeader>
      {config.enabled && (
        <CardContent>
          <div className="flex flex-col gap-4">
            {config.fields.map((f) => (
              <div key={f.key} className="flex flex-col gap-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400">{f.label}</Label>
                <Input
                  type={f.type ?? "text"}
                  placeholder={f.placeholder}
                  value={values[f.key] ?? ""}
                  onChange={(e) => onChange(f.key, e.target.value)}
                  className="font-sans text-sm border-gray-200 rounded-xl"
                />
              </div>
            ))}
            <div className="flex items-center gap-3 pt-1">
              <Button onClick={onSave} className="bg-gold text-charcoal hover:bg-gold-dark text-xs h-8 px-4 rounded-xl shadow-none font-semibold">
                Save
              </Button>
              {saved && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-sans">
                  <CheckCircle size={13} weight="fill" /> Saved
                </span>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/* ── Webhooks Section ── */
function WebhooksSection() {
  const [webhooks, setWebhooks] = useState([
    { id: "1", label: "New Lead → Zapier", url: "", event: "lead.created",  enabled: false },
    { id: "2", label: "Invoice Sent → Slack", url: "", event: "invoice.sent", enabled: false },
    { id: "3", label: "Payment → QuickBooks", url: "", event: "payment.received", enabled: false },
  ]);
  const [saved, setSaved] = useState<string | null>(null);

  const update = (id: string, field: string, value: string | boolean) => {
    setWebhooks((prev) => prev.map((w) => w.id === id ? { ...w, [field]: value } : w));
  };

  const save = (id: string) => {
    setSaved(id);
    setTimeout(() => setSaved(null), 2000);
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
            <GitFork size={18} weight="regular" className="text-violet-500" />
          </div>
          <div>
            <CardTitle className="font-headline text-sm text-charcoal">Webhooks & Automation</CardTitle>
            <CardDescription className="font-sans text-xs text-gray-400">Send events to external services via webhooks.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {webhooks.map((w) => (
            <div key={w.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="font-sans text-sm font-medium text-charcoal">{w.label}</p>
                <Toggle checked={w.enabled} onChange={(v) => update(w.id, "enabled", v)} />
              </div>
              {w.enabled && (
                <div className="flex flex-col gap-2">
                  <Input
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={w.url}
                    onChange={(e) => update(w.id, "url", e.target.value)}
                    className="font-mono text-xs border-gray-200 rounded-xl"
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-gray-400">Event: {w.event}</span>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => save(w.id)} className="bg-gold text-charcoal hover:bg-gold-dark text-xs h-7 px-3 rounded-lg shadow-none font-semibold">
                        Save
                      </Button>
                      {saved === w.id && (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-sans">
                          <CheckCircle size={12} weight="fill" /> Saved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <button className="flex items-center gap-2 text-xs font-sans text-gray-400 hover:text-charcoal transition-colors cursor-pointer focus:outline-none">
            + Add webhook
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── API Keys Section ── */
function APIKeysSection() {
  const [keys, setKeys] = useState({
    openaiKey:      "",
    anthropicKey:   "",
    googleMapsKey:  "",
    stripeKey:      "",
    sendgridKey:    "",
    twilioSid:      "",
    twilioToken:    "",
  });
  const [show,  setShow]  = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const toggle = (k: string) => setShow((p) => ({ ...p, [k]: !p[k] }));
  const save = () => {
    localStorage.setItem("monzon_api_keys_meta", JSON.stringify(Object.keys(keys).map((k) => ({ key: k, configured: !!keys[k as keyof typeof keys] }))));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields: { key: keyof typeof keys; label: string; placeholder: string }[] = [
    { key: "openaiKey",     label: "OpenAI API Key",       placeholder: "sk-..." },
    { key: "anthropicKey",  label: "Anthropic API Key",    placeholder: "sk-ant-..." },
    { key: "googleMapsKey", label: "Google Maps API Key",  placeholder: "AIza..." },
    { key: "stripeKey",     label: "Stripe Secret Key",    placeholder: "sk_live_..." },
    { key: "sendgridKey",   label: "SendGrid API Key",     placeholder: "SG...." },
    { key: "twilioSid",     label: "Twilio Account SID",   placeholder: "AC..." },
    { key: "twilioToken",   label: "Twilio Auth Token",    placeholder: "..." },
  ];

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <Key size={18} weight="regular" className="text-gray-500" />
          </div>
          <div>
            <CardTitle className="font-headline text-sm text-charcoal">API Keys</CardTitle>
            <CardDescription className="font-sans text-xs text-gray-400">Securely store third-party API credentials.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {fields.map((f) => (
            <div key={f.key} className="flex flex-col gap-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400">{f.label}</Label>
              <div className="relative">
                <Input
                  type={show[f.key] ? "text" : "password"}
                  placeholder={f.placeholder}
                  value={keys[f.key]}
                  onChange={(e) => setKeys((p) => ({ ...p, [f.key]: e.target.value }))}
                  className="font-mono text-xs border-gray-200 rounded-xl pr-10"
                />
                <button onClick={() => toggle(f.key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-charcoal text-[10px] font-mono cursor-pointer focus:outline-none">
                  {show[f.key] ? "hide" : "show"}
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-1">
            <Button onClick={save} className="bg-gold text-charcoal hover:bg-gold-dark text-xs h-8 px-4 rounded-xl shadow-none font-semibold">Save Keys</Button>
            {saved && <span className="flex items-center gap-1 text-xs text-green-600 font-sans"><CheckCircle size={13} weight="fill" /> Saved</span>}
          </div>
          <p className="font-sans text-[10px] text-gray-400 leading-relaxed">
            Keys are stored in-browser. In production, use a secrets manager or environment variables.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════ MAIN ═══════════════════ */
export default function IntegrationsPanel() {
  const INTEGRATIONS: IntegrationConfig[] = [
    {
      id: "email",
      label: "Email Integration",
      description: "SMTP / API for invoices, estimates, notifications, and client messages.",
      icon: EnvelopeSimple,
      color: "bg-blue-50 text-blue-500",
      badge: "Ready",
      fields: [
        { key: "adminEmail",  label: "Admin Email",   placeholder: "silviolmonzon@amenagementmonzon.com" },
        { key: "smtpHost",    label: "SMTP Host",     placeholder: "smtp.gmail.com" },
        { key: "smtpPort",    label: "SMTP Port",     placeholder: "587" },
        { key: "smtpUser",    label: "SMTP Username", placeholder: "your@email.com" },
        { key: "smtpPass",    label: "SMTP Password", placeholder: "••••••••", type: "password" },
        { key: "fromName",    label: "From Name",     placeholder: "Aménagement Monzon" },
      ],
      enabled: true,
    },
    {
      id: "ai-public",
      label: "Public AI Chat",
      description: "Connect the website chatbot to OpenAI or Anthropic.",
      icon: Robot,
      color: "bg-emerald-50 text-emerald-500",
      badge: "API Ready",
      fields: [
        { key: "aiModel",      label: "Model",       placeholder: "gpt-4o-mini" },
        { key: "aiSystemMsg",  label: "System Prompt context", placeholder: "You are the Aménagement Monzon assistant…" },
        { key: "aiMaxTokens",  label: "Max tokens",  placeholder: "512" },
      ],
      enabled: false,
    },
    {
      id: "ai-admin",
      label: "Admin AI Analyst",
      description: "Economic dashboard AI — powered by OpenAI or Anthropic.",
      icon: Robot,
      color: "bg-indigo-50 text-indigo-500",
      badge: "API Ready",
      fields: [
        { key: "adminAiModel",   label: "Model",      placeholder: "gpt-4o" },
        { key: "adminAiContext", label: "Context",    placeholder: "You are a financial analyst for Aménagement Monzon..." },
      ],
      enabled: false,
    },
    {
      id: "video",
      label: "Video Manager",
      description: "Connect Vimeo, YouTube, or direct CDN for the hero and project reels.",
      icon: Video,
      color: "bg-red-50 text-red-400",
      fields: [
        { key: "vimeoToken",  label: "Vimeo Access Token", placeholder: "xxxxxxxxxxxxxxxx" },
        { key: "ytApiKey",    label: "YouTube API Key",    placeholder: "AIza..." },
        { key: "cdnBaseUrl",  label: "Video CDN Base URL", placeholder: "https://cdn.monzon.com/videos/" },
      ],
      enabled: false,
    },
    {
      id: "3d-assets",
      label: "3D Asset Manager",
      description: "CDN or storage for GLB, OBJ, GLTF, HDR assets.",
      icon: Cube,
      color: "bg-purple-50 text-purple-500",
      fields: [
        { key: "assetCdn",    label: "3D Assets CDN URL",  placeholder: "https://cdn.monzon.com/3d/" },
        { key: "assetBucket", label: "Storage Bucket Name", placeholder: "monzon-3d-assets" },
      ],
      enabled: false,
    },
    {
      id: "image-library",
      label: "Image Library",
      description: "Cloudinary, Imgix, or S3 for image hosting and transformation.",
      icon: Image,
      color: "bg-orange-50 text-orange-400",
      fields: [
        { key: "imgCloudName", label: "Cloudinary Cloud Name", placeholder: "monzon-media" },
        { key: "imgApiKey",    label: "Cloudinary API Key",    placeholder: "123456789..." },
        { key: "imgBaseUrl",   label: "Custom CDN Base URL",   placeholder: "https://images.monzon.com/" },
      ],
      enabled: false,
    },
  ];

  const [configs, setConfigs] = useState<Record<string, { enabled: boolean; values: Record<string, string> }>>(
    () => {
      const stored = localStorage.getItem("monzon_integrations");
      const parsed = stored ? JSON.parse(stored) : {};
      return Object.fromEntries(
        INTEGRATIONS.map((i) => [
          i.id,
          { enabled: parsed[i.id]?.enabled ?? i.enabled, values: parsed[i.id]?.values ?? {} },
        ])
      );
    }
  );
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setConfigs((p) => ({ ...p, [id]: { ...p[id], enabled: !p[id].enabled } }));
  };

  const change = (id: string, key: string, value: string) => {
    setConfigs((p) => ({ ...p, [id]: { ...p[id], values: { ...p[id].values, [key]: value } } }));
  };

  const save = (id: string) => {
    localStorage.setItem("monzon_integrations", JSON.stringify(configs));
    setSaved((p) => ({ ...p, [id]: true }));
    setTimeout(() => setSaved((p) => ({ ...p, [id]: false })), 2500);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-bold text-2xl text-charcoal">Integrations</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">Connect email, AI, media, webhooks, and third-party services.</p>
      </div>

      {/* Status summary */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {INTEGRATIONS.map((i) => (
          <span key={i.id} className={`flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full border ${configs[i.id]?.enabled ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${configs[i.id]?.enabled ? "bg-green-500" : "bg-gray-300"}`} />
            {i.label}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-5">
        {INTEGRATIONS.map((i) => (
          <IntegrationCard
            key={i.id}
            config={{ ...i, enabled: configs[i.id]?.enabled ?? i.enabled }}
            values={configs[i.id]?.values ?? {}}
            onChange={(key, val) => change(i.id, key, val)}
            onToggle={() => toggle(i.id)}
            onSave={() => save(i.id)}
            saved={!!saved[i.id]}
          />
        ))}
        <WebhooksSection />
        <APIKeysSection />
      </div>
    </div>
  );
}
