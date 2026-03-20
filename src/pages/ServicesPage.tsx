import { Helmet } from "react-helmet-async";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import ServicesSection from "@/components/ServicesSection";
import ThreeDContainer from "@/components/ThreeDContainer";
import ContactSection from "@/components/ContactSection";
import PlaceholderPanel from "@/components/PlaceholderPanel";
import ReviewsSection from "@/components/ReviewsSection";
import { ChartBar } from "@phosphor-icons/react";

export default function ServicesPage() {
  return (
    <>
      <Helmet>
        <title>Services – Aménagement Monzon</title>
        <meta name="description" content="Construction, renovation, landscaping, and maintenance services by Aménagement Monzon." />
      </Helmet>
      <PageShell>
        <PageHero
          eyebrow="What We Do"
          title="Our Services"
          subtitle="A full spectrum of premium property services, delivered with the precision and artistry that defines Aménagement Monzon."
        />
        <ServicesSection />

        {/* Optional 3D showcase */}
        <ThreeDContainer />

        {/* Process placeholder */}
        <section className="py-20 bg-white">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <h2 className="font-headline font-bold text-fluid-xl text-charcoal mb-8">Our Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {["Discovery & Estimate", "Design & Planning", "Execution", "Handover & Support"].map((step, i) => (
                <PlaceholderPanel key={step} title={`Step ${i + 1}: ${step}`} description="Process step placeholder — ready for content." height="h-48" icon={<ChartBar size={22} weight="regular" className="text-gray-400" />} />
              ))}
            </div>
          </div>
        </section>

        <ReviewsSection limit={3} />
        <ContactSection />
      </PageShell>
    </>
  );
}
