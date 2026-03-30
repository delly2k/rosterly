"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  setPaymentConfirmed,
  setTransportAssigned,
} from "@/app/dashboard/admin/actions";

export function BookingToggles({
  bookingId,
  paymentConfirmed,
  transportAssigned,
}: {
  bookingId: string;
  paymentConfirmed: boolean;
  transportAssigned: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function togglePayment() {
    setLoading("payment");
    setError(null);
    try {
      await setPaymentConfirmed(bookingId, !paymentConfirmed);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  async function toggleTransport() {
    setLoading("transport");
    setError(null);
    try {
      await setTransportAssigned(bookingId, !transportAssigned);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      )}
      <button
        type="button"
        onClick={togglePayment}
        disabled={!!loading}
        className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 disabled:opacity-50"
      >
        {loading === "payment" ? "…" : paymentConfirmed ? "Unconfirm payment" : "Confirm payment"}
      </button>
      <button
        type="button"
        onClick={toggleTransport}
        disabled={!!loading}
        className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 disabled:opacity-50"
      >
        {loading === "transport" ? "…" : transportAssigned ? "Unassign transport" : "Assign transport"}
      </button>
    </div>
  );
}
