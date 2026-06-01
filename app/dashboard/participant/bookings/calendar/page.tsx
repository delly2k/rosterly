import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listMyBookings } from "@/app/dashboard/participant/bookings/actions";
import { CalendarNav } from "./CalendarNav";
import { CalendarDays, List } from "lucide-react";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type BookingWithGig = Awaited<ReturnType<typeof listMyBookings>>[number];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(day: Date, currentMonth: Date) {
  return (
    day.getFullYear() === currentMonth.getFullYear() &&
    day.getMonth() === currentMonth.getMonth()
  );
}

function unwrapGig(booking: BookingWithGig) {
  const raw = booking.gigs;
  return Array.isArray(raw) ? raw[0] : raw;
}

function getBookingsForDay(day: Date, bookings: BookingWithGig[]) {
  return bookings.filter((booking) => {
    const gig = unwrapGig(booking);
    if (!gig?.start_time) return false;
    return isSameDay(new Date(gig.start_time), day);
  });
}

function buildCalendarDays(year: number, month: number): Date[] {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const totalCells = Math.ceil((startPad + daysInMonth) / 7) * 7;
  const calendarDays: Date[] = [];

  for (let i = 0; i < totalCells; i++) {
    if (i < startPad) {
      calendarDays.push(new Date(year, month - 1, -startPad + i + 1));
    } else if (i >= startPad + daysInMonth) {
      calendarDays.push(new Date(year, month, i - startPad - daysInMonth + 1));
    } else {
      calendarDays.push(new Date(year, month - 1, i - startPad + 1));
    }
  }

  return calendarDays;
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
  const safeMonth = Math.max(
    1,
    Math.min(12, Number.isFinite(month) ? month : now.getMonth() + 1)
  );

  const allBookings = await listMyBookings();
  const confirmedOrCompleted = allBookings.filter((b) =>
    ["confirmed", "completed"].includes(b.status)
  );

  const currentMonth = new Date(safeYear, safeMonth - 1, 1);
  const calendarDays = buildCalendarDays(safeYear, safeMonth);
  const today = new Date();

  return (
    <div className="page-bg" style={{ padding: "32px 40px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--color-gold-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CalendarDays size={16} color="var(--color-gold)" />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "var(--color-ink)" }}>
              Calendar
            </div>
            <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
              Your confirmed and completed gigs
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/participant/bookings"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            border: "1px solid var(--color-border)",
            background: "white",
            color: "var(--color-ink)",
            textDecoration: "none",
          }}
        >
          <List size={13} /> List view
        </Link>
      </div>

      <CalendarNav year={safeYear} month={safeMonth} />

      <div
        style={{
          background: "white",
          border: "0.5px solid var(--color-border)",
          borderRadius: "0 0 12px 12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            borderBottom: "0.5px solid var(--color-border)",
            background: "#FAFAF8",
          }}
        >
          {WEEKDAY_LABELS.map((day) => (
            <div
              key={day}
              style={{
                padding: "10px 0",
                textAlign: "center",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-ink-muted)",
              }}
            >
              {day}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
          }}
        >
          {calendarDays.map((day, i) => {
            const isToday = isSameDay(day, today);
            const dayBookings = getBookingsForDay(day, confirmedOrCompleted);
            const inCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={`${day.toISOString()}-${i}`}
                style={{
                  minHeight: 100,
                  padding: "8px",
                  borderRight:
                    (i + 1) % 7 !== 0 ? "0.5px solid var(--color-border)" : "none",
                  borderBottom:
                    i < calendarDays.length - 7
                      ? "0.5px solid var(--color-border)"
                      : "none",
                  background: !inCurrentMonth ? "#FAFAF8" : "white",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: isToday ? "var(--color-gold)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: isToday ? 600 : 400,
                    color: isToday
                      ? "white"
                      : !inCurrentMonth
                        ? "var(--color-ink-hint)"
                        : "var(--color-ink)",
                    marginBottom: 4,
                  }}
                >
                  {day.getDate()}
                </div>

                {dayBookings.map((booking) => {
                  const gig = unwrapGig(booking);
                  return (
                    <Link
                      key={booking.id}
                      href={`/dashboard/participant/bookings/${booking.id}`}
                      style={{
                        textDecoration: "none",
                        display: "block",
                        marginBottom: 3,
                      }}
                    >
                      <div
                        style={{
                          padding: "3px 7px",
                          borderRadius: 5,
                          fontSize: 10,
                          fontWeight: 500,
                          background:
                            booking.status === "completed"
                              ? "var(--color-gold-light)"
                              : "var(--color-green-light)",
                          border: `0.5px solid ${
                            booking.status === "completed"
                              ? "var(--color-gold-border)"
                              : "var(--color-green-border)"
                          }`,
                          color:
                            booking.status === "completed"
                              ? "var(--color-gold)"
                              : "var(--color-green)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={gig?.title ?? "Gig"}
                      >
                        {gig?.title ?? "Gig"}
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginTop: 16,
          padding: "0 4px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "var(--color-ink-muted)",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: "var(--color-green-light)",
              border: "0.5px solid var(--color-green-border)",
            }}
          />
          Confirmed booking
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "var(--color-ink-muted)",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: "var(--color-gold-light)",
              border: "0.5px solid var(--color-gold-border)",
            }}
          />
          Completed gig
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "var(--color-ink-muted)",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--color-gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              color: "white",
              fontWeight: 600,
            }}
          >
            {today.getDate()}
          </div>
          Today
        </div>
      </div>
    </div>
  );
}
