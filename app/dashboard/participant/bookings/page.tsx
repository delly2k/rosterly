import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listMyBookings } from "@/app/dashboard/participant/bookings/actions";
import { ParticipantBookingsPageView } from "./ParticipantBookingsPageView";
import type { BookingListItem } from "./ParticipantBookingCard";

export default async function ParticipantBookingsPage() {
  await requireRole(ROLES.PARTICIPANT);
  const bookings = (await listMyBookings()) as BookingListItem[];

  return <ParticipantBookingsPageView bookings={bookings} />;
}
