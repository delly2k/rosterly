"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileCheck,
  CalendarDays,
  MessageCircle,
  User,
  Shield,
  Settings,
  ClipboardCheck,
  Flag,
  Users,
  FileText,
  CreditCard,
} from "lucide-react";
import type { Role } from "@/lib/roles";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const PARTICIPANT_NAV: NavItem[] = [
  { href: "/dashboard/participant", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/participant/gigs", label: "Gigs", icon: Briefcase },
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

export function DashboardBottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const navItems = getNavForRole(role);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 flex-shrink-0 touch-manipulation items-center justify-around border-t-[3px] border-black bg-white pb-[env(safe-area-inset-bottom,0px)] md:hidden"
      aria-label="Main navigation"
    >
      {navItems.map(({ href, label, icon: Icon }) => {
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
            className={`flex min-h-[48px] min-w-[48px] flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
              active ? "text-[#1D4ED8]" : "text-black"
            }`}
            aria-label={label}
          >
            <Icon className="h-6 w-6 shrink-0" aria-hidden />
          </Link>
        );
      })}
    </nav>
  );
}
