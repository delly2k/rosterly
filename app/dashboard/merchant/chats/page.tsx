import { requireRole, createClient } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listMerchantChatsInbox } from "@/lib/chats";
import { ChatInboxList } from "@/components/chat/ChatInboxList";

export default async function MerchantChatsPage() {
  await requireRole(ROLES.MERCHANT);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const serverNowIso = new Date().toISOString();
  const inboxChats = await listMerchantChatsInbox(user.id);

  return (
    <ChatInboxList
      chats={inboxChats}
      serverNowIso={serverNowIso}
      chatHref={(id) => `/dashboard/merchant/chats/${id}`}
      emptyDescription="Chats begin when you contact an applicant or they message you about a gig"
      emptyCta={{ label: "View gigs →", href: "/dashboard/merchant/gigs" }}
    />
  );
}
