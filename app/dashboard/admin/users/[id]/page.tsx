import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getProfileDetailForAdmin } from "@/app/dashboard/admin/actions";
import { UserStatusActions } from "../UserStatusActions";
import { BackfillProfilePhotoButton } from "../BackfillProfilePhotoButton";

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[4px] border-[3px] border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="section-title text-base">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function DlRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-2 first:pt-0 last:pb-0">
      <dt className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-zinc-900 dark:text-zinc-100">
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
      <div className="space-y-6">
        <Link
          href="/dashboard/admin/users"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← User management
        </Link>
        <p className="text-zinc-600 dark:text-zinc-400">User not found.</p>
      </div>
    );
  }

  const { profile, participant, merchant, latestVerification, paymentDisclosureAcknowledgment } = detail;
  const displayName =
    participant?.full_name?.trim() ||
    merchant?.officer_name?.trim() ||
    merchant?.business_name?.trim() ||
    null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/admin/users"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← User management
          </Link>
          <h1 className="page-title mt-2 tracking-tight">
            {displayName ?? "User profile"}
          </h1>
          {displayName && (
            <p className="mt-1 font-mono text-sm text-zinc-500 dark:text-zinc-400">
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
        <dl className="divide-y divide-zinc-200 dark:divide-zinc-700">
          <DlRow label="User ID" value={profile.id} />
          <DlRow label="Name" value={displayName} />
          <DlRow label="Role" value={profile.role} />
          <DlRow
            label="Status"
            value={
              <span
                className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                  profile.status === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-200"
                    : profile.status === "suspended"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
                      : profile.status === "banned"
                        ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                }`}
              >
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
          <dl className="divide-y divide-zinc-200 dark:divide-zinc-700">
            <DlRow label="Full name" value={participant.full_name} />
            <DlRow label="Profile photo" value={participant.photo_url ? "Set" : "Not set"} />
            {participant.verified &&
              (!participant.photo_url || participant.photo_source === "none") && (
                <div className="pt-2">
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

      {merchant && (
        <Section title="Merchant profile">
          <dl className="divide-y divide-zinc-200 dark:divide-zinc-700">
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
        <dl className="divide-y divide-zinc-200 dark:divide-zinc-700">
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
          <dl className="divide-y divide-zinc-200 dark:divide-zinc-700">
            <DlRow label="Type" value={latestVerification.type} />
            <DlRow label="Status" value={latestVerification.status} />
            <DlRow
              label="Submitted"
              value={new Date(latestVerification.created_at).toLocaleString()}
            />
            <div className="pt-2">
              <Link
                href={`/dashboard/admin/verifications/${latestVerification.id}`}
                className="text-sm font-medium text-[#1D4ED8] underline hover:no-underline"
              >
                View verification details →
              </Link>
            </div>
          </dl>
        </Section>
      )}

      {profile.role !== ROLES.ADMIN && (
        <div className="flex justify-end border-t border-zinc-200 pt-6 dark:border-zinc-700">
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
