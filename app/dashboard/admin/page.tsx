import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

export default async function AdminDashboardPage() {
  await requireRole(ROLES.ADMIN);

  return (
    <div className="space-y-8">
      <div className="rounded-[4px] border-[3px] border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="page-title tracking-tight">
          Admin dashboard
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-black/80">
          Trust & safety tools. All actions are logged.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-[#FDE047]">
          <CardTitle className="text-black">Verify users</CardTitle>
          <CardDescription className="text-black/90">
            Approve or reject ID verification requests.
          </CardDescription>
          <div className="mt-6">
            <ButtonLink href="/dashboard/admin/verifications" variant="primary" size="sm">
              Verification queue
            </ButtonLink>
          </div>
        </Card>

        <Card className="bg-[#F97316]">
          <CardTitle className="text-black">Reports & disputes</CardTitle>
          <CardDescription className="text-black/90">
            Non-payment, harassment, unsafe environment. Resolve or dismiss.
          </CardDescription>
          <div className="mt-6">
            <ButtonLink href="/dashboard/admin/reports" variant="primary" size="sm">
              View reports
            </ButtonLink>
          </div>
        </Card>

        <Card className="bg-[#EC4899]">
          <CardTitle className="text-black">User management</CardTitle>
          <CardDescription className="text-black/90">
            Suspend or ban users. Status enforced by middleware.
          </CardDescription>
          <div className="mt-6">
            <ButtonLink href="/dashboard/admin/users" variant="primary" size="sm">
              All users
            </ButtonLink>
          </div>
        </Card>

        <Card className="bg-[#06B6D4]">
          <CardTitle className="text-black">Audit log</CardTitle>
          <CardDescription className="text-black/90">
            Gig, application, booking and check-in change history.
          </CardDescription>
          <div className="mt-6">
            <ButtonLink href="/dashboard/admin/audit" variant="primary" size="sm">
              View audit log
            </ButtonLink>
          </div>
        </Card>

        <Card className="bg-[#84CC16]">
          <CardTitle className="text-black">Chats (read-only)</CardTitle>
          <CardDescription className="text-black/90">
            View all gig chats. Flagged messages highlighted.
          </CardDescription>
          <div className="mt-6">
            <ButtonLink href="/dashboard/admin/chats" variant="primary" size="sm">
              View all chats
            </ButtonLink>
          </div>
        </Card>

        <Card>
          <CardTitle>Bookings (dummy)</CardTitle>
          <CardDescription>
            Payment confirmed / transport assigned toggles. No real integration.
          </CardDescription>
          <div className="mt-6">
            <ButtonLink href="/dashboard/admin/bookings" variant="secondary" size="sm">
              Manage bookings
            </ButtonLink>
          </div>
        </Card>
      </div>
    </div>
  );
}
