import { useState, useRef } from "react";
import { Play, VideoCamera, Trash, UploadSimple, Check, Eye, Spinner } from "@phosphor-icons/react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const STOCK_VIDEOS = [
  { name: "Cinematic Hero (Default)", url: "https://c.animaapp.com/mmslviois4xSNv/img/ai_1.mp4", thumb: "https://c.animaapp.com/mmslviois4xSNv/img/ai_1-poster.png" },
];

export default function VideoManagerPanel() {
  const [activeUrl, setActiveUrl] = useState(STOCK_VIDEOS[0].url);
  const [newUrl, setNewUrl]       = useState("");
  const [preview, setPreview]     = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedPreview, setUploadedPreview] = useState<{ name: string; url: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: assets } = useQuery("MediaAsset", { where: { fileType: { eq: "Video" } } });
  const { create, remove, isPending } = useMutation("MediaAsset");

  const allVideos = [
    ...STOCK_VIDEOS,
    ...(assets ?? []).filter(a => a.fileType === "Video").map(a => ({ name: a.fileName, url: a.url, thumb: "" })),
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await readFileAsDataURL(file);
      setUploadedPreview({ name: file.name, url: dataUrl });
      setNewUrl(dataUrl);
    } catch (err) {
      console.error("Failed to read video file", err);
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = async () => {
    const urlToAdd = newUrl.trim();
    if (!urlToAdd) return;
    const fileName = uploadedPreview?.name ?? `Custom Video ${Date.now()}`;
    await create({ fileName, fileType: "Video", url: urlToAdd });
    setNewUrl("");
    setUploadedPreview(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-headline font-bold text-2xl text-charcoal">Video Manager</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">Manage hero background videos and cinematic assets.</p>
      </div>

      {/* Current hero video */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
        <p className="font-headline font-semibold text-sm text-charcoal mb-4">Current Hero Video</p>
        <div className="aspect-video rounded-xl overflow-hidden bg-surface-0 mb-3 relative group">
          <video src={activeUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="font-mono text-xs text-white">Active Hero Video</span>
          </div>
        </div>
        <p className="font-mono text-[10px] text-gray-400 truncate">{activeUrl}</p>
      </div>

      {/* Add video — upload or URL */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
        <p className="font-headline font-semibold text-sm text-charcoal mb-4">Add Video</p>

        {/* File upload */}
        <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full mb-3 py-3 text-sm font-sans font-medium rounded-xl border-2 border-dashed border-gray-300 hover:border-charcoal/40 bg-gray-50 hover:bg-white text-gray-500 hover:text-charcoal transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {uploading
            ? <><Spinner size={15} className="animate-spin" /> Reading video…</>
            : <><UploadSimple size={15} weight="bold" /> Choose video file from computer</>
          }
        </button>

        {/* Preview if file selected */}
        {uploadedPreview && (
          <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <div className="w-16 h-10 rounded-lg overflow-hidden bg-black flex-shrink-0 flex items-center justify-center">
              <Play size={14} weight="fill" className="text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[11px] text-emerald-700 truncate">{uploadedPreview.name}</p>
              <p className="font-mono text-[9px] text-emerald-500 mt-0.5">File loaded — click "Add to Library" below</p>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="font-mono text-[9px] text-gray-300 uppercase">or paste URL</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="flex gap-2">
          <input type="url"
            value={uploadedPreview ? "" : newUrl}
            onChange={e => { setUploadedPreview(null); setNewUrl(e.target.value); }}
            placeholder="https://… (MP4 or WebM)"
            className="flex-1 px-4 py-2.5 text-sm font-sans bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/30"
          />
          <button
            onClick={handleAddUrl}
            disabled={!newUrl.trim() || isPending}
            className="px-4 py-2.5 bg-charcoal text-white text-xs font-sans font-semibold rounded-xl cursor-pointer hover:bg-gray-800 disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            Add to Library
          </button>
        </div>
      </div>

      {/* Video library */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <p className="font-headline font-semibold text-sm text-charcoal">Video Library</p>
        </div>
        {allVideos.map((v, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
            <div className="w-20 h-12 rounded-lg overflow-hidden bg-surface-0 flex-shrink-0 relative">
              {v.thumb ? <img src={v.thumb} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center"><VideoCamera size={16} className="text-gray-600" /></div>}
              <div className="absolute inset-0 flex items-center justify-center"><Play size={14} weight="fill" className="text-white/80" /></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-xs font-medium text-charcoal truncate">{v.name}</p>
              <p className="font-mono text-[9px] text-gray-400 truncate mt-0.5">{v.url}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setPreview(v.url)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-blue-600 group/btn transition-colors cursor-pointer">
                <Eye size={13} weight="regular" className="text-gray-500 group-hover/btn:text-white" />
              </button>
              <button onClick={() => setActiveUrl(v.url)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${activeUrl === v.url ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 hover:bg-emerald-600 group/btn"}`}>
                <Check size={13} weight={activeUrl === v.url ? "bold" : "regular"} className={activeUrl === v.url ? "" : "text-gray-500 group-hover/btn:text-white"} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-black rounded-2xl overflow-hidden max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <video src={preview} autoPlay loop muted playsInline controls className="w-full aspect-video" />
            <div className="p-4 flex justify-end">
              <button onClick={() => setPreview(null)} className="px-4 py-2 text-xs font-sans text-white bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-600">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
