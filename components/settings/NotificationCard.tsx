"use client";

import type { ReactNode } from "react";

export function NotificationCard({
  icon: Icon,
  title,
  children,
  emphasized,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
  emphasized?: boolean;
}) {
  return (
    <section
      className={`surface-card p-5 transition-shadow hover:shadow-sm sm:p-6 ${
        emphasized ? "bg-[var(--color-gold-light)]" : ""
      }`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            emphasized ? "bg-[var(--color-gold-light)]" : "bg-[var(--color-page)]"
          }`}
        >
          <Icon className="h-5 w-5 text-[var(--color-ink-muted)]" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
          {title}
        </h2>
      </div>
      <div className="space-y-0">{children}</div>
    </section>
  );
}
