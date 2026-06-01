"use client";

import { useState } from "react";
import { RatingModal } from "@/components/ui/RatingModal";

export function ParticipantBookingRating({
  bookingId,
  gigTitle,
  rateeName,
}: {
  bookingId: string;
  gigTitle: string;
  rateeName: string;
}) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <RatingModal
      open={open}
      onClose={() => setOpen(false)}
      bookingId={bookingId}
      gigTitle={gigTitle}
      rateeName={rateeName}
    />
  );
}
