"use server";

import { createClient } from "@/lib/auth";

export type AuditEntity = "gig" | "application" | "booking" | "checkin";

export async function logAudit(
  entityType: AuditEntity,
  entityId: string,
  action: string,
  payload?: Record<string, unknown>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const actorId = user?.id ?? null;

  await supabase.from("audit_log").insert({
    entity_type: entityType,
    entity_id: entityId,
    action,
    actor_id: actorId,
    payload: payload ?? {},
  });
}
