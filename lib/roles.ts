/**
 * Application roles. Enforced via Supabase RLS and app-level checks.
 * Do not rely on client-only checks for sensitive actions.
 */
export const ROLES = {
  PARTICIPANT: "participant",
  MERCHANT: "merchant",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_VALUES: Role[] = [
  ROLES.PARTICIPANT,
  ROLES.MERCHANT,
  ROLES.ADMIN,
];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLE_VALUES.includes(value as Role);
}

/** Profile status (from DB). Used for access control. */
export const PROFILE_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  BANNED: "banned",
} as const;

export type ProfileStatus =
  (typeof PROFILE_STATUS)[keyof typeof PROFILE_STATUS];

export const PROFILE_STATUS_VALUES: ProfileStatus[] = [
  PROFILE_STATUS.PENDING,
  PROFILE_STATUS.ACTIVE,
  PROFILE_STATUS.SUSPENDED,
  PROFILE_STATUS.BANNED,
];

export function isProfileStatus(value: unknown): value is ProfileStatus {
  return (
    typeof value === "string" &&
    PROFILE_STATUS_VALUES.includes(value as ProfileStatus)
  );
}
