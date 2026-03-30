"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Shield,
  Bell,
  Heart,
  FileCheck,
  CreditCard,
} from "lucide-react";
import type { Role } from "@/lib/roles";

type SettingsNavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const PARTICIPANT_SETTINGS_NAV: SettingsNavItem[] = [
  { href: "/dashboard/settings/account", label: "Account", icon: User },
  { href: "/dashboard/settings/privacy", label: "Privacy & Visibility", icon: Shield },
  { href: "/dashboard/settings/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings/safety", label: "Safety & Support", icon: Heart },
];

const MERCHANT_SETTINGS_NAV: SettingsNavItem[] = [
  { href: "/dashboard/settings/account", label: "Account", icon: User },
  { href: "/dashboard/settings/privacy", label: "Privacy & Visibility", icon: Shield },
  { href: "/dashboard/settings/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings/safety", label: "Safety & Compliance", icon: FileCheck },
];

function getSettingsNav(role: Role): SettingsNavItem[] {
  if (role === "merchant") return MERCHANT_SETTINGS_NAV;
  return PARTICIPANT_SETTINGS_NAV;
}

export function SettingsTopTabs({ role }: { role: Role }) {
  const pathname = usePathname();
  const navItems = getSettingsNav(role);

  return (
    <nav
      className="flex gap-0 overflow-x-auto pb-2 md:overflow-visible md:pb-0"
      aria-label="Settings"
    >
      <div
        className="flex w-full min-w-0 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/50"
        role="tablist"
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              role="tab"
              aria-selected={active}
              className={`relative flex flex-1 shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors md:flex-initial ${
                active
                  ? "rounded-lg bg-[#84CC16] text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
