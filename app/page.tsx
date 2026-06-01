import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardPathForRole } from "@/lib/dashboard";

export default async function Home() {
  const current = await getCurrentUser();
  if (current?.user && current?.profile) {
    redirect(getDashboardPathForRole(current.profile.role));
  }

  redirect("/login");
}
