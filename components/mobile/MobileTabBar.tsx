"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  CalendarCheck,
  User,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

type TabItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
};

const TABS: TabItem[] = [
  { href: "/dashboard/participant", icon: LayoutDashboard, label: "Home", exact: true },
  { href: "/dashboard/participant/gigs", icon: Briefcase, label: "Gigs" },
  { href: "/dashboard/participant/academy", icon: GraduationCap, label: "Academy" },
  { href: "/dashboard/participant/bookings", icon: CalendarCheck, label: "Bookings" },
  { href: "/dashboard/participant/profile", icon: User, label: "Profile" },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "white",
        borderTop: "0.5px solid var(--color-border)",
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.06)",
      }}
    >
      {TABS.map((tab) => {
        const { href, icon: Icon, label } = tab;
        const active = tab.exact
          ? pathname === tab.href
          : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 0 8px",
              gap: 4,
              textDecoration: "none",
              position: "relative",
              minHeight: 48,
            }}
          >
            {active && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 24,
                  height: 2,
                  background: "#C8973A",
                  borderRadius: "0 0 2px 2px",
                }}
              />
            )}

            <Icon
              size={22}
              color={active ? "#C8973A" : "var(--color-ink-muted)"}
              strokeWidth={active ? 2.5 : 1.8}
            />

            <span
              style={{
                fontSize: 10,
                fontWeight: active ? 600 : 400,
                color: active ? "#C8973A" : "var(--color-ink-muted)",
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
