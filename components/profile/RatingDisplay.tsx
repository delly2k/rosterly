import { Star } from "lucide-react";

export function StarRatingDisplay({
  averageRating,
  totalRatings,
  className,
}: {
  averageRating: number | null;
  totalRatings: number;
  className?: string;
}) {
  if (totalRatings === 0 || averageRating == null || Number(averageRating) === 0) {
    return null;
  }

  return (
    <span className={`inline-flex items-center gap-1 text-sm ${className ?? ""}`}>
      <Star
        className="h-3.5 w-3.5 shrink-0"
        fill="var(--color-gold)"
        stroke="var(--color-gold)"
        aria-hidden
      />
      <span className="font-medium tabular-nums text-[var(--color-ink)]">
        {Number(averageRating).toFixed(1)}
      </span>
      <span className="text-[var(--color-ink-muted)]">
        ({totalRatings} review{totalRatings !== 1 ? "s" : ""})
      </span>
    </span>
  );
}

export function ApplicantInitials({ name }: { name: string | null }) {
  const initials = (name?.trim() || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-gold-light)] text-sm font-semibold text-[var(--color-gold)]"
      aria-hidden
    >
      {initials || "?"}
    </span>
  );
}
