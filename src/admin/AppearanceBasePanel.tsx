import { useState } from "react";
import { TextT, Rows, GridFour, Cube, SquaresFour, TextAlignLeft } from "@phosphor-icons/react";

const SPACING_SCALE = [
  { name: "xs",  px: "4px",  desc: "Tight padding, small chips" },
  { name: "sm",  px: "8px",  desc: "Icon gaps, small insets" },
  { name: "md",  px: "16px", desc: "Card padding default" },
  { name: "lg",  px: "24px", desc: "Section inner padding" },
  { name: "xl",  px: "40px", desc: "Section side padding" },
  { name: "2xl", px: "64px", desc: "Section top/bottom padding" },
  { name: "3xl", px: "96px", desc: "Hero padding" },
];

const FONT_SCALE = [
  { name: "xs",    size:"11px", lh:"1.4", usage:"Captions, timestamps" },
  { name: "sm",    size:"13px", lh:"1.5", usage:"Helper text, tags" },
  { name: "base",  size:"15px", lh:"1.6", usage:"Body copy" },
  { name: "lg",    size:"18px", lh:"1.5", usage:"Lead paragraph" },
  { name: "xl",    size:"22px", lh:"1.35",usage:"Section subtitle" },
  { name: "2xl",   size:"28px", lh:"1.2", usage:"Section title" },
  { name: "3xl",   size:"40px", lh:"1.1", usage:"Page title" },
  { name: "hero",  size:"72px", lh:"1.0", usage:"Hero headline" },
];

const BUTTON_VARIANTS = [
  { name:"Primary",  bg:"bg-charcoal",  text:"text-white",     border:"border-transparent" },
  { name:"Gold",     bg:"bg-gold",      text:"text-charcoal",  border:"border-transparent" },
  { name:"Outline",  bg:"bg-transparent",text:"text-charcoal", border:"border-charcoal border" },
  { name:"Ghost",    bg:"bg-gray-100",  text:"text-charcoal",  border:"border-transparent" },
  { name:"Danger",   bg:"bg-red-600",   text:"text-white",     border:"border-transparent" },
];

const CARD_VARIANTS = [
  { name:"Default",  style:"bg-white border border-gray-200 shadow-sm" },
  { name:"Elevated", style:"bg-white border border-gray-200 shadow-lg" },
  { name:"Glass",    style:"glass border border-white/10" },
  { name:"Dark",     style:"bg-charcoal border border-gray-700/60" },
  { name:"Gold",     style:"bg-white border border-gold/30 shadow-sm" },
];

