import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getChatForAdmin, getMessagesForAdmin } from "@/app/actions/chat";
import { getCurrentUser } from "@/lib/auth";
import { ChatThread } from "@/components/chat/ChatThread";

export default async function AdminChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(ROLES.ADMIN);
  const { id: chatId } = await params;
  const current = await getCurrentUser();
  if (!current?.user) notFound();

  const [chat, messages] = await Promise.all([
    getChatForAdmin(chatId),
    getMessagesForAdmin(chatId),
  ]);
  if (!chat) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/admin/chats"
          className="text-sm font-bold text-black underline underline-offset-2 hover:no-underline"
        >
          ← Chats
        </Link>
      </div>
      <div className="rounded-[4px] border-[3px] border-black bg-[#FDE047] px-4 py-2 text-sm font-medium text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        Read-only. Flagged messages are highlighted for moderation.
      </div>
      <h1 className="page-title tracking-tight">
        {chat.gig?.title ?? "Chat"} (admin view)
      </h1>
      <ChatThread
        chatId={chat.id}
        currentUserId={current.user.id}
        otherPartyUserId={chat.participant_user_id}
        initialMessages={messages}
        isAdmin={true}
        showReportBlock={false}
      />
    </div>
  );
}
