import { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { Plus, Trash, PencilSimple, InstagramLogo, YoutubeLogo, TiktokLogo, Link, X, Check } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PLATFORMS = ["Instagram", "YouTube", "TikTok"];

const PLATFORM_ICON: Record<string, React.ReactNode> = {
  Instagram: <InstagramLogo size={16} weight="fill" className="text-pink-500" />,
  YouTube:   <YoutubeLogo size={16} weight="fill" className="text-red-500" />,
  TikTok:    <TiktokLogo size={16} weight="fill" className="text-charcoal" />,
};

const EMPTY_FORM = { platform: "Instagram", handle: "@amenagementmonzon", image: "", likes: "0", views: "0" };

export default function CommunityManagerPanel() {
  const { data: posts, isPending } = useQuery("CommunityPost", { orderBy: { createdAt: "desc" } });
  const { create, update, remove, isPending: isMutating } = useMutation("CommunityPost");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [platformFilter, setPlatformFilter] = useState("all");
  const [saved, setSaved] = useState(false);

  const all = posts ?? [];
  const filtered = platformFilter === "all" ? all : all.filter(p => p.platform === platformFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) { await update(editing, form); setEditing(null); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    else { await create(form); }
    setForm({ ...EMPTY_FORM }); setShowForm(false);
  };

  const handleEdit = (p: any) => {
    setEditing(p.id);
    setForm({ platform: p.platform, handle: p.handle, image: p.image, likes: p.likes, views: p.views });
    setShowForm(true);
  };

  const stats = {
    total: all.length,
    byPlatform: PLATFORMS.map(pl => ({ name: pl, count: all.filter(p => p.platform === pl).length })),
    totalLikes: all.reduce((a, p) => a + parseFloat(p.likes || "0"), 0),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">Community Manager</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">Manage social media posts displayed in the community section.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-green-600 font-sans flex items-center gap-1"><Check size={12} /> Saved!</span>}
          <button onClick={() => { setShowForm(p => !p); setEditing(null); setForm({ ...EMPTY_FORM }); }} className="flex items-center gap-2 px-4 py-2 bg-gold text-charcoal text-xs font-sans font-semibold rounded-xl hover:bg-gold-dark cursor-pointer">
            <Plus size={13} weight="bold" /> Add Post
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="font-headline font-bold text-xl text-charcoal">{stats.total}</p>
          <p className="font-sans text-xs text-gray-400 mt-0.5">Total Posts</p>
        </div>
        {stats.byPlatform.map(pl => (
          <div key={pl.name} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">{PLATFORM_ICON[pl.name]}<p className="font-headline font-bold text-xl text-charcoal">{pl.count}</p></div>
            <p className="font-sans text-xs text-gray-400">{pl.name} Posts</p>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-6 bg-white border-gray-200 shadow-sm">
          <CardHeader><CardTitle className="font-headline text-base text-charcoal">{editing ? "Edit Post" : "Add Post"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Platform</label>
                <select value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none">
                  {PLATFORMS.map(pl => <option key={pl}>{pl}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Handle</label>
                <input value={form.handle} onChange={e => setForm(p => ({ ...p, handle: e.target.value }))} placeholder="@handle" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Image URL *</label>
                <input required type="url" value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="https://…" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Likes / Engagement</label>
                <input value={form.likes} onChange={e => setForm(p => ({ ...p, likes: e.target.value }))} placeholder="1.2K" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Views</label>
                <input value={form.views} onChange={e => setForm(p => ({ ...p, views: e.target.value }))} placeholder="8.5K" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
              </div>
              <div className="flex gap-2 md:col-span-2">
                <button type="submit" disabled={isMutating} className="px-5 py-2 bg-charcoal text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-gray-800 disabled:opacity-50">{editing ? "Update" : "Save Post"}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-400">Cancel</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", ...PLATFORMS].map(f => (
          <button key={f} onClick={() => setPlatformFilter(f)} className={`px-3 py-1.5 text-xs font-mono rounded-xl border transition-all cursor-pointer ${f === platformFilter ? "bg-charcoal text-gold border-charcoal" : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"}`}>
            {f === "all" ? `All (${all.length})` : `${f} (${all.filter(p => p.platform === f).length})`}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {isPending ? (
        <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="font-sans text-sm text-gray-400">No posts yet. Add your first social post.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(post => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm group relative">
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img src={post.image} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  {PLATFORM_ICON[post.platform]}
                  <span className="font-sans text-xs font-medium text-charcoal truncate">{post.handle}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-gray-400">
                  <span>❤ {post.likes}</span>
                  <span>👁 {post.views}</span>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(post)} className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center shadow cursor-pointer hover:bg-charcoal group/btn transition-colors"><PencilSimple size={11} className="text-gray-600 group-hover/btn:text-white" /></button>
                <button onClick={() => remove(post.id)} disabled={isMutating} className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center shadow cursor-pointer hover:bg-red-600 group/btn transition-colors disabled:opacity-50"><Trash size={11} className="text-gray-600 group-hover/btn:text-white" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
