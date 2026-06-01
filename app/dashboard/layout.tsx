import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser, createClient } from "@/lib/auth";
import type { Role } from "@/lib/roles";
import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { hasAcceptedPaymentDisclosure } from "@/app/legal/actions";
import { getPendingInvitationCount } from "@/lib/invitations";
import { getUnreadChatCount } from "@/lib/chats";
import { ROLES } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Dashboard | Rosterly",
  description: "Your dashboard",
};

async function getSidebarDisplayName(
  userId: string,
  role: Role,
  email: string | undefined
): Promise<string> {
  const supabase = await createClient();

  if (role === "participant") {
    const { data } = await supabase
      .from("participant_profiles")
      .select("full_name")
      .eq("user_id", userId)
      .maybeSingle();
    const name = data?.full_name?.trim();
    if (name) return name;
  } else if (role === "merchant") {
    const { data } = await supabase
      .from("merchant_profiles")
      .select("business_name")
      .eq("user_id", userId)
      .maybeSingle();
    const name = data?.business_name?.trim();
    if (name) return name;
  }

  return email ?? "User";
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isOnboarding = pathname.includes("/dashboard/participant/onboarding");

  if (isOnboarding) {
    return <>{children}</>;
  }

  const current = await getCurrentUser();
  if (!current?.user || !current.profile) {
    return null; // Middleware redirects unauthenticated users
  }

  const accepted = await hasAcceptedPaymentDisclosure(current.user.id);
  if (!accepted) {
    redirect("/legal/acknowledgment");
  }

  const role = current.profile.role as Role;
  const displayName = await getSidebarDisplayName(
    current.user.id,
    role,
    current.user.email
  );

  const pendingInvitationCount =
    role === ROLES.PARTICIPANT
      ? await getPendingInvitationCount(current.user.id)
      : 0;

  const unreadChats =
    role === ROLES.PARTICIPANT
      ? await getUnreadChatCount(current.user.id)
      : 0;

  return (
    <DashboardChrome
      role={role}
      displayName={displayName}
      pendingInvitationCount={pendingInvitationCount}
      unreadChats={unreadChats}
    >
      {children}
    </DashboardChrome>
  );
}
