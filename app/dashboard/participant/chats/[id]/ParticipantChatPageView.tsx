"use client";

import Link from "next/link";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileChatThread from "@/components/mobile/participant/MobileChatThread";
import { ChatThread } from "@/components/chat/ChatThread";
import type { MessageRow } from "@/app/actions/chat";
import type { MobileChatDetail } from "@/lib/chats";

export function ParticipantChatPageView({
  chat,
  chatTitle,
  currentUserId,
  initialMessages,
  sendAction,
}: {
  chat: MobileChatDetail & {
    merchant_profiles?: { business_name: string | null } | null;
  };
  chatTitle: string;
  currentUserId: string;
  initialMessages: MessageRow[];
  sendAction: (fd: FormData) => Promise<{
    blocked?: boolean;
    message?: string;
    error?: string;
    success?: boolean;
  }>;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return (
      <MobileChatThread
        chat={chat}
        messages={initialMessages}
        currentUserId={currentUserId}
        sendAction={sendAction}
      />
    );
  }

  const otherPartyUserId =
    chat.participant_user_id === currentUserId
      ? chat.merchant_user_id
      : chat.participant_user_id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/participant/chats"
          className="text-sm font-bold text-[var(--color-ink)] underline underline-offset-2 hover:no-underline"
        >
          ← Chats
        </Link>
      </div>
      <h1 className="page-title tracking-tight">{chatTitle}</h1>
      <ChatThread
        chatId={chat.id}
        currentUserId={currentUserId}
        otherPartyUserId={otherPartyUserId}
        initialMessages={initialMessages}
        isAdmin={false}
        showReportBlock={true}
      />
    </div>
  );
}
