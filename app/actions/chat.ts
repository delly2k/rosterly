"use server";

import { createClient, getCurrentUser } from "@/lib/auth";
import { containsPhoneNumber, getFlaggedKeyword } from "@/lib/chatModeration";
import { ROLES } from "@/lib/roles";

export type ChatRow = {
  id: string;
  gig_id: string;
  merchant_user_id: string;
  participant_user_id: string;
  created_at: string;
  gig?: { id: string; title: string };
  /** Set when listing as merchant: participant display name from participant_profiles. */
  participant_display_name?: string | null;
};

export type MessageRow = {
  id: string;
  chat_id: string;
  sender_id: string;
  body: string;
  flagged: boolean;
  flagged_reason: string | null;
  created_at: string;
};

/** Get or create the chat for this gig. As participant: pass only gigId (you are participant). As merchant: pass gigId and participantUserId. */
export async function getOrCreateChat(
  gigId: string,
  participantUserId?: string
): Promise<ChatRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: gig } = await supabase
    .from("gigs")
    .select("id, merchant_user_id")
    .eq("id", gigId)
    .single();
  if (!gig) return null;

  const merchantId = gig.merchant_user_id;
  const participantId =
    participantUserId ?? (user.id === gig.merchant_user_id ? undefined : user.id);

  if (!participantId) return null;

  const { data: existing } = await supabase
    .from("chats")
    .select("id, gig_id, merchant_user_id, participant_user_id, created_at")
    .eq("gig_id", gigId)
    .eq("participant_user_id", participantId)
    .maybeSingle();

  if (existing) {
    const { data: gigRow } = await supabase
      .from("gigs")
      .select("id, title")
      .eq("id", existing.gig_id)
      .single();
    return { ...existing, gig: gigRow ?? undefined } as ChatRow;
  }

  if (user.id === merchantId) {
    const { data: inserted, error } = await supabase
      .from("chats")
      .insert({
        gig_id: gigId,
        merchant_user_id: merchantId,
        participant_user_id: participantId,
      })
      .select("id, gig_id, merchant_user_id, participant_user_id, created_at")
      .single();
    if (error || !inserted) return null;
    const { data: gigRow } = await supabase
      .from("gigs")
      .select("id, title")
      .eq("id", inserted.gig_id)
      .single();
    return { ...inserted, gig: gigRow ?? undefined } as ChatRow;
  }

  if (user.id === participantId) {
    const { data: inserted, error } = await supabase
      .from("chats")
      .insert({
        gig_id: gigId,
        merchant_user_id: merchantId,
        participant_user_id: participantId,
      })
      .select("id, gig_id, merchant_user_id, participant_user_id, created_at")
      .single();
    if (error || !inserted) return null;
    const { data: gigRow } = await supabase
      .from("gigs")
      .select("id, title")
      .eq("id", inserted.gig_id)
      .single();
    return { ...inserted, gig: gigRow ?? undefined } as ChatRow;
  }

  return null;
}

