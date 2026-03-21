import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import ContactSection from "@/components/ContactSection";

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact – Aménagement Monzon</title>
        <meta
          name="description"
          content="Get in touch with Aménagement Monzon to start your next project."
        />
      </Helmet>

      <PageShell>
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <PageHero
            eyebrow="Get In Touch"
            title="Contact Us"
            subtitle="Tell us about your vision and we'll craft a tailored plan that brings it to life."
          />
        </motion.div>

        {/* CONTACT SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="pb-20"
        >
          <ContactSection />
        </motion.div>

        {/* CTA FINAL (Opcional pero recomendado para conversión) */}
        <motion.section
          className="py-16 bg-charcoal text-center rounded-3xl max-w-screen-xl mx-auto mt-10 px-6 md:px-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          <h2 className="font-headline font-bold text-fluid-xl text-warm-white mb-4">
            Ready to start your project?
          </h2>
          <p className="font-sans text-sm text-gray-400 max-w-md mx-auto mb-8">
            Our team is here to guide you from the first idea to the final result.
          </p>

          <a
            href="tel:+1-514-000-0000"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-charcoal font-sans font-semibold text-sm rounded-xl hover:bg-gold-dark transition-all shadow-lg shadow-gold/20"
          >
            Call Us Today
          </a>
        </motion.section>
      </PageShell>
    </>
  );
}