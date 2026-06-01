"use client";

import { usePathname } from "next/navigation";
import type { Role } from "@/lib/roles";
import { ROLES } from "@/lib/roles";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardBottomNav } from "@/components/dashboard/DashboardBottomNav";
import NotificationBell from "@/components/ui/NotificationBell";
import MobileTabBar from "@/components/mobile/MobileTabBar";

function RoleBadge({ role }: { role: string }) {
  const config = {
    participant: {
      bg: "linear-gradient(135deg, #FBF7EF 0%, #F5EDD8 100%)",
      border: "rgba(200,151,58,0.4)",
      color: "#A07828",
      icon: "👤",
      shadow: "0 2px 8px rgba(200,151,58,0.2)",
    },
    merchant: {
      bg: "linear-gradient(135deg, #FBF7EF 0%, #F5EDD8 100%)",
      border: "rgba(200,151,58,0.4)",
      color: "#A07828",
      icon: "🏢",
      shadow: "0 2px 8px rgba(200,151,58,0.2)",
    },
    admin: {
      bg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
      border: "rgba(37,99,235,0.3)",
      color: "#1D4ED8",
      icon: "🛡️",
      shadow: "0 2px 8px rgba(37,99,235,0.15)",
    },
  };
  const c = config[role as keyof typeof config] ?? config.participant;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "6px 14px",
        borderRadius: 20,
        background: c.bg,
        border: `1px solid ${c.border}`,
        boxShadow: c.shadow,
        cursor: "default",
      }}
    >
      <span style={{ fontSize: 13 }}>{c.icon}</span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: c.color,
          letterSpacing: "0.02em",
        }}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    </div>
  );
}

export function DashboardChrome({
  role,
  displayName,
  pendingInvitationCount,
  unreadChats = 0,
  children,
}: {
  role: Role;
  displayName: string;
  pendingInvitationCount: number;
  unreadChats?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const participantMobile = role === ROLES.PARTICIPANT && isMobile;
  const hideMobileTabBar =
    participantMobile && /^\/dashboard\/participant\/chats\/[^/]+$/.test(pathname);
  if (participantMobile) {
    return (
      <div className="min-h-screen bg-[var(--color-page)]">
        <div className={hideMobileTabBar ? "min-h-screen" : "mobile-safe-bottom"}>
          {children}
        </div>
        {!hideMobileTabBar && <MobileTabBar />}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F4F3EF]">
      <DashboardSidebar
        role={role}
        displayName={displayName}
        pendingInvitationCount={pendingInvitationCount}
      />
      <DashboardBottomNav role={role} pendingInvitationCount={pendingInvitationCount} />
      <div
        className="flex min-h-screen min-w-0 flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0 md:pl-20 lg:pl-64"
      >
        <div
          className="desktop-header-bar hidden md:flex"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: "white",
            borderBottom: "0.5px solid var(--color-border)",
            padding: "0 32px",
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1 }} />

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <NotificationBell />
            <RoleBadge role={role} />
          </div>
        </div>

        <main
          className="min-h-0 flex-1 overflow-auto"
          style={{ background: "var(--color-page)" }}
        >
          <div className="px-4 py-6 md:px-10 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