/** List chats for current user (as merchant or participant). */
export async function listMyChats(): Promise<ChatRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: chats } = await supabase
    .from("chats")
    .select(
      "id, gig_id, merchant_user_id, participant_user_id, created_at, gigs(id, title)"
    )
    .or(`merchant_user_id.eq.${user.id},participant_user_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const rows = (chats ?? []) as Array<Record<string, unknown> & { merchant_user_id: string; participant_user_id: string }>;
  const participantIds = [...new Set(rows.filter((c) => c.merchant_user_id === user.id).map((c) => c.participant_user_id))];
  let displayByUserId = new Map<string, string | null>();
  if (participantIds.length > 0) {
    const { data: profiles } = await supabase
      .from("participant_profiles")
      .select("user_id, full_name")
      .in("user_id", participantIds);
    (profiles ?? []).forEach((p: { user_id: string; full_name: string | null }) => {
      displayByUserId.set(p.user_id, p.full_name ?? null);
    });
  }

  return rows.map((c) => {
    const gigs = c.gigs;
    const gig =
      gigs && !Array.isArray(gigs)
        ? (gigs as { id: string; title: string })
        : Array.isArray(gigs) && gigs.length
          ? (gigs[0] as { id: string; title: string })
          : undefined;
    const participant_display_name = c.merchant_user_id === user.id ? (displayByUserId.get(c.participant_user_id) ?? null) : undefined;
    return {
      id: c.id as string,
      gig_id: c.gig_id as string,
      merchant_user_id: c.merchant_user_id as string,
      participant_user_id: c.participant_user_id as string,
      created_at: c.created_at as string,
      gig,
      participant_display_name,
    } satisfies ChatRow;
  });
}

/** Get one chat by id (for permission check). */
export async function getChat(chatId: string): Promise<ChatRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("chats")
    .select("id, gig_id, merchant_user_id, participant_user_id, created_at, gigs(id, title)")
    .eq("id", chatId)
    .single();

  if (!data) return null;
  const canAccess =
    data.merchant_user_id === user.id || data.participant_user_id === user.id;
  if (!canAccess) return null;

  const rawGig = (data as Record<string, unknown>).gigs;
  const gig =
    rawGig && !Array.isArray(rawGig)
      ? (rawGig as { id: string; title: string })
      : Array.isArray(rawGig) && rawGig.length
        ? (rawGig[0] as { id: string; title: string })
        : undefined;
  return {
    id: data.id,
    gig_id: data.gig_id,
    merchant_user_id: data.merchant_user_id,
    participant_user_id: data.participant_user_id,
    created_at: data.created_at,
    gig,
  } as ChatRow;
}

/** Messages for chat; excludes messages from users the current user has blocked. */
export async function getMessages(chatId: string): Promise<MessageRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: chat } = await supabase
    .from("chats")
    .select("id, merchant_user_id, participant_user_id")
    .eq("id", chatId)
    .single();
  if (!chat) return [];

  const isParticipant =
    chat.merchant_user_id === user.id || chat.participant_user_id === user.id;
  if (!isParticipant) return [];

  const { data: blocked } = await supabase
    .from("blocked_users")
    .select("blocked_id")
    .eq("blocker_id", user.id);
  const blockedIds = new Set((blocked ?? []).map((b) => b.blocked_id));

  const { data: messages } = await supabase
    .from("messages")
    .select("id, chat_id, sender_id, body, flagged, flagged_reason, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  return (messages ?? []).filter(
    (m) => !blockedIds.has(m.sender_id)
  ) as MessageRow[];
}

/** Send a message. Rejects if body contains phone number; auto-flags risky keywords. */
export async function sendMessage(
  chatId: string,
  body: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Authentication required." };

  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Message cannot be empty." };

  if (containsPhoneNumber(trimmed))
    return { ok: false, error: "Messages cannot contain phone numbers. Keep contact in-app." };

  const { data: chat } = await supabase
    .from("chats")
    .select("id, merchant_user_id, participant_user_id")
    .eq("id", chatId)
    .single();
  if (!chat) return { ok: false, error: "Chat not found." };
  const isParticipant =
    chat.merchant_user_id === user.id || chat.participant_user_id === user.id;
  if (!isParticipant) return { ok: false, error: "You cannot post in this chat." };

  const keyword = getFlaggedKeyword(trimmed);
  const { error } = await supabase.from("messages").insert({
    chat_id: chatId,
    sender_id: user.id,
    body: trimmed,
    flagged: !!keyword,
    flagged_reason: keyword ?? null,
  });

  if (error) return { ok: false, error: "Could not send message." };
  return { ok: true };
}

/** Report a user (optionally in context of a message). */
export async function reportUser(
  reportedUserId: string,
  options: { category?: string; description?: string; messageId?: string } = {}
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Authentication required." };
  if (reportedUserId === user.id)
    return { ok: false, error: "You cannot report yourself." };

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_id: reportedUserId,
    message_id: options.messageId ?? null,
    category: options.category ?? null,
    description: options.description?.trim() ?? null,
    status: "pending",
  });
  if (error) return { ok: false, error: "Could not submit report." };
  return { ok: true };
}

/** Report a specific message. */
export async function reportMessage(
  messageId: string,
  options: { category?: string; description?: string } = {}
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Authentication required." };

  const { data: msg } = await supabase
    .from("messages")
    .select("id, sender_id, chat_id")
    .eq("id", messageId)
    .single();
  if (!msg) return { ok: false, error: "Message not found." };

  const { data: chat } = await supabase
    .from("chats")
    .select("id")
    .eq("id", msg.chat_id)
    .single();
  if (!chat) return { ok: false, error: "Chat not found." };

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_id: msg.sender_id,
    message_id: messageId,
    category: options.category ?? "inappropriate_message",
    description: options.description?.trim() ?? null,
    status: "pending",
  });
  if (error) return { ok: false, error: "Could not submit report." };
  return { ok: true };
}

/** Block a user. They will not appear in your chat; their messages are hidden. */
export async function blockUser(
  blockedUserId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Authentication required." };
  if (blockedUserId === user.id)
    return { ok: false, error: "You cannot block yourself." };

  const { error } = await supabase.from("blocked_users").insert({
    blocker_id: user.id,
    blocked_id: blockedUserId,
  });
  if (error) {
    if (error.code === "23505") return { ok: true };
    return { ok: false, error: "Could not block user." };
  }
  return { ok: true };
}

// ---------- Admin (read-only) ----------

/** Admin: list all chats with gig title. */
export async function listAllChatsForAdmin(): Promise<ChatRow[]> {
  const current = await getCurrentUser();
  if (!current?.profile || current.profile.role !== ROLES.ADMIN) return [];

  const supabase = await createClient();
  const { data: chats } = await supabase
    .from("chats")
    .select(
      "id, gig_id, merchant_user_id, participant_user_id, created_at, gigs(id, title)"
    )
    .order("created_at", { ascending: false });

  return (chats ?? []).map((c: Record<string, unknown>) => {
    const rawGig = c.gigs;
    const gig =
      rawGig && !Array.isArray(rawGig)
        ? (rawGig as { id: string; title: string })
        : Array.isArray(rawGig) && rawGig.length
          ? (rawGig[0] as { id: string; title: string })
          : undefined;
    return {
      id: c.id as string,
      gig_id: c.gig_id as string,
      merchant_user_id: c.merchant_user_id as string,
      participant_user_id: c.participant_user_id as string,
      created_at: c.created_at as string,
      gig,
    } satisfies ChatRow;
  });
}

/** Admin: get messages for any chat (read-only; RLS allows admin select). */
export async function getMessagesForAdmin(
  chatId: string
): Promise<MessageRow[]> {
  const current = await getCurrentUser();
  if (!current?.profile || current.profile.role !== ROLES.ADMIN) return [];

  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("messages")
    .select("id, chat_id, sender_id, body, flagged, flagged_reason, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  return (messages ?? []) as MessageRow[];
}

/** Admin: get one chat by id. */
export async function getChatForAdmin(chatId: string): Promise<ChatRow | null> {
  const current = await getCurrentUser();
  if (!current?.profile || current.profile.role !== ROLES.ADMIN) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("chats")
    .select("id, gig_id, merchant_user_id, participant_user_id, created_at, gigs(id, title)")
    .eq("id", chatId)
    .single();
  if (!data) return null;
  const rawGig = (data as Record<string, unknown>).gigs;
  const gig =
    rawGig && !Array.isArray(rawGig)
      ? (rawGig as { id: string; title: string })
      : Array.isArray(rawGig) && rawGig.length
        ? (rawGig[0] as { id: string; title: string })
        : undefined;
  return {
    id: data.id,
    gig_id: data.gig_id,
    merchant_user_id: data.merchant_user_id,
    participant_user_id: data.participant_user_id,
    created_at: data.created_at,
    gig,
  } as ChatRow;
}
