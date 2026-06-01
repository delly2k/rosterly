export type AuditDisplayContext = {
  gigTitleById: Map<string, string>;
  /** booking id → gig id (when payload omits gig_id) */
  bookingGigIdById: Map<string, string>;
};

function gigLabel(
  gigId: string | undefined,
  ctx: AuditDisplayContext
): string | null {
  if (!gigId) return null;
  const title = ctx.gigTitleById.get(gigId);
  if (title) return `"${title}"`;
  return `gig ${gigId.slice(0, 8)}…`;
}

/** Human-readable one-line summary for admin audit log (raw payload unchanged in DB). */
export function formatAuditPayloadSummary(
  entityType: string,
  entityId: string,
  action: string,
  payload: Record<string, unknown> | null | undefined,
  ctx: AuditDisplayContext
): string {
  const p = payload ?? {};
  const hasPayload = Object.keys(p).length > 0;
  let gigId = typeof p.gig_id === "string" ? p.gig_id : undefined;
  if (!gigId && entityType === "booking") {
    gigId = ctx.bookingGigIdById.get(entityId);
  }
  if (!gigId && entityType === "gig") {
    gigId = entityId;
  }
  const gig = gigLabel(gigId, ctx);

  switch (entityType) {
    case "application": {
      if (action === "created") {
        return gig ? `Applied to gig ${gig}` : "Application submitted";
      }
      if (action === "accepted") {
        const parts = ["Application accepted"];
        if (gig) parts.push(`for ${gig}`);
        if (typeof p.booking_id === "string") parts.push("· booking created");
        return parts.join(" ");
      }
      if (action === "rejected") {
        return gig ? `Not selected for ${gig}` : "Application rejected";
      }
      break;
    }
    case "booking": {
      if (action === "created") {
        return gig ? `Booking offer created for ${gig}` : "Booking offer created";
      }
      if (action === "accepted") {
        return gig ? `Participant confirmed for ${gig}` : "Participant confirmed booking";
      }
      if (action === "declined") {
        return gig ? `Participant declined · ${gig}` : "Participant declined booking";
      }
      break;
    }
    case "gig": {
      if (action === "created") {
        const title = typeof p.title === "string" ? p.title.trim() : "";
        if (title) return `Posted gig "${title}"`;
        const status = typeof p.status === "string" ? p.status : "";
        return status ? `Gig created (${status})` : "Gig created";
      }
      if (action === "updated") {
        if (p.locked === true) {
          return "Gig updated (locked — active bookings)";
        }
        const keys = Array.isArray(p.keys)
          ? (p.keys as string[]).filter((k) => typeof k === "string")
          : [];
        if (keys.length > 0) {
          return `Updated fields: ${keys.join(", ")}`;
        }
        return "Gig details updated";
      }
      break;
    }
    case "checkin": {
      const checkType = p.type === "out" ? "out" : p.type === "in" ? "in" : null;
      const gps = p.has_location === true;
      if (checkType === "in") {
        return gps ? "Checked in at venue (GPS)" : "Checked in at venue";
      }
      if (checkType === "out") {
        return gps ? "Checked out (GPS)" : "Checked out";
      }
      if (typeof p.booking_id === "string") {
        return "Check-in recorded for booking";
      }
      break;
    }
  }

  if (!hasPayload) {
    switch (`${entityType}:${action}`) {
      case "booking:accepted":
        return "Participant confirmed booking";
      case "application:rejected":
        return "Application rejected";
      default:
        return "";
    }
  }

  const parts: string[] = [];
  if (gig) parts.push(`Gig ${gig}`);
  for (const [key, value] of Object.entries(p)) {
    if (key === "gig_id" || value == null) continue;
    if (key === "booking_id" && typeof value === "string") {
      parts.push(`booking ${value.slice(0, 8)}…`);
      continue;
    }
    if (key === "has_location") {
      parts.push(value ? "with GPS" : "no GPS");
      continue;
    }
    if (key === "type" && (value === "in" || value === "out")) continue;
    if (typeof value === "boolean") {
      parts.push(`${key.replace(/_/g, " ")}: ${value ? "yes" : "no"}`);
    } else if (typeof value === "string" || typeof value === "number") {
      parts.push(`${key.replace(/_/g, " ")}: ${value}`);
    }
  }
  return parts.length > 0 ? parts.join(" · ") : "";
}
