import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getOrCreateChat } from "@/app/actions/chat";

export default async function ParticipantStartChatPage({
  searchParams,
}: {
  searchParams: Promise<{ gigId?: string }>;
}) {
  await requireRole(ROLES.PARTICIPANT);
  const { gigId } = await searchParams;
  if (!gigId) redirect("/dashboard/participant/chats");

  const chat = await getOrCreateChat(gigId);
  if (!chat) redirect("/dashboard/participant/chats");

  redirect(`/dashboard/participant/chats/${chat.id}`);
}
