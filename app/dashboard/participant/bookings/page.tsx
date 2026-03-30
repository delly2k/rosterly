import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import {
  listMyBookings,
  getCheckinsForBookings,
} from "@/app/dashboard/participant/bookings/actions";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { BookingCardActions } from "@/app/dashboard/participant/bookings/BookingCardActions";
import { CalendarDays } from "lucide-react";

export default async function ParticipantBookingsPage() {
  await requireRole(ROLES.PARTICIPANT);
  const bookings = await listMyBookings();
  const bookingIds = bookings.map((b) => b.id);
  const checkinsMap = await getCheckinsForBookings(bookingIds);

  const statusVariant = (s: string) =>
    s === "pending" ? "pending" : s === "confirmed" ? "success" : "inactive";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title tracking-tight">
          My bookings
        </h1>
        <ButtonLink
          href="/dashboard/participant/bookings/calendar"
          variant="secondary"
          size="sm"
        >
          Calendar
        </ButtonLink>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No bookings yet"
          description="Apply to gigs to get started. When you're accepted, your bookings will appear here."
          action={
            <ButtonLink href="/dashboard/participant/gigs" variant="primary" size="md">
              Browse gigs
            </ButtonLink>
          }
        />
      ) : (
        <ul className="space-y-4">
          {bookings.map((b) => {
            const gig = Array.isArray(b.gigs) ? b.gigs[0] : b.gigs;
            const checkins = checkinsMap[b.id] ?? [];
            return (
              <li
                key={b.id}
                className="rounded-[4px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:p-6 md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <Link
                    href={`/dashboard/participant/bookings/${b.id}`}
                    className="min-h-[44px] min-w-0 flex-1 py-1 sm:py-0"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-black">
                        {gig?.title ?? "Gig"}
                      </h2>
                      <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-black/80">
                      {gig?.location_general}
                      {gig?.start_time &&
                        ` · ${new Date(gig.start_time).toLocaleString()}`}
                    </p>
                    {b.status === "pending" && (
                      <p className="mt-2 text-xs font-medium text-black">
                        Accept the booking to confirm your place
                      </p>
                    )}
                  </Link>
                  <div className="shrink-0 sm:mt-0">
                    <BookingCardActions
                      bookingId={b.id}
                      status={b.status}
                      gigStartTime={gig?.start_time ?? null}
                      gigEndTime={gig?.end_time ?? null}
                      checkins={checkins}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
