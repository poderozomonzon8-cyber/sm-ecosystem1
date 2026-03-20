import { Helmet } from "react-helmet-async";
import HeaderNav from "@/components/HeaderNav";
import HeroSection from "@/components/HeroSection";
import ThreeDContainer from "@/components/ThreeDContainer";
import ServicesSection from "@/components/ServicesSection";
import PortfolioSection from "@/components/PortfolioSection";
import StorePreview from "@/components/StorePreview";
import CommunitySection from "@/components/CommunitySection";
import ContactSection from "@/components/ContactSection";
import ClientPortalBanner from "@/components/ClientPortalBanner";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Aménagement Monzon – Crafting Spaces with a Cinematic Touch</title>
        <meta name="description" content="Premium construction, renovation, landscaping, and maintenance services by Aménagement Monzon. Cinematic quality, exceptional craftsmanship." />
        <meta property="og:title" content="Aménagement Monzon – Crafting Spaces with a Cinematic Touch" />
        <meta property="og:description" content="Premium construction, renovation, landscaping, and maintenance services." />
        <link rel="canonical" href="https://amenagement-monzon.com/" />
      </Helmet>
      <HeaderNav />
      <main>
        <HeroSection />
        <ThreeDContainer />
        <ServicesSection />
        <PortfolioSection />
        <StorePreview />
        <CommunitySection />
        <ContactSection />
        <ClientPortalBanner />
      </main>
      <Footer />
      <AIChatWidget />
    </>
  );
}
