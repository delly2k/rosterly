"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
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
  variant = "default",
}: {
  bookingId: string;
  gigStartTime: string | null;
  gigEndTime: string | null;
  checkins: CheckinRow[];
  variant?: "default" | "hero";
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

  if (variant === "hero") {
    return (
      <div>
        {!hasWindow && (
          <p style={{ fontSize: 12, color: "var(--color-warning)", marginBottom: 12 }}>
            This gig has no start/end time set; check-in may not be available.
          </p>
        )}
        {hasWindow && !withinWindow && windowText && (
          <p style={{ fontSize: 12, color: "var(--color-ink-muted)", marginBottom: 12 }}>
            Check-in is allowed from 1 hour before start until 15 minutes after end.
          </p>
        )}
        <p style={{ fontSize: 11, color: "var(--color-ink-hint)", marginBottom: 12 }}>
          Attendance is not affected by legal status.{" "}
          <Link
            href="/legal/acknowledgment"
            style={{ color: "var(--color-ink-muted)", textDecoration: "underline" }}
          >
            Payment &amp; Liability acknowledgment
          </Link>
        </p>
        {error && (
          <p style={{ fontSize: 12, color: "var(--color-danger)", marginBottom: 12 }} role="alert">
            {error}
          </p>
        )}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => handleCheck("in")}
            disabled={!canCheckIn || !!loading || !withinWindow}
            title={!withinWindow && windowText ? windowText : undefined}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              background: "var(--color-gold)",
              color: "white",
              border: "none",
              cursor: !canCheckIn || !!loading || !withinWindow ? "not-allowed" : "pointer",
              opacity: !canCheckIn || !!loading || !withinWindow ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <LogIn size={14} />
            {loading === "in" ? "Recording…" : "Check in"}
          </button>
          <button
            type="button"
            onClick={() => handleCheck("out")}
            disabled={!canCheckOut || !!loading || !withinWindow}
            title={!withinWindow && windowText ? windowText : undefined}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              background: "var(--color-green)",
              color: "white",
              border: "none",
              cursor: !canCheckOut || !!loading || !withinWindow ? "not-allowed" : "pointer",
              opacity: !canCheckOut || !!loading || !withinWindow ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <LogOut size={14} />
            {loading === "out" ? "Recording…" : "Check out"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[#E5E3DC] bg-zinc-50 p-4">
      <h2 className="text-base font-medium text-[var(--color-ink)]">
        Attendance
      </h2>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        Check in when you arrive and check out when you leave. GPS is recorded
        only during the job time window. No live tracking.
      </p>
      {!hasWindow && (
        <p className="mt-2 text-sm text-amber-700">
          This gig has no start/end time set; check-in may not be available.
        </p>
      )}
      {hasWindow && !withinWindow && windowText && (
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]" title={windowText}>
          Check-in is allowed from 1 hour before start until 15 minutes after end.
        </p>
      )}
      <p className="mt-2 text-xs text-[#6B7280]">
        Attendance is not affected by legal status.{" "}
        <Link
          href="/legal/acknowledgment"
          className="font-medium text-[var(--color-ink-muted)] underline underline-offset-2 hover:no-underline"
        >
          Payment &amp; Liability acknowledgment
        </Link>
      </p>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
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
          className="min-h-[44px] rounded-md border border-[#E5E3DC] bg-white px-5 py-3 text-sm font-medium text-[var(--color-ink-muted)] hover:bg-zinc-50 active:bg-zinc-50 disabled:opacity-50"
        >
          {loading === "out" ? "Recording…" : "Check out"}
        </button>
      </div>
    </div>
  );
}
