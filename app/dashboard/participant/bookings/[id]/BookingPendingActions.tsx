"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import {
  acceptBookingAction,
  declineBooking,
} from "@/app/dashboard/participant/bookings/actions";
import {
  LegalAcknowledgmentModal,
  LEGAL_ACKNOWLEDGMENT_REQUIRED_MESSAGE,
} from "@/components/legal/LegalAcknowledgmentModal";
import { OnPlatformProtectionBanner } from "@/components/legal/OnPlatformProtectionBanner";

export function BookingPendingActions({
  bookingId,
  acceptError,
}: {
  bookingId: string;
  acceptError?: string | null;
}) {
  const [showLegalModal, setShowLegalModal] = useState(
    acceptError === LEGAL_ACKNOWLEDGMENT_REQUIRED_MESSAGE
  );

  return (
    <>
      <LegalAcknowledgmentModal
        open={showLegalModal}
        onClose={() => setShowLegalModal(false)}
      />
      <div style={{ borderTop: "0.5px solid var(--color-border)", margin: "20px 0" }} />
      <OnPlatformProtectionBanner />
      {acceptError && acceptError !== LEGAL_ACKNOWLEDGMENT_REQUIRED_MESSAGE && (
        <p
          style={{
            fontSize: 12,
            color: "var(--color-danger)",
            marginBottom: 12,
          }}
          role="alert"
        >
          {acceptError}
        </p>
      )}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <form action={acceptBookingAction}>
          <input type="hidden" name="bookingId" value={bookingId} />
          <button
            type="submit"
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              background: "var(--color-green)",
              color: "white",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <CheckCircle size={14} /> Accept booking
          </button>
        </form>
        <form action={declineBooking}>
          <input type="hidden" name="bookingId" value={bookingId} />
          <button
            type="submit"
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              background: "var(--color-danger-light)",
              color: "var(--color-danger)",
              border: "0.5px solid rgba(220,38,38,0.2)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <XCircle size={14} /> Decline booking
          </button>
        </form>
        <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
          Declining will notify the merchant and release your spot
        </div>
      </div>
    </>
  );
}
