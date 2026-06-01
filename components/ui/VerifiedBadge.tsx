import { clsx } from "clsx";

export type VerifiedBadgeSize = "sm" | "md";

const dotSizes: Record<VerifiedBadgeSize, string> = {
  sm: "h-2 w-2",
  md: "h-2 w-2",
};

export function VerifiedBadge({
  verified,
  size = "md",
  className,
}: {
  verified: boolean;
  size?: VerifiedBadgeSize;
  className?: string;
}) {
  const dotClass = dotSizes[size];

  if (verified) {
    return (
      <span
        className={clsx(
          "inline-flex items-center gap-1.5",
          size === "md" && "text-sm font-medium text-[var(--color-green)]",
          className
        )}
        title={size === "sm" ? "Verified" : undefined}
      >
        <span
          className={clsx("shrink-0 rounded-full bg-[var(--color-green)]", dotClass)}
          aria-hidden
        />
        {size === "md" && <span>Verified</span>}
        {size === "sm" && <span className="sr-only">Verified</span>}
      </span>
    );
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5",
        size === "md" && "text-sm font-medium text-[var(--color-warning)]",
        className
      )}
      title={size === "sm" ? "Unverified" : undefined}
    >
      <span
        className={clsx("shrink-0 rounded-full bg-[var(--color-warning)]", dotClass)}
        aria-hidden
      />
      {size === "md" && <span>Unverified</span>}
      {size === "sm" && <span className="sr-only">Unverified</span>}
    </span>
  );
}
