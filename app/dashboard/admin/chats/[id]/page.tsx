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
    <div className="page-bg space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/admin/chats"
          className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          ← Chats
        </Link>
      </div>
      <div className="rounded-xl border border-[rgba(217,119,6,0.3)] bg-[var(--color-warning-light)] px-4 py-2 text-sm font-medium text-[var(--color-warning)]">
        Read-only. Flagged messages are highlighted for moderation.
      </div>
      <h1 className="admin-page-title">
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
