"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { acceptBooking, recordCheckin } from "@/app/dashboard/participant/bookings/actions";
import {
  LegalAcknowledgmentModal,
  LEGAL_ACKNOWLEDGMENT_REQUIRED_MESSAGE,
} from "@/components/legal/LegalAcknowledgmentModal";

const CHECKIN_BUFFER_BEFORE_MS = 60 * 60 * 1000; // 1 hour before start
const CHECKIN_BUFFER_AFTER_MS = 15 * 60 * 1000;  // 15 min after end

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

type CheckinRow = { id: string; type: string; created_at: string };

export function BookingCardActions({
  bookingId,
  status,
  gigStartTime,
  gigEndTime,
  checkins,
}: {
  bookingId: string;
  status: string;
  gigStartTime: string | null;
  gigEndTime: string | null;
  checkins: CheckinRow[];
}) {
  const router = useRouter();
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState<"in" | "out" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLegalModal, setShowLegalModal] = useState(false);

  const lastIn = [...checkins].reverse().find((c) => c.type === "in");
  const lastOut = [...checkins].reverse().find((c) => c.type === "out");
  const canCheckIn = !lastIn || !!lastOut;
  const canCheckOut = !!lastIn && !lastOut;
  const withinWindow = isWithinCheckinWindow(gigStartTime, gigEndTime);
  const hasWindow = !!gigStartTime && !!gigEndTime;

  async function handleAccept() {
    setError(null);
    setAcceptLoading(true);
    try {
      await acceptBooking(bookingId);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not accept.";
      if (msg === LEGAL_ACKNOWLEDGMENT_REQUIRED_MESSAGE) {
        setShowLegalModal(true);
      } else {
        setError(msg);
      }
    } finally {
      setAcceptLoading(false);
    }
  }

  async function handleCheck(type: "in" | "out") {
    setError(null);
    setCheckinLoading(type);
    try {
      let lat: number | null = null;
      let lon: number | null = null;
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 10000,
            });
          });
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
        } catch {
          // proceed without GPS
        }
      }
      await recordCheckin(bookingId, type, lat, lon);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not record.");
    } finally {
      setCheckinLoading(null);
    }
  }

  if (status === "pending") {
    return (
      <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
        <LegalAcknowledgmentModal
          open={showLegalModal}
          onClose={() => setShowLegalModal(false)}
        />
        {error && (
          <p className="text-right text-xs text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleAccept}
          disabled={acceptLoading}
          className="min-h-[44px] rounded-md border-[2px] border-black bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-800 active:bg-zinc-800 disabled:opacity-50"
        >
          {acceptLoading ? "Accepting…" : "Accept booking"}
        </button>
      </div>
    );
  }

  if (status === "confirmed" && hasWindow) {
    const windowText = formatCheckinWindow(gigStartTime, gigEndTime);
    return (
      <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
        {error && (
          <p className="text-right text-xs text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {!withinWindow && windowText && (
          <p className="text-right text-xs text-zinc-500 dark:text-zinc-400" title={windowText}>
            Check-in available: 1 hr before start – 15 min after end
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <button
            type="button"
            onClick={() => handleCheck("in")}
            disabled={!canCheckIn || !!checkinLoading || !withinWindow}
            title={!withinWindow && windowText ? windowText : undefined}
            className="min-h-[44px] rounded-md bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 active:bg-green-700 disabled:opacity-50"
          >
            {checkinLoading === "in" ? "…" : "Check in"}
          </button>
          <button
            type="button"
            onClick={() => handleCheck("out")}
            disabled={!canCheckOut || !!checkinLoading || !withinWindow}
            title={!withinWindow && windowText ? windowText : undefined}
            className="min-h-[44px] rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 active:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:active:bg-zinc-700"
          >
            {checkinLoading === "out" ? "…" : "Check out"}
          </button>
        </div>
        <Link
          href={`/dashboard/participant/bookings/${bookingId}`}
          className="inline-flex min-h-[44px] items-center text-xs font-medium text-black underline underline-offset-2 hover:no-underline active:no-underline sm:justify-end"
        >
          View details
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={`/dashboard/participant/bookings/${bookingId}`}
      className="inline-flex min-h-[44px] items-center text-sm font-medium text-black underline underline-offset-2 hover:no-underline active:no-underline"
    >
      View details
    </Link>
  );
}
