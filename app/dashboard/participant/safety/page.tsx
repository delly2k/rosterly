import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { getReportOutcomesForCurrentUser } from "@/app/dashboard/participant/actions";
import { Shield, FileWarning, AlertCircle } from "lucide-react";

export default async function ParticipantSafetyPage() {
  await requireRole(ROLES.PARTICIPANT);
  const outcomes = await getReportOutcomesForCurrentUser();

  return (
    <div className="page-bg space-y-6 sm:space-y-8">
      <PageHeader
        icon={Shield}
        title="Report / Safety"
        description="Your safety matters. Use the options below to report issues or get help."
      />

      {outcomes.length > 0 && (
        <Card>
          <CardTitle>Reports about you</CardTitle>
          <CardDescription>
            Outcome of reports where you were the reported party. You only see the outcome
            after our team has taken action.
          </CardDescription>
          <ul className="mt-4 space-y-3">
            {outcomes.map((o) => (
              <li
                key={o.id}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3 text-sm"
              >
                <span
                  className={`font-medium ${
                    o.status === "resolved"
                      ? "text-[var(--color-green)]"
                      : "text-[var(--color-ink-muted)]"
                  }`}
                >
                  Report {o.status}
                </span>
                {o.outcome_message && (
                  <p className="mt-1 text-[var(--color-ink-muted)]">{o.outcome_message}</p>
                )}
                <p className="mt-1 text-xs text-[var(--color-ink-hint)]">
                  {new Date(o.updated_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-gold-light)]">
            <FileWarning className="h-4 w-4 text-[var(--color-gold)]" aria-hidden />
          </span>
          Report an issue
        </CardTitle>
        <CardDescription>
          Report a person, gig, or safety concern. Submissions are reviewed by our team.
        </CardDescription>
        <div className="mt-6">
          <ButtonLink href="/dashboard/participant/report" variant="primary" size="sm">
            Submit a report
          </ButtonLink>
        </div>
      </Card>

      <Card>
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-page)]">
            <AlertCircle className="h-4 w-4 text-[var(--color-ink-muted)]" aria-hidden />
          </span>
          SOS emergency
        </CardTitle>
        <CardDescription>
          The SOS button on your dashboard notifies Rosterly admins, logs your GPS location,
          and texts your emergency contact when Twilio is configured. In a real emergency, also
          call local emergency numbers (e.g. 119 in Jamaica).
        </CardDescription>
      </Card>
    </div>
  );
}
