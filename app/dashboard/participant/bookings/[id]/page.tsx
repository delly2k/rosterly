import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import {
  getBookingForParticipant,
  getCheckinsForBooking,
  getGigTeamPreview,
} from "@/app/dashboard/participant/bookings/actions";
import { TeamPreviewCard } from "@/components/team/TeamPreviewCard";
import { AcceptBookingButton } from "./AcceptBookingButton";
import { CheckinCheckoutSection } from "./CheckinCheckoutSection";

export default async function ParticipantBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(ROLES.PARTICIPANT);
  const { id } = await params;
  const booking = await getBookingForParticipant(id);
  if (!booking) notFound();

  const gig = Array.isArray(booking.gigs) ? booking.gigs[0] : booking.gigs;
  const checkins = await getCheckinsForBooking(id);

  const gigUpcomingOrActive =
    !gig?.end_time || new Date(gig.end_time) > new Date();
  const teamPreview =
    booking.status === "confirmed" &&
    gig?.id &&
    gigUpcomingOrActive
      ? await getGigTeamPreview(gig.id)
      : [];

  return (
    <div className="space-y-6 sm:space-y-8">
      <Link
        href="/dashboard/participant/bookings"
        className="inline-flex min-h-[44px] items-center text-sm font-bold text-black underline underline-offset-2 hover:no-underline active:no-underline"
      >
        ← Back to bookings
      </Link>

      <article className="rounded-[4px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:p-6 md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="page-title tracking-tight">
          {gig?.title ?? "Gig"}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {gig?.location_general}
          {gig?.start_time &&
            ` · Start: ${new Date(gig.start_time).toLocaleString()}`}
          {gig?.end_time &&
            ` · End: ${new Date(gig.end_time).toLocaleString()}`}
        </p>
        <p className="mt-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              booking.status === "pending"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
                : "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-200"
            }`}
          >
            Booking: {booking.status}
          </span>
        </p>

        {booking.status === "pending" && (
          <div className="mt-6">
            <AcceptBookingButton bookingId={id} />
          </div>
        )}

        {booking.status === "confirmed" && (
          <div className="mt-6">
            <CheckinCheckoutSection
              bookingId={id}
              gigStartTime={gig?.start_time ?? null}
              gigEndTime={gig?.end_time ?? null}
              checkins={checkins}
            />
          </div>
        )}
      </article>

      {teamPreview.length > 0 && (
        <TeamPreviewCard
          members={teamPreview}
          currentUserId={booking.participant_user_id}
        />
      )}

      {checkins.length > 0 && (
        <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Attendance log
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Check-in and check-out are only recorded during the job time window.
            No live tracking.
          </p>
          <ul className="mt-4 space-y-2">
            {checkins.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <span
                  className={
                    c.type === "in"
                      ? "font-medium text-green-700 dark:text-green-300"
                      : "font-medium text-zinc-700 dark:text-zinc-300"
                  }
                >
                  {c.type === "in" ? "Check-in" : "Check-out"}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {new Date(c.created_at).toLocaleString()}
                </span>
                {c.lat != null && c.lon != null && (
                  <span className="text-xs text-zinc-400">
                    (GPS recorded)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
