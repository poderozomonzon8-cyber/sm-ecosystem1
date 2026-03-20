import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  LockKey, ArrowUpRight, ArrowLeft, ShieldCheck, User,
  EnvelopeSimple, Eye, EyeSlash,
} from "@phosphor-icons/react";
import { useAppAuth } from "@/contexts/AuthContext";

type PageMode = "client" | "register" | "admin";

interface LoginPageProps {
  mode?: PageMode;
}

export default function LoginPage({ mode: initialMode = "client" }: LoginPageProps) {
  const [mode, setMode] = useState<PageMode>(initialMode);
  const { login, isPending: authPending, isAnonymous } = useAppAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return alert('Email/password required');
    setLoading(true);
    try {
      await login(email, password);
      if (mode === "admin") {
        navigate("/admin");
      } else {
        navigate("/portal");
      }
    } catch (e) {
      console.error('[LoginPage] Error:', e);
      alert('Login failed. Check email/password.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = mode === "admin";
  const isRegister = mode === "register";

  const titles: Record<PageMode, { eyebrow: string; title: string; subtitle: string }> = {
    client:   { eyebrow: "Client Access",    title: "Sign In",          subtitle: "Access your projects, invoices, and documents." },
    register: { eyebrow: "Create Account",   title: "Get Started",      subtitle: "Create your client account to access the portal." },
    admin:    { eyebrow: "Admin Access",      title: "Admin Portal",     subtitle: "Sign in with your administrator credentials." },
  };

  const { eyebrow, title, subtitle } = titles[mode];

  return (
    <>
      <Helmet>
        <title>{isAdmin ? "Admin Login" : isRegister ? "Register" : "Sign In"} – Aménagement Monzon</title>
      </Helmet>

      <div className={`min-h-screen flex ${isAdmin ? "bg-charcoal" : "bg-gray-50"}`}>

        {/* Left panel — decorative */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className={`absolute inset-0 ${isAdmin ? "bg-gradient-1" : "bg-charcoal"}`} />
          {/* Grid pattern */}
          <svg className="absolute inset-0 opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          {/* Radial glow */}
          <div className="absolute inset-0 bg-radial-gradient pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 60%, rgba(212,160,23,0.12) 0%, transparent 65%)" }} />
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between p-14">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl border border-gold/40 bg-gold/10 flex items-center justify-center group-hover:border-gold/80 transition-colors">
                <span className="font-headline font-bold text-sm text-gold">M</span>
              </div>
              <div>
                <p className="font-headline font-bold text-[15px] text-warm-white leading-tight">Aménagement<span className="text-gold"> Monzon</span></p>
                <p className="font-mono text-[9px] text-gray-500 tracking-widest uppercase">Construction · Signature</p>
              </div>
            </Link>

            <div>
              <p className="font-mono text-[10px] text-gold/60 tracking-widest uppercase mb-4">Est. 2024</p>
              <h2 className="font-headline font-bold text-4xl text-warm-white leading-tight mb-4">
                Premium spaces.<br />
                <span className="text-gradient-gold">Precision built.</span>
              </h2>
              <p className="font-sans text-sm text-gray-400 leading-relaxed max-w-sm">
                Construction, renovation, landscaping, and maintenance — delivering excellence across every project.
              </p>
            </div>

            <div>
              <div className="flex flex-col gap-3">
                {[
                  { icon: "🏗️", text: "Full project tracking & updates" },
                  { icon: "📄", text: "Real-time invoices & estimates" },
                  { icon: "💬", text: "Direct team messaging" },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className="text-sm">{item.icon}</span>
                    <p className="font-sans text-xs text-gray-400">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className={`flex-1 flex flex-col items-center justify-center px-6 py-12 ${isAdmin ? "bg-charcoal" : "bg-white"}`}>
          {/* Back link */}
          <div className="w-full max-w-md mb-6">
            <Link to="/"
              className={`inline-flex items-center gap-1.5 text-xs font-sans transition-colors ${isAdmin ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-charcoal"}`}>
              <ArrowLeft size={13} weight="regular" /> Back to site
            </Link>
          </div>

          <div className="w-full max-w-md">
            {/* Mode switcher (not for admin) */}
            {!isAdmin && (
              <div className={`flex gap-1 p-1 rounded-xl mb-8 ${isAdmin ? "bg-gray-800" : "bg-gray-100"}`}>
                <button onClick={() => setMode("client")}
                  className={`flex-1 py-2 text-xs font-sans font-medium rounded-lg transition-all cursor-pointer ${mode === "client" ? "bg-white text-charcoal shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                  Sign In
                </button>
                <button onClick={() => setMode("register")}
                  className={`flex-1 py-2 text-xs font-sans font-medium rounded-lg transition-all cursor-pointer ${mode === "register" ? "bg-white text-charcoal shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                  Create Account
                </button>
              </div>
            )}

            {/* Header */}
            <div className="mb-8">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${isAdmin ? "bg-gold/10 border border-gold/20" : "bg-charcoal"}`}>
                {isAdmin
                  ? <ShieldCheck size={22} weight="regular" className="text-gold" />
                  : <LockKey size={22} weight="regular" className="text-gold" />
                }
              </div>
              <span className={`section-eyebrow block mb-2 ${isAdmin ? "text-gold/60" : "text-gold/70"}`}>{eyebrow}</span>
              <h1 className={`font-headline font-bold text-3xl mb-2 ${isAdmin ? "text-warm-white" : "text-charcoal"}`}>{title}</h1>
              <p className={`font-sans text-sm leading-relaxed ${isAdmin ? "text-gray-400" : "text-gray-500"}`}>{subtitle}</p>
            </div>

            {/* CTA */}
<div className="space-y-4 mb-6">
              <div>
                <label className={`text-xs font-mono uppercase tracking-wider mb-1.5 block ${isAdmin ? "text-gray-400" : "text-gray-500"}`}>Email</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="silviolmonzon@amenagementmonzon.com"
                  className={`w-full px-4 py-3 rounded-xl border font-sans text-sm transition-all focus:outline-none focus:ring-2 ${isAdmin ? "border-gray-600/50 bg-gray-800/50 text-warm-white placeholder-gray-500 focus:border-gold focus:ring-gold/20" : "border-gray-200 bg-white text-charcoal placeholder-gray-400 focus:border-charcoal focus:ring-charcoal/20"}`} />
              </div>
              <div>
                <label className={`text-xs font-mono uppercase tracking-wider mb-1.5 block ${isAdmin ? "text-gray-400" : "text-gray-500"}`}>Password</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-xl border font-sans text-sm transition-all focus:outline-none focus:ring-2 ${isAdmin ? "border-gray-600/50 bg-gray-800/50 text-warm-white placeholder-gray-500 focus:border-gold focus:ring-gold/20" : "border-gray-200 bg-white text-charcoal placeholder-gray-400 focus:border-charcoal focus:ring-charcoal/20"}`} />
              </div>
            </div>
            <button onClick={handleLogin} disabled={loading || !email || !password}
              className={`w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl font-sans font-semibold text-sm transition-all cursor-pointer disabled:opacity-60 shadow-lg mb-5 ${isAdmin ? "bg-gold text-charcoal hover:bg-gold-dark shadow-gold/20" : "bg-charcoal text-warm-white hover:bg-gray-800 shadow-black/10"}`}>
              {loading
                ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                : <>
                    {isRegister ? <User size={16} weight="bold" /> : <LockKey size={16} weight="bold" />}
                    {isRegister ? "Create Account" : `Sign In${isAdmin ? " to Admin" : ""}`}
                    <ArrowUpRight size={14} weight="bold" />
                  </>
              }
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className={`flex-1 h-px ${isAdmin ? "bg-gray-700" : "bg-gray-200"}`} />
              <span className={`font-mono text-[10px] ${isAdmin ? "text-gray-600" : "text-gray-400"}`}>SECURE · ENCRYPTED · PROTECTED</span>
              <div className={`flex-1 h-px ${isAdmin ? "bg-gray-700" : "bg-gray-200"}`} />
            </div>

            {/* Footer note */}
            {isAdmin ? (
              <div className={`text-center text-xs font-sans ${isAdmin ? "text-gray-600" : "text-gray-400"}`}>
                <p>Admin email: <span className="font-mono text-gray-500">silviolmonzon@amenagementmonzon.com</span></p>
                <p className="mt-1 text-gray-700">Staff access requires role assignment by admin.</p>
              </div>
            ) : (
              <p className="text-center text-xs font-sans text-gray-400">
                {mode === "client"
                  ? <>Don't have an account? <button onClick={() => setMode("register")} className="text-gold hover:text-gold-dark cursor-pointer">Create one →</button></>
                  : <>Already have an account? <button onClick={() => setMode("client")} className="text-gold hover:text-gold-dark cursor-pointer">Sign in →</button></>
                }
              </p>
            )}

            {/* Admin login link */}
            {!isAdmin && (
              <p className="text-center text-[10px] font-mono text-gray-300 mt-4">
                <Link to="/admin/login" className="hover:text-gray-500 transition-colors">Admin portal →</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
