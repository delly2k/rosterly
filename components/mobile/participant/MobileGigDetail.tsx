"use client";

import Link from "next/link";
import {
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  MessageCircle,
  Lock,
} from "lucide-react";
import AddressMap from "@/components/ui/AddressMap";
import { MobileApplyBar } from "./MobileApplyBar";
import MobileParticipantShell from "./MobileParticipantShell";
import { MOBILE_BODY_SIZE, MOBILE_CARD_RADIUS, MOBILE_LABEL_SIZE, mobilePrimaryBtnStyle } from "./mobileTokens";
import type { TeamPreviewMember } from "@/app/dashboard/participant/bookings/actions";

type GigData = {
  id: string;
  title: string;
  duties: unknown;
  pay_rate: number | null;
  location_general: string | null;
  location_city?: string | null;
  location_parish?: string | null;
  location_exact?: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string;
  spots?: number;
};

function parseDuties(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((d): d is string => typeof d === "string" && d.trim().length > 0);
}

export default function MobileGigDetail({
  gig,
  application,
  booking,
  filledSpots,
  teamPreview,
  currentUserId,
}: {
  gig: GigData;
  application: { id: string; status: string } | null;
  booking: { id: string; status: string } | null;
  filledSpots: number;
  teamPreview: TeamPreviewMember[];
  currentUserId: string;
}) {
  const duties = parseDuties(gig.duties);
  const spots = gig.spots ?? 1;
  const isBooked =
    booking?.status === "confirmed" || booking?.status === "completed";
  const canApply = gig.status === "open" && !application && !isBooked;
  const mapQuery =
    isBooked && gig.location_exact
      ? gig.location_exact
      : [gig.location_city, gig.location_parish, "Jamaica"]
          .filter(Boolean)
          .join(", ") ||
        (gig.location_general ? `${gig.location_general}, Jamaica` : "");

  const stickyFooter = canApply ? (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: "calc(56px + env(safe-area-inset-bottom))",
        padding: "12px 16px",
        background: "white",
        borderTop: "0.5px solid var(--color-border)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
        zIndex: 60,
      }}
    >
      <MobileApplyBar gigId={gig.id} icon={<Send size={16} />} />
    </div>
  ) : booking?.status === "confirmed" ? (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: "calc(56px + env(safe-area-inset-bottom))",
        padding: "12px 16px",
        background: "white",
        borderTop: "0.5px solid var(--color-border)",
        zIndex: 60,
      }}
    >
      <Link
        href={`/dashboard/participant/chats/start?gigId=${gig.id}`}
        style={{
          ...mobilePrimaryBtnStyle,
          background: "var(--color-gold)",
          color: "white",
          textDecoration: "none",
        }}
      >
        <MessageCircle size={18} /> Message merchant
      </Link>
    </div>
  ) : null;

  return (
    <MobileParticipantShell
      title="Gig details"
      showBack
      contentStyle={{ paddingBottom: stickyFooter ? 100 : 16 }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1A1D23 0%, #2A2D35 100%)",
          borderRadius: MOBILE_CARD_RADIUS,
          padding: "20px 16px",
          marginBottom: 16,
          color: "#F5F4F0",
        }}
      >
        <h1 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, lineHeight: 1.25 }}>
          {gig.title}
        </h1>
        {gig.location_general && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: MOBILE_BODY_SIZE, opacity: 0.85 }}>
            <MapPin size={14} /> {gig.location_general}
          </div>
        )}
        {gig.pay_rate != null && (
          <div style={{ marginTop: 12, fontSize: 28, fontWeight: 700, color: "#C8973A" }}>
            J${gig.pay_rate.toLocaleString()}
            <span style={{ fontSize: MOBILE_LABEL_SIZE, fontWeight: 500, opacity: 0.8 }}> /hr</span>
          </div>
        )}
      </div>

      {application && (
        <div
          style={{
            ...mobileCardStyle,
            padding: "12px 14px",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: MOBILE_BODY_SIZE,
            fontWeight: 500,
          }}
        >
          {application.status === "accepted" && <CheckCircle size={16} color="var(--color-green)" />}
          {application.status === "rejected" && <XCircle size={16} color="var(--color-danger)" />}
          {application.status === "pending" && <Clock size={16} color="var(--color-warning)" />}
          Application {application.status}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ ...mobileCardStyle, padding: "12px 14px" }}>
          <div style={{ fontSize: MOBILE_LABEL_SIZE, color: "var(--color-ink-muted)" }}>Spots left</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-ink)", marginTop: 4 }}>
            {Math.max(0, spots - filledSpots)} / {spots}
          </div>
        </div>
        {gig.start_time && (
          <div style={{ ...mobileCardStyle, padding: "12px 14px" }}>
            <div style={{ fontSize: MOBILE_LABEL_SIZE, color: "var(--color-ink-muted)" }}>Starts</div>
            <div style={{ fontSize: MOBILE_BODY_SIZE, fontWeight: 600, color: "var(--color-ink)", marginTop: 4 }}>
              {new Date(gig.start_time).toLocaleDateString("en-JM", {
                day: "numeric",
                month: "short",
              })}
            </div>
          </div>
        )}
      </div>

      {duties.length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: MOBILE_BODY_SIZE, fontWeight: 600, marginBottom: 8 }}>Duties</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {duties.map((d, i) => (
              <span
                key={i}
                style={{
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontSize: MOBILE_LABEL_SIZE,
                  background: "var(--color-gold-light)",
                  border: "0.5px solid var(--color-gold-border)",
                  color: "var(--color-ink-muted)",
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </section>
      )}

      {mapQuery && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: MOBILE_BODY_SIZE, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            {isBooked ? null : <Lock size={14} />}
            Location
          </h2>
          <div style={{ borderRadius: MOBILE_CARD_RADIUS, overflow: "hidden" }}>
            <AddressMap query={mapQuery} />
          </div>
        </section>
      )}

      {teamPreview.length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: MOBILE_BODY_SIZE, fontWeight: 600, marginBottom: 8 }}>Team preview</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {teamPreview.map((m) => (
              <div
                key={m.user_id}
                style={{
                  ...mobileCardStyle,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--color-gold-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--color-gold)",
                  }}
                >
                  {(m.first_name ?? "?").slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: MOBILE_BODY_SIZE, fontWeight: 500 }}>
                  {m.user_id === currentUserId ? "You" : m.first_name ?? "Team member"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {stickyFooter}
    </MobileParticipantShell>
  );
}

const mobileCardStyle = {
  background: "white",
  border: "0.5px solid var(--color-border)",
  borderRadius: MOBILE_CARD_RADIUS,
};
