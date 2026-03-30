/** Profile is complete when full name is set (required before verification). */
export function isProfileComplete(
  profile: { full_name: string | null } | null
): boolean {
  return Boolean(profile?.full_name?.trim());
}