const FORM_ELEMENTS = [
  { name:"Text Input",    demo: <input type="text" placeholder="Enter value…" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-sans bg-white focus:outline-none focus:border-charcoal/40" /> },
  { name:"Select",        demo: <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-sans bg-white focus:outline-none"><option>Choose an option</option></select> },
  { name:"Textarea",      demo: <textarea rows={3} placeholder="Write something…" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-sans bg-white focus:outline-none resize-none" /> },
  { name:"Checkbox Row",  demo: <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="w-4 h-4 accent-gold" /><span className="font-sans text-sm text-charcoal">Enable feature</span></label> },
];

const SECTION_TEMPLATES = [
  { name:"Dark Hero",     desc:"Full-width dark section with headline + CTA",  bg:"bg-gradient-1 text-white" },
  { name:"Light Content", desc:"White background for body content",            bg:"bg-white text-charcoal" },
  { name:"Warm Section",  desc:"Off-white with subtle warmth",                 bg:"bg-gray-50 text-charcoal" },
  { name:"Side-by-Side",  desc:"50/50 layout text + visual",                   bg:"bg-white text-charcoal" },
  { name:"Full-Bleed",    desc:"Edge-to-edge image/video with overlay text",   bg:"bg-surface-0 text-white" },
];

export default function AppearanceBasePanel() {
  const [activeTab, setActiveTab] = useState<"spacing"|"typography"|"layout"|"buttons"|"cards"|"forms">("spacing");

  const tabs = [
    { id: "spacing",    label: "Spacing",    icon: Rows },
    { id: "typography", label: "Typography", icon: TextT },
    { id: "layout",     label: "Layout",     icon: GridFour },
    { id: "buttons",    label: "Buttons",    icon: Cube },
    { id: "cards",      label: "Cards",      icon: SquaresFour },
    { id: "forms",      label: "Forms",      icon: TextAlignLeft },
  ] as const;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-headline font-bold text-2xl text-charcoal">Appearance Base</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">Global system for spacing, typography, layout, and component templates.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === id ? "bg-white shadow-sm text-charcoal" : "text-gray-400 hover:text-gray-600"}`}>
            <Icon size={13} weight="regular" /> {label}
          </button>
        ))}
      </div>

      {/* Spacing */}
      {activeTab === "spacing" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="font-headline font-semibold text-sm text-charcoal mb-6">Global Spacing Scale</p>
          <div className="flex flex-col gap-4">
            {SPACING_SCALE.map(s => (
              <div key={s.name} className="flex items-center gap-6">
                <span className="font-mono text-xs text-gray-500 w-8">{s.name}</span>
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-gold/30 rounded-sm" style={{ width: s.px, height: "20px", minWidth: "4px" }} />
                  <span className="font-mono text-xs text-charcoal">{s.px}</span>
                </div>
                <span className="font-sans text-xs text-gray-400 flex-1">{s.desc}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="font-mono text-xs text-gray-500 mb-2">Usage note:</p>
            <p className="font-sans text-xs text-gray-500 leading-relaxed">The spacing system maps to Tailwind's default scale (p-1 = 4px, p-2 = 8px, etc.). For section-level padding, use the custom classes defined in tailwind.config.js.</p>
          </div>
        </div>
      )}

      {/* Typography */}
      {activeTab === "typography" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="font-headline font-semibold text-sm text-charcoal mb-6">Typography Scale</p>
          <div className="flex flex-col gap-6">
            {FONT_SCALE.map(f => (
              <div key={f.name} className="flex items-baseline gap-6 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                <span className="font-mono text-[10px] text-gray-400 w-12 flex-shrink-0">{f.name}</span>
                <span className="font-mono text-[10px] text-gray-400 w-16 flex-shrink-0">{f.size}</span>
                <span className="font-headline font-semibold text-charcoal leading-none flex-1" style={{ fontSize: Math.min(parseInt(f.size), 32) + "px" }}>
                  Aménagement Monzon
                </span>
                <span className="font-sans text-xs text-gray-400 flex-shrink-0 hidden sm:block">{f.usage}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { family: "DM Sans", var: "--font-headline", class:"font-headline", role:"Headings" },
              { family: "Inter", var: "--font-sans", class:"font-sans", role:"Body copy" },
              { family: "JetBrains Mono", var: "--font-mono", class:"font-mono", role:"Code, labels" },
            ].map(f => (
              <div key={f.var} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className={`text-base font-semibold text-charcoal ${f.class}`}>{f.family}</p>
                <p className="font-mono text-[10px] text-gray-400 mt-1">{f.var}</p>
                <p className="font-sans text-xs text-gray-500 mt-1">{f.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layout */}
      {activeTab === "layout" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="font-headline font-semibold text-sm text-charcoal mb-6">Section Templates</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SECTION_TEMPLATES.map(s => (
              <div key={s.name} className={`rounded-xl p-5 ${s.bg}`}>
                <p className="font-headline font-semibold text-sm">{s.name}</p>
                <p className="font-sans text-xs opacity-60 mt-1">{s.desc}</p>
                <div className="mt-4 flex flex-col gap-1.5 opacity-30">
                  <div className="h-2 rounded-full bg-current w-3/4" />
                  <div className="h-2 rounded-full bg-current w-full" />
                  <div className="h-2 rounded-full bg-current w-2/3" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <p className="font-headline font-semibold text-sm text-charcoal mb-4">Grid Systems</p>
            <div className="flex flex-col gap-3">
              {[
                { cols: 1, label:"Single column — max 768px" },
                { cols: 2, label:"Two columns — md and up" },
                { cols: 3, label:"Three columns — lg and up" },
                { cols: 4, label:"Four columns — xl and up" },
              ].map(g => (
                <div key={g.cols} className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${g.cols}, 1fr)` }}>
                  {Array.from({length: g.cols}).map((_, i) => (
                    <div key={i} className="h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                      <span className="font-mono text-[9px] text-gold/60">{g.label}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Buttons */}
      {activeTab === "buttons" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="font-headline font-semibold text-sm text-charcoal mb-6">Button System</p>
          <div className="flex flex-col gap-6">
            {BUTTON_VARIANTS.map(v => (
              <div key={v.name} className="flex items-center gap-6 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                <span className="font-sans text-xs text-gray-500 w-20 flex-shrink-0">{v.name}</span>
                <div className="flex items-center gap-3 flex-wrap">
                  {["xs","sm","md","lg"].map(sz => (
                    <button key={sz} className={`font-sans font-semibold rounded-xl transition-all cursor-pointer ${v.bg} ${v.text} ${v.border} ${sz === "xs" ? "px-3 py-1.5 text-xs" : sz === "sm" ? "px-4 py-2 text-sm" : sz === "md" ? "px-5 py-2.5 text-sm" : "px-7 py-3.5 text-base"}`}>
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards */}
      {activeTab === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CARD_VARIANTS.map(v => (
            <div key={v.name} className={`rounded-2xl p-5 min-h-40 ${v.style}`}>
              <p className={`font-headline font-semibold text-sm mb-2 ${v.name === "Dark" ? "text-warm-white" : "text-charcoal"}`}>{v.name} Card</p>
              <p className={`font-sans text-xs leading-relaxed ${v.name === "Dark" ? "text-gray-400" : "text-gray-500"}`}>This is how a {v.name.toLowerCase()} card looks. Used for content groups, feature highlights, and data display.</p>
              <button className={`mt-4 px-4 py-1.5 text-xs font-sans font-medium rounded-lg cursor-pointer ${v.name === "Dark" ? "bg-gold text-charcoal" : "bg-charcoal text-white"}`}>Action</button>
            </div>
          ))}
        </div>
      )}

      {/* Forms */}
      {activeTab === "forms" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="font-headline font-semibold text-sm text-charcoal mb-6">Form Component Templates</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FORM_ELEMENTS.map(f => (
              <div key={f.name} className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">{f.name}</label>
                {f.demo}
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 bg-gray-50 rounded-xl border border-gray-100">
            <p className="font-headline font-semibold text-sm text-charcoal mb-4">Sample Contact Form</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-1.5">Name</label><input type="text" placeholder="Full name" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-charcoal/30" /></div>
              <div><label className="block font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-1.5">Email</label><input type="email" placeholder="you@email.com" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-charcoal/30" /></div>
              <div className="sm:col-span-2"><label className="block font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-1.5">Message</label><textarea rows={3} placeholder="How can we help?" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none resize-none" /></div>
              <div className="sm:col-span-2"><button className="px-6 py-3 bg-gold text-charcoal font-sans font-semibold text-sm rounded-xl cursor-pointer hover:bg-gold-dark transition-colors">Send Message</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
