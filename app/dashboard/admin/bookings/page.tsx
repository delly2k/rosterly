import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listBookingsForAdmin } from "@/app/dashboard/admin/actions";
import { BookingToggles } from "./BookingToggles";

export default async function AdminBookingsPage() {
  await requireRole(ROLES.ADMIN);
  const bookings = await listBookingsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title tracking-tight">
          Bookings (dummy)
        </h1>
        <Link
          href="/dashboard/admin"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Admin
        </Link>
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
        <strong>No real integration.</strong> Payment confirmed and transport
        assigned are admin toggles only. TODO: Replace with payment provider
        webhook and transport API in a future phase.
      </div>
      {bookings.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">No bookings.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Gig
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Participant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Payment confirmed
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Transport assigned
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
                    {(b.gigs as { title?: string } | null)?.title ?? b.gig_id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-zinc-600 dark:text-zinc-400">
                    {b.participant_user_id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded px-2 py-0.5 text-xs bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {b.payment_confirmed ? (
                      <span className="text-green-600 dark:text-green-400">Yes</span>
                    ) : (
                      <span className="text-zinc-500 dark:text-zinc-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {b.transport_assigned ? (
                      <span className="text-green-600 dark:text-green-400">Yes</span>
                    ) : (
                      <span className="text-zinc-500 dark:text-zinc-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <BookingToggles
                      bookingId={b.id}
                      paymentConfirmed={b.payment_confirmed}
                      transportAssigned={b.transport_assigned}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
