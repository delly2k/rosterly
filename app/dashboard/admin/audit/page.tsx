import Link from "next/link";
import { ScrollText } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listAuditLog, type AuditLogRow } from "@/app/dashboard/admin/actions";
import { PageHeader } from "@/components/ui/PageHeader";

const ENTITY_STYLES: Record<
  string,
  { emoji: string; bg: string; border: string; color: string }
> = {
  booking: {
    emoji: "📋",
    bg: "var(--color-green-light)",
    border: "var(--color-green-border)",
    color: "var(--color-green)",
  },
  application: {
    emoji: "📩",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    color: "#2563EB",
  },
  gig: {
    emoji: "🎤",
    bg: "var(--color-gold-light)",
    border: "var(--color-gold-border)",
    color: "var(--color-gold)",
  },
  checkin: {
    emoji: "📍",
    bg: "#F4F3EF",
    border: "var(--color-border)",
    color: "var(--color-ink-muted)",
  },
};

const DEFAULT_ENTITY_STYLE = {
  emoji: "📄",
  bg: "#F4F3EF",
  border: "var(--color-border)",
  color: "var(--color-ink-muted)",
};

function actionStyle(action: string): {
  bg: string;
  border: string;
  color: string;
} {
  const a = action.toLowerCase();
  if (a === "created" || a === "accepted" || a === "approved") {
    return {
      bg: "var(--color-green-light)",
      border: "var(--color-green-border)",
      color: "var(--color-green)",
    };
  }
  if (a === "updated") {
    return {
      bg: "var(--color-gold-light)",
      border: "var(--color-gold-border)",
      color: "var(--color-gold)",
    };
  }
  if (a === "declined" || a === "rejected" || a === "cancelled" || a === "banned") {
    return {
      bg: "var(--color-danger-light)",
      border: "rgba(220,38,38,0.2)",
      color: "var(--color-danger)",
    };
  }
  if (a === "suspended") {
    return {
      bg: "var(--color-warning-light)",
      border: "rgba(217,119,6,0.3)",
      color: "var(--color-warning)",
    };
  }
  return {
    bg: "#F4F3EF",
    border: "var(--color-border)",
    color: "var(--color-ink-muted)",
  };
}

function AuditLogTable({ entries }: { entries: AuditLogRow[] }) {
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
            {["Time", "Entity", "Action", "Actor", "Payload"].map((col) => (
              <th
                key={col}
                style={{
                  padding: "10px 16px",
                  textAlign: "left",
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
          {entries.map((e) => {
            const entityStyle =
              ENTITY_STYLES[e.entity_type] ?? DEFAULT_ENTITY_STYLE;
            const actStyle = actionStyle(e.action);
            const summary = e.payload_summary?.trim() ?? "";
            const rawPayload =
              e.payload && Object.keys(e.payload).length > 0
                ? JSON.stringify(e.payload)
                : "";

            return (
              <tr
                key={e.id}
                className="audit-log-row"
                style={{
                  borderBottom: "0.5px solid var(--color-border)",
                  transition: "background 0.1s ease",
                }}
              >
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: 12,
                    color: "var(--color-ink-muted)",
                    whiteSpace: "nowrap",
                    verticalAlign: "top",
                  }}
                >
                  <div style={{ color: "var(--color-ink)", fontWeight: 500 }}>
                    {new Date(e.created_at).toLocaleDateString("en-JM", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div style={{ marginTop: 2, fontSize: 11 }}>
                    {new Date(e.created_at).toLocaleTimeString("en-JM", {
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </div>
                </td>

                <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 500,
                        background: entityStyle.bg,
                        border: `0.5px solid ${entityStyle.border}`,
                        color: entityStyle.color,
                        textTransform: "capitalize",
                      }}
                    >
                      {entityStyle.emoji}
                      {e.entity_type}
                    </span>
                    <span
                      style={{
                        fontFamily: "ui-monospace, monospace",
                        fontSize: 11,
                        color: "var(--color-ink-muted)",
                      }}
                    >
                      {e.entity_id.slice(0, 8)}…
                    </span>
                  </div>
                </td>

                <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 500,
                      background: actStyle.bg,
                      border: `0.5px solid ${actStyle.border}`,
                      color: actStyle.color,
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
                    {e.action}
                  </span>
                </td>

                <td
                  style={{
                    padding: "14px 16px",
                    verticalAlign: "top",
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 11,
                    color: "var(--color-ink-muted)",
                  }}
                >
                  {e.actor_id ? `${e.actor_id.slice(0, 8)}…` : "—"}
                </td>

                <td
                  style={{
                    padding: "14px 16px",
                    verticalAlign: "top",
                    maxWidth: 280,
                  }}
                >
                  {summary ? (
                    <span
                      title={rawPayload || undefined}
                      style={{
                        display: "block",
                        fontSize: 12,
                        lineHeight: 1.5,
                        color: "var(--color-ink)",
                        background: "#FAFAF8",
                        border: "0.5px solid var(--color-border)",
                        borderRadius: 6,
                        padding: "6px 10px",
                        maxWidth: 280,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {summary}
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--color-ink-hint)" }}>
                      —
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminAuditPage() {
  await requireRole(ROLES.ADMIN);
  const entries = await listAuditLog(200);

  return (
    <div className="page-bg space-y-6">
      <PageHeader
        icon={ScrollText}
        title="Audit log"
        description="Gig, application, booking and check-in changes. Read-only."
        action={
          <Link
            href="/dashboard/admin"
            className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            ← Admin
          </Link>
        }
      />

      {entries.length === 0 ? (
        <div className="surface-card p-8 text-center">
          <p className="text-[var(--color-ink-muted)]">No audit entries yet.</p>
        </div>
      ) : (
        <AuditLogTable entries={entries} />
      )}
    </div>
  );
}
