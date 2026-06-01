export type ProfileCompletionInput = {
  full_name?: string | null;
  bio?: string | null;
  location_general?: string | null;
  rate?: number | null;
  skills?: unknown;
  availability?: unknown;
};

type CompletionCheck = {
  field: keyof ProfileCompletionInput;
  label: string;
  weight: number;
  check?: (v: unknown) => boolean;
};

const COMPLETION_CHECKS: CompletionCheck[] = [
  { field: "full_name", label: "Full name", weight: 20 },
  { field: "bio", label: "Bio", weight: 20 },
  { field: "location_general", label: "Location", weight: 15 },
  { field: "rate", label: "Hourly rate", weight: 15 },
  {
    field: "skills",
    label: "At least 1 skill",
    weight: 15,
    check: (v) => Array.isArray(v) && v.length > 0,
  },
  {
    field: "availability",
    label: "Availability",
    weight: 15,
    check: (v) => {
      if (!v || typeof v !== "object") return false;
      return Object.values(v as Record<string, unknown>).some(
        (d) =>
          d &&
          typeof d === "object" &&
          (d as { available?: boolean }).available === true
      );
    },
  },
];

export function calculateCompletion(profile: ProfileCompletionInput | null | undefined): {
  pct: number;
  missing: string[];
} {
  let earned = 0;
  const missing: string[] = [];

  for (const { field, label, weight, check } of COMPLETION_CHECKS) {
    const value = profile?.[field];
    const passes = check
      ? check(value)
      : value !== null && value !== undefined && value !== "" && value !== 0;
    if (passes) {
      earned += weight;
    } else {
      missing.push(label);
    }
  }

  return { pct: earned, missing };
}
