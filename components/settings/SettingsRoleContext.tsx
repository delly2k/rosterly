"use client";

import { createContext, useContext } from "react";
import type { Role } from "@/lib/roles";

const SettingsRoleContext = createContext<Role | null>(null);

export function useSettingsRole(): Role | null {
  return useContext(SettingsRoleContext);
}

export function SettingsRoleProvider({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  return (
    <SettingsRoleContext.Provider value={role}>
      {children}
    </SettingsRoleContext.Provider>
  );
}
