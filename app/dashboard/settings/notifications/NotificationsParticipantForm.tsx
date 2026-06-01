"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, CalendarCheck, Shield } from "lucide-react";
import { NotificationSegmentedTabs } from "@/components/settings/NotificationSegmentedTabs";
import { NotificationCard } from "@/components/settings/NotificationCard";
import { NotificationToggleRow } from "@/components/settings/NotificationToggleRow";
import { updateNotificationSettings } from "../actions";

const KEYS = {
  newGigMatch: "new_gig_match",
  applicationUpdates: "application_rejected",
  bookingReminders: "booking_offer",
  safetyAlerts: "verification_approved",
} as const;

const LEGACY_KEYS: Record<string, string> = {
  new_gig_match: "new_gig_matches",
  application_rejected: "application_updates",
  booking_offer: "booking_reminders",
  verification_approved: "safety_alerts",
};

function readPref(settings: Record<string, boolean>, key: string): boolean {
  if (settings[key] !== undefined) return settings[key];
  const legacy = LEGACY_KEYS[key];
  if (legacy && settings[legacy] !== undefined) return settings[legacy];
  return true;
}

const TOAST_DURATION_MS = 3000;

export function NotificationsParticipantForm({
  initialSettings,
}: {
  initialSettings: Record<string, boolean>;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState({
    [KEYS.newGigMatch]: readPref(initialSettings, KEYS.newGigMatch),
    [KEYS.applicationUpdates]: readPref(initialSettings, KEYS.applicationUpdates),
    [KEYS.bookingReminders]: readPref(initialSettings, KEYS.bookingReminders),
    [KEYS.safetyAlerts]: readPref(initialSettings, KEYS.safetyAlerts),
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
    (key: (typeof KEYS)[keyof typeof KEYS], value: boolean) => {
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
        <NotificationCard icon={Briefcase} title="Gigs & Applications">
          <NotificationToggleRow
            label="New gig matches"
            description="When new gigs match your profile or preferences."
            checked={settings[KEYS.newGigMatch]}
            onChange={(v) => update(KEYS.newGigMatch, v)}
            last={false}
          />
          <NotificationToggleRow
            label="Application updates"
            description="When your application is accepted or rejected."
            checked={settings[KEYS.applicationUpdates]}
            onChange={(v) => update(KEYS.applicationUpdates, v)}
            last={true}
          />
        </NotificationCard>

        <NotificationCard icon={CalendarCheck} title="Bookings">
          <NotificationToggleRow
            label="Booking reminders"
            description="Reminders before confirmed gigs."
            checked={settings[KEYS.bookingReminders]}
            onChange={(v) => update(KEYS.bookingReminders, v)}
            last={true}
          />
        </NotificationCard>

        <NotificationCard icon={Shield} title="Safety & Platform" emphasized>
          <NotificationToggleRow
            label="Safety alerts"
            description="Important safety and platform updates."
            checked={settings[KEYS.safetyAlerts]}
            onChange={(v) => update(KEYS.safetyAlerts, v)}
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
