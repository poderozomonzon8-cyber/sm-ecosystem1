import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useQuery, useMutation } from "@/lib/anima-supabase-adapter";
import { useAppAuth } from "@/contexts/AuthContext";

/* ══════════════════════════════════════════
   Types
══════════════════════════════════════════ */
export type NotifType =
  | "lead-new"
  | "client-new"
  | "invoice-sent"
  | "invoice-opened"
  | "estimate-approved"
  | "payment-received"
  | "project-updated"
  | "hours-submitted"
  | "expense-added"
  | "system"
  | "message";

export type NotifChannel = "in-app" | "email" | "push";

export interface InAppNotification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  linkedEntityId?: string;
  linkedEntityType?: string;
  url?: string;
}

export type NotifPrefs = Record<NotifType, { inApp: boolean; email: boolean; push: boolean }>;

const DEFAULT_PREFS: NotifPrefs = {
  "lead-new":           { inApp: true,  email: true,  push: true  },
  "client-new":         { inApp: true,  email: true,  push: false },
  "invoice-sent":       { inApp: true,  email: true,  push: false },
  "invoice-opened":     { inApp: true,  email: false, push: false },
  "estimate-approved":  { inApp: true,  email: true,  push: true  },
  "payment-received":   { inApp: true,  email: true,  push: true  },
  "project-updated":    { inApp: true,  email: false, push: false },
  "hours-submitted":    { inApp: true,  email: false, push: false },
  "expense-added":      { inApp: false, email: false, push: false },
  "system":             { inApp: true,  email: false, push: false },
  "message":            { inApp: true,  email: true,  push: true  },
};

/* ══════════════════════════════════════════
   Reducer
══════════════════════════════════════════ */
type State = {
  notifications: InAppNotification[];
  prefs: NotifPrefs;
  pushEnabled: boolean;
};

type Action =
  | { type: "ADD";    payload: InAppNotification }
  | { type: "READ";   id: string }
  | { type: "READ_ALL" }
  | { type: "REMOVE"; id: string }
  | { type: "CLEAR_ALL" }
  | { type: "SET_PREF"; notifType: NotifType; channel: NotifChannel; value: boolean }
  | { type: "SET_PUSH_ENABLED"; value: boolean }
  | { type: "SEED";   payload: InAppNotification[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SEED":
      return { ...state, notifications: action.payload };
    case "ADD":
      return { ...state, notifications: [action.payload, ...state.notifications].slice(0, 100) };
    case "READ":
      return { ...state, notifications: state.notifications.map((n) => n.id === action.id ? { ...n, read: true } : n) };
    case "READ_ALL":
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    case "REMOVE":
      return { ...state, notifications: state.notifications.filter((n) => n.id !== action.id) };
    case "CLEAR_ALL":
      return { ...state, notifications: [] };
    case "SET_PREF":
      return {
        ...state,
        prefs: {
          ...state.prefs,
          [action.notifType]: {
            ...state.prefs[action.notifType],
            [action.channel === "in-app" ? "inApp" : action.channel === "email" ? "email" : "push"]: action.value,
          },
        },
      };
    case "SET_PUSH_ENABLED":
      return { ...state, pushEnabled: action.value };
    default:
      return state;
  }
}

