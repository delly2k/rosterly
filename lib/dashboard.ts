import type { Role } from "@/lib/roles";

export const DASHBOARD_BASE = "/dashboard";

export function getDashboardPathForRole(role: Role): string {
  return `${DASHBOARD_BASE}/${role}`;
}
