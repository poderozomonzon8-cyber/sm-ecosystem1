import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DeviceMobile, Desktop, Globe, CloudArrowDown,
  WifiHigh, WifiSlash, ArrowClockwise, CheckCircle,
  WarningCircle, Broadcast, HardDrives, Spinner,
  Download,
} from "@phosphor-icons/react";
import { usePWA } from "@/hooks/usePWA";

/* ── Stat Tile ── */
function StatTile({ icon: Icon, label, value, accent = false }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex flex-col gap-1.5 p-4 rounded-2xl border ${accent ? "bg-gold/5 border-gold/20" : "bg-white border-gray-200"}`}>
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
        <Icon size={16} weight="regular" className={accent ? "text-gold" : "text-gray-500"} />
      </div>
      <p className="font-mono text-lg font-bold text-charcoal">{value}</p>
      <p className="font-sans text-xs text-gray-500">{label}</p>
    </div>
  );
}

/* ── Cache Stats (placeholder computed values) ── */
function CacheStats() {
  const [stats, setStats] = useState<{ name: string; count: number; size: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const cacheNames = await caches.keys();
      const result = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name);
          const keys  = await cache.keys();
          return { name, count: keys.length, size: `~${(keys.length * 48).toFixed(0)} KB` };
        })
      );
      setStats(result);
    } catch {
      setStats([]);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">Cache Storage</p>
        <button onClick={refresh} disabled={loading}
          className="flex items-center gap-1.5 text-xs font-sans text-gray-400 hover:text-charcoal transition-colors cursor-pointer focus:outline-none disabled:opacity-50">
          {loading ? <Spinner size={12} className="animate-spin" /> : <ArrowClockwise size={12} />} Refresh
        </button>
      </div>
      {stats.length === 0 && !loading ? (
        <p className="font-sans text-xs text-gray-400 italic">Click refresh to inspect caches.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {stats.map((s) => (
            <div key={s.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <p className="font-mono text-xs text-charcoal truncate max-w-[60%]">{s.name}</p>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-gray-400">{s.count} files</span>
                <span className="font-mono text-[10px] text-gray-400">{s.size}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Panel ── */
export default function PWASettingsPanel() {
  const { isInstallable, isInstalled, isOnline, isUpdating, swStatus, promptInstall, skipWaiting, swRegistration } = usePWA();
  const [cleared, setCleared] = useState(false);

  const clearCache = async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  const statusColor = isOnline
    ? swStatus === "updated" ? "text-amber-500" : "text-green-600"
    : "text-red-500";

  const statusLabel = !isOnline
    ? "Offline"
    : swStatus === "installing" ? "Installing…"
    : swStatus === "updated"    ? "Update ready"
    : swStatus === "error"      ? "Error"
    : "Active";

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-bold text-2xl text-charcoal">PWA Settings</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">Progressive Web App configuration, caching, and installation.</p>
      </div>

      {/* Status tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile icon={isOnline ? WifiHigh : WifiSlash} label="Network"     value={isOnline ? "Online" : "Offline"} accent={!isOnline} />
        <StatTile icon={HardDrives}  label="Service Worker" value={statusLabel} accent={swStatus === "updated"} />
        <StatTile icon={DeviceMobile} label="Install State" value={isInstalled ? "Installed" : "Browser"} />
        <StatTile icon={Globe}       label="Scope"         value="/" />
      </div>

      {/* Update banner */}
      {isUpdating && (
        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6">
          <div className="flex items-center gap-3">
            <WarningCircle size={20} weight="fill" className="text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-sans text-sm font-semibold text-amber-800">Update Available</p>
              <p className="font-sans text-xs text-amber-600">A new version of the app is ready.</p>
            </div>
          </div>
          <Button onClick={skipWaiting} className="bg-amber-500 text-white hover:bg-amber-600 text-xs h-8 px-4 rounded-xl shadow-none">
            Apply Update
          </Button>
        </div>
      )}

      {/* Install prompt */}
      {isInstallable && (
        <div className="flex items-center justify-between p-4 bg-gold/5 border border-gold/20 rounded-2xl mb-6">
          <div className="flex items-center gap-3">
            <Download size={20} weight="fill" className="text-gold flex-shrink-0" />
            <div>
              <p className="font-sans text-sm font-semibold text-charcoal">Install as App</p>
              <p className="font-sans text-xs text-gray-500">Install Aménagement Monzon on your device for the best experience.</p>
            </div>
          </div>
          <Button onClick={promptInstall} className="bg-gold text-charcoal hover:bg-gold-dark text-xs h-8 px-4 rounded-xl shadow-none font-semibold">
            Install
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Service Worker Status */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-base text-charcoal flex items-center gap-2">
              <Broadcast size={16} weight="regular" className="text-gold" /> Service Worker
            </CardTitle>
            <CardDescription className="font-sans text-xs text-gray-400">Registration and lifecycle status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-sans text-xs text-gray-500">Status</span>
                <span className={`font-mono text-xs font-medium ${statusColor}`}>{statusLabel}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-sans text-xs text-gray-500">Scope</span>
                <span className="font-mono text-xs text-charcoal">{swRegistration?.scope ?? "/"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-sans text-xs text-gray-500">State</span>
                <span className="font-mono text-xs text-charcoal">{swRegistration?.active ? "Activated" : "Pending"}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-sans text-xs text-gray-500">Update interval</span>
                <span className="font-mono text-xs text-charcoal">60 min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Caching Strategy */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-base text-charcoal flex items-center gap-2">
              <HardDrives size={16} weight="regular" className="text-gold" /> Caching Strategy
            </CardTitle>
            <CardDescription className="font-sans text-xs text-gray-400">How assets are cached for offline use.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {[
                { type: "HTML / Navigation", strategy: "Network First + Offline fallback", color: "bg-blue-100 text-blue-700" },
                { type: "JS / CSS / Fonts",  strategy: "Cache First",                      color: "bg-green-100 text-green-700" },
                { type: "Images",            strategy: "Cache First",                      color: "bg-green-100 text-green-700" },
                { type: "Video / 3D Assets", strategy: "Cache First (no range)",            color: "bg-purple-100 text-purple-700" },
                { type: "API / SDK calls",   strategy: "Network Only (bypassed)",           color: "bg-gray-100 text-gray-500" },
              ].map((r) => (
                <div key={r.type} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0 gap-2">
                  <span className="font-sans text-xs text-gray-600 min-w-0 truncate">{r.type}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${r.color}`}>{r.strategy}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cache Inspector */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-base text-charcoal flex items-center gap-2">
              <CloudArrowDown size={16} weight="regular" className="text-gold" /> Cache Inspector
            </CardTitle>
            <CardDescription className="font-sans text-xs text-gray-400">Inspect and clear cached content.</CardDescription>
          </CardHeader>
          <CardContent>
            <CacheStats />
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <Button onClick={clearCache} variant="outline"
                className="text-xs h-8 px-4 rounded-xl border-red-200 text-red-600 hover:bg-red-50 shadow-none">
                Clear All Caches
              </Button>
              {cleared && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-sans">
                  <CheckCircle size={13} weight="fill" /> Cleared
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-base text-charcoal flex items-center gap-2">
              <Desktop size={16} weight="regular" className="text-gold" /> App Configuration
            </CardTitle>
            <CardDescription className="font-sans text-xs text-gray-400">Manifest and PWA identity settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {[
                ["App Name",        "Aménagement Monzon"],
                ["Short Name",      "Monzon"],
                ["Display Mode",    "standalone"],
                ["Start URL",       "/"],
                ["Theme Colour",    "#d49e30"],
                ["Background",      "#0a0c0e"],
                ["Orientation",     "any"],
                ["Shortcuts",       "Portal, AI Chat"],
                ["Background Sync", "leads, contacts"],
                ["Push Support",    "placeholder ready"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <span className="font-sans text-xs text-gray-500">{k}</span>
                  <span className="font-mono text-xs text-charcoal">{v}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
