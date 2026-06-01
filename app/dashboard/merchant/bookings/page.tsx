import { createClient } from "@/lib/supabase/server";
import { CalendarCheck, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MerchantBookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      `
      id, status, created_at,
      gigs!inner (
        id, title, location_general, start_time, pay_rate, merchant_user_id
      ),
      participant_profiles!participant_user_id (
        full_name, reputation_score, verified
      )
    `
    )
    .eq("gigs.merchant_user_id", user.id)
    .order("created_at", { ascending: false });

  const statusGroups = {
    pending: bookings?.filter((b) => b.status === "pending") ?? [],
    confirmed: bookings?.filter((b) => b.status === "confirmed") ?? [],
    completed: bookings?.filter((b) => b.status === "completed") ?? [],
    cancelled: bookings?.filter((b) => b.status === "cancelled") ?? [],
  };

  const statusColors: Record<string, string> = {
    pending: "var(--color-warning)",
    confirmed: "var(--color-green)",
    completed: "var(--color-gold)",
    cancelled: "var(--color-danger)",
  };

  const statusBgs: Record<string, string> = {
    pending: "var(--color-warning-light)",
    confirmed: "var(--color-green-light)",
    completed: "var(--color-gold-light)",
    cancelled: "var(--color-danger-light)",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <div style={{ padding: "32px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--color-gold-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CalendarCheck size={16} color="var(--color-gold)" />
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "var(--color-ink)" }}>
            All bookings
          </div>
          <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
            {bookings?.length ?? 0} total across all gigs
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 12,
          marginBottom: 28,
        }}
      >
        {Object.entries(statusGroups).map(([status, items]) => (
          <div
            key={status}
            style={{
              background: "white",
              borderRadius: 10,
              border: "0.5px solid var(--color-border)",
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--color-ink-muted)",
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              {statusLabels[status] ?? status}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: statusColors[status] }}>
              {items.length}
            </div>
          </div>
        ))}
      </div>

      {Object.entries(statusGroups).map(
        ([status, items]) =>
          items.length > 0 && (
            <div key={status} style={{ marginBottom: 28 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-ink)",
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: statusColors[status],
                  }}
                />
                {statusLabels[status] ?? status}
                <span style={{ fontSize: 11, color: "var(--color-ink-muted)", fontWeight: 400 }}>
                  ({items.length})
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {items.map((booking) => {
                  const gig = Array.isArray(booking.gigs) ? booking.gigs[0] : booking.gigs;
                  const participant = Array.isArray(booking.participant_profiles)
                    ? booking.participant_profiles[0]
                    : booking.participant_profiles;
                  return (
                    <Link
                      key={booking.id}
                      href={`/dashboard/merchant/gigs/${gig?.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        style={{
                          background: "white",
                          borderRadius: 12,
                          border: "0.5px solid var(--color-border)",
                          borderLeft: `3px solid ${statusColors[status]}`,
                          padding: "14px 18px",
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          transition: "box-shadow 0.15s ease",
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "var(--color-gold-light)",
                            border: "1px solid var(--color-gold-border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--color-gold)",
                            flexShrink: 0,
                          }}
                        >
                          {participant?.full_name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() ?? "?"}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "var(--color-ink)",
                              marginBottom: 3,
                            }}
                          >
                            {participant?.full_name ?? "Unknown"}
                          </div>
                          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--color-ink-muted)",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <CalendarCheck size={11} /> {gig?.title}
                            </span>
                            {gig?.location_general && (
                              <span
                                style={{
                                  fontSize: 12,
                                  color: "var(--color-ink-muted)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <MapPin size={11} /> {gig.location_general}
                              </span>
                            )}
                            {gig?.start_time && (
                              <span style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                                {new Date(gig.start_time).toLocaleDateString("en-JM", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          {gig?.pay_rate != null && (
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "var(--color-gold)",
                                marginBottom: 4,
                              }}
                            >
                              J${gig.pay_rate.toLocaleString()}/hr
                            </div>
                          )}
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: 20,
                              fontSize: 10,
                              fontWeight: 500,
                              background: statusBgs[status],
                              color: statusColors[status],
                            }}
                          >
                            {statusLabels[status] ?? status}
                          </span>
                        </div>

                        <ChevronRight size={16} color="var(--color-ink-hint)" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )
      )}

      {(!bookings || bookings.length === 0) && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <CalendarCheck
            size={32}
            color="var(--color-ink-hint)"
            style={{ margin: "0 auto 12px", display: "block" }}
          />
          <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-ink)" }}>
            No bookings yet
          </div>
          <div style={{ fontSize: 13, color: "var(--color-ink-muted)", marginTop: 4 }}>
            Bookings appear here when you accept applications on your gigs.
          </div>
        </div>
      )}
    </div>
  );
}
