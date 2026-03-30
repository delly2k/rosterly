/**
 * Photo visibility options for participant privacy mode. Shared by UI and server actions.
 */

export const PHOTO_VISIBILITY_VALUES = [
  "team_only",
  "merchants_after_booking",
  "merchants_on_application",
  "hidden",
] as const;

export type PhotoVisibility = (typeof PHOTO_VISIBILITY_VALUES)[number];
