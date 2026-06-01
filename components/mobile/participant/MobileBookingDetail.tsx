"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AddressMap from "@/components/ui/AddressMap";
import { OnPlatformProtectionBanner } from "@/components/legal/OnPlatformProtectionBanner";
import { SafetyCheckIn } from "@/app/dashboard/participant/bookings/[id]/SafetyCheckIn";
import { ParticipantBookingRating } from "@/app/dashboard/participant/bookings/[id]/ParticipantBookingRating";
import {
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  Lock,
  LogIn,
  LogOut,
  Shield,
} from "lucide-react";

type GigEmbed = {
  title: string;
  location_general: string | null;
  pay_rate: number | null;
  start_time: string | null;
  end_time: string | null;
  duties: unknown;
  gig_locations:
    | { location_exact: string | null }
    | { location_exact: string | null }[]
    | null;
};

export type MobileBookingRecord = {
  id: string;
  status: string;
  gigs: GigEmbed | GigEmbed[] | null;
};

function unwrapGig(gigs: MobileBookingRecord["gigs"]): GigEmbed | null {
  if (!gigs) return null;
  return Array.isArray(gigs) ? gigs[0] ?? null : gigs;
}

function parseDuties(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((d): d is string => typeof d === "string" && d.trim().length > 0);
}

function statusStyle(status: string) {
  if (status === "confirmed") {
    return {
      bg: "var(--color-green-light)",
      border: "var(--color-green-border)",
      color: "var(--color-green)",
    };
  }
  if (status === "completed") {
    return {
      bg: "var(--color-gold-light)",
      border: "var(--color-gold-border)",
      color: "var(--color-gold)",
    };
  }
  if (status === "cancelled") {
    return {
      bg: "var(--color-danger-light)",
      border: "rgba(220,38,38,0.2)",
      color: "var(--color-danger)",
    };
  }
  return {
    bg: "var(--color-warning-light)",
    border: "rgba(217,119,6,0.3)",
    color: "var(--color-warning)",
  };
}

