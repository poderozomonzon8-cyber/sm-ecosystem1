import { useState, useRef } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { Plus, Trash, Check, Warning, Image, UploadSimple, Spinner } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LOGO_TYPES = [
  { type: "light",   label: "Light Logo",    desc: "Used on dark backgrounds (nav, hero)" },
  { type: "dark",    label: "Dark Logo",     desc: "Used on light backgrounds (footer, print)" },
  { type: "favicon", label: "Favicon",       desc: "Browser tab icon (16×16 or 32×32)" },
  { type: "pwa-192", label: "PWA Icon 192",  desc: "Home screen icon (192×192)" },
  { type: "pwa-512", label: "PWA Icon 512",  desc: "Splash screen icon (512×512)" },
  { type: "email",   label: "Email Logo",    desc: "Used in email templates" },
];

const FALLBACK_INSTRUCTIONS: Record<string, string> = {
  light:   "Recommended: SVG or PNG, transparent background, white/gold version.",
  dark:    "Recommended: SVG or PNG, transparent background, dark version.",
  favicon: "Recommended: ICO or PNG, 32×32 or 64×64",
  "pwa-192": "Required: PNG, exactly 192×192",
  "pwa-512": "Required: PNG, exactly 512×512",
  email:   "Recommended: PNG, 300px wide max, solid background.",
};

// Helper: convert a File to a data-URL (for local preview and storage)
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function LogoManagerPanel() {
  const { data: logos, isPending } = useQuery("LogoAsset");
  const { create, update, remove, isPending: isMutating } = useMutation("LogoAsset");
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});
  const [fileNameInputs, setFileNameInputs] = useState<Record<string, string>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const getActive = (type: string) => logos?.find(l => l.type === type && l.active === "yes");

  // Handle file selected from disk — convert to data-URL for local preview/storage
  const handleFileChange = async (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(p => ({ ...p, [type]: true }));
    try {
      const dataUrl = await readFileAsDataURL(file);
      setPreviewUrls(p => ({ ...p, [type]: dataUrl }));
      setUrlInputs(p => ({ ...p, [type]: dataUrl }));
      setFileNameInputs(p => ({ ...p, [type]: file.name }));
    } catch (err) {
      console.error("Failed to read file", err);
    } finally {
      setUploading(p => ({ ...p, [type]: false }));
    }
  };

  const handleSave = async (type: string) => {
    const url = urlInputs[type];
    const fileName = fileNameInputs[type] || url?.split("/").pop() || type;
    if (!url?.trim()) return;

    /* Find any existing record for this slot regardless of active status */
    const existing = logos?.find((l: any) => l.type === type);
    if (existing) {
      await update(existing.id, { url: url.trim(), fileName, active: "yes" } as any);
    } else {
      await create({ type, url: url.trim(), fileName, active: "yes" } as any);
    }

    setUrlInputs(p => ({ ...p, [type]: "" }));
    setFileNameInputs(p => ({ ...p, [type]: "" }));
    setPreviewUrls(p => ({ ...p, [type]: "" }));
    setSaved(p => ({ ...p, [type]: true }));
    setTimeout(() => setSaved(p => ({ ...p, [type]: false })), 2500);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-headline font-bold text-2xl text-charcoal">Logo Manager</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">Upload and manage logos for every context. All changes apply globally.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {LOGO_TYPES.map(({ type, label, desc }) => {
          const active = getActive(type);
          const isSaved = saved[type];
          return (
            <Card key={type} className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <Image size={16} weight="regular" className="text-gold" />
                  </div>
                  <div>
                    <CardTitle className="font-headline text-sm text-charcoal">{label}</CardTitle>
                    <p className="font-sans text-[11px] text-gray-400">{desc}</p>
                  </div>
                  {active && <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-mono rounded-full">Active</span>}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {active && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                    <div className="w-16 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                      <img src={active.url} alt={label} className="max-w-full max-h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] text-gray-500 truncate">{active.fileName}</p>
                      <p className="font-mono text-[9px] text-gray-300 truncate">{active.url}</p>
                    </div>
                    <button onClick={() => remove(active.id)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-red-500 group cursor-pointer transition-colors">
                      <Trash size={11} weight="regular" className="text-gray-400 group-hover:text-white" />
                    </button>
                  </div>
                )}
                <p className="font-mono text-[9px] text-gray-400 mb-2">{FALLBACK_INSTRUCTIONS[type]}</p>
                <div className="flex flex-col gap-2">
                  {/* File upload button */}
                  <input
                    ref={el => { fileRefs.current[type] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleFileChange(type, e)}
                  />
                  <button
                    type="button"
                    onClick={() => fileRefs.current[type]?.click()}
                    disabled={uploading[type]}
                    className="w-full py-2.5 text-xs font-sans font-medium rounded-xl border-2 border-dashed border-gray-300 hover:border-charcoal/40 bg-gray-50 hover:bg-white text-gray-500 hover:text-charcoal transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploading[type]
                      ? <><Spinner size={13} className="animate-spin" /> Reading file…</>
                      : <><UploadSimple size={13} weight="bold" /> Choose image from computer</>
                    }
                  </button>

                  {/* Local file preview once selected */}
                  {previewUrls[type] && (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <img src={previewUrls[type]} alt="preview" className="w-14 h-10 object-contain rounded-lg bg-white border border-gray-200" />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-[10px] text-emerald-700 truncate">{fileNameInputs[type]}</p>
                        <p className="font-mono text-[9px] text-emerald-500 mt-0.5">Ready to save ↓</p>
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="font-mono text-[9px] text-gray-300 uppercase">or paste URL</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  <input
                    type="url"
                    placeholder="https://… (external logo URL)"
                    value={previewUrls[type] ? "" : (urlInputs[type] ?? "")}
                    onChange={e => {
                      setPreviewUrls(p => ({ ...p, [type]: "" }));
                      setUrlInputs(p => ({ ...p, [type]: e.target.value }));
                    }}
                    className="w-full px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/40"
                  />
                  <input
                    type="text"
                    placeholder="File name (optional)"
                    value={fileNameInputs[type] ?? ""}
                    onChange={e => setFileNameInputs(p => ({ ...p, [type]: e.target.value }))}
                    className="w-full px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/40"
                  />
                  <button
                    onClick={() => handleSave(type)}
                    disabled={isMutating || !urlInputs[type]?.trim()}
                    className={`w-full py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5 ${isSaved ? "bg-green-500 text-white" : "bg-charcoal text-gold hover:bg-gold hover:text-charcoal"}`}
                  >
                    {isSaved ? <><Check size={12} weight="bold" /> Saved!</> : <><Plus size={12} weight="bold" /> {active ? "Replace Logo" : "Save Logo"}</>}
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
        <div className="flex items-start gap-3">
          <Warning size={18} weight="fill" className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-sans text-sm font-semibold text-amber-800 mb-1">How to apply logos globally</p>
            <p className="font-sans text-xs text-amber-700 leading-relaxed">
              After uploading, logos are stored in the database. The HeaderNav, Footer, and email templates will automatically use the active logo URL from the LogoAsset records. For favicon and PWA icons, update the static/manifest.json and index.html files to reference the uploaded URLs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
