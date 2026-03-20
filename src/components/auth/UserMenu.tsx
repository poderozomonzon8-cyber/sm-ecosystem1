import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { CaretDown, User, SignOut, Gauge, FolderOpen, ShieldCheck } from "@phosphor-icons/react";
import { useAppAuth } from "@/contexts/AuthContext";

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  admin:      { label: "Admin",      cls: "bg-gold/20 text-gold" },
  manager:    { label: "Manager",    cls: "bg-blue-100 text-blue-600" },
  employee:   { label: "Employee",   cls: "bg-purple-100 text-purple-600" },
  accountant: { label: "Accountant", cls: "bg-emerald-100 text-emerald-600" },
  client:     { label: "Client",     cls: "bg-gray-700/40 text-gray-300" },
  guest:      { label: "Guest",      cls: "bg-gray-100 text-gray-500" },
};

export default function UserMenu() {
  const { user, role, isAdmin, isStaff, logout } = useAppAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const badge = ROLE_BADGE[role] ?? ROLE_BADGE.guest;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 px-3 py-2 text-[13px] font-sans font-medium text-gray-300 hover:text-warm-white rounded-xl transition-colors focus:outline-none cursor-pointer group">
        <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
          <span className="font-headline font-bold text-[11px] text-gold">{user?.name?.[0] ?? "U"}</span>
        </div>
        <span className="hidden sm:block max-w-[100px] truncate">{user?.name?.split(" ")[0] ?? "Account"}</span>
        <CaretDown size={11} weight="bold" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-charcoal border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-scale-in">
          {/* User info */}
          <div className="px-4 py-3.5 border-b border-gray-700/40">
            <p className="font-sans text-xs font-semibold text-warm-white truncate">{user?.name}</p>
            <p className="font-mono text-[10px] text-gray-500 truncate">{user?.email}</p>
            <span className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono rounded-full ${badge.cls}`}>
              <ShieldCheck size={9} weight="bold" /> {badge.label}
            </span>
          </div>

          {/* Links */}
          <div className="py-1.5">
            {(isAdmin || isStaff) && (
              <Link to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-sans text-gray-300 hover:bg-gray-800 hover:text-warm-white transition-colors">
                <Gauge size={13} weight="regular" /> Admin Panel
              </Link>
            )}
            <Link to="/portal"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-sans text-gray-300 hover:bg-gray-800 hover:text-warm-white transition-colors">
              <FolderOpen size={13} weight="regular" /> Client Portal
            </Link>
            <Link to="/portal"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-sans text-gray-300 hover:bg-gray-800 hover:text-warm-white transition-colors">
              <User size={13} weight="regular" /> My Profile
            </Link>
          </div>

          <div className="border-t border-gray-700/40 py-1.5">
            <button onClick={async () => { 
                await logout(); 
                setOpen(false); 
              }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-sans text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors cursor-pointer">
              <SignOut size={13} weight="regular" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
