import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { supabase, supabaseSignIn, supabaseSignOut, getUserProfile } from "@/lib/supabase";
import type { User as SupabaseUser } from '@supabase/supabase-js';

/* ─────────────────────────────────────────────
   Permission catalogue (unchanged)
───────────────────────────────────────────── */
export type Permission =
  | "view" | "edit" | "create" | "delete" | "approve"
  | "manage_billing" | "manage_projects" | "manage_employees" | "manage_clients"
  | "manage_leads" | "manage_analytics" | "manage_3d_assets" | "manage_appearance"
  | "manage_settings" | "manage_roles" | "manage_users";

export type Role = "admin" | "manager" | "employee" | "accountant" | "client" | "guest";

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

export function detectRole(email: string | undefined | null): Role {
  if (!email) return "guest";
  if (ADMIN_EMAILS.includes(email.toLowerCase())) return "admin";
  const stored = localStorage.getItem(`monzon_role_${email}`);
  if (stored && ROLE_PERMISSIONS[stored as Role]) return stored as Role;
  return "client";
}

export function setStoredRole(email: string, role: Role) {
  localStorage.setItem(`monzon_role_${email}`, role);
}

/* ─────────────────────────────────────────────
   Context type (updated for Supabase)
───────────────────────────────────────────── */
export type AuthContextType = {
  user: { id: string; email: string; name?: string; profilePictureUrl?: string } | null;
  isPending: boolean;
  isAnonymous: boolean;
  role: Role;
  permissions: Permission[];
  can: (permission: Permission) => boolean;
  isAdmin: boolean;
  isClient: boolean;
  isStaff: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; name?: string; profilePictureUrl?: string } | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Supabase auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? { 
        id: session.user.id, 
        email: session.user.email!, 
        name: session.user.user_metadata?.name 
      } : null);
      setIsPending(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { 
        id: session.user.id, 
        email: session.user.email!, 
        name: session.user.user_metadata?.name 
      } : null);
      setIsPending(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsPending(true);
      const { data } = await supabaseSignIn(email, password);
      if (data.user) {
        const profile = await getUserProfile(data.user.id);
        setUser({ 
          id: data.user.id, 
          email: data.user.email!, 
          name: profile?.name 
        });
      }
    } catch (error) {
      console.error('[Auth] Login error:', error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('[Auth] Starting logout...');
      
      // Clear role storage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('monzon_role_')) localStorage.removeItem(key);
      });
      console.log('[Auth] Cleared role storage');

      // Supabase logout
      const { error } = await supabaseSignOut();
      if (error) throw error;
      console.log('[Auth] Supabase logout complete');

      // Clear state
      setUser(null);
      
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    }
  }, []);

  const role = useMemo(() => detectRole(user?.email), [user?.email]);
  const permissions = useMemo(() => ROLE_PERMISSIONS[role] ?? [], [role]);
  const can = useCallback((p: Permission) => permissions.includes(p), [permissions]);
  const isAdmin = role === "admin";
  const isClient = role === "client";
  const isStaff = ["admin","manager","employee","accountant"].includes(role);

  return (
    <AuthCtx.Provider value={{ 
      user, isPending, isAnonymous, role, permissions, can, isAdmin, isClient, isStaff, login, logout 
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAppAuth(): AuthContextType {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAppAuth must be inside AuthProvider");
  return ctx;
}
