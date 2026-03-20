import { useState } from "react";
import { X, LockKey, ArrowUpRight, User, EnvelopeSimple } from "@phosphor-icons/react";
import { useAppAuth } from "@/contexts/AuthContext";

interface LoginModalProps {
  onClose: () => void;
  mode?: "client" | "admin";
}

export default function LoginModal({ onClose, mode = "client" }: LoginModalProps) {
  const { login } = useAppAuth();
const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (e) {
      console.error('[Login] Error:', e);
      alert('Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = mode === "admin";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <div className={`rounded-3xl p-8 md:p-10 shadow-2xl border ${isAdmin ? "bg-charcoal border-gray-700/60" : "bg-white border-gray-200"}`}>

          {/* Close */}
          <button onClick={onClose}
            className={`absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${isAdmin ? "text-gray-500 hover:bg-gray-700 hover:text-white" : "text-gray-400 hover:bg-gray-100 hover:text-charcoal"}`}>
            <X size={15} weight="bold" />
          </button>

          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isAdmin ? "bg-gold/10 border border-gold/20" : "bg-charcoal"}`}>
            {isAdmin
              ? <span className="font-headline font-bold text-2xl text-gold">M</span>
              : <LockKey size={28} weight="regular" className="text-gold" />
            }
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <span className={`section-eyebrow mb-2 block ${isAdmin ? "text-gold/60" : "text-gold/70"}`}>
              {isAdmin ? "Admin Access" : "Secure Access"}
            </span>
            <h2 className={`font-headline font-bold text-2xl mb-2 ${isAdmin ? "text-warm-white" : "text-charcoal"}`}>
              {isAdmin ? "Admin Portal" : "Client Portal"}
            </h2>
            <p className={`font-sans text-sm leading-relaxed ${isAdmin ? "text-gray-400" : "text-gray-500"}`}>
              {isAdmin
                ? "Sign in with your administrator account to access the full management suite."
                : "Sign in to access your projects, invoices, estimates and more."}
            </p>
          </div>

          {/* Login button */}
<div className="space-y-3 mb-6">
            <div>
              <label className={`text-xs font-mono uppercase tracking-wider mb-1 block ${isAdmin ? "text-gray-500" : "text-gray-500"}`}>
                Email
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAdmin ? "silviolmonzon@amenagementmonzon.com" : "your@email.com"}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm font-sans transition-colors focus:outline-none focus:ring-2 ${isAdmin ? "border-gray-600/50 bg-gray-800/50 text-warm-white placeholder-gray-500 focus:border-gold focus:ring-gold/30" : "border-gray-200 bg-white text-charcoal placeholder-gray-400 focus:border-charcoal focus:ring-charcoal/20"}`} />
            </div>
            <div>
              <label className={`text-xs font-mono uppercase tracking-wider mb-1 block ${isAdmin ? "text-gray-500" : "text-gray-500"}`}>
                Password
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3 py-2.5 rounded-xl border text-sm font-sans transition-colors focus:outline-none focus:ring-2 ${isAdmin ? "border-gray-600/50 bg-gray-800/50 text-warm-white placeholder-gray-500 focus:border-gold focus:ring-gold/30" : "border-gray-200 bg-white text-charcoal placeholder-gray-400 focus:border-charcoal focus:ring-charcoal/20"}`} />
            </div>
          </div>
          <button onClick={handleLogin} disabled={loading || !email || !password}
            className={`w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl font-sans font-semibold text-sm transition-all cursor-pointer disabled:opacity-60 ${isAdmin ? "bg-gold text-charcoal hover:bg-gold-dark" : "bg-charcoal text-warm-white hover:bg-gray-800"}`}>
            {loading
              ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              : <>
                  <LockKey size={16} weight="bold" />
                  Sign In {isAdmin ? "to Admin Panel" : "to Portal"}
                  <ArrowUpRight size={14} weight="bold" />
                </>
            }
          </button>

          {/* Footer text */}
          <p className={`font-sans text-xs text-center mt-5 ${isAdmin ? "text-gray-600" : "text-gray-400"}`}>
            {isAdmin
              ? <>Admin email: <span className="font-mono text-gray-500">silviolmonzon@amenagementmonzon.com</span></>
              : <>Not a client yet?{" "}<a href="/contact" className="text-gold hover:text-gold-dark transition-colors">Request access →</a></>
            }
          </p>

          {isAdmin && (
            <p className={`font-mono text-[10px] text-center mt-2 text-gray-700`}>
              Staff portal access controlled by role assignment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
