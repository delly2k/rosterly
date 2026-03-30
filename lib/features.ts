/**
 * Feature flags for gradual rollout. Change here only; do not scatter flags in UI.
 */

/** When true, merchant applicant list shows a small avatar (from participant_profiles.photo_url). */
export const merchantApplicantAvatars = false;

/**
 * When true, photo_visibility is enforced: team preview and merchant applicant queries
 * respect participant_profiles.photo_visibility (team_only, merchants_after_booking,
 * merchants_on_application, hidden). When false, app behaves as today (photo shown in
 * profile + team preview; merchants do not see avatar unless merchantApplicantAvatars is on).
 */
export const PRIVACY_MODE_ENFORCEMENT = false;
