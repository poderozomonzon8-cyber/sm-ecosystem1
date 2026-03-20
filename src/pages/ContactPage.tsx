import { Helmet } from "react-helmet-async";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import ContactSection from "@/components/ContactSection";

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact – Aménagement Monzon</title>
        <meta name="description" content="Get in touch with Aménagement Monzon to start your next project." />
      </Helmet>
      <PageShell>
        <PageHero eyebrow="Get In Touch" title="Contact Us" subtitle="Tell us about your vision and we'll craft a tailored plan that brings it to life." />
        <ContactSection />
      </PageShell>
    </>
  );
}
