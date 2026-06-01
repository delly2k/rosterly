"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileBookingsList from "@/components/mobile/participant/MobileBookingsList";
import EmptyState from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ParticipantBookingCard, type BookingListItem } from "./ParticipantBookingCard";
import { CalendarCheck } from "lucide-react";

export function ParticipantBookingsPageView({ bookings }: { bookings: BookingListItem[] }) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return <MobileBookingsList bookings={bookings} />;
  }

  return (
    <div className="page-bg space-y-8">
      <PageHeader
        icon={CalendarCheck}
        title="Bookings"
        description="Your confirmed and upcoming gigs"
        action={
          <ButtonLink
            href="/dashboard/participant/bookings/calendar"
            variant="secondary"
            size="sm"
          >
            Calendar
          </ButtonLink>
        }
      />

      {bookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings yet"
          description="Once a merchant accepts your application you will see bookings here"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {bookings.map((booking) => (
            <ParticipantBookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
