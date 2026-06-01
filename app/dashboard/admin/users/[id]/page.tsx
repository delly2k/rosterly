import Link from "next/link";
import { Star } from "lucide-react";
import { requireRole } from "@/lib/auth";
import EmptyState from "@/components/ui/EmptyState";
import { ROLES } from "@/lib/roles";
import { getProfileDetailForAdmin } from "@/app/dashboard/admin/actions";
import { getRatingsReceivedByUser } from "@/app/dashboard/actions/ratings";
import { ReputationScore } from "@/components/ui/ReputationScore";
import { UserStatusActions } from "../UserStatusActions";
import { BackfillProfilePhotoButton } from "../BackfillProfilePhotoButton";

function profileStatusClass(status: string) {
  if (status === "active") return "pill-green";
  if (status === "suspended") return "pill-warning";
  if (status === "banned") return "pill-danger";
  return "pill-gold";
}

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-6">
      <h2 className="admin-section-title">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function DlRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-t border-[var(--color-border)] py-3 first:border-t-0 first:pt-0 last:pb-0">
      <dt className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--color-ink-muted)]">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-[var(--color-ink)]">
        {value ?? "—"}
      </dd>
    </div>
  );
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(ROLES.ADMIN);
  const { id } = await params;
  const detail = await getProfileDetailForAdmin(id);

  if (!detail) {
    return (
      <div className="page-bg space-y-6">
        <Link
          href="/dashboard/admin/users"
          className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          ← User management
        </Link>
        <p className="text-[var(--color-ink-muted)]">User not found.</p>
      </div>
    );
  }

  const { profile, participant, merchant, latestVerification, paymentDisclosureAcknowledgment } = detail;
  const ratingsReceived = await getRatingsReceivedByUser(id, 10);
  const displayName =
    participant?.full_name?.trim() ||
    merchant?.officer_name?.trim() ||
    merchant?.business_name?.trim() ||
    null;

  return (
    <div className="page-bg space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/admin/users"
            className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            ← User management
          </Link>
          <h1 className="admin-page-title mt-2">
            {displayName ?? "User profile"}
          </h1>
          {displayName && (
            <p className="mt-1 font-mono text-sm text-[var(--color-ink-muted)]">
              {profile.id}
            </p>
          )}
        </div>
        {profile.role !== ROLES.ADMIN && (
          <UserStatusActions
            userId={profile.id}
            currentStatus={profile.status as "active" | "suspended" | "banned" | "pending"}
            isAdmin={false}
          />
        )}
      </div>

      <Section title="Account">
        <dl>
          <DlRow label="User ID" value={profile.id} />
          <DlRow label="Name" value={displayName} />
          <DlRow label="Role" value={profile.role} />
          <DlRow
            label="Status"
            value={
              <span className={profileStatusClass(profile.status)}>
                {profile.status}
              </span>
            }
          />
          <DlRow
            label="Created"
            value={new Date(profile.created_at).toLocaleString()}
          />
        </dl>
      </Section>

      {participant && (
        <Section title="Participant profile">
          <dl>
            <DlRow label="Full name" value={participant.full_name} />
            <DlRow label="Profile photo" value={participant.photo_url ? "Set" : "Not set"} />
            {participant.verified &&
              (!participant.photo_url || participant.photo_source === "none") && (
                <div className="border-t border-[var(--color-border)] pt-3">
                  <BackfillProfilePhotoButton userId={profile.id} />
                </div>
              )}
            <DlRow label="Bio" value={participant.bio} />
            <DlRow label="Location" value={participant.location_general} />
            <DlRow
              label="Hourly rate"
              value={
                participant.rate != null ? `$${Number(participant.rate).toFixed(2)}` : null
              }
            />
            <DlRow label="Emergency contact" value={participant.emergency_contact} />
            <DlRow
              label="Verified"
              value={participant.verified ? "Yes" : "No"}
            />
          </dl>
        </Section>
      )}

      {participant && (
        <Section title="Ratings & reputation">
          <div className="mb-6 max-w-sm">
            <ReputationScore score={participant.reputation_score ?? 0} size="lg" />
          </div>
          <dl>
            <DlRow
              label="Average rating"
              value={
                participant.average_rating != null
                  ? Number(participant.average_rating).toFixed(2)
                  : "—"
              }
            />
            <DlRow label="Total ratings" value={participant.total_ratings ?? 0} />
          </dl>
          {ratingsReceived.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={Star}
                title="No reviews yet"
                description="Complete your first gig to start building your reputation"
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--color-border)]">
              {ratingsReceived.map((r) => (
                <li key={r.id} className="py-3 first:pt-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium text-[var(--color-ink)]">
                      {r.score}/5
                    </span>
                    <span className="pill-gray capitalize">{r.role_of_rater}</span>
                    <span className="text-[var(--color-ink-muted)]">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{r.comment}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {merchant && (
        <Section title="Merchant profile">
          <dl>
            <DlRow label="Business name" value={merchant.business_name} />
            <DlRow label="Business type" value={merchant.business_type} />
            <DlRow label="Officer name" value={merchant.officer_name} />
            <DlRow
              label="Verified"
              value={merchant.verified ? "Yes" : "No"}
            />
          </dl>
        </Section>
      )}

      <Section title="Legal acknowledgment">
        <dl>
          <DlRow
            label="Payment & Liability Disclosure"
            value={
              paymentDisclosureAcknowledgment ? (
                <>
                  Accepted {new Date(paymentDisclosureAcknowledgment.accepted_at).toLocaleString()} (version{" "}
                  {paymentDisclosureAcknowledgment.version})
                </>
              ) : (
                "Not accepted"
              )
            }
          />
        </dl>
      </Section>

      {latestVerification && (
        <Section title="Latest verification">
          <dl>
            <DlRow label="Type" value={latestVerification.type} />
            <DlRow label="Status" value={latestVerification.status} />
            <DlRow
              label="Submitted"
              value={new Date(latestVerification.created_at).toLocaleString()}
            />
            <div className="border-t border-[var(--color-border)] pt-3">
              <Link
                href={`/dashboard/admin/verifications/${latestVerification.id}`}
                className="text-sm font-medium text-[var(--color-gold)] underline hover:no-underline"
              >
                View verification details →
              </Link>
            </div>
          </dl>
        </Section>
      )}

      {profile.role !== ROLES.ADMIN && (
        <div className="flex justify-end border-t border-[var(--color-border)] pt-6">
          <UserStatusActions
            userId={profile.id}
            currentStatus={profile.status as "active" | "suspended" | "banned" | "pending"}
            isAdmin={false}
          />
        </div>
      )}
    </div>
  );
}
