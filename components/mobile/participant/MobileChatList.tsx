"use client";

import MobileParticipantShell from "./MobileParticipantShell";
import type { MobileChatListItem } from "@/lib/chats";
import { MessageCircle, ChevronRight } from "lucide-react";

function gigTitle(gigs: MobileChatListItem["gigs"]): string {
  if (!gigs) return "Gig";
  const g = Array.isArray(gigs) ? gigs[0] : gigs;
  return g?.title ?? "Gig";
}

export default function MobileChatList({ chats }: { chats: MobileChatListItem[] }) {
  return (
    <MobileParticipantShell title="Chats">
      <div style={{ padding: "0 2px" }}>
        {chats.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <MessageCircle
              size={32}
              color="var(--color-ink-hint)"
              style={{ margin: "0 auto 12px", display: "block" }}
            />
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-ink)" }}>
              No conversations yet
            </div>
            <div style={{ fontSize: 13, color: "var(--color-ink-muted)", marginTop: 4 }}>
              Chats start when you apply to a gig
            </div>
          </div>
        ) : (
          chats.map((chat) => (
            <a
              key={chat.id}
              href={`/dashboard/participant/chats/${chat.id}`}
              style={{ textDecoration: "none", display: "block", marginBottom: 10 }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: 12,
                  border: "0.5px solid var(--color-border)",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  minHeight: 72,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "var(--color-gold-light)",
                    border: "1px solid var(--color-gold-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--color-gold)",
                    flexShrink: 0,
                  }}
                >
                  {chat.merchant_profiles?.business_name?.charAt(0)?.toUpperCase() ?? "?"}
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
                    {chat.merchant_profiles?.business_name ?? "Merchant"}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--color-ink-muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Re: {gigTitle(chat.gigs)}
                  </div>
                </div>
                <ChevronRight size={16} color="var(--color-ink-hint)" />
              </div>
            </a>
          ))
        )}
      </div>
    </MobileParticipantShell>
  );
}
