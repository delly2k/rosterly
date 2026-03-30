import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listMyChats } from "@/app/actions/chat";
import { Card } from "@/components/ui/Card";

export default async function ParticipantChatsPage() {
  await requireRole(ROLES.PARTICIPANT);
  const chats = await listMyChats();

  return (
    <div className="space-y-6">
      <h1 className="page-title tracking-tight">
        Chats
      </h1>
      <p className="text-sm leading-relaxed text-black/80">
        One chat per gig. No phone numbers—keep contact in-app.
      </p>
      {chats.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-[var(--text-secondary)]">
            No chats yet. Start a conversation from a gig you applied to.
          </p>
          <Link
            href="/dashboard/participant/gigs"
            className="mt-4 inline-block text-sm font-medium text-[var(--primary)] underline hover:no-underline"
          >
            Browse gigs
          </Link>
        </Card>
      ) : (
        <ul className="space-y-2">
          {chats.map((c) => (
            <li key={c.id}>
              <Link
                href={`/dashboard/participant/chats/${c.id}`}
                className="block transition-opacity hover:opacity-90"
              >
                <Card className="p-4">
                  <span className="font-medium text-[var(--text-primary)]">
                    {c.gig?.title ?? "Gig"}
                  </span>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Gig chat · {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
