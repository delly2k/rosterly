import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getOrCreateChat } from "@/app/actions/chat";

export default async function MerchantStartChatPage({
  searchParams,
}: {
  searchParams: Promise<{ gigId?: string; participantId?: string }>;
}) {
  await requireRole(ROLES.MERCHANT);
  const { gigId, participantId } = await searchParams;
  if (!gigId || !participantId) redirect("/dashboard/merchant/chats");

  const chat = await getOrCreateChat(gigId, participantId);
  if (!chat) redirect("/dashboard/merchant/chats");

  redirect(`/dashboard/merchant/chats/${chat.id}`);
}
