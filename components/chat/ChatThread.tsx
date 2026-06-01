"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import type { MessageRow } from "@/app/actions/chat";
import { sendMessage, reportUser, reportMessage, blockUser } from "@/app/actions/chat";
import { Button } from "@/components/ui/Button";

type ChatThreadProps = {
  chatId: string;
  currentUserId: string;
  otherPartyUserId: string;
  initialMessages: MessageRow[];
  isAdmin?: boolean;
  showReportBlock?: boolean;
};

export function ChatThread({
  chatId,
  currentUserId,
  otherPartyUserId,
  initialMessages,
  isAdmin = false,
  showReportBlock = true,
}: ChatThreadProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [reportBlockOpen, setReportBlockOpen] = useState(false);
  const [reportMessageId, setReportMessageId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isAdmin) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        () => router.refresh()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, isAdmin, router]);

  useEffect(() => {
    if (!blockedMessage) return;
    const t = setTimeout(() => setBlockedMessage(null), 6000);
    return () => clearTimeout(t);
  }, [blockedMessage]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isAdmin) return;
    setSending(true);
    setError(null);
    const result = await sendMessage(chatId, input.trim());
    if (result.blocked) {
      setBlockedMessage(result.message ?? "Message could not be sent.");
      setSending(false);
      return;
    }
    if (result.ok) {
      setInput("");
      router.refresh();
    } else {
      setError(result.error ?? "Failed to send");
    }
    setSending(false);
  }

  async function handleReportUser(description: string) {
    const result = await reportUser(otherPartyUserId, {
      description: description || undefined,
      messageId: reportMessageId ?? undefined,
    });
    if (result.ok) {
      setReportBlockOpen(false);
      setReportMessageId(null);
    } else {
      setError(result.error ?? null);
    }
  }

  async function handleReportMessage(messageId: string, description: string) {
    const result = await reportMessage(messageId, {
      category: "inappropriate_message",
      description: description || undefined,
    });
    if (result.ok) {
      setReportBlockOpen(false);
      setReportMessageId(null);
    } else {
      setError(result.error ?? null);
    }
  }

  async function handleBlock() {
    const result = await blockUser(otherPartyUserId);
    if (result.ok) {
      setReportBlockOpen(false);
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(result.error ?? "Could not block");
    }
  }

  return (
    <div className="flex flex-col surface-card overflow-hidden">
      {!isAdmin && (
        <div
          style={{
            background: "#FAFAF8",
            borderBottom: "0.5px solid var(--color-border)",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            color: "var(--color-ink-muted)",
          }}
        >
          <Shield size={12} color="var(--color-gold)" />
          Payments, ratings and safety features only work for on-platform bookings.
          <Link
            href="/legal/acknowledgment"
            style={{ color: "var(--color-gold)", fontWeight: 500, marginLeft: 2 }}
          >
            Learn more
          </Link>
        </div>
      )}
      {showReportBlock && (
        <div className="relative flex justify-end border-b border-[var(--color-border)] px-4 py-2">
          <button
            type="button"
            onClick={() => setReportBlockOpen((v) => !v)}
            className="text-sm font-medium text-[var(--color-gold)] hover:underline"
          >
            Report / Block user
          </button>
          {reportBlockOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 flex w-72 flex-col gap-2 surface-card p-3 shadow-lg">
              <ReportBlockForm
                onReportUser={handleReportUser}
                onReportMessage={
                  reportMessageId
                    ? (desc) => handleReportMessage(reportMessageId, desc)
                    : undefined
                }
                onBlock={handleBlock}
                onClose={() => {
                  setReportBlockOpen(false);
                  setReportMessageId(null);
                }}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex max-h-[60vh] min-h-[200px] flex-1 flex-col overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-[var(--color-ink-muted)]">
            No messages yet. Say hello.
          </p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) =>
              m.is_system ? (
                <li key={m.id}>
                  <div
                    style={{
                      textAlign: "center",
                      margin: "8px 0",
                      padding: "6px 16px",
                      background: "var(--color-gold-light)",
                      border: "0.5px solid var(--color-gold-border)",
                      borderRadius: 20,
                      fontSize: 11,
                      color: "var(--color-gold)",
                      fontWeight: 500,
                    }}
                  >
                    {m.body}
                  </div>
                </li>
              ) : (
                <li
                  key={m.id}
                  className={`flex ${m.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 ${
                      m.sender_id === currentUserId
                        ? "border border-[var(--color-gold-border)] bg-[var(--color-gold-light)] text-[var(--color-ink)]"
                        : "border border-[var(--color-border)] bg-white text-[var(--color-ink)]"
                    } ${m.flagged ? "ring-2 ring-[var(--color-warning)]" : ""}`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs opacity-70">
                        {new Date(m.created_at).toLocaleString()}
                      </span>
                      {m.flagged && (
                        <span className="pill-warning">
                          Flagged{m.flagged_reason ? `: ${m.flagged_reason}` : ""}
                        </span>
                      )}
                      {showReportBlock && m.sender_id && m.sender_id !== currentUserId && (
                        <button
                          type="button"
                          onClick={() => {
                            setReportMessageId(m.id);
                            setReportBlockOpen(true);
                          }}
                          className="text-xs text-[var(--color-gold)] underline opacity-80 hover:opacity-100"
                        >
                          Report message
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              )
            )}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="px-4 py-2 text-sm text-[var(--color-danger)]">{error}</p>
      )}

      {!isAdmin && (
        <>
          {blockedMessage && (
            <div
              style={{
                margin: "0 16px 8px",
                background: "#FEF2F2",
                border: "0.5px solid rgba(220,38,38,0.3)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 12,
                color: "#DC2626",
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              {blockedMessage}
            </div>
          )}
          <form onSubmit={handleSend} className="border-t border-[var(--color-border)] p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message (no phone numbers)"
                className="input-refined min-h-[44px] flex-1 px-4 py-2 text-sm disabled:opacity-50"
                maxLength={2000}
                disabled={sending}
              />
              <Button
                type="submit"
                disabled={sending || !input.trim()}
                variant="primary"
                size="sm"
              >
                Send
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

function ReportBlockForm({
  onReportUser,
  onReportMessage,
  onBlock,
  onClose,
}: {
  onReportUser: (description: string) => void | Promise<void>;
  onReportMessage?: (description: string) => void | Promise<void>;
  onBlock: () => void | Promise<void>;
  onClose: () => void;
}) {
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleReport() {
    setSubmitting(true);
    try {
      if (onReportMessage) await onReportMessage(description);
      else await onReportUser(description);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBlock() {
    setSubmitting(true);
    try {
      await onBlock();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <label className="text-xs font-medium text-[var(--text-primary)]">
        Optional description
      </label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What happened?"
        className="min-h-[60px] w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text-primary)]"
        rows={2}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={submitting}
          onClick={handleReport}
          className="rounded-lg bg-[var(--text-primary)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          Report
        </button>
        <button
          type="button"
          onClick={handleBlock}
          disabled={submitting}
          className="rounded-lg bg-[var(--warning-text)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          Block user
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--card-bg)] disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </>
  );
}