/* ══════════════════════════════════════════
   Context
══════════════════════════════════════════ */
export interface NotificationContextType {
  notifications: InAppNotification[];
  unreadCount: number;
  prefs: NotifPrefs;
  pushEnabled: boolean;
  push: (notif: Omit<InAppNotification, "id" | "timestamp" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clearAll: () => void;
  setPref: (notifType: NotifType, channel: NotifChannel, value: boolean) => void;
  requestPushPermission: () => Promise<boolean>;
}

const NotifCtx = createContext<NotificationContextType | null>(null);

/* ══════════════════════════════════════════
   Provider
══════════════════════════════════════════ */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isStaff } = useAppAuth();
  const { create: createDBNotif } = useMutation("Notification");
  const { data: dbNotifs } = useQuery("Notification", {
    where: user ? { recipientId: { eq: user.id } } : undefined,
    orderBy: { createdAt: "desc" },
    limit: 50,
  });

  const storedPrefs = (() => {
    try {
      const raw = localStorage.getItem("monzon_notif_prefs");
      return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
    } catch { return DEFAULT_PREFS; }
  })();

  const [state, dispatch] = useReducer(reducer, {
    notifications: [],
    prefs: storedPrefs,
    pushEnabled: false,
  });

  /* Seed from DB on mount */
  const seeded = useRef(false);
  useEffect(() => {
    if (!dbNotifs || seeded.current) return;
    seeded.current = true;
    const mapped: InAppNotification[] = dbNotifs.map((n) => ({
      id: n.id,
      type: (n.type as NotifType) || "system",
      title: n.title,
      message: n.message,
      read: n.read === "yes",
      timestamp: new Date(n.createdAt),
      linkedEntityId: n.linkedEntityId,
      linkedEntityType: n.linkedEntityType,
    }));
    dispatch({ type: "SEED", payload: mapped });
  }, [dbNotifs]);

  /* Persist prefs */
  useEffect(() => {
    localStorage.setItem("monzon_notif_prefs", JSON.stringify(state.prefs));
  }, [state.prefs]);

  /* Push permission status */
  useEffect(() => {
    if ("Notification" in window) {
      dispatch({ type: "SET_PUSH_ENABLED", value: Notification.permission === "granted" });
    }
  }, []);

  const push = useCallback(
    (notif: Omit<InAppNotification, "id" | "timestamp" | "read">) => {
      const pref = state.prefs[notif.type];
      if (!pref?.inApp) return;

      const full: InAppNotification = {
        ...notif,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: new Date(),
        read: false,
      };
      dispatch({ type: "ADD", payload: full });

      // Persist to DB
      if (user) {
        createDBNotif({
          recipientId: user.id,
          recipientType: isAdmin ? "admin" : isStaff ? "manager" : "client",
          title: notif.title,
          message: notif.message,
          type: notif.type,
          read: "no",
          linkedEntityId: notif.linkedEntityId ?? "",
          linkedEntityType: notif.linkedEntityType ?? "",
        }).catch(console.warn);
      }

      // Browser Notification API (if push enabled)
      if (pref?.push && state.pushEnabled && "Notification" in window && Notification.permission === "granted") {
        new Notification(notif.title, {
          body: notif.message,
          icon: "/icon-192.png",
          tag: notif.type,
        });
      }
    },
    [state.prefs, state.pushEnabled, user, isAdmin, isStaff, createDBNotif]
  );

  const markRead     = useCallback((id: string) => dispatch({ type: "READ",   id }), []);
  const markAllRead  = useCallback(() => dispatch({ type: "READ_ALL" }), []);
  const remove       = useCallback((id: string) => dispatch({ type: "REMOVE", id }), []);
  const clearAll     = useCallback(() => dispatch({ type: "CLEAR_ALL" }), []);

  const setPref = useCallback(
    (notifType: NotifType, channel: NotifChannel, value: boolean) =>
      dispatch({ type: "SET_PREF", notifType, channel, value }),
    []
  );

  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;
    const result = await Notification.requestPermission();
    const granted = result === "granted";
    dispatch({ type: "SET_PUSH_ENABLED", value: granted });
    return granted;
  }, []);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <NotifCtx.Provider value={{
      notifications: state.notifications,
      unreadCount,
      prefs: state.prefs,
      pushEnabled: state.pushEnabled,
      push,
      markRead,
      markAllRead,
      remove,
      clearAll,
      setPref,
      requestPushPermission,
    }}>
      {children}
    </NotifCtx.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const ctx = useContext(NotifCtx);
  if (!ctx) throw new Error("useNotifications must be inside NotificationProvider");
  return ctx;
}
