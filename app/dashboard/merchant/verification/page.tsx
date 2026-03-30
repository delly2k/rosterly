import { redirect } from "next/navigation";

/** Verification is on the profile page; redirect there. */
export default function MerchantVerificationPage() {
  redirect("/dashboard/merchant/profile#verification");
}
