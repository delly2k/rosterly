import { requireRole, createClient } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listChatsForParticipantMobile, listParticipantChatsInbox } from "@/lib/chats";
import { ParticipantChatsPageView } from "./ParticipantChatsPageView";

export default async function ParticipantChatsPage() {
  await requireRole(ROLES.PARTICIPANT);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const serverNowIso = new Date().toISOString();

  const [inboxChats, mobileChats] = await Promise.all([
    listParticipantChatsInbox(user.id),
    listChatsForParticipantMobile(user.id),
  ]);

  return (
    <ParticipantChatsPageView
      inboxChats={inboxChats}
      mobileChats={mobileChats}
      serverNowIso={serverNowIso}
    />
  );
}
