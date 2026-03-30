/**
 * Storage path and URL helpers. Profile photos are public; verification docs use signed URLs.
 * Only low-resolution avatar copies go in profile-photos; verification-docs remains private (admin-only).
 */
const PROFILE_PHOTOS_BUCKET = "profile-photos";
const VERIFICATION_DOCS_BUCKET = "verification-docs";

export function profilePhotoPath(userId: string, filename: string): string {
  return `${userId}/${filename}`;
}

export function verificationDocPath(
  userId: string,
  type: "id_doc" | "selfie",
  filename: string
): string {
  return `${userId}/${type}_${filename}`;
}

/** Merchant officer ID document path (verification-docs bucket). */
export function merchantOfficerDocPath(userId: string, filename: string): string {
  return `${userId}/merchant_officer_${filename}`;
}

/** Per–responsible-officer ID document (verification-docs bucket). Use when adding/updating an officer. */
export function merchantOfficerIdDocPath(userId: string, filename: string): string {
  return `${userId}/officers/${filename}`;
}

export function getProfilePhotoPublicUrl(path: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";
  return `${url}/storage/v1/object/public/${PROFILE_PHOTOS_BUCKET}/${path}`;
}

export { PROFILE_PHOTOS_BUCKET, VERIFICATION_DOCS_BUCKET };
