"use client";

import { SettingsTopTabs } from "./SettingsTopTabs";
import { useSettingsRole } from "./SettingsRoleContext";

export function SettingsPageShell({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  const role = useSettingsRole();
  return (
    <div className="space-y-8">
      <div className={badge ? "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between" : undefined}>
        <div>
          <h1 className="page-title tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </p>
        </div>
        {badge && <span className="shrink-0">{badge}</span>}
      </div>
      {role != null && <SettingsTopTabs role={role} />}
      <div className="space-y-8">{children}</div>
    </div>
  );
}
