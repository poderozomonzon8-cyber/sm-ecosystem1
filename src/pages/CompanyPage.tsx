import { useState } from "react";
import { Helmet } from "react-helmet-async";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import { useQuery } from "@animaapp/playground-react-sdk";
import { Buildings, UsersThree, Trophy, Leaf, Star, Target, RocketLaunch, Heart, Clock, Medal } from "@phosphor-icons/react";

const FALLBACK_SECTIONS = [
  { section: "founder", title: "Silviol Monzon", subtitle: "Founder & CEO", content: "With over 15 years of combined experience in construction, renovation, and landscaping, Silviol Monzon founded Aménagement Monzon with a singular vision: to elevate every property into a masterpiece. Born in Montreal, Silviol grew up watching skilled tradespeople transform spaces, and developed a deep respect for craft, precision, and artistry from an early age.", photoUrl: "https://c.animaapp.com/mmslviois4xSNv/img/ai_2.png", active: "yes" },
  { section: "story", title: "Our Story", subtitle: "From a garage to a leading construction brand", content: "Aménagement Monzon began in 2015 with a single renovation project and a commitment to doing things differently. Today, we have completed over 250 projects across residential, commercial, and landscape categories — each one a testament to our relentless pursuit of excellence. Our journey from a small local contractor to a full-service property company is built on the trust of our clients and the skill of our people.", photoUrl: "https://c.animaapp.com/mmslviois4xSNv/img/ai_3.png", active: "yes" },
  { section: "mission", title: "Our Mission", subtitle: "Building beyond expectations", content: "To deliver premium construction, renovation, and maintenance services that transform properties into lasting works of art — with craftsmanship that stands the test of time and customer experiences that set the industry standard.", photoUrl: "", active: "yes" },
  { section: "vision", title: "Our Vision", subtitle: "The future of property transformation", content: "To be the most trusted and recognized construction and property maintenance brand in Quebec — known not only for the quality of our work, but for our innovation, environmental responsibility, and the positive impact we create in every community we serve.", photoUrl: "", active: "yes" },
];

const VALUES = [
  { icon: Star, label: "Excellence", desc: "We don't settle. Every nail, every cut, every finish is held to the highest standard." },
  { icon: Heart, label: "Integrity", desc: "Transparent pricing, honest timelines, and communication you can count on." },
  { icon: UsersThree, label: "Teamwork", desc: "Our crews are our greatest asset — skilled, dedicated, and always in sync." },
  { icon: Leaf, label: "Sustainability", desc: "We build with respect for the environment, using responsible materials and practices." },
  { icon: Target, label: "Precision", desc: "Architectural accuracy in every millimeter — because details define masterpieces." },
  { icon: RocketLaunch, label: "Innovation", desc: "We embrace new methods, materials, and technology to deliver better outcomes." },
];

const TIMELINE = [
  { year: "2015", event: "Founded in Montréal — first residential renovation project completed." },
  { year: "2017", event: "Expanded into landscaping and exterior maintenance services." },
  { year: "2019", event: "Launched commercial division — first major commercial project." },
  { year: "2021", event: "Reached 100 completed projects milestone. Team grew to 20+." },
  { year: "2023", event: "Launched SM Store and digital presence. 200+ projects delivered." },
  { year: "2024", event: "Opened Aménagement Monzon Academy. Launched full digital ecosystem." },
  { year: "2025", event: "Expanded to 250+ projects, 50+ team members, and 500+ clients served." },
];

const AWARDS = [
  { title: "Best Renovation Company", org: "Montreal Business Awards", year: "2023" },
  { title: "Top Landscaping Service", org: "Quebec Home & Garden", year: "2022" },
  { title: "Excellence in Construction", org: "APCHQ Regional Awards", year: "2021" },
  { title: "Community Builder Award", org: "City of Montréal", year: "2020" },
];

