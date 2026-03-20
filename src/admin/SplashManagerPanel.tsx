import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSplash, DEFAULT_SPLASH_SETTINGS } from "@/contexts/SplashContext";
import {
  Play, Eye, ArrowCounterClockwise, ToggleLeft, ToggleRight,
  PencilSimple, CheckCircle,
} from "@phosphor-icons/react";

const THEME_OPTIONS = [
  { value: "hardscape-landscape",   label: "Hardscape / Landscape" },
  { value: "construction-renovation", label: "Construction / Renovation" },
  { value: "maintenance-service",   label: "Maintenance / Service Plans" },
  { value: "monzon-dark",           label: "Monzon Dark" },
  { value: "midnight-blue",         label: "Midnight Blue" },
  { value: "forest-green",          label: "Forest Green" },
];

export default function SplashManagerPanel() {
  const {
    settings,
    updateSettings,
    updateButton,
    resetSettings,
    resetSplashForPreview,
  } = useSplash();

  const [saved, setSaved] = useState(false);
  const [editingBtn, setEditingBtn] = useState<string | null>(null);

  const markSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggleEnabled = () => {
    updateSettings({ enabled: !settings.enabled });
    markSaved();
  };

  const handleTextChange = (val: string) => {
    updateSettings({ questionText: val });
  };

  const handleSpeedChange = (val: string) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0 && n <= 3) updateSettings({ animationSpeed: n });
  };

  const handleIntensityChange = (val: string) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0 && n <= 1) updateSettings({ particleIntensity: n });
  };

  const handleBgChange = (val: "default" | "pure-black" | "charcoal") => {
    updateSettings({ backgroundStyle: val });
  };

  const handlePreviewSplash = () => {
    resetSplashForPreview();
    // Navigate to root so splash shows
    window.location.href = "/";
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">Splash Screen Manager</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">
            Configure the cinematic intro experience shown to first-time visitors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-green-600 font-sans">
              <CheckCircle size={13} weight="fill" /> Saved
            </span>
          )}
          <Button
            onClick={handlePreviewSplash}
            className="flex items-center gap-2 bg-gold text-charcoal hover:bg-gold-dark text-xs font-semibold h-9 px-4 rounded-xl shadow-none"
          >
            <Play size={13} weight="fill" /> Preview Splash
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Enable / Disable */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-base text-charcoal">Visibility</CardTitle>
            <CardDescription className="font-sans text-xs text-gray-400">
              Control when the splash screen appears to visitors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="font-sans text-sm font-medium text-charcoal">
                  {settings.enabled ? "Splash Screen Enabled" : "Splash Screen Disabled"}
                </p>
                <p className="font-sans text-xs text-gray-400 mt-0.5">
                  {settings.enabled
                    ? "First-time visitors will see the cinematic intro."
                    : "Visitors go directly to the site."}
                </p>
              </div>
              <button
                onClick={handleToggleEnabled}
                className="flex-shrink-0 cursor-pointer focus:outline-none"
                title={settings.enabled ? "Disable" : "Enable"}
              >
                {settings.enabled
                  ? <ToggleRight size={32} weight="fill" className="text-gold" />
                  : <ToggleLeft size={32} weight="regular" className="text-gray-400" />
                }
              </button>
            </div>

            <div className="mt-4">
              <button
                onClick={() => { resetSplashForPreview(); markSaved(); }}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm font-sans text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 hover:border-gold/40 hover:text-charcoal transition-all cursor-pointer focus:outline-none"
              >
                <ArrowCounterClockwise size={14} weight="regular" />
                Reset "seen" flag (show on next visit)
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Text content */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-base text-charcoal">Text Content</CardTitle>
            <CardDescription className="font-sans text-xs text-gray-400">Edit the question and labels.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400">
                  Question / Headline
                </Label>
                <Input
                  value={settings.questionText}
                  onChange={e => handleTextChange(e.target.value)}
                  onBlur={markSaved}
                  className="font-sans text-sm border-gray-200 rounded-xl"
                  placeholder="¿Qué servicio deseas?"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400">
                  Background Style
                </Label>
                <div className="flex gap-2">
                  {(["default", "pure-black", "charcoal"] as const).map(style => (
                    <button
                      key={style}
                      onClick={() => { handleBgChange(style); markSaved(); }}
                      className={`flex-1 py-2.5 text-[10px] font-mono capitalize rounded-xl border transition-all cursor-pointer focus:outline-none ${settings.backgroundStyle === style ? "border-gold/50 bg-gold/5 text-charcoal font-semibold" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                    >
                      {style === "pure-black" ? "Pure Black" : style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Animation settings */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-base text-charcoal">Animation</CardTitle>
            <CardDescription className="font-sans text-xs text-gray-400">Tune timing and visual effects.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              {/* Speed */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400">Animation Speed</Label>
                  <span className="font-mono text-xs text-charcoal">{settings.animationSpeed}×</span>
                </div>
                <input
                  type="range" min="0.3" max="2.5" step="0.1"
                  value={settings.animationSpeed}
                  onChange={e => handleSpeedChange(e.target.value)}
                  onMouseUp={markSaved}
                  className="w-full accent-amber-500 h-1.5 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>Slow (0.3×)</span>
                  <span>Normal (1×)</span>
                  <span>Fast (2.5×)</span>
                </div>
              </div>

              {/* Particle intensity */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400">Particle Intensity</Label>
                  <span className="font-mono text-xs text-charcoal">{Math.round(settings.particleIntensity * 100)}%</span>
                </div>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={settings.particleIntensity}
                  onChange={e => handleIntensityChange(e.target.value)}
                  onMouseUp={markSaved}
                  className="w-full accent-amber-500 h-1.5 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>Off</span>
                  <span>Medium</span>
                  <span>Max</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reset */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-base text-charcoal">Reset & Preview</CardTitle>
            <CardDescription className="font-sans text-xs text-gray-400">Restore defaults or launch a preview.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <button
                onClick={handlePreviewSplash}
                className="flex items-center gap-2 w-full px-4 py-3.5 text-sm font-sans font-medium text-charcoal bg-gold/10 border border-gold/30 rounded-xl hover:bg-gold/15 transition-all cursor-pointer focus:outline-none"
              >
                <Eye size={15} weight="regular" className="text-gold" />
                Preview Splash Screen
              </button>
              <button
                onClick={() => { resetSettings(); markSaved(); }}
                className="flex items-center gap-2 w-full px-4 py-3.5 text-sm font-sans text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl hover:border-red-300 hover:text-red-500 transition-all cursor-pointer focus:outline-none"
              >
                <ArrowCounterClockwise size={14} weight="regular" />
                Reset to Default Settings
              </button>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Button Editor */}
      <div className="mt-6">
        <div className="mb-4">
          <h2 className="font-headline font-bold text-lg text-charcoal">Service Buttons</h2>
          <p className="font-sans text-xs text-gray-400 mt-0.5">Edit the three cinematic service selection cards.</p>
        </div>

        <div className="flex flex-col gap-4">
          {settings.buttons.map((btn, index) => (
            <Card key={btn.id} className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                      <span className="font-mono text-[10px] text-gold font-semibold">0{index + 1}</span>
                    </div>
                  </div>

                  {editingBtn === btn.id ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400">Button Label</Label>
                        <Input
                          value={btn.label}
                          onChange={e => updateButton(btn.id, { label: e.target.value })}
                          className="font-sans text-sm border-gray-200 rounded-xl"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400">Sub-label</Label>
                        <Input
                          value={btn.sublabel}
                          onChange={e => updateButton(btn.id, { sublabel: e.target.value })}
                          className="font-sans text-sm border-gray-200 rounded-xl"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400">Theme Preset ID</Label>
                        <select
                          value={btn.themePresetId}
                          onChange={e => updateButton(btn.id, { themePresetId: e.target.value })}
                          className="px-3 py-2 text-sm font-sans border border-gray-200 rounded-xl bg-white text-charcoal focus:outline-none focus:border-gold/50"
                        >
                          {THEME_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label className="font-mono text-[10px] uppercase tracking-widest text-gray-400">Destination URL</Label>
                        <Input
                          value={btn.destination}
                          onChange={e => updateButton(btn.id, { destination: e.target.value })}
                          className="font-sans text-sm border-gray-200 rounded-xl"
                          placeholder="/"
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <Button
                          onClick={() => { setEditingBtn(null); markSaved(); }}
                          className="bg-gold text-charcoal hover:bg-gold-dark text-xs font-semibold h-8 px-4 rounded-xl shadow-none"
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <p className="font-headline font-semibold text-charcoal text-sm">{btn.label}</p>
                      <p className="font-mono text-[10px] text-gray-400 mt-0.5">{btn.sublabel}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="font-mono text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          theme: {btn.themePresetId}
                        </span>
                        <span className="font-mono text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          → {btn.destination}
                        </span>
                      </div>
                    </div>
                  )}

                  {editingBtn !== btn.id && (
                    <button
                      onClick={() => setEditingBtn(btn.id)}
                      className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-charcoal group transition-colors cursor-pointer focus:outline-none flex-shrink-0"
                    >
                      <PencilSimple size={13} weight="regular" className="text-gray-500 group-hover:text-white" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
