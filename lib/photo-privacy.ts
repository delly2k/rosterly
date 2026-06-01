/**
 * Photo visibility options for participant privacy mode. Shared by UI and server actions.
 */

import { PRIVACY_MODE_ENFORCEMENT } from "@/lib/features";

export const PHOTO_VISIBILITY_VALUES = [
  "team_only",
  "merchants_after_booking",
  "merchants_on_application",
  "hidden",
] as const;

export type PhotoVisibility = (typeof PHOTO_VISIBILITY_VALUES)[number];

/** Legacy / alternate labels mapped to schema values. */
const VISIBILITY_ALIASES: Record<string, PhotoVisibility> = {
  public: "merchants_on_application",
  verified_merchants: "merchants_after_booking",
  private: "hidden",
};

export function normalizePhotoVisibility(
  value: string | null | undefined
): PhotoVisibility {
  if (value && PHOTO_VISIBILITY_VALUES.includes(value as PhotoVisibility)) {
    return value as PhotoVisibility;
  }
  if (value && value in VISIBILITY_ALIASES) {
    return VISIBILITY_ALIASES[value];
  }
  return "team_only";
}

export type PhotoViewerContext =
  | { viewer: "self" }
  | { viewer: "admin" }
  /** Confirmed teammate on the same gig (team preview). */
  | { viewer: "team_peer" }
  /** Merchant viewing a participant profile or applicant. */
  | {
      viewer: "merchant";
      hasApplication: boolean;
      hasConfirmedBooking: boolean;
    };

/**
 * Returns photo_url when the viewer is allowed to see it, otherwise null (use initials).
 * When PRIVACY_MODE_ENFORCEMENT is false, always returns photoUrl unchanged.
 */
export function resolveParticipantPhotoUrl(
  photoUrl: string | null | undefined,
  photoVisibility: string | null | undefined,
  context: PhotoViewerContext
): string | null {
  const url = photoUrl?.trim() || null;
  if (!url) return null;
  if (!PRIVACY_MODE_ENFORCEMENT) return url;

  if (context.viewer === "self" || context.viewer === "admin") {
    return url;
  }

  const visibility = normalizePhotoVisibility(photoVisibility);

  if (context.viewer === "team_peer") {
    return visibility === "hidden" ? null : url;
  }

  if (context.viewer === "merchant") {
    switch (visibility) {
      case "hidden":
      case "team_only":
        return null;
      case "merchants_on_application":
        return context.hasApplication ? url : null;
      case "merchants_after_booking":
        return context.hasConfirmedBooking ? url : null;
      default:
        return null;
    }
  }

  return null;
}

/** First initial for avatar fallback when photo is hidden. */
export function participantInitials(
  fullName: string | null | undefined,
  fallback = "?"
): string {
  const trimmed = fullName?.trim();
  if (!trimmed) return fallback.charAt(0).toUpperCase();
  return trimmed.charAt(0).toUpperCase();
}
