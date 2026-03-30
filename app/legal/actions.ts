"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/auth";
import { AuthError } from "@/lib/auth";
import {
  LEGAL_DOCUMENT_TYPE,
  PAYMENT_DISCLOSURE_VERSION,
} from "@/lib/legal";

/** Returns true if the current user has accepted the required Payment & Liability Disclosure at the current version. */
export async function hasAcceptedPaymentDisclosure(
  userId?: string
): Promise<boolean> {
  const supabase = await createClient();
  const id = userId ?? (await supabase.auth.getUser()).data.user?.id;
  if (!id) return false;

  const { data } = await supabase
    .from("legal_acknowledgments")
    .select("id")
    .eq("user_id", id)
    .eq("document_type", LEGAL_DOCUMENT_TYPE)
    .eq("version", PAYMENT_DISCLOSURE_VERSION)
    .limit(1)
    .maybeSingle();

  return !!data;
}

/** Insert Payment & Liability acknowledgment for the current user. Captures IP and user agent from request headers. Redirects to dashboard on success. */
export async function acceptPaymentDisclosure() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentication required.");

  const headersList = await headers();
  const ip_address =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    null;
  const user_agent = headersList.get("user-agent") ?? null;

  const { error } = await supabase.from("legal_acknowledgments").insert({
    user_id: user.id,
    document_type: LEGAL_DOCUMENT_TYPE,
    version: PAYMENT_DISCLOSURE_VERSION,
    ip_address,
    user_agent,
  });

  if (error) throw new AuthError("Could not save acknowledgment.");

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
