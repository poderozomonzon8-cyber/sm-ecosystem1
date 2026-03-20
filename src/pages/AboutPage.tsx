import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import PlaceholderPanel from "@/components/PlaceholderPanel";
import ReviewsSection from "@/components/ReviewsSection";
import { Buildings, Users, Trophy, Leaf, ArrowUpRight } from "@phosphor-icons/react";

const STATS = [
  { value: "250+", label: "Projects Delivered" },
  { value: "8+",   label: "Years in Business"  },
  { value: "100%", label: "Client Satisfaction" },
  { value: "50+",  label: "Team Members"        },
];

const TEAM_PLACEHOLDERS = [
  "Founder & CEO", "Lead Architect", "Head of Construction", "Landscaping Director",
  "Project Manager", "Creative Director",
];

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About – Aménagement Monzon</title>
        <meta name="description" content="Learn about Aménagement Monzon — our story, team, and values." />
      </Helmet>
      <PageShell>
        <PageHero eyebrow="Our Story" title="About Aménagement Monzon" subtitle="Where architectural precision meets cinematic storytelling. Every project, a masterpiece." />

        {/* Stats */}
        <section className="py-16 bg-white">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS.map((s, i) => (
                <div key={i} className="text-center p-8 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <p className="font-headline font-bold text-4xl text-charcoal">{s.value}</p>
                  <p className="font-sans text-sm text-gray-500 mt-2 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission / Vision placeholders */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <h2 className="font-headline font-bold text-fluid-xl text-charcoal mb-8">Mission & Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Excellence",    icon: Trophy   },
                { label: "Teamwork",      icon: Users    },
                { label: "Craftsmanship", icon: Buildings },
                { label: "Sustainability",icon: Leaf     },
              ].map(({ label, icon: Icon }) => (
                <PlaceholderPanel key={label} title={label} description={`${label} value description placeholder — ready for content.`} icon={<Icon size={22} weight="regular" className="text-gray-400" />} height="h-48" />
              ))}
            </div>
          </div>
        </section>

        {/* Company Page CTA */}
        <section className="py-10 bg-charcoal">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-headline font-bold text-lg text-warm-white">Discover our full story</p>
              <p className="font-sans text-sm text-gray-400">Founder, heroes, timeline, values, and awards.</p>
            </div>
            <Link to="/about/company" className="flex items-center gap-2 px-6 py-3 bg-gold text-charcoal font-sans font-semibold text-sm rounded-xl hover:bg-gold-dark transition-all">
              Our Company <ArrowUpRight size={14} weight="bold" />
            </Link>
          </div>
        </section>

        {/* Team placeholder */}
        <section className="py-16 bg-white">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <h2 className="font-headline font-bold text-fluid-xl text-charcoal mb-8">Meet the Team</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {TEAM_PLACEHOLDERS.map((role) => (
                <div key={role} className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <Users size={24} weight="regular" className="text-gray-300" />
                  </div>
                  <div>
                    <p className="font-headline font-semibold text-xs text-charcoal">Team Member</p>
                    <p className="font-mono text-[10px] text-gray-400 mt-0.5">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <ReviewsSection limit={3} />
      </PageShell>
    </>
  );
}
