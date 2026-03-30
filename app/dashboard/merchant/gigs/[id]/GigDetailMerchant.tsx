"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  updateGig,
  acceptApplication,
  rejectApplication,
} from "@/app/dashboard/merchant/gigs/actions";
import type { ApplicationWithApplicant } from "@/app/dashboard/merchant/gigs/actions";
import type { GigStatus } from "@/types/gig";

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
}: {
  gig: Gig;
  applications: ApplicationWithApplicant[];
  attendance: AttendanceForGig;
  locked: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const duties = Array.isArray(gig.duties) ? gig.duties : [];

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

  const pendingApps = applications.filter((a) => a.status === "pending");

  return (
    <div className="space-y-8">
      {locked && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          Job details are locked because a booking has been accepted. You can
          only change status and times.
        </div>
      )}

      {error && (
        <div
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200"
          role="alert"
        >
          {error}
        </div>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="page-title tracking-tight">
          {gig.title}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Status: <span className="font-medium">{gig.status}</span>
          {gig.location_general && ` · ${gig.location_general}`}
          {gig.pay_rate != null && ` · $${gig.pay_rate}/hr`}
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {(gig.spots_filled ?? 0)} of {gig.spots ?? 1} spots filled
        </p>
        {duties.length > 0 && (
          <ul className="mt-4 list-inside list-disc text-sm text-zinc-700 dark:text-zinc-300">
            {duties.map((d, i) => (
              <li key={i}>{String(d)}</li>
            ))}
          </ul>
        )}
        {gig.location_exact && (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Exact address: {gig.location_exact}
          </p>
        )}
        {gig.start_time && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Start: {new Date(gig.start_time).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
            {gig.end_time &&
              ` · End: ${new Date(gig.end_time).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}`}
          </p>
        )}

        {!locked && gig.status !== "filled" && (
          <div className="mt-4 flex gap-2">
            <Link
              href={`/dashboard/merchant/gigs/${gig.id}/edit`}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            >
              Edit gig
            </Link>
            {gig.status === "draft" && (
              <button
                type="button"
                disabled={updating}
                onClick={() => handleStatusChange("open")}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Publish (set open)
              </button>
            )}
            {gig.status === "open" && (
              <button
                type="button"
                disabled={updating}
                onClick={() => handleStatusChange("cancelled")}
                className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-zinc-800 dark:text-red-300"
              >
                Cancel gig
              </button>
            )}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Applications ({applications.length})
        </h2>
        {applications.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            No applications yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {applications.map((app) => {
              const name = app.participant_display?.full_name?.trim() || null;
              const sub = [
                app.participant_display?.location_general,
                app.participant_display?.rate != null ? `$${Number(app.participant_display.rate)}/hr` : null,
              ].filter(Boolean);
              return (
              <li
                key={app.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-200 p-3 dark:border-zinc-700"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {name || `Applicant ${app.participant_user_id.slice(0, 8)}…`}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        app.status === "pending"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
                          : app.status === "accepted"
                            ? "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-200"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  {(app.participant_display?.bio || sub.length > 0) && (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {[app.participant_display?.bio ?? null, ...sub].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/merchant/chats/start?gigId=${gig.id}&participantId=${app.participant_user_id}`}
                    className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
                  >
                    Message
                  </Link>
                  {app.status === "pending" && gig.status === "open" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAccept(app.id)}
                        className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(app.id)}
                        className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Attendance
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Bookings and check-in/check-out logs for this gig.
        </p>
        {attendance.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            No bookings with attendance yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {attendance.map((b) => (
              <li
                key={b.id}
                className="rounded border border-zinc-200 p-4 dark:border-zinc-700"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Participant {b.participant_user_id.slice(0, 8)}…
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      b.status === "confirmed"
                        ? "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-200"
                        : b.status === "completed" || b.status === "no_show"
                          ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
                    }`}
                  >
                    {b.status}
                  </span>
                  {b.accepted_at && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Accepted {new Date(b.accepted_at).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  )}
                </div>
                {b.checkins && b.checkins.length > 0 ? (
                  <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-700">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
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
                            className="flex flex-wrap items-center gap-2 text-zinc-700 dark:text-zinc-300"
                          >
                            <span
                              className={
                                c.type === "check_in"
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-zinc-600 dark:text-zinc-400"
                              }
                            >
                              {c.type === "check_in" ? "Check-in" : "Check-out"}
                            </span>
                            <span className="text-zinc-500 dark:text-zinc-400">
                              {new Date(c.created_at).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                            </span>
                            {c.lat != null && c.lon != null && (
                              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                ({c.lat.toFixed(5)}, {c.lon.toFixed(5)})
                              </span>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    No check-ins recorded.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
