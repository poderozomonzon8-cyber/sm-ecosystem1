import { useEffect } from "react";
import { useAppAuth } from "@/contexts/AuthContext";
import type { Permission, Role } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  /** Redirect/trigger login for anonymous users */
  requireAuth?: boolean;
  /** At least one of these roles required */
  allowedRoles?: Role[];
  /** At least one of these permissions required */
  requirePermission?: Permission[];
  children: React.ReactNode;
  /** Custom unauthorized UI */
  unauthorized?: React.ReactNode;
}

const Spinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <span className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
  </div>
);

const AccessDenied = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-6">
    <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
      <span className="text-2xl">🚫</span>
    </div>
    <h2 className="font-headline font-bold text-xl text-charcoal">Access Restricted</h2>
    <p className="font-sans text-sm text-gray-500 text-center max-w-sm">You don't have the required permissions to view this page. Please contact your administrator.</p>
    <a href="/" className="px-5 py-2.5 bg-gold text-charcoal font-sans font-semibold text-sm rounded-xl hover:bg-gold-dark transition-colors">Return Home</a>
  </div>
);

export default function ProtectedRoute({
  requireAuth = true,
  allowedRoles,
  requirePermission,
  children,
  unauthorized,
}: ProtectedRouteProps) {
  const { user, isPending, isAnonymous, role, can, login } = useAppAuth();

  useEffect(() => {
    if (!isPending && isAnonymous && requireAuth) {
      login();
    }
  }, [isPending, isAnonymous, requireAuth, login]);

  if (isPending) return <Spinner />;
  if (isAnonymous && requireAuth) return <Spinner />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <>{unauthorized ?? <AccessDenied />}</>;
  }

  if (requirePermission && !requirePermission.every(p => can(p))) {
    return <>{unauthorized ?? <AccessDenied />}</>;
  }

  return <>{children}</>;
}
