import { clsx } from "clsx";

export type ReputationScoreSize = "sm" | "lg";

function clampScore(score: number): number {
  return Math.min(1000, Math.max(0, score));
}

function getTierLabel(score: number): "Rising" | "Established" | "Elite" {
  if (score <= 400) return "Rising";
  if (score <= 700) return "Established";
  return "Elite";
}

function getBarFillColor(score: number): string {
  return score >= 701 ? "var(--color-green)" : "var(--color-gold)";
}

function ProgressBar({
  score,
  heightClass,
  className,
}: {
  score: number;
  heightClass: string;
  className?: string;
}) {
  const clamped = clampScore(score);
  const fillPct = (clamped / 1000) * 100;

  return (
    <div
      className={clsx(
        "w-full overflow-hidden rounded-full bg-[var(--color-border)]",
        heightClass,
        className
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={1000}
    >
      <div
        className="h-full rounded-full transition-[width] duration-300 ease-out"
        style={{
          width: `${fillPct}%`,
          backgroundColor: getBarFillColor(clamped),
        }}
      />
    </div>
  );
}

export function ReputationScore({
  score,
  size = "sm",
  className,
}: {
  score: number;
  size?: ReputationScoreSize;
  className?: string;
}) {
  const clamped = clampScore(score);
  const tier = getTierLabel(clamped);

  if (size === "lg") {
    return (
      <div className={clsx("space-y-2", className)}>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-3xl font-semibold tabular-nums text-[var(--color-ink)]">
            {clamped}
          </span>
          <span className="text-sm font-medium text-[var(--color-ink-muted)]">
            {tier}
          </span>
        </div>
        <ProgressBar score={clamped} heightClass="h-2" />
      </div>
    );
  }

  return (
    <div className={clsx("space-y-1", className)}>
      <span className="text-sm font-medium tabular-nums text-[var(--color-ink)]">
        {clamped}
      </span>
      <ProgressBar score={clamped} heightClass="h-1" className="max-w-[120px]" />
    </div>
  );
}
