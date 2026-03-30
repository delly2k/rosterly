"use client";

import Link from "next/link";

export function CalendarNav({
  year,
  month,
}: {
  year: number;
  month: number;
}) {
  const prev = new Date(year, month - 2, 1);
  const next = new Date(year, month, 1);
  const prevParams = new URLSearchParams({
    year: String(prev.getFullYear()),
    month: String(prev.getMonth() + 1),
  });
  const nextParams = new URLSearchParams({
    year: String(next.getFullYear()),
    month: String(next.getMonth() + 1),
  });

  return (
    <nav className="flex items-center justify-between gap-4">
      <Link
        href={`/dashboard/participant/bookings/calendar?${prevParams}`}
        className="rounded-md border-[2px] border-black bg-white px-3 py-1.5 text-sm font-semibold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100"
      >
        ← Previous
      </Link>
      <span className="text-lg font-bold text-black">
        {new Date(year, month - 1, 1).toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}
      </span>
      <Link
        href={`/dashboard/participant/bookings/calendar?${nextParams}`}
        className="rounded-md border-[2px] border-black bg-white px-3 py-1.5 text-sm font-semibold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100"
      >
        Next →
      </Link>
    </nav>
  );
}
