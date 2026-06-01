import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getMessages, sendMessageFormAction } from "@/app/actions/chat";
import { getCurrentUser } from "@/lib/auth";
import { getChatForParticipantMobile } from "@/lib/chats";
import { ParticipantChatPageView } from "./ParticipantChatPageView";

export default async function ParticipantChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(ROLES.PARTICIPANT);
  const { id: chatId } = await params;
  const current = await getCurrentUser();
  if (!current?.user) notFound();

  const [chat, messages] = await Promise.all([
    getChatForParticipantMobile(chatId, current.user.id),
    getMessages(chatId),
  ]);
  if (!chat) notFound();

  const gigRaw = chat.gigs;
  const gigTitle = Array.isArray(gigRaw)
    ? gigRaw[0]?.title
    : gigRaw?.title;

  return (
    <ParticipantChatPageView
      chat={{
        ...chat,
        merchant_profiles: { business_name: chat.merchantName },
      }}
      chatTitle={gigTitle ?? "Chat"}
      currentUserId={current.user.id}
      initialMessages={messages}
      sendAction={sendMessageFormAction}
    />
  );
}
