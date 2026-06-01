"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptBooking } from "@/app/dashboard/participant/bookings/actions";
import {
  LegalAcknowledgmentModal,
  LEGAL_ACKNOWLEDGMENT_REQUIRED_MESSAGE,
} from "@/components/legal/LegalAcknowledgmentModal";

export function AcceptBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLegalModal, setShowLegalModal] = useState(false);

  async function handleAccept() {
    setError(null);
    setLoading(true);
    try {
      await acceptBooking(bookingId);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not accept booking.";
      if (msg === LEGAL_ACKNOWLEDGMENT_REQUIRED_MESSAGE) {
        setShowLegalModal(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <LegalAcknowledgmentModal
        open={showLegalModal}
        onClose={() => setShowLegalModal(false)}
      />
      {error && (
        <p className="mb-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleAccept}
        disabled={loading}
        className="btn-portal-primary min-h-[44px] text-sm disabled:opacity-50"
      >
        {loading ? "Accepting…" : "Accept booking"}
      </button>
    </div>
  );
}
