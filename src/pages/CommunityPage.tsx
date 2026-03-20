import { Helmet } from "react-helmet-async";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import CommunitySection from "@/components/CommunitySection";
import PlaceholderPanel from "@/components/PlaceholderPanel";
import { Chat, Users } from "@phosphor-icons/react";

export default function CommunityPage() {
  return (
    <>
      <Helmet>
        <title>Community – Aménagement Monzon</title>
        <meta name="description" content="Join the Aménagement Monzon community on Instagram, YouTube, and TikTok." />
      </Helmet>
      <PageShell>
        <PageHero dark eyebrow="Social Media" title="Our Community" subtitle="Real projects. Real craftsmanship. Follow our cinematic journey across platforms." />
        <CommunitySection />

        <section className="py-16 bg-white">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <h2 className="font-headline font-bold text-fluid-xl text-charcoal mb-8">Community Hub</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PlaceholderPanel title="Discussion Forum" description="Community forum and Q&A module placeholder." icon={<Chat size={22} weight="regular" className="text-gray-400" />} height="h-56" />
              <PlaceholderPanel title="Member Directory" description="Verified members and community profiles placeholder." icon={<Users size={22} weight="regular" className="text-gray-400" />} height="h-56" />
            </div>
          </div>
        </section>
      </PageShell>
    </>
  );
}