export default function MobileBookingDetail({
  booking,
  acceptAction,
  declineAction,
  checkInAction,
  checkOutAction,
  showRatingModal,
  rateeName,
}: {
  booking: MobileBookingRecord;
  acceptAction: (fd: FormData) => Promise<any>;
  declineAction: (fd: FormData) => Promise<any>;
  checkInAction: (fd: FormData) => Promise<{ success?: boolean; error?: string }>;
  checkOutAction: (fd: FormData) => Promise<{ success?: boolean; error?: string }>;
  showRatingModal?: boolean;
  rateeName?: string;
}) {
  const router = useRouter();
  const [gpsLoading, setGpsLoading] = useState(false);
  const gig = unwrapGig(booking.gigs);
  const duties = parseDuties(gig?.duties);
  const isBooked = booking.status === "confirmed" || booking.status === "completed";
  const locRow = gig?.gig_locations
    ? Array.isArray(gig.gig_locations)
      ? gig.gig_locations[0]
      : gig.gig_locations
    : null;
  const locationExact = locRow?.location_exact ?? null;
  const styles = statusStyle(booking.status);

  async function handleGpsAction(
    action: (fd: FormData) => Promise<{ success?: boolean; error?: string }>
  ) {
    setGpsLoading(true);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const fd = new FormData();
        fd.append("bookingId", booking.id);
        fd.append("lat", pos.coords.latitude.toString());
        fd.append("lon", pos.coords.longitude.toString());
        await action(fd);
        setGpsLoading(false);
        router.refresh();
      },
      () => setGpsLoading(false),
      { timeout: 5000 }
    );
  }

  return (
    <div
      className="mobile-safe-bottom"
      style={{ background: "var(--color-page)", minHeight: "100vh" }}
    >
      <div
        style={{
          background: "white",
          borderBottom: "0.5px solid var(--color-border)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 22,
            color: "var(--color-ink)",
            padding: "0 8px 0 0",
            minHeight: 48,
            minWidth: 48,
          }}
          aria-label="Go back"
        >
          ←
        </button>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-ink)", flex: 1 }}>
          Booking detail
        </div>
        <span
          style={{
            padding: "4px 12px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: styles.bg,
            border: `0.5px solid ${styles.border}`,
            color: styles.color,
          }}
        >
          <span
            style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }}
          />
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>

      <div
        style={{
          padding: "14px",
          paddingBottom: booking.status === "pending" || booking.status === "confirmed" ? 100 : 14,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 14,
            border: "0.5px solid var(--color-border)",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div style={{ height: 3, background: "linear-gradient(90deg, #C8973A, #D4A843)" }} />
          <div style={{ padding: 16 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--color-ink)",
                marginBottom: 8,
              }}
            >
              {gig?.title ?? "Gig"}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              {gig?.location_general && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 13,
                    color: "var(--color-ink-muted)",
                  }}
                >
                  <MapPin size={13} /> {gig.location_general}
                </span>
              )}
              {gig?.pay_rate != null && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-ink)",
                  }}
                >
                  <DollarSign size={13} color="var(--color-gold)" />
                  J${Number(gig.pay_rate).toLocaleString()}/hr
                </span>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <div
                style={{
                  background: "#FAFAF8",
                  borderRadius: 8,
                  border: "0.5px solid var(--color-border)",
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--color-ink-muted)",
                    marginBottom: 4,
                  }}
                >
                  Start
                </div>
                {gig?.start_time ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink)" }}>
                      {new Date(gig.start_time).toLocaleDateString("en-JM", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                      {new Date(gig.start_time).toLocaleTimeString("en-JM", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>—</div>
                )}
              </div>
              <div
                style={{
                  background: "#FAFAF8",
                  borderRadius: 8,
                  border: "0.5px solid var(--color-border)",
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--color-ink-muted)",
                    marginBottom: 4,
                  }}
                >
                  End
                </div>
                {gig?.end_time ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink)" }}>
                      {new Date(gig.end_time).toLocaleDateString("en-JM", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                      {new Date(gig.end_time).toLocaleTimeString("en-JM", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>—</div>
                )}
              </div>
            </div>

            <div
              style={{
                background: isBooked ? "#FAFAF8" : "var(--color-gold-light)",
                border: `0.5px solid ${isBooked ? "var(--color-border)" : "var(--color-gold-border)"}`,
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--color-ink-muted)",
                  marginBottom: 3,
                }}
              >
                Exact address
              </div>
              {isBooked ? (
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink)" }}>
                  {locationExact ?? "Not provided"}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--color-warning)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Lock size={11} /> Accept to reveal address
                </div>
              )}
            </div>
          </div>
        </div>

        {duties.length > 0 && (
          <div
            style={{
              background: "white",
              borderRadius: 12,
              border: "0.5px solid var(--color-border)",
              padding: "14px 16px",
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", marginBottom: 10 }}>
              Your duties
            </div>
            {duties.map((duty, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom:
                    i < duties.length - 1 ? "0.5px solid var(--color-border)" : "none",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "var(--color-gold)",
                    color: "white",
                    fontSize: 10,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: 13, color: "var(--color-ink)" }}>{duty}</div>
              </div>
            ))}
          </div>
        )}

        {isBooked && locationExact && (
          <div
            style={{
              background: "white",
              borderRadius: 12,
              border: "0.5px solid var(--color-border)",
              padding: "14px 16px",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-ink)",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <MapPin size={13} color="var(--color-gold)" /> Location
            </div>
            <AddressMap query={locationExact} />
          </div>
        )}

        {booking.status === "pending" && (
          <div style={{ marginBottom: 12 }}>
            <OnPlatformProtectionBanner />
          </div>
        )}

        {booking.status === "confirmed" && <SafetyCheckIn bookingId={booking.id} />}

        {showRatingModal && gig && (
          <ParticipantBookingRating
            bookingId={booking.id}
            gigTitle={gig.title}
            rateeName={rateeName ?? "Merchant"}
          />
        )}
      </div>

      {booking.status === "pending" && (
        <div
          style={{
            position: "fixed",
            bottom: "calc(56px + env(safe-area-inset-bottom))",
            left: 0,
            right: 0,
            background: "white",
            borderTop: "0.5px solid var(--color-border)",
            padding: "12px 16px",
            display: "flex",
            gap: 10,
            zIndex: 90,
          }}
        >
          <form action={declineAction} style={{ flex: 1 }}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <button
              type="submit"
              style={{
                width: "100%",
                minHeight: 48,
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                background: "var(--color-danger-light)",
                color: "var(--color-danger)",
                border: "0.5px solid rgba(220,38,38,0.2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <XCircle size={16} /> Decline
            </button>
          </form>
          <form action={acceptAction} style={{ flex: 2 }}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <button
              type="submit"
              style={{
                width: "100%",
                minHeight: 48,
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                background: "var(--color-green)",
                color: "white",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <CheckCircle size={16} /> Accept booking
            </button>
          </form>
        </div>
      )}

      {booking.status === "confirmed" && (
        <div
          style={{
            position: "fixed",
            bottom: "calc(56px + env(safe-area-inset-bottom))",
            left: 0,
            right: 0,
            background: "white",
            borderTop: "0.5px solid var(--color-border)",
            padding: "12px 16px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            zIndex: 90,
          }}
        >
          <button
            type="button"
            onClick={() => void handleGpsAction(checkInAction)}
            disabled={gpsLoading}
            style={{
              minHeight: 48,
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              background: "var(--color-gold)",
              color: "white",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <LogIn size={15} /> Check in
          </button>
          <button
            type="button"
            onClick={() => void handleGpsAction(checkOutAction)}
            disabled={gpsLoading}
            style={{
              minHeight: 48,
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              background: "var(--color-green)",
              color: "white",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <LogOut size={15} /> Check out
          </button>
        </div>
      )}
    </div>
  );
}
