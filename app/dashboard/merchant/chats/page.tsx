import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listMyChats } from "@/app/actions/chat";

export default async function MerchantChatsPage() {
  await requireRole(ROLES.MERCHANT);
  const chats = await listMyChats();

  return (
    <div className="space-y-6">
      <h1 className="page-title tracking-tight">
        Chats
      </h1>
      <p className="text-sm leading-relaxed text-black/80">
        One chat per gig per participant. No phone numbers—keep contact in-app.
      </p>
      {chats.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            No chats yet. Start a conversation from a gig application.
          </p>
          <Link
            href="/dashboard/merchant/gigs"
            className="mt-4 inline-block text-sm font-medium text-zinc-700 underline dark:text-zinc-300"
          >
            Your gigs
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {chats.map((c) => (
            <li key={c.id}>
              <Link
                href={`/dashboard/merchant/chats/${c.id}`}
                className="block rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {c.gig?.title ?? "Gig"}
                </span>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {c.participant_display_name ?? `Participant ${c.participant_user_id.slice(0, 8)}…`} ·{" "}
                  {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
