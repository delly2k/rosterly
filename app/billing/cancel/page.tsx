import { redirect } from "next/navigation";

export default function BillingCancelPage() {
  redirect("/dashboard/settings/billing?message=subscription_canceled");
}
