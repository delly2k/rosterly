"use client";

export function ProgressRing({
  value,
  size = 48,
  strokeWidth = 4,
  className,
  accent = "primary",
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  accent?: "primary" | "warm";
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (clamped / 100) * circumference;
  const strokeColor = accent === "warm" ? "#84CC16" : "#1D4ED8";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--ring-track)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
