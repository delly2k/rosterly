"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  CalendarDays,
  MessageCircle,
  Mail,
  Settings,
  ClipboardCheck,
  Flag,
  Users,
  FileText,
  CreditCard,
  User,
} from "lucide-react";
import type { Role } from "@/lib/roles";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

const PARTICIPANT_NAV: NavItem[] = [
  { href: "/dashboard/participant", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/participant/gigs", label: "Gigs", icon: Briefcase },
  { href: "/dashboard/participant/invitations", label: "Invites", icon: Mail },
  { href: "/dashboard/participant/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/dashboard/participant/chats", label: "Chats", icon: MessageCircle },
];

const MERCHANT_NAV: NavItem[] = [
  { href: "/dashboard/merchant", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/merchant/gigs", label: "Gigs", icon: Briefcase },
  { href: "/dashboard/merchant/chats", label: "Chats", icon: MessageCircle },
  { href: "/dashboard/merchant/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/settings/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/merchant/verification", label: "Verification", icon: ClipboardCheck },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/admin/verifications", label: "Verifications", icon: ClipboardCheck },
  { href: "/dashboard/admin/reports", label: "Reports", icon: Flag },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/audit", label: "Audit log", icon: FileText },
  { href: "/dashboard/admin/chats", label: "Chats", icon: MessageCircle },
  { href: "/dashboard/admin/bookings", label: "Bookings", icon: CalendarDays },
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

export function DashboardBottomNav({
  role,
  pendingInvitationCount = 0,
}: {
  role: Role;
  pendingInvitationCount?: number;
}) {
  const pathname = usePathname();
  const navItems = getNavForRole(role).map((item) =>
    item.href === "/dashboard/participant/invitations" && pendingInvitationCount > 0
      ? { ...item, badge: pendingInvitationCount }
      : item
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 flex-shrink-0 touch-manipulation items-center justify-around border-t border-[var(--color-border)] bg-white pb-[env(safe-area-inset-bottom,0px)] md:hidden"
      aria-label="Main navigation"
    >
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
            className={`relative flex min-h-[48px] min-w-[48px] flex-1 flex-col items-center justify-center gap-0.5 transition-colors duration-150 ${
              active ? "text-[#C8973A]" : "text-[#9CA3AF] hover:text-[#6B7280]"
            }`}
            aria-label={label}
          >
            <Icon className="h-6 w-6 shrink-0" aria-hidden />
            {badge != null && badge > 0 && (
              <span
                className="absolute right-[22%] top-2 h-2 w-2 rounded-full bg-[#C8973A]"
                aria-hidden
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
