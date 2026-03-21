import {
  createContext,
  useContext,
  useReducer,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

/* ─────────────────────────────────────────────
   TYPES
────────────────────────────────────────────── */

export type NotifType = "system" | "project" | "billing" | "message";

export interface InAppNotification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  linkedEntityId?: string | null;
  linkedEntityType?: string | null;
}

interface NotificationState {
  notifications: InAppNotification[];
}

type NotificationAction =
  | { type: "SEED"; payload: InAppNotification[] }
  | { type: "ADD"; payload: InAppNotification }
  | { type: "MARK_READ"; payload: string }
  | { type: "CLEAR" };

interface NotificationContextValue {
  notifications: InAppNotification[];
  loading: boolean;
  markAsRead: (id: string) => void;
  addNotification: (n: InAppNotification) => void;
}

/* ─────────────────────────────────────────────
   REDUCER
────────────────────────────────────────────── */

function notificationReducer(
  state: NotificationState,
  action: NotificationAction
): NotificationState {
  switch (action.type) {
    case "SEED":
      return { notifications: action.payload };

    case "ADD":
      return { notifications: [action.payload, ...state.notifications] };

    case "MARK_READ":
      return {
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };

    case "CLEAR":
      return { notifications: [] };

    default:
      return state;
  }
}

/* ─────────────────────────────────────────────
   CONTEXT
────────────────────────────────────────────── */

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}

/* ─────────────────────────────────────────────
   PROVIDER
────────────────────────────────────────────── */

export function NotificationProvider({
  user,
  children,
}: {
  user: { id: string } | null;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: [],
  });

  const [loading, setLoading] = useState(true);

  /* ─────────────────────────────────────────────
     LOAD NOTIFICATIONS FROM SUPABASE
  ────────────────────────────────────────────── */

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("Notification")
          .select("*")
          .eq("recipientId", user.id)
          .order("createdAt", { ascending: false })
          .limit(50);

        if (error) throw error;

        const mapped: InAppNotification[] = (data || []).map((n: any) => ({
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
      } catch (error) {
        console.error("Notification load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user?.id]);

  /* ─────────────────────────────────────────────
     ACTIONS
  ────────────────────────────────────────────── */

  const markAsRead = (id: string) => {
    dispatch({ type: "MARK_READ", payload: id });

    supabase
      .from("Notification")
      .update({ read: "yes" })
      .eq("id", id)
      .then(() => {});
  };

  const addNotification = (n: InAppNotification) => {
    dispatch({ type: "ADD", payload: n });
  };

  /* ─────────────────────────────────────────────
     PROVIDER VALUE
  ────────────────────────────────────────────── */

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        loading,
        markAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}