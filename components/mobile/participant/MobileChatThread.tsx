"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MessageRow } from "@/app/actions/chat";
import type { MobileChatDetail } from "@/lib/chats";
import { Send, AlertTriangle } from "lucide-react";

function gigTitle(gigs: MobileChatDetail["gigs"]): string {
  if (!gigs) return "Gig";
  const g = Array.isArray(gigs) ? gigs[0] : gigs;
  return g?.title ?? "Gig";
}

export default function MobileChatThread({
  chat,
  messages,
  currentUserId,
  sendAction,
}: {
  chat: MobileChatDetail & {
    merchant_profiles?: { business_name: string | null } | null;
  };
  messages: MessageRow[];
  currentUserId: string;
  sendAction: (fd: FormData) => Promise<{ blocked?: boolean; message?: string; error?: string }>;
}) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [blocked, setBlocked] = useState<string | null>(null);

  const merchantName =
    chat.merchant_profiles?.business_name ?? chat.merchantName ?? "Merchant";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const fd = new FormData();
    fd.append("body", input.trim());
    fd.append("chatId", chat.id);
    const result = await sendAction(fd);
    if (result?.blocked) {
      setBlocked(result.message ?? "Message blocked");
      setTimeout(() => setBlocked(null), 5000);
    } else if (!result?.error) {
      setInput("");
      router.refresh();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "#F4F3EF",
      }}
    >
      <div
        style={{
          background: "white",
          borderBottom: "0.5px solid var(--color-border)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 22,
            color: "var(--color-ink)",
            padding: "0 8px 0 0",
            minHeight: 48,
            minWidth: 48,
          }}
          aria-label="Go back"
        >
          ←
        </button>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--color-gold-light)",
            border: "1px solid var(--color-gold-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-gold)",
            flexShrink: 0,
          }}
        >
          {merchantName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ink)" }}>
            {merchantName}
          </div>
          <div style={{ fontSize: 11, color: "var(--color-ink-muted)" }}>
            Re: {gigTitle(chat.gigs)}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#FAFAF8",
          borderBottom: "0.5px solid var(--color-border)",
          padding: "6px 14px",
          fontSize: 11,
          color: "var(--color-ink-muted)",
          display: "flex",
          alignItems: "center",
          gap: 5,
          flexShrink: 0,
        }}
      >
        Payments and safety only work for on-platform bookings
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px" }}>
        {messages.map((msg) =>
          msg.is_system ? (
            <div
              key={msg.id}
              style={{
                textAlign: "center",
                margin: "8px 0",
                padding: "5px 12px",
                background: "var(--color-gold-light)",
                border: "0.5px solid var(--color-gold-border)",
                borderRadius: 20,
                fontSize: 11,
                color: "var(--color-gold)",
                fontWeight: 500,
              }}
            >
              {msg.body}
            </div>
          ) : (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.sender_id === currentUserId ? "flex-end" : "flex-start",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  maxWidth: "78%",
                  padding: "10px 13px",
                  borderRadius:
                    msg.sender_id === currentUserId ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                  background: msg.sender_id === currentUserId ? "var(--color-gold)" : "white",
                  border:
                    msg.sender_id === currentUserId ? "none" : "0.5px solid var(--color-border)",
                  color: msg.sender_id === currentUserId ? "white" : "var(--color-ink)",
                  fontSize: 14,
                  lineHeight: 1.5,
                  boxShadow:
                    msg.sender_id !== currentUserId ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {msg.body}
              </div>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {blocked && (
        <div
          style={{
            margin: "0 14px 6px",
            background: "#FEF2F2",
            border: "0.5px solid rgba(220,38,38,0.3)",
            borderRadius: 8,
            padding: "9px 12px",
            fontSize: 12,
            color: "#DC2626",
            display: "flex",
            gap: 7,
          }}
        >
          <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} /> {blocked}
        </div>
      )}

      <div
        style={{
          background: "white",
          borderTop: "0.5px solid var(--color-border)",
          padding: "10px 14px",
          paddingBottom: "calc(10px + env(safe-area-inset-bottom))",
          display: "flex",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void handleSend()}
          className="input-refined"
          style={{ flex: 1, height: 44, fontSize: 14 }}
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!input.trim()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            flexShrink: 0,
            background: input.trim() ? "var(--color-gold)" : "#F4F3EF",
            border: "none",
            cursor: input.trim() ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Send size={16} color={input.trim() ? "white" : "var(--color-ink-hint)"} />
        </button>
      </div>
    </div>
  );
}
