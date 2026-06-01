import Link from "next/link";
import { MessageCircle, AlertTriangle, Briefcase } from "lucide-react";
import { requireRole, createClient } from "@/lib/auth";
import { ROLES } from "@/lib/roles";

type ChatMessage = {
  id: string;
  chat_id: string;
  body: string;
  created_at: string;
  sender_id: string | null;
  ai_verdict: string | null;
  ai_category: string | null;
  flagged: boolean | null;
  is_system: boolean | null;
};

type EnrichedChat = {
  id: string;
  created_at: string;
  gig_id: string;
  merchant_user_id: string;
  participant_user_id: string;
  gigTitle: string;
  merchantName: string;
  participantName: string;
  flaggedMsgs: ChatMessage[];
  lastMsg: ChatMessage | undefined;
  totalMessages: number;
};

function isMessageFlagged(m: ChatMessage): boolean {
  return (
    m.flagged === true ||
    m.ai_verdict === "flag" ||
    m.ai_verdict === "block"
  );
}

export default async function AdminChatsPage() {
  await requireRole(ROLES.ADMIN);
  const supabase = await createClient();

  const { data: chats } = await supabase
    .from("chats")
    .select("id, created_at, gig_id, merchant_user_id, participant_user_id")
    .order("created_at", { ascending: false });

  if (!chats || chats.length === 0) {
    return (
      <div style={{ padding: "32px 40px" }}>
        <PageHeader enrichedCount={0} flaggedCount={0} />
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-ink)",
              marginBottom: 12,
            }}
          >
            All conversations
          </div>
          <div
            style={{
              background: "white",
              border: "0.5px solid var(--color-border)",
              borderRadius: 12,
              padding: "40px",
              textAlign: "center",
            }}
          >
            <MessageCircle
              size={28}
              color="var(--color-ink-hint)"
              style={{ margin: "0 auto 10px", display: "block" }}
            />
            <div style={{ fontSize: 14, color: "var(--color-ink-muted)" }}>
              No conversations yet
            </div>
          </div>
        </div>
      </div>
    );
  }

  const chatIds = chats.map((c) => c.id);
  const gigIds = [...new Set(chats.map((c) => c.gig_id).filter(Boolean))];
  const merchantIds = [...new Set(chats.map((c) => c.merchant_user_id).filter(Boolean))];
  const participantIds = [
    ...new Set(chats.map((c) => c.participant_user_id).filter(Boolean)),
  ];

  const [
    { data: messages },
    { data: gigs },
    { data: merchants },
    { data: participants },
  ] = await Promise.all([
    supabase
      .from("messages")
      .select(
        "id, chat_id, body, created_at, sender_id, ai_verdict, ai_category, flagged, is_system"
      )
      .in("chat_id", chatIds)
      .order("created_at", { ascending: true }),
    gigIds.length > 0
      ? supabase.from("gigs").select("id, title").in("id", gigIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    merchantIds.length > 0
      ? supabase
          .from("merchant_profiles")
          .select("user_id, business_name")
          .in("user_id", merchantIds)
      : Promise.resolve({ data: [] as { user_id: string; business_name: string | null }[] }),
    participantIds.length > 0
      ? supabase
          .from("participant_profiles")
          .select("user_id, full_name")
          .in("user_id", participantIds)
      : Promise.resolve({ data: [] as { user_id: string; full_name: string | null }[] }),
  ]);

  const enriched: EnrichedChat[] = chats.map((chat) => {
    const chatMessages = (messages ?? []).filter((m) => m.chat_id === chat.id) as ChatMessage[];
    const nonSystem = chatMessages.filter((m) => !m.is_system);
    const flaggedMsgs = chatMessages.filter(isMessageFlagged);
    const lastMsg = nonSystem.at(-1);

    return {
      ...chat,
      gigTitle: gigs?.find((g) => g.id === chat.gig_id)?.title ?? "Unknown gig",
      merchantName:
        merchants?.find((m) => m.user_id === chat.merchant_user_id)?.business_name ??
        "Unknown merchant",
      participantName:
        participants?.find((p) => p.user_id === chat.participant_user_id)?.full_name ??
        "Unknown participant",
      flaggedMsgs,
      lastMsg,
      totalMessages: nonSystem.length,
    };
  });

  const flaggedChats = enriched.filter((c) => c.flaggedMsgs.length > 0);
  const cleanChats = enriched.filter((c) => c.flaggedMsgs.length === 0);

  return (
    <div style={{ padding: "32px 40px" }}>
      <PageHeader enrichedCount={enriched.length} flaggedCount={flaggedChats.length} />

      {flaggedChats.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-danger)",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <AlertTriangle size={14} /> Flagged conversations
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {flaggedChats.map((chat) => (
              <ChatCard key={chat.id} chat={chat} />
            ))}
          </div>
        </div>
      )}

      {flaggedChats.length > 0 && cleanChats.length > 0 && (
        <div style={{ borderTop: "0.5px solid var(--color-border)", marginBottom: 24 }} />
      )}

      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-ink)",
            marginBottom: 12,
          }}
        >
          All conversations
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {enriched.map((chat) => (
            <ChatCard key={chat.id} chat={chat} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PageHeader({
  enrichedCount,
  flaggedCount,
}: {
  enrichedCount: number;
  flaggedCount: number;
}) {
  return (
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
        <MessageCircle size={16} color="var(--color-gold)" />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 600, color: "var(--color-ink)" }}>
          Chat monitoring
        </div>
        <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
          {enrichedCount} conversations · {flaggedCount} flagged
        </div>
      </div>
      {flaggedCount > 0 && (
        <div
          style={{
            marginLeft: "auto",
            padding: "6px 16px",
            borderRadius: 20,
            background: "var(--color-danger-light)",
            border: "0.5px solid rgba(220,38,38,0.2)",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-danger)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <AlertTriangle size={14} /> {flaggedCount} conversation
          {flaggedCount > 1 ? "s" : ""} need review
        </div>
      )}
    </div>
  );
}

function ChatCard({ chat }: { chat: EnrichedChat }) {
  const merchant = chat.merchantName;
  const participant = chat.participantName;
  const gigTitle = chat.gigTitle;
  const hasFlagged = chat.flaggedMsgs.length > 0;
  const merchantInitial = merchant.charAt(0).toUpperCase();
  const participantInitial = participant.charAt(0).toUpperCase();

  const categoryLabels: Record<string, string> = {
    off_platform: "Off-platform attempt",
    contact_info: "Contact info shared",
    harassment: "Harassment",
    inappropriate: "Inappropriate content",
    payment: "Payment negotiation",
  };

  return (
    <Link
      href={`/dashboard/admin/chats/${chat.id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        style={{
          background: "white",
          border: `0.5px solid ${hasFlagged ? "rgba(220,38,38,0.3)" : "var(--color-border)"}`,
          borderLeft: `3px solid ${hasFlagged ? "var(--color-danger)" : "var(--color-border)"}`,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", position: "relative", flexShrink: 0 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "var(--color-gold-light)",
                border: "1px solid var(--color-gold-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-gold)",
              }}
            >
              {merchantInitial}
            </div>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#F0F9FF",
                border: "2px solid white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 600,
                color: "#0369A1",
                position: "absolute",
                bottom: -4,
                right: -8,
              }}
            >
              {participantInitial}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0, paddingLeft: 8 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-ink)",
                marginBottom: 3,
              }}
            >
              {merchant} ↔ {participant}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "var(--color-ink-muted)",
                }}
              >
                <Briefcase size={11} /> {gigTitle}
              </span>
              <span style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                {chat.totalMessages} message{chat.totalMessages !== 1 ? "s" : ""}
              </span>
              <span style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                {new Date(chat.created_at).toLocaleDateString("en-JM", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {hasFlagged && (
            <div
              style={{
                padding: "4px 12px",
                borderRadius: 20,
                background: "var(--color-danger-light)",
                border: "0.5px solid rgba(220,38,38,0.2)",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--color-danger)",
                display: "flex",
                alignItems: "center",
                gap: 5,
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={11} />
              {chat.flaggedMsgs.length} flagged
            </div>
          )}

          {chat.lastMsg && (
            <div
              style={{
                maxWidth: 280,
                padding: "6px 12px",
                borderRadius: 8,
                background: "#FAFAF8",
                border: "0.5px solid var(--color-border)",
                fontSize: 12,
                color: "var(--color-ink-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                flexShrink: 0,
              }}
            >
              {chat.lastMsg.body}
            </div>
          )}
        </div>

        {hasFlagged && (
          <div
            style={{
              borderTop: "0.5px solid rgba(220,38,38,0.15)",
              background: "#FFF8F8",
              padding: "12px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--color-danger)",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Flagged messages
            </div>
            {chat.flaggedMsgs.map((msg) => (
              <div
                key={msg.id}
                style={{
                  background: "white",
                  borderRadius: 8,
                  border: "0.5px solid rgba(220,38,38,0.2)",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <AlertTriangle
                  size={14}
                  color="var(--color-danger)"
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "var(--color-ink)", marginBottom: 4 }}>
                    &ldquo;{msg.body}&rdquo;
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {msg.ai_category && (
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 500,
                          background: "var(--color-danger-light)",
                          border: "0.5px solid rgba(220,38,38,0.2)",
                          color: "var(--color-danger)",
                        }}
                      >
                        {categoryLabels[msg.ai_category] ?? msg.ai_category}
                      </span>
                    )}
                    {msg.ai_verdict && (
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 500,
                          background: "#F4F3EF",
                          border: "0.5px solid var(--color-border)",
                          color: "var(--color-ink-muted)",
                        }}
                      >
                        AI: {msg.ai_verdict}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: "var(--color-ink-hint)" }}>
                      {new Date(msg.created_at).toLocaleTimeString("en-JM", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      ·{" "}
                      {new Date(msg.created_at).toLocaleDateString("en-JM", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
