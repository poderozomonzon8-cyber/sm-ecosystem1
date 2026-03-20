import { useAppAuth } from "@/contexts/AuthContext";
import type { Permission } from "@/contexts/AuthContext";

interface PermissionGuardProps {
  require: Permission | Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Renders children only when the current user has the required permission(s).
 * Renders `fallback` (or nothing) otherwise.
 */
export default function PermissionGuard({ require, fallback = null, children }: PermissionGuardProps) {
  const { can } = useAppAuth();
  const perms = Array.isArray(require) ? require : [require];
  const allowed = perms.every(p => can(p));
  return <>{allowed ? children : fallback}</>;
}
