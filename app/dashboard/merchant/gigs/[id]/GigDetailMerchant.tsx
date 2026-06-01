"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, DollarSign, Pencil, XCircle } from "lucide-react";
import {
  updateGig,
  acceptApplication,
  rejectApplication,
} from "@/app/dashboard/merchant/gigs/actions";
import type { ApplicationWithApplicant } from "@/app/dashboard/merchant/gigs/actions";
import type { GigStatus } from "@/types/gig";
import { BookingRatingPrompt } from "@/components/ui/RatingModal";
import { MerchantApplicantCards } from "./MerchantApplicantCards";
import { SuggestedCandidates } from "./SuggestedCandidates";

type Gig = {
  id: string;
  title: string;
  duties: unknown;
  pay_rate: number | null;
  payment_method_dummy: string | null;
  location_general: string | null;
  location_exact: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string;
  spots?: number;
  spots_filled?: number;
};

type CheckinRow = {
  id: string;
  type: string;
  lat: number | null;
  lon: number | null;
  created_at: string;
};

type AttendanceBooking = {
  id: string;
  participant_user_id: string;
  status: string;
  accepted_at: string | null;
  created_at: string;
  checkins: CheckinRow[] | null;
};

export type AttendanceForGig = AttendanceBooking[];

export function GigDetailMerchant({
  gig,
  applications,
  attendance,
  locked,
  completedRatingStatus = [],
}: {
  gig: Gig;
  applications: ApplicationWithApplicant[];
  attendance: AttendanceForGig;
  locked: boolean;
  completedRatingStatus?: {
    bookingId: string;
    participantName: string;
    merchantHasRated: boolean;
  }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const duties = Array.isArray(gig.duties)
    ? gig.duties.filter((d): d is string => typeof d === "string" && d.trim().length > 0)
    : [];
  const filledSpots = gig.spots_filled ?? 0;
  const ratingByBookingId = new Map(
    completedRatingStatus.map((r) => [r.bookingId, r])
  );

  async function handleStatusChange(newStatus: GigStatus) {
    setError(null);
    setUpdating(true);
    try {
      await updateGig(gig.id, { status: newStatus });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleAccept(appId: string) {
    setError(null);
    try {
      await acceptApplication(appId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not accept.");
    }
  }

  async function handleReject(appId: string) {
    setError(null);
    try {
      await rejectApplication(appId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reject.");
    }
  }


  return (
    <div className="space-y-8">
      {locked && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Job details are locked because a booking has been accepted. You can
          only change status and times.
        </div>
      )}

      {error && (
        <div
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <div
        style={{
          background: "white",
          border: "0.5px solid var(--color-border)",
          borderRadius: "12px",
          overflow: "hidden",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            height: 4,
            background: "linear-gradient(90deg, #C8973A 0%, #D4A843 50%, #A07828 100%)",
          }}
        />

        <div style={{ padding: "28px 32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--color-ink)",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {gig.title}
              </h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 10,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 500,
                    background:
                      gig.status === "open"
                        ? "var(--color-green-light)"
                        : "var(--color-gold-light)",
                    border: `0.5px solid ${
                      gig.status === "open"
                        ? "var(--color-green-border)"
                        : "var(--color-gold-border)"
                    }`,
                    color:
                      gig.status === "open" ? "var(--color-green)" : "var(--color-gold)",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background:
                        gig.status === "open" ? "var(--color-green)" : "var(--color-gold)",
                    }}
                  />
                  {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                </span>
                {gig.location_general && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 13,
                      color: "var(--color-ink-muted)",
                    }}
                  >
                    <MapPin size={13} /> {gig.location_general}
                  </span>
                )}
                {gig.pay_rate != null && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--color-ink)",
                    }}
                  >
                    <DollarSign size={13} color="var(--color-gold)" />
                    J${Number(gig.pay_rate).toLocaleString()}/hr
                  </span>
                )}
              </div>
            </div>

            {!locked && gig.status !== "filled" && (
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Link
                  href={`/dashboard/merchant/gigs/${gig.id}/edit`}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    border: "1px solid var(--color-border)",
                    background: "white",
                    color: "var(--color-ink)",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Pencil size={13} /> Edit gig
                </Link>
                {gig.status === "draft" && (
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleStatusChange("open")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 500,
                      border: "1px solid var(--color-gold-border)",
                      background: "var(--color-gold-light)",
                      color: "var(--color-gold)",
                      cursor: updating ? "not-allowed" : "pointer",
                      opacity: updating ? 0.7 : 1,
                    }}
                  >
                    Publish (set open)
                  </button>
                )}
                {gig.status === "open" && (
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleStatusChange("cancelled")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 500,
                      border: "1px solid rgba(220,38,38,0.3)",
                      background: "var(--color-danger-light)",
                      color: "var(--color-danger)",
                      cursor: updating ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      opacity: updating ? 0.7 : 1,
                    }}
                  >
                    <XCircle size={13} /> Cancel gig
                  </button>
                )}
              </div>
            )}
          </div>

          <div
            style={{ borderTop: "0.5px solid var(--color-border)", margin: "20px 0" }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                background: "#FAFAF8",
                borderRadius: 8,
                border: "0.5px solid var(--color-border)",
                padding: "12px 16px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--color-ink-muted)",
                  marginBottom: 4,
                }}
              >
                Spots filled
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "var(--color-ink)" }}>
                {filledSpots}{" "}
                <span
                  style={{ fontSize: 13, fontWeight: 400, color: "var(--color-ink-muted)" }}
                >
                  of {gig.spots ?? 1}
                </span>
              </div>
            </div>

            <div
              style={{
                background: "#FAFAF8",
                borderRadius: 8,
                border: "0.5px solid var(--color-border)",
                padding: "12px 16px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--color-ink-muted)",
                  marginBottom: 4,
                }}
              >
                Start
              </div>
              {gig.start_time ? (
                <>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink)" }}>
                    {new Date(gig.start_time).toLocaleDateString("en-JM", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                    {new Date(gig.start_time).toLocaleTimeString("en-JM", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink-muted)" }}>
                  Not set
                </div>
              )}
            </div>

            <div
              style={{
                background: "#FAFAF8",
                borderRadius: 8,
                border: "0.5px solid var(--color-border)",
                padding: "12px 16px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--color-ink-muted)",
                  marginBottom: 4,
                }}
              >
                End
              </div>
              {gig.end_time ? (
                <>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink)" }}>
                    {new Date(gig.end_time).toLocaleDateString("en-JM", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                    {new Date(gig.end_time).toLocaleTimeString("en-JM", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink-muted)" }}>
                  Not set
                </div>
              )}
            </div>

            <div
              style={{
                background: "#FAFAF8",
                borderRadius: 8,
                border: "0.5px solid var(--color-border)",
                padding: "12px 16px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--color-ink-muted)",
                  marginBottom: 4,
                }}
              >
                Exact address
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink)" }}>
                {gig.location_exact ?? "Not set"}
              </div>
            </div>
          </div>

          {duties.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--color-ink-muted)",
                  marginBottom: 10,
                }}
              >
                Duties
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {duties.map((duty, i) => (
                  <div
                    key={i}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 14px",
                      borderRadius: 8,
                      background: "var(--color-gold-light)",
                      border: "0.5px solid var(--color-gold-border)",
                      fontSize: 13,
                      color: "var(--color-ink)",
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "var(--color-gold)",
                        color: "white",
                        fontSize: 9,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    {duty}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <SuggestedCandidates
        gigId={gig.id}
        applicationsCount={applications.length}
        applicationsPanel={
          <MerchantApplicantCards
            gigId={gig.id}
            gigStatus={gig.status}
            applications={applications}
            onAccept={handleAccept}
            onReject={handleReject}
            embedded
          />
        }
      />

      <section className="rounded-lg border border-[#E5E3DC] bg-white p-6">
        <h2 className="text-lg font-medium text-[var(--color-ink)]">
          Attendance
        </h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Bookings and check-in/check-out logs for this gig.
        </p>
        {attendance.length === 0 ? (
          <p className="mt-4 text-sm text-[#6B7280]">
            No bookings with attendance yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {attendance.map((b) => {
              const ratingInfo = ratingByBookingId.get(b.id);
              const participantName =
                ratingInfo?.participantName ??
                `Participant ${b.participant_user_id.slice(0, 8)}…`;
              return (
              <li
                key={b.id}
                className="rounded border border-[var(--color-border)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-[var(--color-ink)]">
                    {participantName}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      b.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : b.status === "completed" || b.status === "no_show"
                          ? "bg-zinc-100 text-[var(--color-ink-muted)]"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {b.status}
                  </span>
                  {b.accepted_at && (
                    <span className="text-xs text-[var(--color-ink-muted)]">
                      Accepted {new Date(b.accepted_at).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  )}
                  </div>
                  {b.status === "completed" && ratingInfo && !ratingInfo.merchantHasRated && (
                    <BookingRatingPrompt
                      bookingId={b.id}
                      gigTitle={gig.title}
                      rateeName={participantName}
                    />
                  )}
                  {b.status === "completed" && ratingInfo?.merchantHasRated && (
                    <span className="pill-green text-xs">Rated</span>
                  )}
                </div>
                {b.checkins && b.checkins.length > 0 ? (
                  <div className="mt-3 border-t border-[#E5E3DC] pt-3">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                      Check-in / check-out log
                    </p>
                    <ul className="space-y-1.5 text-sm">
                      {[...b.checkins]
                        .sort(
                          (a, c) =>
                            new Date(a.created_at).getTime() -
                            new Date(c.created_at).getTime()
                        )
                        .map((c) => (
                          <li
                            key={c.id}
                            className="flex flex-wrap items-center gap-2 text-[var(--color-ink-muted)]"
                          >
                            <span
                              className={
                                c.type === "check_in"
                                  ? "text-green-600"
                                  : "text-[var(--color-ink-muted)]"
                              }
                            >
                              {c.type === "check_in" ? "Check-in" : "Check-out"}
                            </span>
                            <span className="text-[#6B7280]">
                              {new Date(c.created_at).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                            </span>
                            {c.lat != null && c.lon != null && (
                              <span className="text-xs text-[#6B7280]">
                                ({c.lat.toFixed(5)}, {c.lon.toFixed(5)})
                              </span>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-[#6B7280]">
                    No check-ins recorded.
                  </p>
                )}
              </li>
            );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
