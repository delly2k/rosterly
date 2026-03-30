import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getChat, getMessages } from "@/app/actions/chat";
import { getCurrentUser } from "@/lib/auth";
import { ChatThread } from "@/components/chat/ChatThread";

export default async function MerchantChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(ROLES.MERCHANT);
  const { id: chatId } = await params;
  const current = await getCurrentUser();
  if (!current?.user) notFound();

  const [chat, messages] = await Promise.all([
    getChat(chatId),
    getMessages(chatId),
  ]);
  if (!chat) notFound();

  const otherPartyUserId =
    chat.merchant_user_id === current.user.id
      ? chat.participant_user_id
      : chat.merchant_user_id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/merchant/chats"
          className="text-sm font-bold text-black underline underline-offset-2 hover:no-underline"
        >
          ← Chats
        </Link>
      </div>
      <h1 className="page-title tracking-tight">
        {chat.gig?.title ?? "Chat"} · Participant
      </h1>
      <ChatThread
        chatId={chat.id}
        currentUserId={current.user.id}
        otherPartyUserId={otherPartyUserId}
        initialMessages={messages}
        isAdmin={false}
        showReportBlock={true}
      />
    </div>
  );
}
