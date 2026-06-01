"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  const monthLabel = new Date(year, month - 1, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "white",
        border: "0.5px solid var(--color-border)",
        borderRadius: "12px 12px 0 0",
        padding: "14px 20px",
        borderBottom: "none",
      }}
    >
      <Link
        href={`/dashboard/participant/bookings/calendar?${prevParams}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 14px",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          border: "0.5px solid var(--color-border)",
          background: "white",
          color: "var(--color-ink)",
          cursor: "pointer",
          textDecoration: "none",
        }}
      >
        <ChevronLeft size={14} /> Previous
      </Link>

      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--color-ink)" }}>
        {monthLabel}
      </div>

      <Link
        href={`/dashboard/participant/bookings/calendar?${nextParams}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 14px",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          border: "0.5px solid var(--color-border)",
          background: "white",
          color: "var(--color-ink)",
          cursor: "pointer",
          textDecoration: "none",
        }}
      >
        Next <ChevronRight size={14} />
      </Link>
    </div>
  );
}
