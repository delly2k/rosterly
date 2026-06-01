"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, CalendarCheck, Shield } from "lucide-react";
import { NotificationSegmentedTabs } from "@/components/settings/NotificationSegmentedTabs";
import { NotificationCard } from "@/components/settings/NotificationCard";
import { NotificationToggleRow } from "@/components/settings/NotificationToggleRow";
import { updateNotificationSettings } from "../actions";

const KEYS = {
  newApplicants: "new_application",
  bookingConfirmations: "participant_accepted",
  eventReminders: "participant_checked_in",
  reportsIssues: "merchant_rating_received",
} as const;

const LEGACY_KEYS: Record<string, string> = {
  new_application: "new_applicants",
  participant_accepted: "booking_confirmations",
  participant_checked_in: "event_reminders",
  merchant_rating_received: "reports_issues",
};

function readPref(settings: Record<string, boolean>, key: string): boolean {
  if (settings[key] !== undefined) return settings[key];
  const legacy = LEGACY_KEYS[key];
  if (legacy && settings[legacy] !== undefined) return settings[legacy];
  return true;
}

const TOAST_DURATION_MS = 3000;

export function NotificationsMerchantForm({
  initialSettings,
}: {
  initialSettings: Record<string, boolean>;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState({
    [KEYS.newApplicants]: readPref(initialSettings, KEYS.newApplicants),
    [KEYS.bookingConfirmations]: readPref(initialSettings, KEYS.bookingConfirmations),
    [KEYS.eventReminders]: readPref(initialSettings, KEYS.eventReminders),
    [KEYS.reportsIssues]: readPref(initialSettings, KEYS.reportsIssues),
  });
  const [toast, setToast] = useState<string | null>(null);

  const persist = useCallback(
    async (next: Record<string, boolean>) => {
      const result = await updateNotificationSettings(next);
      if (result.ok) {
        router.refresh();
        setToast("Notification preferences updated.");
      }
    },
    [router]
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(t);
  }, [toast]);

  const update = useCallback(
    (key: string, value: boolean) => {
      const next = { ...settings, [key]: value };
      setSettings(next);
      void persist(next);
    },
    [settings, persist]
  );

  return (
    <div className="space-y-8">
      <NotificationSegmentedTabs />

      <div className="space-y-6 sm:space-y-8">
        <NotificationCard icon={Users} title="Applications & Bookings">
          <NotificationToggleRow
            label="New applicants"
            description="When someone applies to your gig."
            checked={settings[KEYS.newApplicants]}
            onChange={(v) => update(KEYS.newApplicants, v)}
            last={false}
          />
          <NotificationToggleRow
            label="Booking confirmations"
            description="When a participant accepts a booking."
            checked={settings[KEYS.bookingConfirmations]}
            onChange={(v) => update(KEYS.bookingConfirmations, v)}
            last={true}
          />
        </NotificationCard>

        <NotificationCard icon={CalendarCheck} title="Events">
          <NotificationToggleRow
            label="Event reminders"
            description="Reminders before gig start."
            checked={settings[KEYS.eventReminders]}
            onChange={(v) => update(KEYS.eventReminders, v)}
            last={true}
          />
        </NotificationCard>

        <NotificationCard icon={Shield} title="Reports & Platform" emphasized>
          <NotificationToggleRow
            label="Reports and issues"
            description="When a report is submitted or an issue needs attention."
            checked={settings[KEYS.reportsIssues]}
            onChange={(v) => update(KEYS.reportsIssues, v)}
            last={true}
          />
        </NotificationCard>
      </div>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--color-gold)] px-4 py-2 text-sm font-medium text-white shadow-lg"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
