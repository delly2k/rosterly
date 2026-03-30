"use client";

const TABS = [
  { id: "app", label: "App", active: true },
  { id: "email", label: "Email", active: false, badge: "Coming soon" },
  { id: "sms", label: "SMS", active: false, badge: "Coming soon" },
] as const;

export function NotificationSegmentedTabs() {
  return (
    <div className="flex gap-0 overflow-x-auto pb-2 md:overflow-visible md:pb-0">
      <div
        className="flex w-full min-w-0 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/50"
        role="tablist"
        aria-label="Notification channels"
      >
        {TABS.map((tab) => (
          <div
            key={tab.id}
            className="relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 transition-colors md:flex-initial"
            role="tab"
            aria-selected={tab.active}
            aria-disabled={!tab.active}
          >
            {tab.active ? (
              <span className="rounded-lg bg-[#84CC16] px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm">
                {tab.label}
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {tab.label}
                {tab.badge && (
                  <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-600 dark:text-zinc-300">
                    {tab.badge}
                  </span>
                )}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
