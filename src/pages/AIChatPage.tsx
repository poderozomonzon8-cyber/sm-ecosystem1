import { Helmet } from "react-helmet-async";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import { Robot, Sparkle, Lock, ChartBar } from "@phosphor-icons/react";

export default function AIChatPage() {
  return (
    <PageShell>
      <Helmet>
        <title>AI Assistant – Aménagement Monzon</title>
        <meta name="description" content="Ask anything about our services, projects, and availability. Powered by AI." />
      </Helmet>

      <PageHero
        eyebrow="Intelligent Assistant"
        title="Ask Monzon AI"
        subtitle="Get instant answers about our services, project timelines, and more — available 24/7."
      />

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
            {[
              { icon: Robot, title: "Smart Answers", desc: "Ask about services, process, materials, timelines in plain English or French.", color: "bg-charcoal/5 text-charcoal" },
              { icon: Lock, title: "No Pricing", desc: "The AI never provides prices — all estimates go through our team for accuracy.", color: "bg-gold/10 text-gold-dark" },
              { icon: ChartBar, title: "Admin AI", desc: "A separate AI in your admin panel analyzes your financial data and trends.", color: "bg-blue-50 text-blue-600" },
            ].map(item => (
              <div key={item.title} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center">
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3`}>
                  <item.icon size={20} weight="fill" />
                </div>
                <p className="font-headline font-semibold text-sm text-charcoal mb-2">{item.title}</p>
                <p className="font-sans text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Chat embed hint */}
          <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-charcoal border border-gold/30 flex items-center justify-center mx-auto mb-6">
              <Robot size={32} weight="fill" className="text-gold" />
            </div>
            <h2 className="font-headline font-bold text-xl text-charcoal mb-3">Chat Available Site-Wide</h2>
            <p className="font-sans text-sm text-gray-500 leading-relaxed max-w-lg mx-auto mb-6">
              The Monzon AI chat widget is available on every page — look for the floating button in the bottom right corner. You can ask about services, processes, materials, project timelines, and more.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["What services do you offer?","How long does a renovation take?","What materials do you use?","How do I start a project?"].map(q => (
                <span key={q} className="px-4 py-2 text-xs font-sans text-charcoal bg-gray-100 rounded-full border border-gray-200">
                  {q}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 mt-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-mono text-xs text-gray-400">Monzon AI is online · Look for the chat button ↘</span>
            </div>
          </div>

        </div>
      </section>
    </PageShell>
  );
}
