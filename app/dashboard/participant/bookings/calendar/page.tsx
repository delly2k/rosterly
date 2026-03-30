import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listMyBookings } from "@/app/dashboard/participant/bookings/actions";
import { ButtonLink } from "@/components/ui/Button";
import { CalendarNav } from "./CalendarNav";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type BookingWithGig = Awaited<ReturnType<typeof listMyBookings>>[number];

function getBookingsByDay(
  bookings: BookingWithGig[],
  year: number,
  month: number
): Map<number, BookingWithGig[]> {
  const map = new Map<number, BookingWithGig[]>();
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);

  for (const b of bookings) {
    const gig = Array.isArray(b.gigs) ? b.gigs[0] : b.gigs;
    const startTime = gig?.start_time;
    if (!startTime) continue;
    const d = new Date(startTime);
    if (d < startOfMonth || d > endOfMonth) continue;
    const day = d.getDate();
    const list = map.get(day) ?? [];
    list.push(b);
    map.set(day, list);
  }

  return map;
}

export default async function ParticipantBookingsCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  await requireRole(ROLES.PARTICIPANT);
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year, 10) : now.getFullYear();
  const month = params.month ? parseInt(params.month, 10) : now.getMonth() + 1;
  const safeYear = Number.isFinite(year) ? year : now.getFullYear();
  const safeMonth = Math.max(1, Math.min(12, Number.isFinite(month) ? month : now.getMonth() + 1));

  const allBookings = await listMyBookings();
  const confirmedOrCompleted = allBookings.filter((b) =>
    ["confirmed", "completed"].includes(b.status)
  );
  const bookingsByDay = getBookingsByDay(confirmedOrCompleted, safeYear, safeMonth);

  const first = new Date(safeYear, safeMonth - 1, 1);
  const last = new Date(safeYear, safeMonth, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const totalCells = startPad + daysInMonth;
  const rows = Math.ceil(totalCells / 7);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title tracking-tight">
          Calendar
        </h1>
        <ButtonLink
          href="/dashboard/participant/bookings"
          variant="secondary"
          size="sm"
        >
          List view
        </ButtonLink>
      </div>

      <CalendarNav year={safeYear} month={safeMonth} />

      <p className="text-sm text-black/80">
        Confirmed and completed gigs appear on their start date.
      </p>

      <div className="overflow-x-auto">
        <div className="min-w-[280px]">
          <div className="grid grid-cols-7 border-[2px] border-black">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="border-b border-r border-black bg-zinc-100 px-2 py-2 text-center text-xs font-semibold text-black last:border-r-0"
              >
                {label}
              </div>
            ))}
            {Array.from({ length: rows * 7 }, (_, i) => {
              const cellIndex = i;
              if (cellIndex < startPad) {
                return <div key={`pad-${i}`} className="min-h-[80px] border-r border-black bg-zinc-50/50 last:border-r-0" />;
              }
              const day = cellIndex - startPad + 1;
              if (day > daysInMonth) {
                return <div key={`pad-end-${i}`} className="min-h-[80px] border-r border-black bg-zinc-50/50 last:border-r-0" />;
              }
              const dayBookings = bookingsByDay.get(day) ?? [];
              return (
                <div
                  key={day}
                  className="min-h-[80px] border-r border-b border-black bg-white p-1 last:border-r-0"
                >
                  <span className="text-sm font-medium text-black">{day}</span>
                  <ul className="mt-1 space-y-1">
                    {dayBookings.map((b) => {
                      const gig = Array.isArray(b.gigs) ? b.gigs[0] : b.gigs;
                      const start = gig?.start_time
                        ? new Date(gig.start_time).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : "";
                      return (
                        <li key={b.id}>
                          <Link
                            href={`/dashboard/participant/bookings/${b.id}`}
                            className="block truncate rounded bg-green-100 px-1 py-0.5 text-xs font-medium text-green-900 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-200 dark:hover:bg-green-800/50"
                            title={`${gig?.title ?? "Gig"} ${start}`}
                          >
                            {gig?.title ?? "Gig"} {start && `· ${start}`}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
