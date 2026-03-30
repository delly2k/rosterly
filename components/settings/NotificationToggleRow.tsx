"use client";

export function NotificationToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
  last,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 py-4 ${last ? "" : "border-b border-zinc-100 dark:border-zinc-700/70"}`}
    >
      <div className="min-w-0 flex-1">
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
        {description && (
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:ring-offset-2 disabled:opacity-50 hover:opacity-90 ${
          checked ? "bg-[#84CC16]" : "bg-zinc-200 dark:bg-zinc-600"
        }`}
      >
        <span
          className={`pointer-events-none absolute top-0.5 inline-block h-6 w-6 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
            checked ? "left-6 translate-x-0" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
