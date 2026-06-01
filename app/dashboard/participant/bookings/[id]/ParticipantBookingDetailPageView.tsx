"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileBookingDetail, {
  type MobileBookingRecord,
} from "@/components/mobile/participant/MobileBookingDetail";
import {
  acceptBookingAction,
  declineBooking,
  checkInAction,
  checkOutAction,
} from "../actions";
import Link from "next/link";
import { TeamPreviewCard } from "@/components/team/TeamPreviewCard";
import { ParticipantBookingDetailHero } from "./ParticipantBookingDetailHero";
import { ParticipantBookingRating } from "./ParticipantBookingRating";
import type { TeamPreviewMember } from "../actions";

type GigDetail = Parameters<typeof ParticipantBookingDetailHero>[0]["gig"];
type CheckinRow = Parameters<typeof ParticipantBookingDetailHero>[0]["checkins"];

export function ParticipantBookingDetailPageView({
  bookingId,
  gigId,
  status,
  roleInGig,
  gig,
  checkins,
  acceptError,
  teamPreview,
  participantUserId,
  showRatingModal,
  rateeName,
}: {
  bookingId: string;
  gigId: string;
  status: string;
  roleInGig: string | null;
  gig: GigDetail;
  checkins: CheckinRow;
  acceptError?: string | null;
  teamPreview: TeamPreviewMember[];
  participantUserId: string;
  showRatingModal: boolean;
  rateeName: string;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    const booking: MobileBookingRecord = {
      id: bookingId,
      status,
      gigs: {
        title: gig.title ?? "Gig",
        location_general: gig.location_general,
        pay_rate: gig.pay_rate,
        start_time: gig.start_time,
        end_time: gig.end_time,
        duties: gig.duties,
        gig_locations: gig.gig_locations ?? null,
      },
    };
    return (
      <MobileBookingDetail
        booking={booking}
        acceptAction={acceptBookingAction}
        declineAction={declineBooking}
        checkInAction={checkInAction}
        checkOutAction={checkOutAction}
        showRatingModal={showRatingModal}
        rateeName={rateeName}
      />
    );
  }

  return (
    <div className="page-bg space-y-6 sm:space-y-8" style={{ padding: "32px 40px" }}>
      <Link
        href="/dashboard/participant/bookings"
        className="inline-flex min-h-[44px] items-center text-sm font-bold text-[var(--color-ink)] underline underline-offset-2 hover:no-underline active:no-underline"
      >
        ← Back to bookings
      </Link>

      <ParticipantBookingDetailHero
        bookingId={bookingId}
        status={status}
        roleInGig={roleInGig}
        gig={gig}
        checkins={checkins}
        acceptError={acceptError}
      />

      {showRatingModal && (
        <ParticipantBookingRating
          bookingId={bookingId}
          gigTitle={gig.title ?? "Gig"}
          rateeName={rateeName}
        />
      )}

      {teamPreview.length > 0 && (
        <TeamPreviewCard members={teamPreview} currentUserId={participantUserId} />
      )}

      {checkins.length > 0 && (
        <section
          style={{
            background: "white",
            border: "0.5px solid var(--color-border)",
            borderRadius: 12,
            padding: "24px 28px",
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--color-ink)",
              margin: 0,
            }}
          >
            Attendance log
          </h2>
          <p style={{ marginTop: 8, fontSize: 13, color: "var(--color-ink-muted)" }}>
            Check-in and check-out are only recorded during the job time window. No live tracking.
          </p>
          <ul style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {checkins.map((c) => (
              <li
                key={c.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--color-ink-muted)",
                }}
              >
                <span
                  style={{
                    fontWeight: 500,
                    color: c.type === "in" ? "var(--color-green)" : "var(--color-ink-muted)",
                  }}
                >
                  {c.type === "in" ? "Check-in" : "Check-out"}
                </span>
                <span>{new Date(c.created_at).toLocaleString()}</span>
                {c.lat != null && c.lon != null && (
                  <span style={{ fontSize: 11, color: "var(--color-ink-hint)" }}>(GPS recorded)</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
