import { createClient } from "@/lib/auth";

export type DashboardChatPreview = {
  id: string;
  gigTitle: string;
  merchantName: string;
  created_at: string;
};

export type MobileChatListItem = {
  id: string;
  merchant_user_id: string;
  created_at: string;
  gigs: { title: string } | { title: string }[] | null;
  merchant_profiles: { business_name: string | null } | null;
};

export type MobileChatDetail = {
  id: string;
  merchant_user_id: string;
  participant_user_id: string;
  gigs: { title: string } | { title: string }[] | null;
  merchantName: string;
};

export type ChatLastMessage = {
  body: string;
  created_at: string;
  sender_id: string | null;
};

export type ChatInboxRow = {
  id: string;
  created_at: string;
  displayName: string;
  gigTitle: string;
  lastMessage: ChatLastMessage | null;
  unreadCount: number;
};

type MessageEmbed = {
  body: string;
  created_at: string;
  sender_id: string | null;
  is_system?: boolean;
};

function unwrapGigTitle(
  gigs: { title?: string } | { title?: string }[] | null | undefined
): string {
  if (!gigs) return "Gig chat";
  const g = Array.isArray(gigs) ? gigs[0] : gigs;
  return g?.title?.trim() || "Gig chat";
}

export function pickLastNonSystemMessage(
  messages: MessageEmbed[] | null | undefined
): ChatLastMessage | null {
  if (!messages?.length) return null;
  const sorted = [...messages]
    .filter((m) => !m.is_system)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  const top = sorted[0];
  if (!top) return null;
  return {
    body: top.body,
    created_at: top.created_at,
    sender_id: top.sender_id,
  };
}

export async function listParticipantChatsInbox(
  participantUserId: string
): Promise<ChatInboxRow[]> {
  const supabase = await createClient();

  const { data: chats } = await supabase
    .from("chats")
    .select(
      `
      id,
      created_at,
      merchant_user_id,
      gigs ( id, title, location_general, start_time ),
      messages ( body, created_at, sender_id, is_system )
    `
    )
    .eq("participant_user_id", participantUserId)
    .order("created_at", { ascending: false });

  if (!chats?.length) return [];

  const merchantIds = [...new Set(chats.map((c) => c.merchant_user_id))];
  const { data: merchants } = await supabase
    .from("merchant_profiles")
    .select("user_id, business_name")
    .in("user_id", merchantIds);

  const nameById = new Map(
    (merchants ?? []).map((m) => [m.user_id, m.business_name?.trim() || "Merchant"])
  );

  return chats.map((chat) => ({
    id: chat.id,
    created_at: chat.created_at,
    displayName: nameById.get(chat.merchant_user_id) ?? "Merchant",
    gigTitle: unwrapGigTitle(chat.gigs as { title?: string } | { title?: string }[] | null),
    lastMessage: pickLastNonSystemMessage(chat.messages as MessageEmbed[] | null),
    unreadCount: 0,
  }));
}

export async function listMerchantChatsInbox(
  merchantUserId: string
): Promise<ChatInboxRow[]> {
  const supabase = await createClient();

  const { data: chats } = await supabase
    .from("chats")
    .select(
      `
      id,
      created_at,
      participant_user_id,
      gigs ( id, title, location_general, start_time ),
      messages ( body, created_at, sender_id, is_system )
    `
    )
    .eq("merchant_user_id", merchantUserId)
    .order("created_at", { ascending: false });

  if (!chats?.length) return [];

  const participantIds = [...new Set(chats.map((c) => c.participant_user_id))];
  const { data: participants } = await supabase
    .from("participant_profiles")
    .select("user_id, full_name")
    .in("user_id", participantIds);

  const nameById = new Map(
    (participants ?? []).map((p) => [
      p.user_id,
      p.full_name?.trim() || "Participant",
    ])
  );

  return chats.map((chat) => ({
    id: chat.id,
    created_at: chat.created_at,
    displayName: nameById.get(chat.participant_user_id) ?? "Participant",
    gigTitle: unwrapGigTitle(chat.gigs as { title?: string } | { title?: string }[] | null),
    lastMessage: pickLastNonSystemMessage(chat.messages as MessageEmbed[] | null),
    unreadCount: 0,
  }));
}

