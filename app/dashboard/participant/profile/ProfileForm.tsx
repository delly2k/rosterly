"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import { upsertParticipantProfile } from "@/app/dashboard/participant/actions";

const WEEKDAYS = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
] as const;

type DayKey = (typeof WEEKDAYS)[number]["key"];

type DayAvailability = {
  available: boolean;
  from: string;
  to: string;
};

type AvailabilityMap = Record<DayKey, DayAvailability>;

const DEFAULT_DAY: DayAvailability = {
  available: false,
  from: "09:00",
  to: "18:00",
};

const DAY_KEYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of ["00", "30"]) {
      const hour = h.toString().padStart(2, "0");
      times.push(`${hour}:${m}`);
    }
  }
  return times;
}

const TIME_OPTIONS = generateTimeOptions();

function formatDayLabel(day: DayKey): string {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

function availabilityHoursLabel(from: string, to: string): string {
  const fromH = parseInt(from.split(":")[0], 10);
  const toH = parseInt(to.split(":")[0], 10);
  const hours = toH - fromH;
  return hours > 0 ? `${hours}h` : "—";
}

function parseSkills(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
}

function parseAvailability(raw: unknown): AvailabilityMap {
  const result = {} as AvailabilityMap;
  const source =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  for (const { key } of WEEKDAYS) {
    const day = source[key];
    if (day && typeof day === "object" && day !== null) {
      const d = day as { available?: boolean; from?: string; to?: string };
      result[key] = {
        available: Boolean(d.available),
        from: typeof d.from === "string" && d.from ? d.from : DEFAULT_DAY.from,
        to: typeof d.to === "string" && d.to ? d.to : DEFAULT_DAY.to,
      };
    } else {
      result[key] = { ...DEFAULT_DAY };
    }
  }

  return result;
}

function getSchema(nameEditable: boolean) {
  return z
    .object({
      full_name: z.string().nullable(),
      bio: z.string().nullable(),
      location_general: z.string().nullable(),
      rate: z.coerce.number().min(0).nullable().optional(),
      emergency_contact: z.string().nullable(),
      accept_disclaimer: z
        .boolean()
        .refine((v) => v === true, {
          message: "You must accept the participant disclaimer.",
        }),
    })
    .refine(
      (data) =>
        !nameEditable || (data.full_name != null && data.full_name.trim().length > 0),
      { message: "Full name is required", path: ["full_name"] }
    );
}

type FormData = z.infer<ReturnType<typeof getSchema>>;

const PARTICIPANT_DISCLAIMER =
  "I understand that my profile may be shared with merchants when I apply to gigs. I will provide accurate information and keep my emergency contact up to date. I have read the Safety and Report guidelines.";

const inputClass = "input-refined w-full text-sm text-[var(--color-ink)]";

const labelClass = "mb-1.5 block text-sm font-medium text-[var(--color-ink-muted)]";

const hintClass = "text-xs leading-relaxed text-[var(--color-ink-muted)]";

const skillsContainerClass =
  "flex min-h-[44px] flex-wrap items-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 transition-[border-color,box-shadow] focus-within:border-[var(--color-gold)] focus-within:shadow-[0_0_0_3px_var(--color-gold-light)]";

const skillsInputClass =
  "min-w-[120px] flex-1 border-0 bg-transparent py-1 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-hint)] !min-h-0 !rounded-none !border-0 !p-1 !shadow-none focus:!shadow-none focus:!outline-none";

type ProfileFormProps = {
  initial: {
    full_name: string | null;
    photo_url?: string | null;
    verified?: boolean;
    bio: string | null;
    skills: unknown;
    location_general: string | null;
    availability?: unknown;
    rate?: number | null;
    emergency_contact?: string | null;
    disclaimer_accepted_at?: string | null;
  } | null;
  identityLocked: boolean;
  nameEditable: boolean;
  completionPct: number;
  missingFields: string[];
};

export function ProfileForm({
  initial,
  identityLocked,
  nameEditable,
  completionPct,
  missingFields,
}: ProfileFormProps) {
  const router = useRouter();
  const photoUrl = initial?.photo_url ?? null;
  const verified = initial?.verified ?? false;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [skills, setSkills] = useState<string[]>(() => parseSkills(initial?.skills));
  const [skillInput, setSkillInput] = useState("");
  const [availability, setAvailability] = useState<AvailabilityMap>(() =>
    parseAvailability(initial?.availability)
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(getSchema(nameEditable)),
    defaultValues: {
      full_name: initial?.full_name ?? "",
      bio: initial?.bio ?? "",
      location_general: initial?.location_general ?? "",
      rate: initial?.rate ?? undefined,
      emergency_contact: initial?.emergency_contact ?? "",
      accept_disclaimer: Boolean(initial?.disclaimer_accepted_at),
    },
  });

  const acceptDisclaimer = watch("accept_disclaimer");

  function addSkill(raw: string) {
    const trimmed = raw.replace(/,/g, "").trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  }

  function removeSkill(index: number) {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    } else if (e.key === "Backspace" && !skillInput && skills.length > 0) {
      setSkills((prev) => prev.slice(0, -1));
    }
  }

  async function onSubmit(data: FormData) {
    setSubmitError(null);
    setSaveSuccess(false);
    try {
      await upsertParticipantProfile(
        {
          full_name: data.full_name || null,
          bio: data.bio || null,
          skills,
          location_general: data.location_general || null,
          availability,
          rate: data.rate ?? null,
          emergency_contact: data.emergency_contact || null,
          photo_url: photoUrl,
          disclaimer_accepted_at: data.accept_disclaimer ? new Date().toISOString() : null,
        },
        identityLocked
      );
      setSaveSuccess(true);
      setTimeout(() => {
        router.refresh();
        setSaveSuccess(false);
      }, 5000);
    } catch {
      setSubmitError("Could not save profile. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {missingFields.length > 0 && (
        <div
          style={{
            background: "white",
            border: "0.5px solid var(--color-border)",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>
              Profile completion
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-gold)" }}>
              {completionPct}%
            </div>
          </div>
          <div
            style={{
              height: 6,
              background: "#F0EEE8",
              borderRadius: 4,
              overflow: "hidden",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                height: 6,
                borderRadius: 4,
                background:
                  completionPct === 100 ? "var(--color-green)" : "var(--color-gold)",
                width: `${completionPct}%`,
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--color-ink-muted)",
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            Still needed to reach 100%:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {missingFields.map((field) => (
              <span
                key={field}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 500,
                  background: "var(--color-warning-light)",
                  border: "0.5px solid rgba(217,119,6,0.3)",
                  color: "var(--color-warning)",
                }}
              >
                <AlertCircle size={10} aria-hidden />
                {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {completionPct === 100 && (
        <div
          style={{
            background: "var(--color-green-light)",
            border: "0.5px solid var(--color-green-border)",
            borderRadius: 12,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
          }}
        >
          <CheckCircle size={18} color="var(--color-green)" aria-hidden />
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-green)" }}>
            Profile complete — you&apos;re fully visible to merchants
          </div>
        </div>
      )}

      {saveSuccess && (
        <div
          className="rounded-lg border border-[var(--color-green-border)] bg-[var(--color-green-light)] px-4 py-3 text-sm font-semibold text-[var(--color-green)]"
          role="status"
        >
          Profile saved.
        </div>
      )}
      {submitError && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {submitError}
        </div>
      )}

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-4 sm:p-5">
        <label className={labelClass}>Profile photo</label>
        <div className="mt-3 flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-[var(--color-border)] bg-white">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-[var(--color-ink-hint)]">
                No photo
              </div>
            )}
          </div>
          <p className={`${hintClass} sm:text-sm`}>
            {verified
              ? "Set from your verification."
              : "Profile photo will be set after verification is approved."}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="full_name" className={labelClass}>
          Full name
        </label>
        <input
          id="full_name"
          type="text"
          className={`${inputClass} disabled:bg-[var(--color-page)] disabled:text-[var(--color-ink-hint)]`}
          {...register("full_name")}
          disabled={!nameEditable}
        />
        {identityLocked && nameEditable && (
          <p className={`mt-1 ${hintClass}`}>
            Your name was not set before verification. Enter it once; it will then be locked.
          </p>
        )}
        {identityLocked && !nameEditable && (
          <p className={`mt-1 ${hintClass}`}>
            Locked after verification submission.
          </p>
        )}
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.full_name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="bio" className={labelClass}>
          Bio
        </label>
        <textarea
          id="bio"
          rows={3}
          className={inputClass}
          {...register("bio")}
        />
      </div>

      <div>
        <label htmlFor="skills-input" className={labelClass}>
          Skills
        </label>
        <p className={`mb-2 ${hintClass}`}>
          Type a skill and press Enter or comma to add it.
        </p>
        <div className={skillsContainerClass}>
          {skills.map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className="pill-gold inline-flex items-center gap-1 px-2 py-1 text-sm font-medium"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="rounded p-0.5 hover:bg-[var(--color-gold)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </span>
          ))}
          <input
            id="skills-input"
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            onBlur={() => {
              if (skillInput.includes(",")) addSkill(skillInput);
            }}
            placeholder={
              skills.length === 0
                ? "e.g. spirits sampling, brand activation"
                : "Add another…"
            }
            className={skillsInputClass}
          />
        </div>
      </div>

      {/* Availability */}
      <div className="w-full">
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-ink)",
            marginBottom: 4,
          }}
        >
          Availability
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--color-ink-muted)",
            marginBottom: 12,
          }}
        >
          Select the days you are available and set your hours
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DAY_KEYS.map((day) => {
            const dayData = availability[day] ?? { ...DEFAULT_DAY };
            const fullDay = formatDayLabel(day);

            return (
              <div
                key={day}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: dayData.available ? "var(--color-gold-light)" : "#FAFAF8",
                  border: `0.5px solid ${dayData.available ? "var(--color-gold-border)" : "var(--color-border)"}`,
                  borderRadius: 10,
                  transition: "all 0.15s ease",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setAvailability((prev) => ({
                      ...prev,
                      [day]: { ...dayData, available: !dayData.available },
                    }))
                  }
                  aria-label={`${dayData.available ? "Disable" : "Enable"} ${fullDay}`}
                  aria-pressed={dayData.available}
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 20,
                    border: "none",
                    background: dayData.available ? "var(--color-gold)" : "#D1CFC8",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      left: dayData.available ? 18 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "white",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      transition: "left 0.2s ease",
                    }}
                  />
                </button>

                <div
                  style={{
                    width: 100,
                    fontSize: 13,
                    fontWeight: 500,
                    color: dayData.available ? "var(--color-gold)" : "var(--color-ink-muted)",
                    transition: "color 0.15s ease",
                    flexShrink: 0,
                  }}
                >
                  {fullDay}
                </div>

                {dayData.available ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flex: 1,
                      flexWrap: "wrap",
                      minWidth: 0,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--color-ink-muted)",
                          fontWeight: 500,
                        }}
                      >
                        FROM
                      </span>
                      <select
                        className="input-refined"
                        value={dayData.from}
                        onChange={(e) =>
                          setAvailability((prev) => ({
                            ...prev,
                            [day]: { ...dayData, from: e.target.value },
                          }))
                        }
                        style={{
                          padding: "4px 8px",
                          fontSize: 12,
                          width: "auto",
                          minWidth: 90,
                        }}
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span style={{ color: "var(--color-ink-hint)", fontSize: 12 }}>→</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--color-ink-muted)",
                          fontWeight: 500,
                        }}
                      >
                        TO
                      </span>
                      <select
                        className="input-refined"
                        value={dayData.to}
                        onChange={(e) =>
                          setAvailability((prev) => ({
                            ...prev,
                            [day]: { ...dayData, to: e.target.value },
                          }))
                        }
                        style={{
                          padding: "4px 8px",
                          fontSize: 12,
                          width: "auto",
                          minWidth: 90,
                        }}
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div
                      style={{
                        marginLeft: "auto",
                        padding: "3px 10px",
                        borderRadius: 20,
                        background: "rgba(200,151,58,0.15)",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "var(--color-gold)",
                      }}
                    >
                      {availabilityHoursLabel(dayData.from, dayData.to)}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--color-ink-hint)",
                      fontStyle: "italic",
                    }}
                  >
                    Not available
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "var(--color-ink-muted)",
              alignSelf: "center",
            }}
          >
            Quick select:
          </span>
          {(
            [
              {
                label: "Weekdays",
                days: ["monday", "tuesday", "wednesday", "thursday", "friday"] as DayKey[],
              },
              { label: "Weekends", days: ["saturday", "sunday"] as DayKey[] },
              { label: "All days", days: DAY_KEYS },
              { label: "Clear all", days: [] as DayKey[] },
            ] as const
          ).map(({ label, days }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setAvailability((prev) => {
                  const next = { ...prev };
                  DAY_KEYS.forEach((d) => {
                    next[d] = { ...next[d], available: days.includes(d) };
                  });
                  return next;
                });
              }}
              className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-[11px] font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="location_general" className={labelClass}>
          General location (e.g. city or region)
        </label>
        <input
          id="location_general"
          type="text"
          className={inputClass}
          {...register("location_general")}
        />
      </div>

      <div>
        <label htmlFor="rate" className={labelClass}>
          Hourly / daily rate (optional)
        </label>
        <div className="flex">
          <span className="inline-flex items-center rounded-l-lg border border-r-0 border-[var(--color-border)] bg-[var(--color-page)] px-3 py-2 text-sm font-semibold text-[var(--color-ink-muted)]">
            JMD
          </span>
          <input
            id="rate"
            type="number"
            step="0.01"
            min="0"
            className={`${inputClass} !rounded-l-none`}
            {...register("rate")}
          />
        </div>
      </div>

      <div>
        <label htmlFor="emergency_contact" className={labelClass}>
          Emergency contact
        </label>
        <input
          id="emergency_contact"
          type="text"
          className={inputClass}
          {...register("emergency_contact")}
        />
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-4 sm:p-5">
        <p className="text-sm leading-relaxed text-[var(--color-ink-muted)]">
          {PARTICIPANT_DISCLAIMER}
        </p>
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--color-border)] text-[var(--color-gold)] focus:ring-[var(--color-gold)]"
            {...register("accept_disclaimer")}
          />
          <span className="text-sm font-medium leading-relaxed text-[var(--color-ink)]">
            I accept the participant disclaimer
          </span>
        </label>
        {errors.accept_disclaimer && (
          <p className="mt-1 text-sm text-red-600">
            {errors.accept_disclaimer.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={isSubmitting || !acceptDisclaimer}
          className="btn-portal-primary"
        >
          {isSubmitting ? "Saving…" : "Save profile"}
        </button>
        <a
          href="/dashboard/participant/safety"
          className="text-sm font-medium text-[var(--color-gold)] underline underline-offset-2 hover:no-underline"
        >
          Report / Safety
        </a>
      </div>
    </form>
  );
}
