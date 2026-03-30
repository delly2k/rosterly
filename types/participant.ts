/**
 * Participant profile and verification types (match DB).
 */
export type ParticipantProfile = {
  user_id: string;
  full_name: string | null;
  photo_url: string | null;
  /** Origin: none | verification_selfie | user_upload_future */
  photo_source?: string;
  /** Who can see photo: team_only | merchants_after_booking | merchants_on_application | hidden */
  photo_visibility?: string;
  bio: string | null;
  skills: unknown;
  location_general: string | null;
  availability: unknown;
  rate: number | null;
  emergency_contact: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
};

export type VerificationRecord = {
  id: string;
  user_id: string;
  type: "participant_id" | "merchant_officer";
  id_doc_url: string | null;
  selfie_url: string | null;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type VerificationStatusDisplay = "unverified" | "pending" | "verified";
