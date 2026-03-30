import type { VerificationStatusDisplay } from "@/types/participant";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";

const LABELS: Record<VerificationStatusDisplay, string> = {
  unverified: "Unverified",
  pending: "Pending review",
  verified: "Verified",
};

const VARIANTS: Record<VerificationStatusDisplay, BadgeVariant> = {
  unverified: "warning",
  pending: "teal",
  verified: "success",
};

export function VerificationBadge({
  status,
}: {
  status: VerificationStatusDisplay;
}) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
