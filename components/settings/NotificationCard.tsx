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
      className={`rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900/30 sm:p-6 ${
        emphasized ? "bg-sky-50/80 dark:bg-sky-950/20" : ""
      }`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            emphasized ? "bg-sky-100 dark:bg-sky-900/40" : "bg-zinc-100 dark:bg-zinc-800"
          }`}
        >
          <Icon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
      </div>
      <div className="space-y-0">{children}</div>
    </section>
  );
}
