"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileChatList from "@/components/mobile/participant/MobileChatList";
import { ChatInboxList } from "@/components/chat/ChatInboxList";
import type { ChatInboxRow, MobileChatListItem } from "@/lib/chats";

export function ParticipantChatsPageView({
  inboxChats,
  mobileChats,
  serverNowIso,
}: {
  inboxChats: ChatInboxRow[];
  mobileChats: MobileChatListItem[];
  serverNowIso: string;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return <MobileChatList chats={mobileChats} />;
  }

  return (
    <ChatInboxList
      chats={inboxChats}
      serverNowIso={serverNowIso}
      chatHref={(id) => `/dashboard/participant/chats/${id}`}
      emptyDescription="Chats are created when you apply to a gig and start a conversation with a merchant"
      emptyCta={{ label: "Browse gigs →", href: "/dashboard/participant/gigs" }}
    />
  );
}
