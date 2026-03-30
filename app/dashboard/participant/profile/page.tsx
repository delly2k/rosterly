import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import {
  getParticipantProfile,
  isIdentityLocked,
} from "@/app/dashboard/participant/actions";
import { isProfileComplete } from "@/lib/participant";
import { ProfileForm } from "./ProfileForm";

export default async function ParticipantProfilePage() {
  await requireRole(ROLES.PARTICIPANT);
  const [profile, identityLocked] = await Promise.all([
    getParticipantProfile(),
    isIdentityLocked(),
  ]);
  const nameEditable = !identityLocked || !isProfileComplete(profile);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="page-title tracking-tight">
          Profile setup
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Your profile is visible to merchants when you apply. Name and photo
          are locked after you submit verification.
        </p>
      </div>

      <ProfileForm
        key={`${profile?.user_id ?? "new"}-${profile?.updated_at ?? ""}-${profile?.disclaimer_accepted_at ?? ""}`}
        initial={profile}
        identityLocked={identityLocked}
        nameEditable={nameEditable}
      />

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Photo visibility can be managed in{" "}
        <Link
          href="/dashboard/settings/privacy"
          className="font-medium text-[#1D4ED8] underline underline-offset-2 hover:no-underline"
        >
          Settings → Privacy
        </Link>
        .
      </p>
    </div>
  );
}
