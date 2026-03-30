"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Shield,
  Bell,
  Heart,
  FileCheck,
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
  { href: "/dashboard/settings/safety", label: "Safety & Compliance", icon: FileCheck },
];

function getSettingsNav(role: Role): SettingsNavItem[] {
  if (role === "merchant") return MERCHANT_SETTINGS_NAV;
  return PARTICIPANT_SETTINGS_NAV;
}

export function SettingsSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const navItems = getSettingsNav(role);

  return (
    <nav
      className="flex shrink-0 flex-col gap-1 rounded-[4px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
      aria-label="Settings"
    >
      <h2 className="mb-3 px-2 text-sm font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Settings
      </h2>
      <ul className="space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
