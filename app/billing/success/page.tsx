import { redirect } from "next/navigation";

export default function BillingSuccessPage() {
  redirect("/dashboard/settings/billing?message=subscription_activated");
}
