import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { getReportOutcomesForCurrentUser } from "@/app/dashboard/participant/actions";

export default async function ParticipantSafetyPage() {
  await requireRole(ROLES.PARTICIPANT);
  const outcomes = await getReportOutcomesForCurrentUser();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="page-title tracking-tight">
          Report / Safety
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-black/80">
          Your safety matters. Use the options below to report issues or get
          help.
        </p>
      </div>

      {outcomes.length > 0 && (
        <Card>
          <CardTitle>Reports about you</CardTitle>
          <CardDescription>
            Outcome of reports where you were the reported party. You only see
            the outcome after our team has taken action.
          </CardDescription>
          <ul className="mt-4 space-y-3">
            {outcomes.map((o) => (
              <li
                key={o.id}
                className="rounded border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-800/50"
              >
                <span
                  className={`font-medium ${
                    o.status === "resolved"
                      ? "text-green-700 dark:text-green-300"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  Report {o.status}
                </span>
                {o.outcome_message && (
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {o.outcome_message}
                  </p>
                )}
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  {new Date(o.updated_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="bg-[#F97316]">
        <CardTitle className="text-black">Report an issue</CardTitle>
        <CardDescription className="text-black/90">
          Report a person, gig, or safety concern. Submissions are reviewed by
          our team.
        </CardDescription>
        <div className="mt-6">
          <ButtonLink href="/dashboard/participant/report" variant="primary" size="sm">
            Submit a report
          </ButtonLink>
        </div>
      </Card>

      <Card>
        <CardTitle>SOS button (dummy)</CardTitle>
        <CardDescription>
          The SOS button on your dashboard logs an event only. It does not
          contact emergency services. In a real emergency, call local emergency
          numbers (e.g. 911).
        </CardDescription>
      </Card>
    </div>
  );
}
