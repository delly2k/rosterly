"use client";

import type { Role } from "@/lib/roles";
import { SettingsRoleProvider } from "./SettingsRoleContext";

export function SettingsLayout({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  return (
    <SettingsRoleProvider role={role}>
      <div className="min-w-0 flex-1">{children}</div>
    </SettingsRoleProvider>
  );
}
