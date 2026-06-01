"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileCheck,
  CalendarDays,
  CalendarCheck,
  MessageCircle,
  Mail,
  User,
  Shield,
  Settings,
  LogOut,
  ClipboardCheck,
  Flag,
  Users,
  FileText,
  CreditCard,
  GraduationCap,
} from "lucide-react";
import type { Role } from "@/lib/roles";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

const PARTICIPANT_NAV: NavItem[] = [
  { href: "/dashboard/participant", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/participant/gigs", label: "Gigs", icon: Briefcase },
  { href: "/dashboard/participant/academy", label: "Academy", icon: GraduationCap },
  { href: "/dashboard/participant/invitations", label: "Invitations", icon: Mail },
  { href: "/dashboard/participant/applications", label: "Applications", icon: FileCheck },
  { href: "/dashboard/participant/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/dashboard/participant/chats", label: "Chats", icon: MessageCircle },
  { href: "/dashboard/participant/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/participant/safety", label: "Safety", icon: Shield },
];

const MERCHANT_NAV: NavItem[] = [
  { href: "/dashboard/merchant", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/merchant/gigs", label: "Gigs", icon: Briefcase },
  { href: "/dashboard/merchant/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/dashboard/merchant/chats", label: "Chats", icon: MessageCircle },
  { href: "/dashboard/merchant/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/settings/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/merchant/officers", label: "Responsible officers", icon: Users },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/admin/verifications", label: "Verifications", icon: ClipboardCheck },
  { href: "/dashboard/admin/reports", label: "Reports", icon: Flag },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/audit", label: "Audit log", icon: FileText },
  { href: "/dashboard/admin/chats", label: "Chats", icon: MessageCircle },
  { href: "/dashboard/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/dashboard/admin/academy", label: "Academy", icon: GraduationCap },
];

function getNavForRole(role: Role): NavItem[] {
  switch (role) {
    case "participant":
      return PARTICIPANT_NAV;
    case "merchant":
      return MERCHANT_NAV;
    case "admin":
      return ADMIN_NAV;
    default:
      return [];
  }
}

const navBase =
  "flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-150";
const navInactive =
  "text-[#9CA3AF] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#F5F4F0]";
const navActive =
  "border-l-[3px] border-l-[#C8973A] bg-[rgba(200,151,58,0.15)] text-[#C8973A] [&_svg]:text-[#C8973A]";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length === 1) {
    return parts[0].toUpperCase();
  }
  return "?";
}

function formatRoleLabel(role: Role): string {
  switch (role) {
    case "participant":
      return "Participant";
    case "merchant":
      return "Merchant";
    case "admin":
      return "Admin";
    default:
      return role;
  }
}

export function DashboardSidebar({
  role,
  displayName,
  pendingInvitationCount = 0,
}: {
  role: Role;
  displayName: string;
  pendingInvitationCount?: number;
}) {
  const pathname = usePathname();
  const navItems = getNavForRole(role).map((item) =>
    item.href === "/dashboard/participant/invitations" && pendingInvitationCount > 0
      ? { ...item, badge: pendingInvitationCount }
      : item
  );
  const initials = getInitials(displayName);
  const roleLabel = formatRoleLabel(role);

  function handleSignOut() {
    const form = document.createElement("form");
    form.method = "post";
    form.action = "/api/auth/signout";
    document.body.appendChild(form);
    form.submit();
  }

  return (
    <aside className="fixed left-0 top-0 z-10 hidden h-screen w-20 flex-col border-r border-[rgba(255,255,255,0.08)] bg-[#1A1D23] text-[#9CA3AF] md:flex lg:w-64">
      <div className="flex shrink-0 items-center justify-center border-b border-[rgba(255,255,255,0.08)] px-2 pt-4 pb-4">
        <Link
          href={
            role === "admin"
              ? "/dashboard/admin"
              : role === "merchant"
                ? "/dashboard/merchant"
                : "/dashboard/participant"
          }
          className="flex items-center transition opacity-95 hover:opacity-100"
          aria-label="Rosterly home"
        >
          <img
            src="/logo.svg"
            alt="Rosterly"
            style={{
              height: 28,
              width: "auto",
              filter:
                "drop-shadow(0px 1px 3px rgba(0,0,0,0.3)) drop-shadow(0px 0px 8px rgba(200,151,58,0.2))",
            }}
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-hidden p-2 lg:p-3">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard/participant" &&
              href !== "/dashboard/merchant" &&
              href !== "/dashboard/admin" &&
              pathname.startsWith(href + "/") &&
              !navItems.some(
                (o) => o.href.length > href.length && pathname.startsWith(o.href)
              ));
          return (
            <Link
              key={href}
              href={href}
              className={`${navBase} relative min-h-[48px] md:justify-center md:px-2 lg:justify-start lg:px-3 ${active ? navActive : navInactive}`}
              title={label}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="hidden lg:inline">{label}</span>
              {badge != null && badge > 0 && (
                <span
                  className="absolute right-1 top-2 h-2 w-2 rounded-full bg-[#C8973A] lg:right-3 lg:top-1/2 lg:-translate-y-1/2"
                  aria-label={`${badge} pending invitations`}
                />
              )}
            </Link>
          );
        })}
      </div>

      <div
        style={{
          borderTop: "0.5px solid rgba(255,255,255,0.08)",
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(200, 151, 58, 0.15)",
              border: "1px solid rgba(200, 151, 58, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 600,
              color: "#C8973A",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#F5F4F0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(200, 151, 58, 0.8)",
                marginTop: 2,
                textTransform: "capitalize",
              }}
            >
              {roleLabel}
            </div>
          </div>

          <Link
            href="/dashboard/settings/account"
            style={{
              color: "rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
            aria-label="Account settings"
          >
            <Settings size={15} />
          </Link>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.04)",
            border: "0.5px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.4)",
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(220,38,38,0.1)";
            e.currentTarget.style.borderColor = "rgba(220,38,38,0.2)";
            e.currentTarget.style.color = "#DC2626";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
          }}
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
