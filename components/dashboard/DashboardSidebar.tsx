"use client";

import Link from "next/link";
import Image from "next/image";
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
  LogOut,
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
  "flex items-center gap-3 rounded-[4px] border-[2px] border-transparent px-3 py-2.5 text-sm font-bold transition-all brutal-press";
const navInactive =
  "text-[#e5e7eb] hover:bg-gray-700/50 hover:text-white shadow-none";
const navActive =
  "border-black bg-[#84CC16] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";

export function DashboardSidebar({
  role,
  userName,
  verified = false,
}: {
  role: Role;
  userName: string;
  verified?: boolean;
}) {
  const pathname = usePathname();
  const navItems = getNavForRole(role);

  return (
    <aside
      className="fixed left-0 top-0 z-10 hidden h-screen w-20 flex-col border-r-[3px] border-black bg-[#1F2937] text-[#e5e7eb] md:flex lg:w-64"
      style={{ boxShadow: "6px 0 0 0 #000" }}
    >
      <div className="flex shrink-0 items-center justify-center border-b-[3px] border-black px-2 py-2">
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
          <Image
            src="/logo.png"
            alt=""
            width={80}
            height={80}
            className="h-10 w-10 object-contain md:h-11 md:w-11 lg:h-12 lg:w-12 xl:h-14 xl:w-14"
            priority
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-hidden p-2 lg:p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          // Exact match, or path starts with href; only highlight if no other nav item has a longer matching href (so Billing is active on /settings/billing, not Settings)
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
              className={`${navBase} min-h-[48px] md:justify-center md:px-2 lg:justify-start lg:px-3 ${active ? navActive : navInactive}`}
              title={label}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          );
        })}
      </div>

      <div className="border-t-[3px] border-black p-2 lg:p-3">
        <p className="truncate px-3 py-1 text-xs text-gray-400">{userName}</p>
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <p className="truncate px-3 py-0.5 text-xs font-bold capitalize text-gray-300">
            {role}
          </p>
          {verified && (
            <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              Verified
            </span>
          )}
        </div>
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-[4px] border-[2px] border-black bg-white px-3 py-2.5 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all brutal-press hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
