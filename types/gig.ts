/**
 * Gig, application, and booking types (match DB enums and tables).
 */
export type GigStatus =
  | "draft"
  | "open"
  | "filled"
  | "cancelled"
  | "completed";

export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export type Gig = {
  id: string;
  merchant_user_id: string;
  title: string;
  duties: unknown;
  pay_rate: number | null;
  payment_method_dummy: string | null;
  location_general: string | null;
  start_time: string | null;
  end_time: string | null;
  status: GigStatus;
  spots: number;
  created_at: string;
  updated_at: string;
};

export type GigLocation = {
  gig_id: string;
  location_exact: string | null;
};

export type Application = {
  id: string;
  gig_id: string;
  participant_user_id: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  gig?: Gig;
};

export type Booking = {
  id: string;
  gig_id: string;
  participant_user_id: string;
  status: BookingStatus;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Booking statuses that lock gig critical fields. */
export const LOCKED_BOOKING_STATUSES: BookingStatus[] = [
  "confirmed",
  "completed",
  "no_show",
];

export type CheckinType = "in" | "out";

export type Checkin = {
  id: string;
  booking_id: string;
  type: CheckinType;
  lat: number | null;
  lon: number | null;
  created_at: string;
};
