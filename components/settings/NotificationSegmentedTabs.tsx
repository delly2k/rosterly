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
        className="flex w-full min-w-0 rounded-xl bg-[var(--color-page)] p-1"
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
              <span className="rounded-lg bg-[var(--color-gold)] px-4 py-2 text-sm font-semibold text-white shadow-sm">
                {tab.label}
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)]">
                {tab.label}
                {tab.badge && (
                  <span className="rounded-full bg-[var(--color-page)] px-2 py-0.5 text-xs font-medium text-[var(--color-ink-muted)]">
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
