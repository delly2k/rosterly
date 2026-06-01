import Link from "next/link";
import { MessageCircle, Briefcase, ChevronRight, Shield } from "lucide-react";
import type { ChatInboxRow } from "@/lib/chats";
import { formatChatListTime } from "@/lib/formatDate";

function initialsFromName(name: string): string {
  return (
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

export function ChatInboxList({
  chats,
  chatHref,
  serverNowIso,
  emptyDescription,
  emptyCta,
}: {
  chats: ChatInboxRow[];
  chatHref: (chatId: string) => string;
  serverNowIso: string;
  emptyDescription: string;
  emptyCta?: { label: string; href: string };
}) {
  const now = new Date(serverNowIso);

  return (
    <div
      className="-mx-4 -mt-6 md:-mx-10 md:-mt-8"
      style={{ padding: 0 }}
    >
      <div
        style={{
          padding: "24px 32px 16px",
          borderBottom: "0.5px solid var(--color-border)",
          background: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
              Messages
            </div>
            <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
              {chats.length} conversation{chats.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "white" }}>
        {chats.length === 0 ? (
          <div
            style={{
              padding: "60px 32px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "var(--color-gold-light)",
                border: "0.5px solid var(--color-gold-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageCircle size={24} color="var(--color-gold)" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--color-ink)" }}>
              No conversations yet
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--color-ink-muted)",
                maxWidth: 280,
                lineHeight: 1.6,
              }}
            >
              {emptyDescription}
            </div>
            {emptyCta && (
              <Link
                href={emptyCta.href}
                style={{
                  marginTop: 4,
                  padding: "9px 20px",
                  borderRadius: 8,
                  background: "var(--color-gold)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                {emptyCta.label}
              </Link>
            )}
          </div>
        ) : (
          chats.map((chat, i) => {
            const isLastItem = i === chats.length - 1;
            const lastMsg = chat.lastMessage;
            const timeLabel = lastMsg
              ? formatChatListTime(lastMsg.created_at, now)
              : formatChatListTime(chat.created_at, now);

            return (
              <Link
                key={chat.id}
                href={chatHref(chat.id)}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  className="transition-colors hover:bg-[#FAFAF8]"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 24px",
                    borderBottom: isLastItem ? "none" : "0.5px solid var(--color-border)",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: "var(--color-gold-light)",
                        border: "1.5px solid var(--color-gold-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        fontWeight: 600,
                        color: "var(--color-gold)",
                      }}
                    >
                      {initialsFromName(chat.displayName)}
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        bottom: 1,
                        right: 1,
                        width: 11,
                        height: 11,
                        borderRadius: "50%",
                        background: "var(--color-green)",
                        border: "2px solid white",
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 3,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--color-ink)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          flex: 1,
                          marginRight: 8,
                        }}
                      >
                        {chat.displayName}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--color-ink-hint)",
                          flexShrink: 0,
                        }}
                      >
                        {timeLabel}
                      </div>
                    </div>

                    <div style={{ marginBottom: 4 }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "1px 7px",
                          borderRadius: 20,
                          background: "var(--color-gold-light)",
                          border: "0.5px solid var(--color-gold-border)",
                          fontSize: 10,
                          fontWeight: 500,
                          color: "var(--color-gold)",
                        }}
                      >
                        <Briefcase size={9} /> {chat.gigTitle}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        color: lastMsg ? "var(--color-ink-muted)" : "var(--color-ink-hint)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontStyle: lastMsg ? "normal" : "italic",
                      }}
                    >
                      {lastMsg ? lastMsg.body : "No messages yet — say hello!"}
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    color="var(--color-ink-hint)"
                    style={{ flexShrink: 0 }}
                  />
                </div>
              </Link>
            );
          })
        )}
      </div>

      <div
        style={{
          padding: "14px 24px",
          background: "#FAFAF8",
          borderTop: "0.5px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: "var(--color-ink-muted)",
        }}
      >
        <Shield size={13} color="var(--color-gold)" />
        All conversations are monitored for safety. Payments and ratings only work for
        on-platform bookings.
      </div>
    </div>
  );
}
