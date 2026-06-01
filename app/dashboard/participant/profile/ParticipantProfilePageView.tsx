"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileProfile from "@/components/mobile/participant/MobileProfile";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProfileForm } from "./ProfileForm";
import { ProfileReputationSection } from "@/components/profile/ProfileReputationSection";
import { UserCircle, Award } from "lucide-react";
import { CertPill } from "@/components/ui/CertPill";
import type { ParticipantCertificate } from "@/lib/academy";
import { badgeColorToVariant } from "@/lib/academy";

type ProfileData = Parameters<typeof ProfileForm>[0]["initial"] & {
  user_id?: string;
  updated_at?: string | null;
  reputation_score?: number;
  average_rating?: number | string | null;
  total_ratings?: number;
  verified?: boolean;
};

export function ParticipantProfilePageView({
  profile,
  identityLocked,
  nameEditable,
  completionPct,
  missingFields,
  gigsCompleted,
  certifications = [],
}: {
  profile: ProfileData;
  identityLocked: boolean;
  nameEditable: boolean;
  completionPct: number;
  missingFields: string[];
  gigsCompleted: number;
  certifications?: ParticipantCertificate[];
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const reputationScore = profile?.reputation_score ?? 0;
  const averageRating =
    profile?.average_rating != null ? Number(profile.average_rating) : null;
  const totalRatings = profile?.total_ratings ?? 0;
  const verified = profile?.verified ?? false;

  if (isMobile) {
    return (
      <Suspense fallback={null}>
        <MobileProfile
          participant={profile}
          identityLocked={identityLocked}
          nameEditable={nameEditable}
          completionPct={completionPct}
          missingFields={missingFields}
          reputationScore={reputationScore}
          averageRating={averageRating}
          totalRatings={totalRatings}
          isVerified={verified}
          gigsCompleted={gigsCompleted}
          certifications={certifications}
        />
      </Suspense>
    );
  }

  return (
    <div className="page-bg space-y-6 sm:space-y-8">
      <PageHeader
        icon={UserCircle}
        title="Profile setup"
        description="Build your professional presence"
      />

      {certifications.length > 0 && (
        <section className="surface-card p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-[var(--color-gold)]" />
            <h2 className="portal-section-title text-lg">Certifications</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert) => (
              <CertPill
                key={cert.id}
                label={cert.levelSubtitle || cert.levelTitle}
                variant={badgeColorToVariant(cert.badge_color)}
                size="md"
              />
            ))}
          </div>
        </section>
      )}

      <ProfileReputationSection
        reputationScore={reputationScore}
        averageRating={averageRating}
        totalRatings={totalRatings}
        verified={verified}
        gigsCompleted={gigsCompleted}
      />

      <section className="surface-card p-4 sm:p-6">
        <h2 className="portal-section-title text-lg">Profile details</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
          Keep your information up to date so merchants can find and book you.
        </p>
        <div className="mt-6">
          <ProfileForm
            key={`${profile?.user_id ?? "new"}-${profile?.updated_at ?? ""}-${profile?.disclaimer_accepted_at ?? ""}`}
            initial={profile}
            identityLocked={identityLocked}
            nameEditable={nameEditable}
            completionPct={completionPct}
            missingFields={missingFields}
          />
        </div>
      </section>

      <p className="text-sm text-[var(--color-ink-muted)]">
        Photo visibility can be managed in{" "}
        <Link
          href="/dashboard/settings/privacy"
          className="font-medium text-[var(--color-gold)] underline underline-offset-2 hover:no-underline"
        >
          Settings → Privacy
        </Link>
        .
      </p>
    </div>
  );
}