/** Chats where the latest message is from the other party (merchant). */
export async function getUnreadChatCount(participantUserId: string): Promise<number> {
  const supabase = await createClient();

  const { data: chats } = await supabase
    .from("chats")
    .select("id, merchant_user_id, participant_user_id")
    .eq("participant_user_id", participantUserId);

  if (!chats?.length) return 0;

  let unread = 0;
  for (const chat of chats) {
    const { data: last } = await supabase
      .from("messages")
      .select("sender_id, is_system")
      .eq("chat_id", chat.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (last?.sender_id && last.sender_id === chat.merchant_user_id && !last.is_system) {
      unread += 1;
    }
  }
  return unread;
}

export async function getRecentChatsForDashboard(
  participantUserId: string,
  limit = 3
): Promise<DashboardChatPreview[]> {
  const supabase = await createClient();

  const { data: chats } = await supabase
    .from("chats")
    .select("id, merchant_user_id, created_at, gigs(title)")
    .eq("participant_user_id", participantUserId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!chats?.length) return [];

  const merchantIds = [...new Set(chats.map((c) => c.merchant_user_id))];
  const { data: merchants } = await supabase
    .from("merchant_profiles")
    .select("user_id, business_name")
    .in("user_id", merchantIds);

  const nameById = new Map(
    (merchants ?? []).map((m) => [m.user_id, m.business_name?.trim() || "Merchant"])
  );

  return chats.map((c) => {
    const gig = Array.isArray(c.gigs) ? c.gigs[0] : c.gigs;
    return {
      id: c.id,
      gigTitle: (gig as { title?: string } | null)?.title ?? "Gig",
      merchantName: nameById.get(c.merchant_user_id) ?? "Merchant",
      created_at: c.created_at,
    };
  });
}

export async function listChatsForParticipantMobile(
  participantUserId: string
): Promise<MobileChatListItem[]> {
  const supabase = await createClient();

  const { data: chats } = await supabase
    .from("chats")
    .select(
      `
      id,
      merchant_user_id,
      created_at,
      gigs ( title )
    `
    )
    .eq("participant_user_id", participantUserId)
    .order("created_at", { ascending: false });

  if (!chats?.length) return [];

  const merchantIds = [...new Set(chats.map((c) => c.merchant_user_id))];
  const { data: merchants } = await supabase
    .from("merchant_profiles")
    .select("user_id, business_name")
    .in("user_id", merchantIds);

  const nameById = new Map(
    (merchants ?? []).map((m) => [
      m.user_id,
      { business_name: m.business_name },
    ])
  );

  return chats.map((c) => ({
    id: c.id,
    merchant_user_id: c.merchant_user_id,
    created_at: c.created_at,
    gigs: c.gigs as MobileChatListItem["gigs"],
    merchant_profiles: nameById.get(c.merchant_user_id) ?? null,
  }));
}

export async function getChatForParticipantMobile(
  chatId: string,
  participantUserId: string
): Promise<MobileChatDetail | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("chats")
    .select("id, merchant_user_id, participant_user_id, gigs(title)")
    .eq("id", chatId)
    .eq("participant_user_id", participantUserId)
    .maybeSingle();

  if (!data) return null;

  const { data: merchant } = await supabase
    .from("merchant_profiles")
    .select("business_name")
    .eq("user_id", data.merchant_user_id)
    .maybeSingle();

  return {
    id: data.id,
    merchant_user_id: data.merchant_user_id,
    participant_user_id: data.participant_user_id,
    gigs: data.gigs as MobileChatDetail["gigs"],
    merchantName: merchant?.business_name?.trim() || "Merchant",
  };
}
