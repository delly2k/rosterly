"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  created_at: string;
};

const TYPE_ICONS: Record<string, string> = {
  booking_offer: "📋",
  booking_confirmed: "✅",
  booking_cancelled: "❌",
  gig_invitation: "✉️",
  application_rejected: "👎",
  verification_approved: "🛡️",
  verification_rejected: "⚠️",
  gig_starting_soon: "⏰",
  rating_received: "⭐",
  new_gig_match: "✨",
  new_application: "📩",
  participant_accepted: "✅",
  participant_declined: "❌",
  participant_checked_in: "📍",
  merchant_verified: "🛡️",
  plan_limit_reached: "⚡",
  merchant_rating_received: "⭐",
  verification_submitted: "📄",
  report_filed: "🚩",
  sos_triggered: "🚨",
};

export default function NotificationBell({
  compact = false,
  variant = "light",
}: {
  compact?: boolean;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    setNotifications(data ?? []);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    setOpen(false);
    router.push(notification.link);
  };

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await fetchNotifications();

      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) => [
              payload.new as Notification,
              ...prev,
            ]);
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        aria-label="Notifications"
        style={{
          position: "relative",
          width: compact ? 36 : 36,
          height: compact ? 36 : 36,
          borderRadius: 8,
          background: open
            ? isDark
              ? "rgba(200,151,58,0.2)"
              : "var(--color-gold-light)"
            : isDark
              ? "rgba(255,255,255,0.07)"
              : compact
                ? "#F4F3EF"
                : "white",
          border: `0.5px solid ${
            open
              ? "var(--color-gold-border)"
              : isDark
                ? "rgba(255,255,255,0.12)"
                : "var(--color-border)"
          }`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s ease",
        }}
      >
        <Bell
          size={compact ? 18 : 16}
          color={
            open
              ? "var(--color-gold)"
              : isDark
                ? "rgba(255,255,255,0.6)"
                : "var(--color-ink-muted)"
          }
        />
        {unreadCount > 0 && (
          <div
            style={{
              position: "absolute",
              top: compact ? -3 : -4,
              right: compact ? -3 : -4,
              width: compact ? 16 : 18,
              height: compact ? 16 : 18,
              borderRadius: "50%",
              background: "#DC2626",
              color: "white",
              fontSize: compact ? 9 : 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${isDark ? "#1A1D23" : "white"}`,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 360,
            zIndex: 200,
            background: "white",
            border: "0.5px solid var(--color-border)",
            borderRadius: 14,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "0.5px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ink)" }}
            >
              Notifications
              {unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    padding: "2px 7px",
                    borderRadius: 20,
                    background: "var(--color-danger)",
                    color: "white",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11,
                    color: "var(--color-gold)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-ink-muted)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {loading ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  fontSize: 13,
                  color: "var(--color-ink-muted)",
                }}
              >
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 12 }}>
                <EmptyState
                  icon={Bell}
                  title="All caught up"
                  description="No new notifications"
                />
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleClick(n)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleClick(n);
                  }}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    padding: "12px 16px",
                    cursor: "pointer",
                    background: n.read ? "white" : "var(--color-gold-light)",
                    borderBottom: "0.5px solid var(--color-border)",
                    transition: "background 0.1s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = n.read
                      ? "#FAFAF8"
                      : "#F5EDD8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = n.read
                      ? "white"
                      : "var(--color-gold-light)";
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      flexShrink: 0,
                      background: n.read ? "#F4F3EF" : "rgba(200,151,58,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                    }}
                  >
                    {TYPE_ICONS[n.type] ?? "🔔"}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: n.read ? 400 : 600,
                        color: "var(--color-ink)",
                        marginBottom: 2,
                        lineHeight: 1.4,
                      }}
                    >
                      {n.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-ink-muted)",
                        lineHeight: 1.5,
                        marginBottom: 4,
                      }}
                    >
                      {n.body}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--color-ink-hint)" }}>
                      {timeAgo(n.created_at)}
                    </div>
                  </div>

                  {!n.read && (
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "var(--color-gold)",
                        flexShrink: 0,
                        marginTop: 4,
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
