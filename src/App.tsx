/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  ROUTER LOCK — Aménagement Monzon Ecosystem                 ║
 * ║  DO NOT modify this file unless explicitly instructed.      ║
 * ║  Adding pages: import below + add a <Route> only.           ║
 * ║  Renaming pages: update both the import AND the Route.      ║
 * ║  Theme changes, UI changes, animation upgrades MUST NOT     ║
 * ║  touch the route tree below.                                ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

/* ── Splash ─────────────────────────────────────────────────── */
import SplashScreen from "@/components/SplashScreen";
import { useSplash } from "@/contexts/SplashContext";

/* ── PUBLIC PAGES ────────────────────────────────────────────── */
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import CompanyPage from "@/pages/CompanyPage";
import ServicesPage from "@/pages/ServicesPage";
import PortfolioPage from "@/pages/PortfolioPage";
import StorePage from "@/pages/StorePage";
import CommunityPage from "@/pages/CommunityPage";
import ContactPage from "@/pages/ContactPage";
import BlogPage from "@/pages/BlogPage";
import AcademyPage from "@/pages/AcademyPage";
import MaintenancePage from "@/pages/MaintenancePage";
import AIChatPage from "@/pages/AIChatPage";

/* ── AUTH PAGES ──────────────────────────────────────────────── */
import LoginPage from "@/pages/LoginPage";

/* ── PROTECTED — CLIENT PORTAL ──────────────────────────────── */
import ClientPortalPage from "@/pages/ClientPortalPage";

/* ── PROTECTED — ADMIN PANEL ─────────────────────────────────── */
import AdminPage from "@/pages/AdminPage";

/* ─────────────────────────────────────────────────────────────
   AppRoutes — inner component so useSplash can read context
───────────────────────────────────────────────────────────── */
function AppRoutes() {
  const { shouldShowSplash } = useSplash();

  return (
    <>
      {shouldShowSplash && <SplashScreen />}
      <Routes>
        {/* ── PUBLIC WEBSITE ──────────────────────────── */}
        <Route path="/"                 element={<HomePage />} />
        <Route path="/about"            element={<AboutPage />} />
        <Route path="/about/company"    element={<CompanyPage />} />
        <Route path="/services"         element={<ServicesPage />} />
        <Route path="/portfolio"        element={<PortfolioPage />} />
        <Route path="/store"            element={<StorePage />} />
        <Route path="/community"        element={<CommunityPage />} />
        <Route path="/contact"          element={<ContactPage />} />
        <Route path="/blog"             element={<BlogPage />} />
        <Route path="/academy"          element={<AcademyPage />} />
        <Route path="/maintenance"      element={<MaintenancePage />} />
        <Route path="/ai-chat"          element={<AIChatPage />} />

        {/* ── AUTH ────────────────────────────────────── */}
        <Route path="/login"            element={<LoginPage />} />
        <Route path="/register"         element={<LoginPage mode="register" />} />
        <Route path="/admin/login"      element={<LoginPage mode="admin" />} />

        {/* ── CLIENT PORTAL ───────────────────────────── */}
        <Route path="/portal"           element={<ClientPortalPage />} />
        <Route path="/portal/:section"  element={<ClientPortalPage />} />

        {/* ── ADMIN PANEL ─────────────────────────────── */}
        <Route path="/admin"            element={<AdminPage />} />
        <Route path="/admin/:panel"     element={<AdminPage />} />
      </Routes>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   App — root with providers
───────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </HelmetProvider>
  );
}
