"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { recordCheckin } from "@/app/dashboard/participant/bookings/actions";

const CHECKIN_BUFFER_BEFORE_MS = 60 * 60 * 1000;
const CHECKIN_BUFFER_AFTER_MS = 15 * 60 * 1000;

function isWithinCheckinWindow(startTime: string | null, endTime: string | null): boolean {
  if (!startTime || !endTime) return false;
  const now = Date.now();
  const start = new Date(startTime).getTime() - CHECKIN_BUFFER_BEFORE_MS;
  const end = new Date(endTime).getTime() + CHECKIN_BUFFER_AFTER_MS;
  return now >= start && now <= end;
}

function formatCheckinWindow(startTime: string | null, endTime: string | null): string {
  if (!startTime || !endTime) return "";
  const start = new Date(new Date(startTime).getTime() - CHECKIN_BUFFER_BEFORE_MS);
  const end = new Date(new Date(endTime).getTime() + CHECKIN_BUFFER_AFTER_MS);
  return `${start.toLocaleString()} – ${end.toLocaleString()}`;
}

type CheckinRow = {
  id: string;
  type: string;
  lat: number | null;
  lon: number | null;
  created_at: string;
};

export function CheckinCheckoutSection({
  bookingId,
  gigStartTime,
  gigEndTime,
  checkins,
}: {
  bookingId: string;
  gigStartTime: string | null;
  gigEndTime: string | null;
  checkins: CheckinRow[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"in" | "out" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastIn = [...checkins].reverse().find((c) => c.type === "in");
  const lastOut = [...checkins].reverse().find((c) => c.type === "out");
  const canCheckIn = !lastIn || !!lastOut;
  const canCheckOut = !!lastIn && !lastOut;
  const withinWindow = isWithinCheckinWindow(gigStartTime, gigEndTime);
  const windowText = formatCheckinWindow(gigStartTime, gigEndTime);

  async function handleCheck(type: "in" | "out") {
    setError(null);
    setLoading(type);
    try {
      let lat: number | null = null;
      let lon: number | null = null;
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                maximumAge: 10000,
              });
            }
          );
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
        } catch {
          // Proceed without GPS
        }
      }
      await recordCheckin(bookingId, type, lat, lon);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not record check-in.");
    } finally {
      setLoading(null);
    }
  }

  const hasWindow = gigStartTime && gigEndTime;

  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
      <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
        Attendance
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Check in when you arrive and check out when you leave. GPS is recorded
        only during the job time window. No live tracking.
      </p>
      {!hasWindow && (
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
          This gig has no start/end time set; check-in may not be available.
        </p>
      )}
      {hasWindow && !withinWindow && windowText && (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400" title={windowText}>
          Check-in is allowed from 1 hour before start until 15 minutes after end.
        </p>
      )}
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
        Attendance is not affected by legal status.{" "}
        <Link
          href="/legal/acknowledgment"
          className="font-medium text-zinc-700 underline underline-offset-2 hover:no-underline dark:text-zinc-400"
        >
          Payment &amp; Liability acknowledgment
        </Link>
      </p>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-3">
        <button
          type="button"
          onClick={() => handleCheck("in")}
          disabled={!canCheckIn || !!loading || !withinWindow}
          title={!withinWindow && windowText ? windowText : undefined}
          className="min-h-[44px] rounded-md bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-700 active:bg-green-700 disabled:opacity-50"
        >
          {loading === "in" ? "Recording…" : "Check in"}
        </button>
        <button
          type="button"
          onClick={() => handleCheck("out")}
          disabled={!canCheckOut || !!loading || !withinWindow}
          title={!withinWindow && windowText ? windowText : undefined}
          className="min-h-[44px] rounded-md border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 active:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:active:bg-zinc-700"
        >
          {loading === "out" ? "Recording…" : "Check out"}
        </button>
      </div>
    </div>
  );
}
