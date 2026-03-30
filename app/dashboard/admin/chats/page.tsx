import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listAllChatsForAdmin } from "@/app/actions/chat";

export default async function AdminChatsPage() {
  await requireRole(ROLES.ADMIN);
  const chats = await listAllChatsForAdmin();

  return (
    <div className="space-y-6">
      <h1 className="page-title tracking-tight">
        Chats (read-only)
      </h1>
      <p className="text-sm leading-relaxed text-black/80">
        View all gig chats. Flagged messages are highlighted. No sending or
        editing.
      </p>
      {chats.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">No chats yet.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {chats.map((c) => (
            <li key={c.id}>
              <Link
                href={`/dashboard/admin/chats/${c.id}`}
                className="block rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {c.gig?.title ?? "Gig"}
                </span>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Merchant {c.merchant_user_id.slice(0, 8)}… · Participant{" "}
                  {c.participant_user_id.slice(0, 8)}… ·{" "}
                  {new Date(c.created_at).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
