import Link from "next/link";
import { CalendarCheck, CalendarDays, CheckCircle, XCircle, Mic2 } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listBookingsForAdmin, type BookingAdminRow } from "@/app/dashboard/admin/actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { BookingToggles } from "./BookingToggles";

function bookingStatusStyle(status: string): {
  bg: string;
  border: string;
  color: string;
} {
  if (status === "confirmed" || status === "completed") {
    return {
      bg: "var(--color-green-light)",
      border: "var(--color-green-border)",
      color: "var(--color-green)",
    };
  }
  if (status === "pending") {
    return {
      bg: "var(--color-warning-light)",
      border: "rgba(217,119,6,0.3)",
      color: "var(--color-warning)",
    };
  }
  if (status === "cancelled" || status === "no_show") {
    return {
      bg: "var(--color-danger-light)",
      border: "rgba(220,38,38,0.2)",
      color: "var(--color-danger)",
    };
  }
  return {
    bg: "var(--color-gold-light)",
    border: "var(--color-gold-border)",
    color: "var(--color-gold)",
  };
}

function TogglePill({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 500,
        background: active ? "var(--color-green-light)" : "#F4F3EF",
        border: `0.5px solid ${active ? "var(--color-green-border)" : "var(--color-border)"}`,
        color: active ? "var(--color-green)" : "var(--color-ink-muted)",
      }}
    >
      {active ? <CheckCircle size={12} /> : <XCircle size={12} />}
      {label}
    </span>
  );
}

function AdminBookingsTable({ bookings }: { bookings: BookingAdminRow[] }) {
  return (
    <div
      style={{
        background: "white",
        border: "0.5px solid var(--color-border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{
              background: "#F9F8F5",
              borderBottom: "0.5px solid var(--color-border)",
            }}
          >
            {[
              "Gig",
              "Participant",
              "Status",
              "Payment",
              "Transport",
              "Actions",
            ].map((col) => (
              <th
                key={col}
                style={{
                  padding: "10px 16px",
                  textAlign: col === "Actions" ? "right" : "left",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "var(--color-ink-muted)",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => {
            const gigTitle =
              b.gig_title ??
              (b.gigs as { title?: string } | null)?.title ??
              `Gig ${b.gig_id.slice(0, 8)}…`;
            const participantName =
              b.participant_name ?? "Unknown participant";
            const initials = participantName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const statusStyle = bookingStatusStyle(b.status);

            return (
              <tr
                key={b.id}
                className="audit-log-row"
                style={{
                  borderBottom: "0.5px solid var(--color-border)",
                }}
              >
                <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: "var(--color-gold-light)",
                        border: "1px solid var(--color-gold-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Mic2 size={15} color="var(--color-gold)" />
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--color-ink)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 220,
                      }}
                      title={gigTitle}
                    >
                      {gigTitle}
                    </span>
                  </div>
                </td>

                <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "var(--color-gold-light)",
                        border: "1px solid var(--color-gold-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--color-gold)",
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--color-ink)",
                      }}
                    >
                      {participantName}
                    </span>
                  </div>
                </td>

                <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 500,
                      background: statusStyle.bg,
                      border: `0.5px solid ${statusStyle.border}`,
                      color: statusStyle.color,
                      textTransform: "capitalize",
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "currentColor",
                      }}
                    />
                    {b.status}
                  </span>
                </td>

                <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                  <TogglePill
                    active={b.payment_confirmed}
                    label={b.payment_confirmed ? "Confirmed" : "Not confirmed"}
                  />
                </td>

                <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                  <TogglePill
                    active={b.transport_assigned}
                    label={b.transport_assigned ? "Assigned" : "Not assigned"}
                  />
                </td>

                <td
                  style={{
                    padding: "14px 16px",
                    verticalAlign: "middle",
                    textAlign: "right",
                  }}
                >
                  <BookingToggles
                    bookingId={b.id}
                    paymentConfirmed={b.payment_confirmed}
                    transportAssigned={b.transport_assigned}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminBookingsPage() {
  await requireRole(ROLES.ADMIN);
  const bookings = await listBookingsForAdmin();

  return (
    <div className="page-bg space-y-6">
      <PageHeader
        icon={CalendarDays}
        title="Bookings (dummy)"
        description="Payment and transport toggles for confirmed bookings"
        action={
          <Link
            href="/dashboard/admin"
            className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            ← Admin
          </Link>
        }
      />

      <div
        style={{
          background: "var(--color-warning-light)",
          border: "0.5px solid rgba(217,119,6,0.3)",
          borderRadius: 12,
          padding: "14px 18px",
          fontSize: 13,
          color: "var(--color-warning)",
          lineHeight: 1.5,
        }}
      >
        <strong>No real integration.</strong> Payment confirmed and transport
        assigned are admin toggles only. TODO: Replace with payment provider
        webhook and transport API in a future phase.
      </div>

      {bookings.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No bookings to review" />
      ) : (
        <AdminBookingsTable bookings={bookings} />
      )}
    </div>
  );
}
