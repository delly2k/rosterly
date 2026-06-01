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
        <span className="text-xs text-[var(--color-danger)]">{error}</span>
      )}
      <button
        type="button"
        onClick={togglePayment}
        disabled={!!loading}
        className={
          paymentConfirmed ? "btn-admin-secondary text-xs" : "btn-admin-primary text-xs"
        }
      >
        {loading === "payment" ? "…" : paymentConfirmed ? "Unconfirm payment" : "Confirm payment"}
      </button>
      <button
        type="button"
        onClick={toggleTransport}
        disabled={!!loading}
        className={
          transportAssigned ? "btn-admin-secondary text-xs" : "btn-admin-primary text-xs"
        }
      >
        {loading === "transport" ? "…" : transportAssigned ? "Unassign transport" : "Assign transport"}
      </button>
    </div>
  );
}
