import { createContext, useContext, useMemo } from "react";
import { useAuth as useSDKAuth } from "@animaapp/playground-react-sdk";

/* ─────────────────────────────────────────────
   Permission catalogue
───────────────────────────────────────────── */
export type Permission =
  | "view"
  | "edit"
  | "create"
  | "delete"
  | "approve"
  | "manage_billing"
  | "manage_projects"
  | "manage_employees"
  | "manage_clients"
  | "manage_leads"
  | "manage_analytics"
  | "manage_3d_assets"
  | "manage_appearance"
  | "manage_settings"
  | "manage_roles"
  | "manage_users";

export type Role = "admin" | "manager" | "employee" | "accountant" | "client" | "guest";

/* ─────────────────────────────────────────────
   Default role → permission matrix
───────────────────────────────────────────── */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "view","edit","create","delete","approve",
    "manage_billing","manage_projects","manage_employees",
    "manage_clients","manage_leads","manage_analytics",
    "manage_3d_assets","manage_appearance","manage_settings",
    "manage_roles","manage_users",
  ],
  manager: [
    "view","edit","create","approve",
    "manage_billing","manage_projects","manage_clients","manage_leads","manage_analytics",
  ],
  employee: ["view","edit","create","manage_projects"],
  accountant: ["view","edit","create","manage_billing","manage_analytics"],
  client: ["view","approve"],
  guest: [],
};

/* ─────────────────────────────────────────────
   Admin email whitelist
───────────────────────────────────────────── */
export const ADMIN_EMAILS = ["silviolmonzon@amenagementmonzon.com"];

/* ─────────────────────────────────────────────
   Role detection heuristic
   (role stored in localStorage per user session
    so admins don't get confused with clients)
───────────────────────────────────────────── */
export function detectRole(email: string | undefined | null): Role {
  if (!email) return "guest";
  if (ADMIN_EMAILS.includes(email.toLowerCase())) return "admin";
  const stored = localStorage.getItem(`monzon_role_${email}`);
  if (stored && stored in ROLE_PERMISSIONS) return stored as Role;
  return "client";
}

export function setStoredRole(email: string, role: Role) {
  localStorage.setItem(`monzon_role_${email}`, role);
}

/* ─────────────────────────────────────────────
   Context shape
───────────────────────────────────────────── */
export type AuthContextType = {
  user: { id: string; email: string; name: string; profilePictureUrl?: string } | null | undefined;
  isPending: boolean;
  isAnonymous: boolean;
  role: Role;
  permissions: Permission[];
  can: (permission: Permission) => boolean;
  isAdmin: boolean;
  isClient: boolean;
  isStaff: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isPending, isAnonymous, login, logout } = useSDKAuth();

  const role = useMemo(() => detectRole(user?.email), [user?.email]);

  const permissions = useMemo(() => ROLE_PERMISSIONS[role] ?? [], [role]);

  const can = useMemo(
    () => (p: Permission) => permissions.includes(p),
    [permissions],
  );

  const isAdmin  = role === "admin";
  const isClient = role === "client";
  const isStaff  = ["admin","manager","employee","accountant"].includes(role);

  return (
    <AuthCtx.Provider value={{ user, isPending, isAnonymous, role, permissions, can, isAdmin, isClient, isStaff, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAppAuth(): AuthContextType {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAppAuth must be inside AuthProvider");
  return ctx;
}