export default function CompanyPage() {
  const { data: profiles } = useQuery("CompanyProfile");
  const sections = (profiles && profiles.length > 0) ? profiles : FALLBACK_SECTIONS;

  const founder = sections.find(s => s.section === "founder");
  const story   = sections.find(s => s.section === "story");
  const mission = sections.find(s => s.section === "mission");
  const vision  = sections.find(s => s.section === "vision");

  return (
    <>
      <Helmet>
        <title>Our Company – Aménagement Monzon</title>
        <meta name="description" content="Meet the people and story behind Aménagement Monzon — our founder, heroes, values, and journey." />
      </Helmet>
      <PageShell>
        <PageHero eyebrow="About the Company" title="Built on Craft, Driven by Vision" subtitle="The story, people, and values that make Aménagement Monzon a cut above the rest." />

        {/* Founder */}
        {founder && (
          <section className="py-20 bg-white">
            <div className="max-w-screen-xl mx-auto px-6 md:px-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <span className="section-eyebrow">Founder Profile</span>
                  <h2 className="font-headline font-bold text-fluid-xl text-charcoal mt-3 mb-2">{founder.title}</h2>
                  <p className="font-sans text-sm text-gold font-semibold mb-5">{founder.subtitle}</p>
                  <p className="font-sans text-base text-gray-600 leading-relaxed">{founder.content}</p>
                </div>
                {founder.photoUrl && (
                  <div className="relative">
                    <div className="aspect-[4/5] rounded-3xl overflow-hidden">
                      <img src={founder.photoUrl} alt={founder.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-gold flex items-center justify-center shadow-xl">
                      <div className="text-center">
                        <p className="font-headline font-bold text-2xl text-charcoal leading-none">10+</p>
                        <p className="font-mono text-[9px] text-charcoal/70 leading-tight">Years</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Story */}
        {story && (
          <section className="py-20 bg-gray-50">
            <div className="max-w-screen-xl mx-auto px-6 md:px-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {story.photoUrl && (
                  <div className="aspect-video rounded-3xl overflow-hidden">
                    <img src={story.photoUrl} alt="Our story" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <span className="section-eyebrow">{story.subtitle}</span>
                  <h2 className="font-headline font-bold text-fluid-xl text-charcoal mt-3 mb-5">{story.title}</h2>
                  <p className="font-sans text-base text-gray-600 leading-relaxed">{story.content}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Mission & Vision */}
        <section className="py-20 bg-charcoal">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mission && (
                <div className="p-8 rounded-3xl border border-gold/20 bg-gold/5">
                  <Target size={32} weight="regular" className="text-gold mb-4" />
                  <span className="font-mono text-[10px] text-gold/60 uppercase tracking-widest">{mission.subtitle}</span>
                  <h3 className="font-headline font-bold text-2xl text-warm-white mt-2 mb-4">{mission.title}</h3>
                  <p className="font-sans text-sm text-gray-400 leading-relaxed">{mission.content}</p>
                </div>
              )}
              {vision && (
                <div className="p-8 rounded-3xl border border-white/10 bg-white/5">
                  <RocketLaunch size={32} weight="regular" className="text-warm-white mb-4" />
                  <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">{vision.subtitle}</span>
                  <h3 className="font-headline font-bold text-2xl text-warm-white mt-2 mb-4">{vision.title}</h3>
                  <p className="font-sans text-sm text-gray-400 leading-relaxed">{vision.content}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-white">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <div className="text-center mb-12">
              <span className="section-eyebrow">What Drives Us</span>
              <h2 className="font-headline font-bold text-fluid-xl text-charcoal mt-2">Our Core Values</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {VALUES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="group p-6 rounded-2xl border border-gray-100 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                    <Icon size={20} weight="regular" className="text-gold" />
                  </div>
                  <h3 className="font-headline font-bold text-base text-charcoal mb-2">{label}</h3>
                  <p className="font-sans text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <div className="text-center mb-12">
              <span className="section-eyebrow">Since 2015</span>
              <h2 className="font-headline font-bold text-fluid-xl text-charcoal mt-2">Our Journey</h2>
            </div>
            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2 hidden md:block" />
              <div className="flex flex-col gap-8">
                {TIMELINE.map((item, i) => (
                  <div key={item.year} className={`flex items-center gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                      <div className={`inline-block p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:border-gold/30 transition-colors`}>
                        <p className="font-mono text-xs text-gold font-semibold mb-1">{item.year}</p>
                        <p className="font-sans text-sm text-charcoal">{item.event}</p>
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-gold border-2 border-white shadow-md flex-shrink-0 hidden md:block" />
                    <div className="flex-1 hidden md:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Awards */}
        <section className="py-20 bg-white">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <div className="text-center mb-12">
              <span className="section-eyebrow">Recognition</span>
              <h2 className="font-headline font-bold text-fluid-xl text-charcoal mt-2">Awards & Honours</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {AWARDS.map((award) => (
                <div key={award.title} className="p-6 rounded-2xl border border-gray-100 hover:border-gold/30 transition-all text-center">
                  <Medal size={28} weight="fill" className="text-gold mx-auto mb-4" />
                  <h3 className="font-headline font-bold text-sm text-charcoal mb-1">{award.title}</h3>
                  <p className="font-sans text-xs text-gray-500">{award.org}</p>
                  <span className="mt-2 inline-block font-mono text-[10px] text-gold/70 bg-gold/10 px-2 py-0.5 rounded-full">{award.year}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </PageShell>
    </>
  );
}
