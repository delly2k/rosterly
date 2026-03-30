import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import type { Role } from "@/lib/roles";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardBottomNav } from "@/components/dashboard/DashboardBottomNav";
import { getVerificationStatus } from "@/app/dashboard/participant/actions";
import { getMerchantVerificationStatus } from "@/app/dashboard/merchant/actions";
import { hasAcceptedPaymentDisclosure } from "@/app/legal/actions";

export const metadata: Metadata = {
  title: "Dashboard | Rosterly",
  description: "Your dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentUser();
  if (!current?.user || !current.profile) {
    return null; // Middleware redirects unauthenticated users
  }

  const accepted = await hasAcceptedPaymentDisclosure(current.user.id);
  if (!accepted) {
    redirect("/legal/acknowledgment");
  }

  const role = current.profile.role as Role;
  const name = current.user.email?.split("@")[0] ?? "there";

  let verified = false;
  if (role === "participant") {
    const s = await getVerificationStatus();
    verified = s.status === "verified";
  } else if (role === "merchant") {
    const s = await getMerchantVerificationStatus();
    verified = s.verified;
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <DashboardSidebar role={role} userName={name} verified={verified} />
      <DashboardBottomNav role={role} />
      <main className="min-h-screen overflow-auto pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0 md:pl-20 lg:pl-64">
        <div className="mx-auto max-w-4xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
