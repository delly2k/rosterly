"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isAdmin) return;
    setSending(true);
    setError(null);
    const result = await sendMessage(chatId, input.trim());
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
    <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card-bg)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      {!isAdmin && (
        <p className="border-b border-[var(--border)] bg-[var(--sky-bg)] px-4 py-2 text-center text-xs text-[var(--sky-accent)]">
          Keep communication in-app. No phone numbers.
        </p>
      )}
      {showReportBlock && (
        <div className="relative flex justify-end border-b border-[var(--border)] px-4 py-2">
          <button
            type="button"
            onClick={() => setReportBlockOpen((v) => !v)}
            className="text-sm font-medium text-[var(--primary)] hover:underline"
          >
            Report / Block user
          </button>
          {reportBlockOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 flex w-72 flex-col gap-2 rounded-xl border border-[var(--border)] bg-white p-3 shadow-lg">
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
          <p className="text-center text-sm text-[var(--text-secondary)]">
            No messages yet. Say hello.
          </p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li
                key={m.id}
                className={`flex ${m.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 ${
                    m.sender_id === currentUserId
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)]"
                  } ${m.flagged ? "ring-2 ring-[var(--pending-text)]" : ""}`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs opacity-70">
                      {new Date(m.created_at).toLocaleString()}
                    </span>
                    {m.flagged && (
                      <span className="rounded bg-[var(--pending-bg)] px-1.5 py-0.5 text-xs font-medium text-[var(--pending-text)]">
                        Flagged{m.flagged_reason ? `: ${m.flagged_reason}` : ""}
                      </span>
                    )}
                    {showReportBlock && m.sender_id !== currentUserId && (
                      <button
                        type="button"
                        onClick={() => {
                          setReportMessageId(m.id);
                          setReportBlockOpen(true);
                        }}
                        className="text-xs text-[var(--primary)] underline opacity-80 hover:opacity-100"
                      >
                        Report message
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="px-4 py-2 text-sm text-[var(--warning-text)]">{error}</p>
      )}

      {!isAdmin && (
        <form onSubmit={handleSend} className="border-t border-[var(--border)] p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message (no phone numbers)"
              className="flex-1 rounded-[4px] border-[3px] border-black bg-white px-4 py-3 text-sm text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] disabled:opacity-50 min-h-[48px]"
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
