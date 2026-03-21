import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { supabase, getUserProfile } from "../lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/* ─────────────────────────────────────────────
   TYPES
────────────────────────────────────────────── */

export type Permission =
  | "view" | "edit" | "create" | "delete" | "approve"
  | "manage_billing" | "manage_projects" | "manage_employees" | "manage_clients"
  | "manage_leads" | "manage_analytics" | "manage_3d_assets" | "manage_appearance"
  | "manage_settings" | "manage_roles" | "manage_users";

export type Role =
  | "admin"
  | "manager"
  | "employee"
  | "accountant"
  | "client"
  | "guest";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  profilePictureUrl?: string;
}

export interface UserProfile {
  id: string;
  role: Role;
  name?: string;
  profilePictureUrl?: string;
}

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

export const ADMIN_EMAILS = ["silviolmonzon@amenagementmonzon.com"];

/* ─────────────────────────────────────────────
   CONTEXT TYPE
────────────────────────────────────────────── */

export type AuthContextType = {
  user: AuthUser | null;
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

/* ─────────────────────────────────────────────
   PROVIDER
────────────────────────────────────────────── */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [isAnonymous] = useState(false);

  /* ─────────────────────────────────────────────
     AUTH LISTENER
  ────────────────────────────────────────────── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name,
              profilePictureUrl: session.user.user_metadata?.avatar_url,
            }
          : null
      );
      setIsPending(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(
          session?.user
            ? {
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata?.name,
                profilePictureUrl: session.user.user_metadata?.avatar_url,
              }
            : null
        );
        setIsPending(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /* ─────────────────────────────────────────────
     LOGIN — Google OAuth
  ────────────────────────────────────────────── */
  const login = useCallback(async () => {
    try {
      setIsPending(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/admin",
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("[Auth] Login error:", error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  /* ─────────────────────────────────────────────
     LOGOUT
  ────────────────────────────────────────────── */
  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) console.error("[Auth] Logout error:", error);

    clearStoredRole();
    setUser(null);
  };

  /* ─────────────────────────────────────────────
     ROLE + PROFILE
  ────────────────────────────────────────────── */
  const [role, setRole] = useState<Role>("client");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const updateProfile = async (userId: string) => {
    try {
      const p = await getUserProfile(userId);
      setProfile(p);
      setRole(p?.role || "client");
    } catch {
      setRole("client");
    }
  };

  useEffect(() => {
    if (user?.id) {
      updateProfile(user.id);
    } else {
      setProfile(null);
      setRole("client");
    }
  }, [user?.id]);

  /* Persist role */
  useEffect(() => {
    if (role) setStoredRole(role);
  }, [role]);

  const permissions = useMemo(() => ROLE_PERMISSIONS[role] ?? [], [role]);
  const can = useCallback((p: Permission) => permissions.includes(p), [permissions]);

  const isAdmin = role === "admin";
  const isClient = role === "client";
  const isStaff = ["admin", "manager", "employee", "accountant"].includes(role);

  /* ─────────────────────────────────────────────
     MEMOIZED VALUE
  ────────────────────────────────────────────── */
  const value = useMemo(
    () => ({
      user,
      isPending,
      isAnonymous,
      role,
      permissions,
      can,
      isAdmin,
      isClient,
      isStaff,
      login,
      logout,
    }),
    [
      user,
      isPending,
      isAnonymous,
      role,
      permissions,
      can,
      isAdmin,
      isClient,
      isStaff,
      login,
      logout,
    ]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

/* ─────────────────────────────────────────────
   HOOK
────────────────────────────────────────────── */

export function useAppAuth(): AuthContextType {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAppAuth must be used inside AuthProvider");
  return ctx;
}

/* ─────────────────────────────────────────────
   LOCAL STORAGE HELPERS
────────────────────────────────────────────── */

export function setStoredRole(role: string) {
  localStorage.setItem("user_role", role);
}

export function getStoredRole() {
  return localStorage.getItem("user_role");
}

export function clearStoredRole() {
  localStorage.removeItem("user_role");
}